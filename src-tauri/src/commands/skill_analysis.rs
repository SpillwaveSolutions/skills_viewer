// Feature 021: Skill Analysis Tauri Commands
// Provides async commands for skill evaluation and PDA analysis

use crate::utils::cli_executor;
use crate::utils::yaml_parser;
use crate::analyzers::{spec_validator, pda_scorer, permissions_analyzer, trigger_analyzer, link_validator};
use crate::analyzers::{MarkdownReportGenerator, generate_triggers_report, generate_composite_report};
use crate::models::analysis::{
    CLIDetectionResult as ModelCLIDetectionResult, SpecCompliance, PDAAnalysis,
    AnalyzerReport, AnalyzerStatus, AnalysisProgressStatus,
};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::Instant;
use once_cell::sync::Lazy;

/// In-memory store for analysis reports
static ANALYSIS_REPORTS: Lazy<Mutex<HashMap<String, AnalysisReportsStore>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

#[derive(Clone)]
struct AnalysisReportsStore {
    skill_name: String,
    skill_path: String,
    spec_report: Option<AnalyzerReport>,
    pda_report: Option<AnalyzerReport>,
    permissions_report: Option<AnalyzerReport>,
    triggers_report: Option<AnalyzerReport>,
    links_report: Option<AnalyzerReport>,
    status: AnalysisProgressStatus,
}

/// Detect available CLI tools (Claude/OpenCode/Gemini)
/// Returns detection status with paths if available
#[tauri::command]
pub fn detect_cli() -> Result<ModelCLIDetectionResult, String> {
    let detection = cli_executor::detect_available_clis();

    Ok(ModelCLIDetectionResult {
        claude_available: detection.claude_available,
        opencode_available: detection.opencode_available,
        gemini_available: detection.gemini_available,
        claude_path: detection.claude_path.map(|p| p.to_string_lossy().to_string()),
        opencode_path: detection.opencode_path.map(|p| p.to_string_lossy().to_string()),
        gemini_path: detection.gemini_path.map(|p| p.to_string_lossy().to_string()),
    })
}

/// Validate skill against Anthropic Skills Specification
#[tauri::command]
pub async fn validate_skill(
    skill_content: String,
) -> Result<SpecCompliance, String> {
    // Parse frontmatter from skill content
    let (frontmatter_opt, _rest) = yaml_parser::extract_frontmatter(&skill_content);

    let frontmatter = match frontmatter_opt {
        Some(fm) => fm,
        None => serde_json::json!({}),
    };

    // Convert JSON Value to YAML Value
    let frontmatter_yaml: serde_yaml::Value = serde_json::from_value(frontmatter)
        .map_err(|e| format!("Failed to convert frontmatter: {}", e))?;

    let compliance = spec_validator::validate_skill(&skill_content, &frontmatter_yaml);
    Ok(compliance)
}

/// Analyze skill for PDA compliance (script-based, fast)
#[tauri::command]
pub async fn analyze_pda(
    skill_content: String,
) -> Result<PDAAnalysis, String> {
    pda_scorer::analyze_pda(&skill_content).await
}

/// Start detailed LLM-based PDA analysis in background
/// Returns analysis ID for polling
#[tauri::command]
pub async fn start_detailed_pda_analysis(
    skill_name: String,
    skill_content: String,
) -> Result<String, String> {
    // First, run fast script-based analysis
    let script_analysis = pda_scorer::analyze_pda(&skill_content).await?;

    // Start detailed LLM-based analysis in background
    crate::orchestrator::ORCHESTRATOR
        .start_detailed_analysis(skill_name, skill_content, script_analysis)
        .await
}

/// Get status of a background PDA analysis
#[tauri::command]
pub fn get_pda_analysis_status(
    analysis_id: String,
) -> Result<serde_json::Value, String> {
    use crate::orchestrator::JobStatus;

    match crate::orchestrator::ORCHESTRATOR.get_status(&analysis_id) {
        Some(JobStatus::Running { progress }) => Ok(serde_json::json!({
            "status": "running",
            "progress": progress
        })),
        Some(JobStatus::Completed { result }) => Ok(serde_json::json!({
            "status": "completed",
            "result": result
        })),
        Some(JobStatus::Failed { error }) => Ok(serde_json::json!({
            "status": "failed",
            "error": error
        })),
        None => Err(format!("Analysis ID not found: {}", analysis_id)),
    }
}

// =============================================================================
// FR-009, FR-010, FR-011: Markdown Report Commands
// =============================================================================

/// Start full analysis with all analyzers (FR-011)
/// Returns analysis ID for polling progress and fetching reports
#[tauri::command]
pub async fn start_full_analysis(
    skill_name: String,
    skill_path: String,
    skill_content: String,
) -> Result<String, String> {
    let analysis_id = uuid::Uuid::new_v4().to_string();

    // Initialize progress status
    let status = AnalysisProgressStatus {
        analysis_id: analysis_id.clone(),
        skill_name: skill_name.clone(),
        overall_status: AnalyzerStatus::Running,
        spec: AnalyzerStatus::Pending,
        pda: AnalyzerStatus::Pending,
        permissions: AnalyzerStatus::Pending,
        triggers: AnalyzerStatus::Pending,
        links: AnalyzerStatus::Pending,
        error: None,
    };

    let store = AnalysisReportsStore {
        skill_name: skill_name.clone(),
        skill_path: skill_path.clone(),
        spec_report: None,
        pda_report: None,
        permissions_report: None,
        triggers_report: None,
        links_report: None,
        status,
    };

    // Store initial state
    {
        let mut reports = ANALYSIS_REPORTS.lock().unwrap();
        reports.insert(analysis_id.clone(), store);
    }

    // Clone for async move
    let id = analysis_id.clone();
    let content = skill_content.clone();
    let name = skill_name.clone();
    let path = skill_path.clone();

    // Spawn background task to run all analyzers
    tokio::spawn(async move {
        run_all_analyzers(id, name, path, content).await;
    });

    Ok(analysis_id)
}

/// Run all analyzers and update the store progressively
async fn run_all_analyzers(
    analysis_id: String,
    skill_name: String,
    skill_path: String,
    skill_content: String,
) {
    // Parse frontmatter once
    let (frontmatter_opt, _rest) = yaml_parser::extract_frontmatter(&skill_content);
    let frontmatter: serde_yaml::Value = match frontmatter_opt {
        Some(fm) => serde_json::from_value(fm).unwrap_or_default(),
        None => serde_yaml::Value::Null,
    };

    // Extract allowed-tools for permissions analyzer
    let allowed_tools: Vec<String> = frontmatter
        .get("allowed-tools")
        .and_then(|v| v.as_sequence())
        .map(|seq| {
            seq.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    // Extract current triggers
    let current_triggers: Vec<String> = frontmatter
        .get("triggers")
        .and_then(|v| v.as_sequence())
        .map(|seq| {
            seq.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    // Run Spec Validator
    update_analyzer_status(&analysis_id, "spec", AnalyzerStatus::Running);
    let start = Instant::now();
    let spec_result = spec_validator::validate_skill(&skill_content, &frontmatter);
    let spec_report = spec_result.generate_markdown_report(start.elapsed().as_millis() as u64);
    update_analyzer_report(&analysis_id, "spec", spec_report);

    // Run PDA Analyzer
    update_analyzer_status(&analysis_id, "pda", AnalyzerStatus::Running);
    let start = Instant::now();
    match pda_scorer::analyze_pda(&skill_content).await {
        Ok(pda_result) => {
            let pda_report = pda_result.generate_markdown_report(start.elapsed().as_millis() as u64);
            update_analyzer_report(&analysis_id, "pda", pda_report);
        }
        Err(e) => {
            update_analyzer_error(&analysis_id, "pda", &e);
        }
    }

    // Run Permissions Analyzer
    update_analyzer_status(&analysis_id, "permissions", AnalyzerStatus::Running);
    let start = Instant::now();
    let permissions_result = permissions_analyzer::analyze_permissions(&allowed_tools, &skill_content);
    let permissions_report = permissions_result.generate_markdown_report(start.elapsed().as_millis() as u64);
    update_analyzer_report(&analysis_id, "permissions", permissions_report);

    // Run Trigger Analyzer
    update_analyzer_status(&analysis_id, "triggers", AnalyzerStatus::Running);
    let start = Instant::now();
    match trigger_analyzer::suggest_triggers(&skill_content, &current_triggers).await {
        Ok(suggestions) => {
            let triggers_report = generate_triggers_report(&suggestions, start.elapsed().as_millis() as u64);
            update_analyzer_report(&analysis_id, "triggers", triggers_report);
        }
        Err(e) => {
            update_analyzer_error(&analysis_id, "triggers", &e);
        }
    }

    // Run Link Validator
    update_analyzer_status(&analysis_id, "links", AnalyzerStatus::Running);
    let start = Instant::now();
    match link_validator::validate_links(&skill_content, &skill_path).await {
        Ok(links_result) => {
            let links_report = links_result.generate_markdown_report(start.elapsed().as_millis() as u64);
            update_analyzer_report(&analysis_id, "links", links_report);
        }
        Err(e) => {
            update_analyzer_error(&analysis_id, "links", &e);
        }
    }

    // Mark overall as complete
    {
        let mut reports = ANALYSIS_REPORTS.lock().unwrap();
        if let Some(store) = reports.get_mut(&analysis_id) {
            store.status.overall_status = AnalyzerStatus::Complete;
        }
    }
}

fn update_analyzer_status(analysis_id: &str, analyzer: &str, status: AnalyzerStatus) {
    let mut reports = ANALYSIS_REPORTS.lock().unwrap();
    if let Some(store) = reports.get_mut(analysis_id) {
        match analyzer {
            "spec" => store.status.spec = status,
            "pda" => store.status.pda = status,
            "permissions" => store.status.permissions = status,
            "triggers" => store.status.triggers = status,
            "links" => store.status.links = status,
            _ => {}
        }
    }
}

fn update_analyzer_report(analysis_id: &str, analyzer: &str, report: AnalyzerReport) {
    let mut reports = ANALYSIS_REPORTS.lock().unwrap();
    if let Some(store) = reports.get_mut(analysis_id) {
        match analyzer {
            "spec" => {
                store.spec_report = Some(report);
                store.status.spec = AnalyzerStatus::Complete;
            }
            "pda" => {
                store.pda_report = Some(report);
                store.status.pda = AnalyzerStatus::Complete;
            }
            "permissions" => {
                store.permissions_report = Some(report);
                store.status.permissions = AnalyzerStatus::Complete;
            }
            "triggers" => {
                store.triggers_report = Some(report);
                store.status.triggers = AnalyzerStatus::Complete;
            }
            "links" => {
                store.links_report = Some(report);
                store.status.links = AnalyzerStatus::Complete;
            }
            _ => {}
        }
    }
}

fn update_analyzer_error(analysis_id: &str, analyzer: &str, error: &str) {
    let mut reports = ANALYSIS_REPORTS.lock().unwrap();
    if let Some(store) = reports.get_mut(analysis_id) {
        let error_report = AnalyzerReport {
            analyzer_name: analyzer.to_string(),
            markdown: format!("## {} Analysis\n\n**Status**: ❌ Error\n\n{}\n", analyzer, error),
            json_data: serde_json::json!({"error": error}),
            status: AnalyzerStatus::Error,
            duration_ms: 0,
            score: None,
        };
        match analyzer {
            "spec" => {
                store.spec_report = Some(error_report);
                store.status.spec = AnalyzerStatus::Error;
            }
            "pda" => {
                store.pda_report = Some(error_report);
                store.status.pda = AnalyzerStatus::Error;
            }
            "permissions" => {
                store.permissions_report = Some(error_report);
                store.status.permissions = AnalyzerStatus::Error;
            }
            "triggers" => {
                store.triggers_report = Some(error_report);
                store.status.triggers = AnalyzerStatus::Error;
            }
            "links" => {
                store.links_report = Some(error_report);
                store.status.links = AnalyzerStatus::Error;
            }
            _ => {}
        }
    }
}

/// Get analysis progress status (FR-011)
#[tauri::command]
pub fn get_analysis_progress(analysis_id: String) -> Result<AnalysisProgressStatus, String> {
    let reports = ANALYSIS_REPORTS.lock().unwrap();
    reports
        .get(&analysis_id)
        .map(|store| store.status.clone())
        .ok_or_else(|| format!("Analysis ID not found: {}", analysis_id))
}

/// Get a specific analyzer's markdown report (FR-009)
#[tauri::command]
pub fn get_analyzer_report(
    analysis_id: String,
    analyzer: String,
) -> Result<Option<AnalyzerReport>, String> {
    let reports = ANALYSIS_REPORTS.lock().unwrap();
    let store = reports
        .get(&analysis_id)
        .ok_or_else(|| format!("Analysis ID not found: {}", analysis_id))?;

    let report = match analyzer.as_str() {
        "spec" => store.spec_report.clone(),
        "pda" => store.pda_report.clone(),
        "permissions" => store.permissions_report.clone(),
        "triggers" => store.triggers_report.clone(),
        "links" => store.links_report.clone(),
        _ => return Err(format!("Unknown analyzer: {}", analyzer)),
    };

    Ok(report)
}

/// Get composite markdown report (FR-010)
#[tauri::command]
pub fn get_composite_report(analysis_id: String) -> Result<Option<String>, String> {
    let reports = ANALYSIS_REPORTS.lock().unwrap();
    let store = reports
        .get(&analysis_id)
        .ok_or_else(|| format!("Analysis ID not found: {}", analysis_id))?;

    // Collect all completed reports
    let mut all_reports: Vec<AnalyzerReport> = Vec::new();

    if let Some(r) = &store.spec_report {
        all_reports.push(r.clone());
    }
    if let Some(r) = &store.pda_report {
        all_reports.push(r.clone());
    }
    if let Some(r) = &store.permissions_report {
        all_reports.push(r.clone());
    }
    if let Some(r) = &store.triggers_report {
        all_reports.push(r.clone());
    }
    if let Some(r) = &store.links_report {
        all_reports.push(r.clone());
    }

    if all_reports.is_empty() {
        return Ok(None);
    }

    let composite = generate_composite_report(&store.skill_name, &store.skill_path, &all_reports);
    Ok(Some(composite))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_cli_command() {
        let result = detect_cli();
        assert!(result.is_ok());

        let detection = result.unwrap();
        // Verify boolean fields are consistent with paths
        assert_eq!(detection.claude_available, detection.claude_path.is_some());
        assert_eq!(detection.opencode_available, detection.opencode_path.is_some());
    }

    #[test]
    fn test_detect_cli_command_deterministic() {
        // Run detection twice to ensure determinism
        let result1 = detect_cli().unwrap();
        let result2 = detect_cli().unwrap();

        assert_eq!(result1.claude_available, result2.claude_available);
        assert_eq!(result1.opencode_available, result2.opencode_available);
    }

    #[test]
    fn test_detect_cli_command_path_format() {
        let result = detect_cli().unwrap();

        // If paths exist, they should be non-empty strings
        if let Some(path) = result.claude_path {
            assert!(!path.is_empty());
        }

        if let Some(path) = result.opencode_path {
            assert!(!path.is_empty());
        }
    }
}

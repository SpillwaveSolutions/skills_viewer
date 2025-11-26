// Feature 021: Skill Analysis Tauri Commands
// Provides async commands for skill evaluation and PDA analysis

use crate::analyzers::{link_validator, pda_scorer, permissions_analyzer, spec_validator, trigger_analyzer};
use crate::models::analysis::{
    CLIDetectionResult as ModelCLIDetectionResult, LinkValidation, PDAAnalysis, SecurityReview,
    SpecCompliance, TriggerSuggestion,
};
use crate::utils::cli_executor;
use crate::utils::yaml_parser;
use std::path::PathBuf;

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

/// Validate links in skill content
/// Checks that referenced files exist relative to the skill directory
#[tauri::command]
pub async fn validate_skill_links(
    skill_content: String,
    skill_dir: String,
) -> Result<LinkValidation, String> {
    let skill_path = PathBuf::from(&skill_dir);

    if !skill_path.exists() {
        return Err(format!("Skill directory does not exist: {}", skill_dir));
    }

    link_validator::validate_links(&skill_content, &skill_path).await
}

/// Analyze skill permissions for security risks
/// Checks for high-risk tools, dangerous combinations, and unused permissions
#[tauri::command]
pub fn analyze_permissions(
    allowed_tools: Vec<String>,
    skill_content: String,
) -> Result<SecurityReview, String> {
    Ok(permissions_analyzer::analyze_permissions(&allowed_tools, &skill_content))
}

/// Suggest trigger keywords based on skill content analysis
/// Returns suggestions with relevance scores and explanations
#[tauri::command]
pub fn suggest_triggers(
    skill_content: String,
    current_triggers: Vec<String>,
) -> Result<Vec<TriggerSuggestion>, String> {
    trigger_analyzer::suggest_triggers(&skill_content, &current_triggers)
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

// Feature 021: Skill Analysis Tauri Commands
// Provides async commands for skill evaluation and PDA analysis

use crate::utils::cli_executor;
use crate::utils::yaml_parser;
use crate::analyzers::{spec_validator, pda_scorer};
use crate::models::analysis::{CLIDetectionResult as ModelCLIDetectionResult, SpecCompliance, PDAAnalysis};

/// Detect available CLI tools (Claude/OpenCode)
/// Returns detection status with paths if available
#[tauri::command]
pub fn detect_cli() -> Result<ModelCLIDetectionResult, String> {
    let detection = cli_executor::detect_available_clis();

    Ok(ModelCLIDetectionResult {
        claude_available: detection.claude_available,
        opencode_available: detection.opencode_available,
        claude_path: detection.claude_path.map(|p| p.to_string_lossy().to_string()),
        opencode_path: detection.opencode_path.map(|p| p.to_string_lossy().to_string()),
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

/// Analyze skill for PDA compliance
#[tauri::command]
pub async fn analyze_pda(
    skill_content: String,
) -> Result<PDAAnalysis, String> {
    pda_scorer::analyze_pda(&skill_content).await
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

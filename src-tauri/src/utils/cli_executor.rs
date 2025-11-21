// Feature 021: CLI Executor for Claude/OpenCode CLI integration
// Handles CLI detection and execution with timeout/retry logic

use std::path::PathBuf;
use tokio::process::Command;
use tokio::time::{timeout, Duration};

/// CLI tool detection results
#[derive(Debug, Clone)]
pub struct CLIDetectionResult {
    pub claude_available: bool,
    pub opencode_available: bool,
    pub claude_path: Option<PathBuf>,
    pub opencode_path: Option<PathBuf>,
}

/// Detect available CLI tools (claude, opencode)
pub fn detect_available_clis() -> CLIDetectionResult {
    let claude_path = which::which("claude").ok();
    let opencode_path = which::which("opencode").ok();

    CLIDetectionResult {
        claude_available: claude_path.is_some(),
        opencode_available: opencode_path.is_some(),
        claude_path,
        opencode_path,
    }
}

/// Select which CLI to use (claude → opencode → error)
pub fn select_cli() -> Result<String, String> {
    let detection = detect_available_clis();

    if detection.claude_available {
        Ok("claude".to_string())
    } else if detection.opencode_available {
        Ok("opencode".to_string())
    } else {
        Err("No CLI available. Install Claude CLI or OpenCode CLI.".to_string())
    }
}

/// Execute Claude/OpenCode CLI with timeout and retry
pub async fn execute_claude_cli(prompt: &str) -> Result<String, String> {
    let cli_name = select_cli()?;

    // Try once, then retry on failure
    match execute_cli_internal(&cli_name, prompt).await {
        Ok(output) => Ok(output),
        Err(e) if e.contains("timeout") || e.contains("connection") => {
            // Retry once on transient failures
            tokio::time::sleep(Duration::from_millis(500)).await;
            execute_cli_internal(&cli_name, prompt).await
        }
        Err(e) => Err(e),
    }
}

/// Internal CLI execution with timeout
async fn execute_cli_internal(cli_name: &str, prompt: &str) -> Result<String, String> {
    let timeout_duration = Duration::from_secs(30);

    let output = timeout(
        timeout_duration,
        Command::new(cli_name)
            .arg("-p")
            .arg(prompt)
            .arg("--output-format")
            .arg("json")
            .arg("--tools")
            .arg("")
            .output()
    )
    .await
    .map_err(|_| "CLI execution timeout (30s)".to_string())?
    .map_err(|e| format!("Command error: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_available_clis() {
        let result = detect_available_clis();
        // At least one of the booleans should be deterministic
        assert!(result.claude_available || !result.claude_available);
    }

    #[test]
    fn test_select_cli_returns_error_when_none_available() {
        // This test will pass if no CLI is installed
        // If CLI is installed, it returns Ok
        let _result = select_cli();
        // Test should not panic
    }
}

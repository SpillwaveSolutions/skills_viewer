// Feature 021: Permissions Analyzer (FR-004)
// Analyzes allowed-tools for security risks
// - Detects overly permissive patterns (wildcards)
// - Identifies high-risk permission combinations
// - Detects unused permissions (not referenced in content)
// - Suggests minimum required permissions

use crate::models::analysis::{RiskFlag, RiskLevel, SecurityReview};
use regex::Regex;
use std::collections::HashSet;

/// High-risk tool patterns that warrant warnings
const HIGH_RISK_TOOLS: &[(&str, RiskLevel, &str)] = &[
    ("Bash", RiskLevel::High, "Bash allows arbitrary command execution"),
    ("Write", RiskLevel::Medium, "Write can modify files on disk"),
    ("Edit", RiskLevel::Medium, "Edit can modify existing files"),
    ("*", RiskLevel::Critical, "Wildcard grants all permissions - extremely dangerous"),
    ("mcp__*", RiskLevel::High, "MCP wildcard grants access to all MCP servers"),
];

/// Dangerous permission combinations
const DANGEROUS_COMBINATIONS: &[(&[&str], RiskLevel, &str, &str)] = &[
    (
        &["Bash", "Write"],
        RiskLevel::Critical,
        "Bash + Write can execute commands and persist changes",
        "Remove Write if only reading is needed, or limit Bash scope",
    ),
    (
        &["Bash", "Edit"],
        RiskLevel::High,
        "Bash + Edit can execute commands and modify files",
        "Consider if both are truly necessary",
    ),
    (
        &["Read", "Bash"],
        RiskLevel::Medium,
        "Read + Bash can read sensitive files and execute commands",
        "Ensure Bash commands don't leak sensitive file contents",
    ),
];

/// Known safe/read-only tools
const SAFE_TOOLS: &[&str] = &[
    "Read",
    "Grep",
    "Glob",
    "LS",
    "WebFetch",
    "WebSearch",
    "Task",
    "AskUserQuestion",
    "TodoWrite",
    "NotebookEdit",
];

/// Tool patterns commonly used in skill content
const TOOL_PATTERNS: &[(&str, &str)] = &[
    (r"\bRead\b", "Read"),
    (r"\bGrep\b", "Grep"),
    (r"\bGlob\b", "Glob"),
    (r"\bBash\b", "Bash"),
    (r"\bWrite\b", "Write"),
    (r"\bEdit\b", "Edit"),
    (r"\bLS\b", "LS"),
    (r"\bWebFetch\b", "WebFetch"),
    (r"\bWebSearch\b", "WebSearch"),
    (r"\bTask\b", "Task"),
    (r"\bAskUserQuestion\b", "AskUserQuestion"),
    (r"\bTodoWrite\b", "TodoWrite"),
    (r"\bmcp__", "mcp__*"), // MCP tool usage
];

/// Analyze permissions for security risks
pub fn analyze_permissions(allowed_tools: &[String], skill_content: &str) -> SecurityReview {
    // Handle wildcard case first
    if has_wildcard(allowed_tools) {
        return analyze_wildcard_permissions(allowed_tools, skill_content);
    }

    let mut high_risk_permissions = Vec::new();
    let mut score = 100u8;

    // 1. Check for individual high-risk tools
    for tool in allowed_tools {
        if let Some(risk) = check_tool_risk(tool) {
            high_risk_permissions.push(risk.clone());
            score = score.saturating_sub(get_risk_penalty(&risk.risk_level));
        }
    }

    // 2. Check for dangerous combinations
    let combo_risks = check_dangerous_combinations(allowed_tools);
    for risk in combo_risks {
        score = score.saturating_sub(get_risk_penalty(&risk.risk_level));
        high_risk_permissions.push(risk);
    }

    // 3. Detect unused permissions
    let unused_permissions = detect_unused_permissions(allowed_tools, skill_content);
    score = score.saturating_sub((unused_permissions.len() * 3) as u8); // -3 per unused

    // 4. Suggest minimum required permissions
    let minimum_required = suggest_minimum_permissions(skill_content);

    SecurityReview {
        score,
        unused_permissions,
        high_risk_permissions,
        minimum_required,
    }
}

/// Check if permissions include wildcard
fn has_wildcard(allowed_tools: &[String]) -> bool {
    allowed_tools.iter().any(|t| t == "*")
}

/// Special handling for wildcard permissions
fn analyze_wildcard_permissions(allowed_tools: &[String], skill_content: &str) -> SecurityReview {
    let mut high_risk_permissions = vec![RiskFlag {
        permission: "*".to_string(),
        risk_level: RiskLevel::Critical,
        explanation: "Wildcard (*) grants ALL permissions - this is extremely dangerous and should be avoided".to_string(),
        mitigation: Some("Replace with specific tool list based on actual needs".to_string()),
    }];

    // Also flag any explicit high-risk tools alongside wildcard
    for tool in allowed_tools {
        if tool != "*" {
            if let Some(risk) = check_tool_risk(tool) {
                high_risk_permissions.push(risk);
            }
        }
    }

    SecurityReview {
        score: 10, // Very low score for wildcard
        unused_permissions: vec![], // Can't determine unused with wildcard
        high_risk_permissions,
        minimum_required: suggest_minimum_permissions(skill_content),
    }
}

/// Check if a specific tool is high-risk
fn check_tool_risk(tool: &str) -> Option<RiskFlag> {
    for (pattern, risk_level, explanation) in HIGH_RISK_TOOLS {
        // Exact match
        if tool == *pattern {
            return Some(RiskFlag {
                permission: tool.to_string(),
                risk_level: risk_level.clone(),
                explanation: explanation.to_string(),
                mitigation: get_mitigation_for_tool(tool),
            });
        }

        // Pattern match for wildcards (e.g., "mcp__*" matches "mcp__github__create_issue")
        if pattern.ends_with('*') {
            let prefix = &pattern[..pattern.len()-1];
            if !prefix.is_empty() && tool.starts_with(prefix) {
                return Some(RiskFlag {
                    permission: tool.to_string(),
                    risk_level: risk_level.clone(),
                    explanation: explanation.to_string(),
                    mitigation: get_mitigation_for_tool(tool),
                });
            }
        }
    }
    None
}

/// Get mitigation advice for specific tools
fn get_mitigation_for_tool(tool: &str) -> Option<String> {
    match tool {
        "Bash" => Some("Limit Bash usage to specific commands or use Read/Grep instead".to_string()),
        "Write" => Some("Consider if Edit is sufficient, or limit write paths".to_string()),
        "Edit" => Some("Ensure edits are limited to necessary files only".to_string()),
        "*" => Some("Replace with specific tool list based on actual needs".to_string()),
        t if t.starts_with("mcp__") => Some("Use specific MCP tool names instead of wildcards".to_string()),
        _ => None,
    }
}

/// Check for dangerous permission combinations
fn check_dangerous_combinations(allowed_tools: &[String]) -> Vec<RiskFlag> {
    let mut risks = Vec::new();
    let tool_set: HashSet<&str> = allowed_tools.iter().map(|s| s.as_str()).collect();

    for (combo, risk_level, explanation, mitigation) in DANGEROUS_COMBINATIONS {
        if combo.iter().all(|t| tool_set.contains(*t)) {
            risks.push(RiskFlag {
                permission: combo.join(" + "),
                risk_level: risk_level.clone(),
                explanation: explanation.to_string(),
                mitigation: Some(mitigation.to_string()),
            });
        }
    }

    risks
}

/// Detect permissions that are declared but not used in skill content
fn detect_unused_permissions(allowed_tools: &[String], skill_content: &str) -> Vec<String> {
    let mut unused = Vec::new();
    let content_lower = skill_content.to_lowercase();

    for tool in allowed_tools {
        // Skip wildcards
        if tool == "*" || tool.ends_with("*") {
            continue;
        }

        // Check if tool is mentioned in content (case-insensitive check)
        let tool_lower = tool.to_lowercase();
        if !content_lower.contains(&tool_lower) {
            // Also check for common patterns
            let mentioned = TOOL_PATTERNS.iter().any(|(pattern, tool_name)| {
                if *tool_name == tool {
                    Regex::new(pattern).map(|re| re.is_match(skill_content)).unwrap_or(false)
                } else {
                    false
                }
            });

            if !mentioned {
                unused.push(tool.clone());
            }
        }
    }

    unused
}

/// Suggest minimum required permissions based on skill content
fn suggest_minimum_permissions(skill_content: &str) -> Vec<String> {
    let mut suggested = Vec::new();

    for (pattern, tool_name) in TOOL_PATTERNS {
        if let Ok(re) = Regex::new(pattern) {
            if re.is_match(skill_content) {
                // Handle MCP tools specially
                if *tool_name == "mcp__*" {
                    // Try to extract specific MCP tool names
                    if let Ok(mcp_re) = Regex::new(r"mcp__\w+__\w+") {
                        for cap in mcp_re.find_iter(skill_content) {
                            if !suggested.contains(&cap.as_str().to_string()) {
                                suggested.push(cap.as_str().to_string());
                            }
                        }
                    }
                } else if !suggested.contains(&tool_name.to_string()) {
                    suggested.push(tool_name.to_string());
                }
            }
        }
    }

    // Sort for consistent ordering
    suggested.sort();
    suggested
}

/// Get score penalty for risk level
fn get_risk_penalty(risk_level: &RiskLevel) -> u8 {
    match risk_level {
        RiskLevel::Critical => 40,
        RiskLevel::High => 20,
        RiskLevel::Medium => 10,
        RiskLevel::Low => 5,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ==================== Wildcard Detection Tests ====================

    #[test]
    fn test_wildcard_detection_true() {
        assert!(has_wildcard(&["*".to_string()]));
        assert!(has_wildcard(&["Read".to_string(), "*".to_string()]));
    }

    #[test]
    fn test_wildcard_detection_false() {
        assert!(!has_wildcard(&["Read".to_string()]));
        assert!(!has_wildcard(&["Bash".to_string(), "Write".to_string()]));
        assert!(!has_wildcard(&[]));
    }

    // ==================== Wildcard Analysis Tests ====================

    #[test]
    fn test_analyze_wildcard_permissions_critical_score() {
        let result = analyze_permissions(&["*".to_string()], "Some skill content");
        assert_eq!(result.score, 10);
        assert!(result.high_risk_permissions.iter().any(|r| r.permission == "*"));
        assert!(result.high_risk_permissions[0].risk_level == RiskLevel::Critical);
    }

    #[test]
    fn test_analyze_wildcard_with_explanation() {
        let result = analyze_permissions(&["*".to_string()], "");
        let wildcard_risk = result.high_risk_permissions.iter().find(|r| r.permission == "*").unwrap();
        assert!(wildcard_risk.explanation.contains("ALL permissions"));
        assert!(wildcard_risk.mitigation.is_some());
    }

    // ==================== Individual Tool Risk Tests ====================

    #[test]
    fn test_bash_is_high_risk() {
        let risk = check_tool_risk("Bash").unwrap();
        assert_eq!(risk.risk_level, RiskLevel::High);
        assert!(risk.explanation.contains("command execution"));
    }

    #[test]
    fn test_write_is_medium_risk() {
        let risk = check_tool_risk("Write").unwrap();
        assert_eq!(risk.risk_level, RiskLevel::Medium);
    }

    #[test]
    fn test_read_is_safe() {
        assert!(check_tool_risk("Read").is_none());
    }

    #[test]
    fn test_grep_is_safe() {
        assert!(check_tool_risk("Grep").is_none());
    }

    #[test]
    fn test_mcp_wildcard_is_high_risk() {
        // This tests pattern matching for mcp__* style wildcards
        let result = analyze_permissions(&["mcp__*".to_string()], "");
        assert!(result.high_risk_permissions.iter().any(|r| r.permission.starts_with("mcp__")));
    }

    // ==================== Dangerous Combination Tests ====================

    #[test]
    fn test_bash_write_combination_critical() {
        let risks = check_dangerous_combinations(&["Bash".to_string(), "Write".to_string()]);
        assert_eq!(risks.len(), 1);
        assert_eq!(risks[0].risk_level, RiskLevel::Critical);
        assert!(risks[0].permission.contains("Bash"));
        assert!(risks[0].permission.contains("Write"));
    }

    #[test]
    fn test_bash_edit_combination_high() {
        let risks = check_dangerous_combinations(&["Bash".to_string(), "Edit".to_string()]);
        assert_eq!(risks.len(), 1);
        assert_eq!(risks[0].risk_level, RiskLevel::High);
    }

    #[test]
    fn test_read_bash_combination_medium() {
        let risks = check_dangerous_combinations(&["Read".to_string(), "Bash".to_string()]);
        assert_eq!(risks.len(), 1);
        assert_eq!(risks[0].risk_level, RiskLevel::Medium);
    }

    #[test]
    fn test_no_combination_for_safe_tools() {
        let risks = check_dangerous_combinations(&["Read".to_string(), "Grep".to_string()]);
        assert!(risks.is_empty());
    }

    #[test]
    fn test_combination_requires_all_tools() {
        // Only Bash without Write should not trigger the combination
        let risks = check_dangerous_combinations(&["Bash".to_string()]);
        assert!(!risks.iter().any(|r| r.permission.contains("Write")));
    }

    // ==================== Unused Permission Tests ====================

    #[test]
    fn test_detect_unused_permissions_all_used() {
        let content = "Use Read to read files and Grep to search";
        let unused = detect_unused_permissions(&["Read".to_string(), "Grep".to_string()], content);
        assert!(unused.is_empty());
    }

    #[test]
    fn test_detect_unused_permissions_some_unused() {
        let content = "Only uses Read tool";
        let unused = detect_unused_permissions(
            &["Read".to_string(), "Write".to_string(), "Bash".to_string()],
            content,
        );
        assert!(unused.contains(&"Write".to_string()));
        assert!(unused.contains(&"Bash".to_string()));
        assert!(!unused.contains(&"Read".to_string()));
    }

    #[test]
    fn test_detect_unused_permissions_case_insensitive() {
        let content = "use the read tool to READ files";
        let unused = detect_unused_permissions(&["Read".to_string()], content);
        assert!(unused.is_empty());
    }

    #[test]
    fn test_detect_unused_skips_wildcards() {
        let content = "Some content";
        let unused = detect_unused_permissions(&["*".to_string()], content);
        assert!(unused.is_empty()); // Wildcard is skipped
    }

    // ==================== Minimum Permission Suggestion Tests ====================

    #[test]
    fn test_suggest_minimum_read_grep() {
        let content = "Use Read to read the file, then Grep to find patterns";
        let suggested = suggest_minimum_permissions(content);
        assert!(suggested.contains(&"Read".to_string()));
        assert!(suggested.contains(&"Grep".to_string()));
    }

    #[test]
    fn test_suggest_minimum_bash() {
        let content = "Execute Bash commands for deployment";
        let suggested = suggest_minimum_permissions(content);
        assert!(suggested.contains(&"Bash".to_string()));
    }

    #[test]
    fn test_suggest_minimum_mcp_tools() {
        let content = "Use mcp__github__create_issue to create issues and mcp__github__list_issues to list them";
        let suggested = suggest_minimum_permissions(content);
        assert!(suggested.contains(&"mcp__github__create_issue".to_string()));
        assert!(suggested.contains(&"mcp__github__list_issues".to_string()));
    }

    #[test]
    fn test_suggest_minimum_empty_content() {
        let suggested = suggest_minimum_permissions("");
        assert!(suggested.is_empty());
    }

    #[test]
    fn test_suggest_minimum_sorted() {
        let content = "Use Write, Read, and Bash";
        let suggested = suggest_minimum_permissions(content);
        // Should be sorted alphabetically
        let mut sorted = suggested.clone();
        sorted.sort();
        assert_eq!(suggested, sorted);
    }

    // ==================== Full Analysis Tests ====================

    #[test]
    fn test_analyze_safe_permissions_high_score() {
        let result = analyze_permissions(
            &["Read".to_string(), "Grep".to_string()],
            "This skill uses Read and Grep to analyze files",
        );
        assert!(result.score >= 90);
        assert!(result.high_risk_permissions.is_empty());
    }

    #[test]
    fn test_analyze_risky_permissions_lower_score() {
        let result = analyze_permissions(
            &["Bash".to_string(), "Write".to_string()],
            "Uses Bash and Write for deployments",
        );
        // Should have lower score due to high-risk tools and dangerous combination
        assert!(result.score < 70);
        assert!(!result.high_risk_permissions.is_empty());
    }

    #[test]
    fn test_analyze_unused_permissions_penalty() {
        let result = analyze_permissions(
            &["Read".to_string(), "Bash".to_string(), "Write".to_string()],
            "Only uses Read tool",
        );
        // Unused Bash and Write should be detected
        assert!(result.unused_permissions.contains(&"Bash".to_string()));
        assert!(result.unused_permissions.contains(&"Write".to_string()));
    }

    #[test]
    fn test_analyze_empty_permissions() {
        let result = analyze_permissions(&[], "Some content");
        assert_eq!(result.score, 100);
        assert!(result.high_risk_permissions.is_empty());
        assert!(result.unused_permissions.is_empty());
    }

    #[test]
    fn test_analyze_provides_mitigation() {
        let result = analyze_permissions(&["Bash".to_string()], "Uses Bash");
        let bash_risk = result.high_risk_permissions.iter().find(|r| r.permission == "Bash").unwrap();
        assert!(bash_risk.mitigation.is_some());
    }

    // ==================== Risk Penalty Tests ====================

    #[test]
    fn test_risk_penalty_critical() {
        assert_eq!(get_risk_penalty(&RiskLevel::Critical), 40);
    }

    #[test]
    fn test_risk_penalty_high() {
        assert_eq!(get_risk_penalty(&RiskLevel::High), 20);
    }

    #[test]
    fn test_risk_penalty_medium() {
        assert_eq!(get_risk_penalty(&RiskLevel::Medium), 10);
    }

    #[test]
    fn test_risk_penalty_low() {
        assert_eq!(get_risk_penalty(&RiskLevel::Low), 5);
    }

    // ==================== Edge Cases ====================

    #[test]
    fn test_score_does_not_go_negative() {
        // Many high-risk tools should not result in negative score
        let result = analyze_permissions(
            &["*".to_string()], // Worst case
            "",
        );
        assert!(result.score >= 0);
    }

    #[test]
    fn test_handles_mixed_case_tools() {
        let content = "Use BASH for commands";
        let unused = detect_unused_permissions(&["Bash".to_string()], content);
        assert!(unused.is_empty()); // Should find bash in BASH
    }

    #[test]
    fn test_duplicate_mcp_tools_not_suggested() {
        let content = "mcp__github__create_issue and again mcp__github__create_issue";
        let suggested = suggest_minimum_permissions(content);
        let count = suggested.iter().filter(|s| *s == "mcp__github__create_issue").count();
        assert_eq!(count, 1); // Should only appear once
    }
}

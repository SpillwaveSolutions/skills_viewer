// Feature 021: Permissions Analyzer (FR-004, US-021-003)
// Analyzes allowed-tools for security risks

use crate::models::analysis::{SecurityReview, RiskFlag, RiskLevel};

/// Analyze permissions for security risks
pub fn analyze_permissions(allowed_tools: &[String], skill_content: &str) -> SecurityReview {
    // TODO: Implement security analysis (Phase 6)
    // - parse_allowed_tools() from frontmatter
    // - detect_unused_permissions() - cross-reference with skill content
    // - flag_high_risk_permissions() - Bash + Write, wildcard, etc.
    // - suggest_minimum_permissions()
    // - calculate_security_score()

    SecurityReview {
        score: 100, // Placeholder
        unused_permissions: vec![],
        high_risk_permissions: vec![],
        minimum_required: vec![],
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_analyze_permissions_empty() {
        let review = analyze_permissions(&[], "");
        assert_eq!(review.score, 100);
    }
}

// Feature 021: Spec Validator (FR-001, US-021-001)
// Validates skills against Anthropic Skills Specification

use crate::models::analysis::{SpecCompliance, Violation, Warning};

/// Validate skill against Anthropic Skills Specification
pub fn validate_skill(skill_content: &str, frontmatter: &serde_yaml::Value) -> SpecCompliance {
    let mut violations = Vec::new();
    let mut warnings = Vec::new();

    // TODO: Implement validation logic (Phase 4)
    // - validate_frontmatter() - check required fields
    // - check_required_sections() - ## Triggers, ## Usage notes
    // - validate_allowed_tools() - syntax validation
    // - detect_common_typos() - triggers vs trigger, etc.

    let score = calculate_spec_score(&violations, &warnings);

    SpecCompliance {
        score,
        violations,
        warnings,
    }
}

fn calculate_spec_score(violations: &[Violation], warnings: &[Warning]) -> u8 {
    let violation_penalty = violations.len() as i32 * 20;
    let warning_penalty = warnings.len() as i32 * 5;
    let total_penalty = violation_penalty + warning_penalty;

    (100 - total_penalty.min(100)).max(0) as u8
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_spec_score_no_issues() {
        let score = calculate_spec_score(&[], &[]);
        assert_eq!(score, 100);
    }
}

// Feature 021: Spec Validator (FR-001, US-021-001)
// Validates skills against Anthropic Skills Specification

use crate::models::analysis::{SpecCompliance, Violation, Warning};

/// Validate skill against Anthropic Skills Specification
pub fn validate_skill(skill_content: &str, frontmatter: &serde_yaml::Value) -> SpecCompliance {
    let mut violations = Vec::new();
    let mut warnings = Vec::new();

    // T057: Validate frontmatter (check name, description required)
    validate_frontmatter(frontmatter, &mut violations);

    // T058: Check required sections
    check_required_sections(skill_content, &mut warnings);

    // T059: Validate allowed-tools syntax
    validate_allowed_tools(frontmatter, &mut violations);

    // T060: Detect common typos
    detect_common_typos(frontmatter, &mut warnings);

    // T061: Calculate spec score
    let score = calculate_spec_score(&violations, &warnings);

    // T062: Return SpecCompliance struct
    SpecCompliance {
        score,
        violations,
        warnings,
    }
}

/// T057: Validate frontmatter required fields
fn validate_frontmatter(frontmatter: &serde_yaml::Value, violations: &mut Vec<Violation>) {
    // Check for 'name' field
    if frontmatter.get("name").is_none() {
        violations.push(Violation {
            rule: "missing_required_field".to_string(),
            message: "Skill is missing required 'name' field in frontmatter".to_string(),
            fix_suggestion: Some("Add 'name: your-skill-name' to the frontmatter section".to_string()),
            line_number: Some(1),
        });
    }

    // Check for 'description' field
    if frontmatter.get("description").is_none() {
        violations.push(Violation {
            rule: "missing_required_field".to_string(),
            message: "Skill is missing required 'description' field in frontmatter".to_string(),
            fix_suggestion: Some("Add 'description: Your skill description' to the frontmatter section".to_string()),
            line_number: Some(1),
        });
    }
}

/// T058: Check for required sections in skill content
fn check_required_sections(_skill_content: &str, _warnings: &mut Vec<Warning>) {
    // Note: The Agent Skills Spec does not mandate any specific markdown sections.
    // The only required elements are the `name` and `description` frontmatter fields.
    // Skills can organize their markdown body however they see fit.
}

/// T059: Validate allowed-tools field syntax
fn validate_allowed_tools(frontmatter: &serde_yaml::Value, violations: &mut Vec<Violation>) {
    if let Some(allowed_tools) = frontmatter.get("allowed-tools") {
        // Check if it's an array
        if !allowed_tools.is_sequence() {
            violations.push(Violation {
                rule: "invalid_allowed_tools".to_string(),
                message: "'allowed-tools' must be an array/list".to_string(),
                fix_suggestion: Some("Use YAML array syntax: allowed-tools: [Read, Grep]".to_string()),
                line_number: None,
            });
        }
    }
}

/// T060: Detect common typos and non-standard fields in frontmatter
fn detect_common_typos(frontmatter: &serde_yaml::Value, warnings: &mut Vec<Warning>) {
    // Check for 'trigger' or 'triggers' - neither is part of the spec
    if frontmatter.get("trigger").is_some() || frontmatter.get("triggers").is_some() {
        warnings.push(Warning {
            rule: "non_standard_field".to_string(),
            message: "Found 'trigger'/'triggers' field which is not part of the Agent Skills Spec".to_string(),
            recommendation: Some("Incorporate trigger keywords into your 'description' field instead. Use the 'metadata' field for custom properties.".to_string()),
        });
    }

    // Check for 'tool' instead of 'allowed-tools'
    if frontmatter.get("tool").is_some() || frontmatter.get("tools").is_some() {
        warnings.push(Warning {
            rule: "possible_typo".to_string(),
            message: "Found 'tool' or 'tools' field, did you mean 'allowed-tools'?".to_string(),
            recommendation: Some("Use 'allowed-tools' for specifying permitted tools".to_string()),
        });
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
    use serde_yaml;

    // T063: Test missing name field → violation
    #[test]
    fn test_missing_name_field_violation() {
        let frontmatter_yaml = "description: Test skill";
        let frontmatter: serde_yaml::Value = serde_yaml::from_str(frontmatter_yaml).unwrap();
        let skill_content = "# Test Skill\n\nThis is a test.";

        let result = validate_skill(skill_content, &frontmatter);

        assert!(result.violations.iter().any(|v| v.rule == "missing_required_field" && v.message.contains("name")));
        assert!(result.score < 100);
    }

    // T064: Test missing description field → violation
    #[test]
    fn test_missing_description_field_violation() {
        let frontmatter_yaml = "name: test-skill";
        let frontmatter: serde_yaml::Value = serde_yaml::from_str(frontmatter_yaml).unwrap();
        let skill_content = "# Test Skill\n\nThis is a test.";

        let result = validate_skill(skill_content, &frontmatter);

        assert!(result.violations.iter().any(|v| v.rule == "missing_required_field" && v.message.contains("description")));
        assert!(result.score < 100);
    }

    // T065: Test missing Triggers section → warning
    #[test]
    fn test_missing_triggers_section_warning() {
        let frontmatter_yaml = "name: test-skill\ndescription: Test description";
        let frontmatter: serde_yaml::Value = serde_yaml::from_str(frontmatter_yaml).unwrap();
        let skill_content = "# Test Skill\n\n## Usage notes\n\nSome notes.";

        let result = validate_skill(skill_content, &frontmatter);

        assert!(result.warnings.iter().any(|w| w.rule == "missing_section" && w.message.contains("Triggers")));
    }

    // T066: Test malformed allowed-tools → violation
    #[test]
    fn test_malformed_allowed_tools_violation() {
        let frontmatter_yaml = "name: test-skill\ndescription: Test\nallowed-tools: not_an_array";
        let frontmatter: serde_yaml::Value = serde_yaml::from_str(frontmatter_yaml).unwrap();
        let skill_content = "# Test";

        let result = validate_skill(skill_content, &frontmatter);

        assert!(result.violations.iter().any(|v| v.rule == "invalid_allowed_tools"));
    }

    // T067: Test valid skill → score 100, no violations
    #[test]
    fn test_valid_skill_perfect_score() {
        let frontmatter_yaml = r#"
name: test-skill
description: A test skill
allowed-tools:
  - Read
  - Grep
"#;
        let frontmatter: serde_yaml::Value = serde_yaml::from_str(frontmatter_yaml).unwrap();
        let skill_content = r#"# Test Skill

## Triggers

- test
- skill

## Usage notes

Use this skill for testing.
"#;

        let result = validate_skill(skill_content, &frontmatter);

        assert_eq!(result.violations.len(), 0);
        assert_eq!(result.warnings.len(), 0);
        assert_eq!(result.score, 100);
    }

    #[test]
    fn test_calculate_spec_score_no_issues() {
        let score = calculate_spec_score(&[], &[]);
        assert_eq!(score, 100);
    }

    #[test]
    fn test_calculate_spec_score_with_violations() {
        let violations = vec![
            Violation {
                rule: "test".to_string(),
                message: "test".to_string(),
                fix_suggestion: None,
                line_number: None,
            }
        ];
        let score = calculate_spec_score(&violations, &[]);
        assert_eq!(score, 80); // 100 - (1 * 20) = 80
    }

    #[test]
    fn test_calculate_spec_score_with_warnings() {
        let warnings = vec![
            Warning {
                rule: "test".to_string(),
                message: "test".to_string(),
                recommendation: None,
            }
        ];
        let score = calculate_spec_score(&[], &warnings);
        assert_eq!(score, 95); // 100 - (1 * 5) = 95
    }
}

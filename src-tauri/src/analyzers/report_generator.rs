// Feature 021: Markdown Report Generator (FR-009, FR-010)
// Generates standalone markdown reports with embedded JSON for each analyzer

use crate::models::analysis::{
    AnalyzerReport, AnalyzerStatus, LinkValidation, PDAAnalysis, SecurityReview, SpecCompliance,
    TriggerSuggestion,
};
use serde_json::json;
use std::time::Instant;

/// Trait for generating markdown reports from analyzer results
pub trait MarkdownReportGenerator {
    fn generate_markdown_report(&self, duration_ms: u64) -> AnalyzerReport;
}

// =============================================================================
// Spec Compliance Report Generator
// =============================================================================

impl MarkdownReportGenerator for SpecCompliance {
    fn generate_markdown_report(&self, duration_ms: u64) -> AnalyzerReport {
        let status_text = if self.violations.is_empty() && self.warnings.is_empty() {
            "✅ Pass"
        } else if self.violations.is_empty() {
            "⚠️ Warning"
        } else {
            "❌ Fail"
        };

        let analyzer_status = if self.violations.is_empty() {
            AnalyzerStatus::Complete
        } else {
            AnalyzerStatus::Complete // Still complete, just has issues
        };

        let mut markdown = format!(
            r#"## Spec Compliance Analysis

**Status**: {}
**Score**: {}/100
**Duration**: {}ms

"#,
            status_text, self.score, duration_ms
        );

        // Findings section
        if !self.violations.is_empty() || !self.warnings.is_empty() {
            markdown.push_str("### Findings\n\n");

            for violation in &self.violations {
                markdown.push_str(&format!("- ❌ **{}**: {}\n", violation.rule, violation.message));
            }

            for warning in &self.warnings {
                markdown.push_str(&format!("- ⚠️ **{}**: {}\n", warning.rule, warning.message));
            }

            markdown.push('\n');
        } else {
            markdown.push_str("### Findings\n\n✅ No issues found. Skill is compliant with Anthropic specification.\n\n");
        }

        // Suggestions section
        if !self.violations.is_empty() || !self.warnings.is_empty() {
            markdown.push_str("### Suggestions\n\n");

            for (i, violation) in self.violations.iter().enumerate() {
                markdown.push_str(&format!(
                    "{}. **Issue**: {}\n",
                    i + 1,
                    violation.message
                ));
                if let Some(fix) = &violation.fix_suggestion {
                    markdown.push_str(&format!("   **Fix**: {}\n", fix));
                }
                if let Some(line) = violation.line_number {
                    markdown.push_str(&format!("   **Location**: Line {}\n", line));
                }
                markdown.push('\n');
            }

            for (i, warning) in self.warnings.iter().enumerate() {
                markdown.push_str(&format!(
                    "{}. **Warning**: {}\n",
                    self.violations.len() + i + 1,
                    warning.message
                ));
                if let Some(rec) = &warning.recommendation {
                    markdown.push_str(&format!("   **Recommendation**: {}\n", rec));
                }
                markdown.push('\n');
            }
        }

        // JSON data block
        let json_data = json!({
            "analyzer": "spec_compliance",
            "score": self.score,
            "violations": self.violations,
            "warnings": self.warnings
        });

        markdown.push_str(&format!(
            r#"---

```json
{}
```
"#,
            serde_json::to_string_pretty(&json_data).unwrap_or_default()
        ));

        AnalyzerReport {
            analyzer_name: "Spec Compliance".to_string(),
            markdown,
            json_data,
            status: analyzer_status,
            duration_ms,
            score: Some(self.score),
        }
    }
}

// =============================================================================
// PDA Analysis Report Generator
// =============================================================================

impl MarkdownReportGenerator for PDAAnalysis {
    fn generate_markdown_report(&self, duration_ms: u64) -> AnalyzerReport {
        let status_text = if self.score >= 80 {
            "✅ Good"
        } else if self.score >= 60 {
            "⚠️ Needs Improvement"
        } else {
            "❌ Poor"
        };

        let mut markdown = format!(
            r#"## PDA (Progressive Disclosure Architecture) Analysis

**Status**: {}
**Score**: {}/100
**Token Estimate**: {} tokens
**Duration**: {}ms

"#,
            status_text, self.score, self.token_estimate, duration_ms
        );

        // Tier Breakdown
        markdown.push_str("### Tier Breakdown\n\n");
        markdown.push_str(&format!(
            "| Tier | Tokens | Percentage |\n|------|--------|------------|\n"
        ));

        let total = self.tier_breakdown.metadata_tokens
            + self.tier_breakdown.orchestrator_tokens
            + self.tier_breakdown.resource_tokens;

        if total > 0 {
            let meta_pct = (self.tier_breakdown.metadata_tokens as f64 / total as f64) * 100.0;
            let orch_pct = (self.tier_breakdown.orchestrator_tokens as f64 / total as f64) * 100.0;
            let res_pct = (self.tier_breakdown.resource_tokens as f64 / total as f64) * 100.0;

            markdown.push_str(&format!(
                "| Metadata | {} | {:.1}% |\n",
                self.tier_breakdown.metadata_tokens, meta_pct
            ));
            markdown.push_str(&format!(
                "| Orchestrator | {} | {:.1}% |\n",
                self.tier_breakdown.orchestrator_tokens, orch_pct
            ));
            markdown.push_str(&format!(
                "| Resources | {} | {:.1}% |\n",
                self.tier_breakdown.resource_tokens, res_pct
            ));
        }

        markdown.push('\n');

        // Recommendations
        if !self.recommendations.is_empty() {
            markdown.push_str("### Recommendations\n\n");
            for rec in &self.recommendations {
                markdown.push_str(&format!("- {}\n", rec));
            }
            markdown.push('\n');
        }

        // Suggested Structure
        if !self.suggested_structure.is_empty() {
            markdown.push_str("### Suggested Structure\n\n");
            for suggestion in &self.suggested_structure {
                markdown.push_str(&format!("- {}\n", suggestion));
            }
            markdown.push('\n');
        }

        // AI Insights
        if let Some(insights) = &self.ai_insights {
            if !insights.is_empty() {
                markdown.push_str("### AI Insights\n\n");
                for insight in insights {
                    markdown.push_str(&format!("- {}\n", insight));
                }
                markdown.push('\n');
            }
        }

        // JSON data block
        let json_data = json!({
            "analyzer": "pda_analysis",
            "score": self.score,
            "token_estimate": self.token_estimate,
            "tier_breakdown": {
                "metadata_tokens": self.tier_breakdown.metadata_tokens,
                "orchestrator_tokens": self.tier_breakdown.orchestrator_tokens,
                "resource_tokens": self.tier_breakdown.resource_tokens
            },
            "recommendations": self.recommendations,
            "suggested_structure": self.suggested_structure
        });

        markdown.push_str(&format!(
            r#"---

```json
{}
```
"#,
            serde_json::to_string_pretty(&json_data).unwrap_or_default()
        ));

        AnalyzerReport {
            analyzer_name: "PDA Analysis".to_string(),
            markdown,
            json_data,
            status: AnalyzerStatus::Complete,
            duration_ms,
            score: Some(self.score),
        }
    }
}

// =============================================================================
// Security Review Report Generator
// =============================================================================

impl MarkdownReportGenerator for SecurityReview {
    fn generate_markdown_report(&self, duration_ms: u64) -> AnalyzerReport {
        let status_text = if self.score >= 80 {
            "✅ Secure"
        } else if self.score >= 60 {
            "⚠️ Review Recommended"
        } else if self.score >= 40 {
            "⚠️ Security Concerns"
        } else {
            "❌ High Risk"
        };

        let mut markdown = format!(
            r#"## Security & Permissions Analysis

**Status**: {}
**Score**: {}/100
**Duration**: {}ms

"#,
            status_text, self.score, duration_ms
        );

        // High Risk Permissions
        if !self.high_risk_permissions.is_empty() {
            markdown.push_str("### ⚠️ High Risk Permissions\n\n");
            for flag in &self.high_risk_permissions {
                let risk_emoji = match flag.risk_level {
                    crate::models::analysis::RiskLevel::Critical => "🔴",
                    crate::models::analysis::RiskLevel::High => "🟠",
                    crate::models::analysis::RiskLevel::Medium => "🟡",
                    crate::models::analysis::RiskLevel::Low => "🟢",
                };
                markdown.push_str(&format!(
                    "- {} **{}** ({}): {}\n",
                    risk_emoji,
                    flag.permission,
                    format!("{:?}", flag.risk_level).to_lowercase(),
                    flag.explanation
                ));
                if let Some(mitigation) = &flag.mitigation {
                    markdown.push_str(&format!("  - *Mitigation*: {}\n", mitigation));
                }
            }
            markdown.push('\n');
        }

        // Unused Permissions
        if !self.unused_permissions.is_empty() {
            markdown.push_str("### 📋 Unused Permissions\n\n");
            markdown.push_str("The following permissions are declared but not used in the skill:\n\n");
            for perm in &self.unused_permissions {
                markdown.push_str(&format!("- `{}`\n", perm));
            }
            markdown.push_str("\n*Consider removing unused permissions to follow the principle of least privilege.*\n\n");
        }

        // Minimum Required
        if !self.minimum_required.is_empty() {
            markdown.push_str("### ✅ Minimum Required Permissions\n\n");
            markdown.push_str("Based on skill analysis, the minimum permissions needed are:\n\n");
            markdown.push_str("```yaml\nallowed-tools:\n");
            for perm in &self.minimum_required {
                markdown.push_str(&format!("  - {}\n", perm));
            }
            markdown.push_str("```\n\n");
        }

        // JSON data block
        let json_data = json!({
            "analyzer": "permissions",
            "score": self.score,
            "unused_permissions": self.unused_permissions,
            "high_risk_permissions": self.high_risk_permissions,
            "minimum_required": self.minimum_required
        });

        markdown.push_str(&format!(
            r#"---

```json
{}
```
"#,
            serde_json::to_string_pretty(&json_data).unwrap_or_default()
        ));

        AnalyzerReport {
            analyzer_name: "Security & Permissions".to_string(),
            markdown,
            json_data,
            status: AnalyzerStatus::Complete,
            duration_ms,
            score: Some(self.score),
        }
    }
}

// =============================================================================
// Trigger Suggestions Report Generator
// =============================================================================

pub fn generate_triggers_report(suggestions: &[TriggerSuggestion], duration_ms: u64) -> AnalyzerReport {
    let has_good_suggestions = suggestions.iter().any(|s| s.relevance_score >= 70);
    let status_text = if suggestions.is_empty() {
        "ℹ️ No Suggestions"
    } else if has_good_suggestions {
        "✅ Suggestions Available"
    } else {
        "⚠️ Low Confidence Suggestions"
    };

    let mut markdown = format!(
        r#"## Trigger Keyword Suggestions

**Status**: {}
**Suggestions**: {}
**Duration**: {}ms

"#,
        status_text,
        suggestions.len(),
        duration_ms
    );

    if suggestions.is_empty() {
        markdown.push_str("### Suggestions\n\nNo additional trigger keywords suggested. Your current triggers appear comprehensive.\n\n");
    } else {
        markdown.push_str("### Suggested Keywords\n\n");
        markdown.push_str("| Keyword | Relevance | Explanation |\n|---------|-----------|-------------|\n");

        for suggestion in suggestions {
            let relevance_badge = if suggestion.relevance_score >= 80 {
                "🟢 High"
            } else if suggestion.relevance_score >= 60 {
                "🟡 Medium"
            } else {
                "🔴 Low"
            };

            markdown.push_str(&format!(
                "| `{}` | {} ({}%) | {} |\n",
                suggestion.keyword,
                relevance_badge,
                suggestion.relevance_score,
                suggestion.explanation
            ));
        }

        markdown.push_str("\n### How to Add\n\n");
        markdown.push_str("Add these keywords to your skill's frontmatter:\n\n");
        markdown.push_str("```yaml\ntriggers:\n");
        for suggestion in suggestions.iter().filter(|s| s.relevance_score >= 70) {
            markdown.push_str(&format!("  - {}\n", suggestion.keyword));
        }
        markdown.push_str("```\n\n");
    }

    // JSON data block
    let json_data = json!({
        "analyzer": "triggers",
        "suggestion_count": suggestions.len(),
        "suggestions": suggestions
    });

    markdown.push_str(&format!(
        r#"---

```json
{}
```
"#,
        serde_json::to_string_pretty(&json_data).unwrap_or_default()
    ));

    AnalyzerReport {
        analyzer_name: "Trigger Suggestions".to_string(),
        markdown,
        json_data,
        status: AnalyzerStatus::Complete,
        duration_ms,
        score: None,
    }
}

// =============================================================================
// Link Validation Report Generator
// =============================================================================

impl MarkdownReportGenerator for LinkValidation {
    fn generate_markdown_report(&self, duration_ms: u64) -> AnalyzerReport {
        let status_text = if self.broken_links.is_empty() {
            "✅ All Links Valid"
        } else {
            "❌ Broken Links Found"
        };

        let mut markdown = format!(
            r#"## Link Validation

**Status**: {}
**Total Links**: {}
**Valid Links**: {}
**Broken Links**: {}
**Duration**: {}ms

"#,
            status_text,
            self.total_links,
            self.valid_links,
            self.broken_links.len(),
            duration_ms
        );

        if self.broken_links.is_empty() {
            markdown.push_str("### Results\n\n✅ All links in the skill are valid and accessible.\n\n");
        } else {
            markdown.push_str("### ❌ Broken Links\n\n");
            markdown.push_str("| Line | URL | Error |\n|------|-----|-------|\n");

            for link in &self.broken_links {
                markdown.push_str(&format!(
                    "| {} | `{}` | {} |\n",
                    link.line_number, link.url, link.error
                ));
            }

            markdown.push_str("\n### Suggestions\n\n");
            for link in &self.broken_links {
                markdown.push_str(&format!(
                    "- **Line {}**: Fix or remove `{}`\n",
                    link.line_number, link.url
                ));
            }
            markdown.push('\n');
        }

        // JSON data block
        let json_data = json!({
            "analyzer": "links",
            "total_links": self.total_links,
            "valid_links": self.valid_links,
            "broken_links": self.broken_links
        });

        markdown.push_str(&format!(
            r#"---

```json
{}
```
"#,
            serde_json::to_string_pretty(&json_data).unwrap_or_default()
        ));

        let score = if self.total_links == 0 {
            100
        } else {
            ((self.valid_links as f64 / self.total_links as f64) * 100.0) as u8
        };

        AnalyzerReport {
            analyzer_name: "Link Validation".to_string(),
            markdown,
            json_data,
            status: AnalyzerStatus::Complete,
            duration_ms,
            score: Some(score),
        }
    }
}

// =============================================================================
// Composite Report Generator (FR-010)
// =============================================================================

pub fn generate_composite_report(
    skill_name: &str,
    skill_path: &str,
    reports: &[AnalyzerReport],
) -> String {
    let timestamp = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC").to_string();

    let mut markdown = format!(
        r#"# Skill Analysis Report: {}

**Generated**: {}
**Skill Path**: `{}`

---

"#,
        skill_name, timestamp, skill_path
    );

    // Concatenate all individual reports
    for report in reports {
        markdown.push_str(&report.markdown);
        markdown.push_str("\n---\n\n");
    }

    // Summary section
    markdown.push_str("## Summary\n\n");

    let scores: Vec<_> = reports.iter().filter_map(|r| r.score).collect();
    if !scores.is_empty() {
        let avg_score: f64 = scores.iter().map(|&s| s as f64).sum::<f64>() / scores.len() as f64;
        markdown.push_str(&format!("- **Average Score**: {:.0}/100\n", avg_score));
    }

    let total_duration: u64 = reports.iter().map(|r| r.duration_ms).sum();
    markdown.push_str(&format!("- **Total Analysis Time**: {}ms\n", total_duration));
    markdown.push_str(&format!("- **Analyzers Run**: {}\n\n", reports.len()));

    // Quick Fix section
    markdown.push_str(
        r#"## Quick Fix Instructions

Copy this entire report and paste it into Claude Code with the following prompt:

> "Please review this skill analysis report and help me fix the issues identified.
> Focus on the violations and suggestions, and provide the corrected skill.md content."

---

*Report generated by Skill Debugger - Feature 021*
"#,
    );

    markdown
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::analysis::{BrokenLink, RiskFlag, RiskLevel, TierBreakdown, Violation, Warning};

    #[test]
    fn test_spec_compliance_report_pass() {
        let compliance = SpecCompliance {
            score: 100,
            violations: vec![],
            warnings: vec![],
        };

        let report = compliance.generate_markdown_report(50);

        assert_eq!(report.analyzer_name, "Spec Compliance");
        assert!(report.markdown.contains("✅ Pass"));
        assert!(report.markdown.contains("100/100"));
        assert_eq!(report.score, Some(100));
    }

    #[test]
    fn test_spec_compliance_report_with_violations() {
        let compliance = SpecCompliance {
            score: 60,
            violations: vec![Violation {
                rule: "missing_name".to_string(),
                message: "Missing required name field".to_string(),
                fix_suggestion: Some("Add name: your-skill".to_string()),
                line_number: Some(1),
            }],
            warnings: vec![],
        };

        let report = compliance.generate_markdown_report(100);

        assert!(report.markdown.contains("❌ Fail"));
        assert!(report.markdown.contains("60/100"));
        assert!(report.markdown.contains("missing_name"));
        assert!(report.markdown.contains("Add name: your-skill"));
    }

    #[test]
    fn test_pda_report_generation() {
        let pda = PDAAnalysis {
            score: 75,
            token_estimate: 3000,
            tier_breakdown: TierBreakdown {
                metadata_tokens: 200,
                orchestrator_tokens: 1500,
                resource_tokens: 1300,
            },
            recommendations: vec!["Move examples to references/".to_string()],
            suggested_structure: vec!["skill.md (~1700 tokens)".to_string()],
            ai_insights: None,
        };

        let report = pda.generate_markdown_report(200);

        assert_eq!(report.analyzer_name, "PDA Analysis");
        assert!(report.markdown.contains("75/100"));
        assert!(report.markdown.contains("3000 tokens"));
        assert!(report.markdown.contains("Move examples to references/"));
    }

    #[test]
    fn test_security_report_high_risk() {
        let review = SecurityReview {
            score: 40,
            unused_permissions: vec!["Write".to_string()],
            high_risk_permissions: vec![RiskFlag {
                permission: "Bash".to_string(),
                risk_level: RiskLevel::High,
                explanation: "Can execute arbitrary commands".to_string(),
                mitigation: Some("Restrict to specific commands".to_string()),
            }],
            minimum_required: vec!["Read".to_string()],
        };

        let report = review.generate_markdown_report(75);

        assert!(report.markdown.contains("Security Concerns"));
        assert!(report.markdown.contains("Bash"));
        assert!(report.markdown.contains("Write"));
        assert!(report.markdown.contains("Restrict to specific commands"));
    }

    #[test]
    fn test_triggers_report_generation() {
        let suggestions = vec![
            TriggerSuggestion {
                keyword: "analyze".to_string(),
                relevance_score: 85,
                explanation: "Skill analyzes content".to_string(),
            },
            TriggerSuggestion {
                keyword: "parse".to_string(),
                relevance_score: 70,
                explanation: "Skill parses data".to_string(),
            },
        ];

        let report = generate_triggers_report(&suggestions, 150);

        assert_eq!(report.analyzer_name, "Trigger Suggestions");
        assert!(report.markdown.contains("analyze"));
        assert!(report.markdown.contains("85%"));
    }

    #[test]
    fn test_link_validation_report() {
        let validation = LinkValidation {
            total_links: 5,
            valid_links: 4,
            broken_links: vec![BrokenLink {
                url: "https://example.com/broken".to_string(),
                line_number: 42,
                error: "404 Not Found".to_string(),
            }],
        };

        let report = validation.generate_markdown_report(500);

        assert!(report.markdown.contains("Broken Links Found"));
        assert!(report.markdown.contains("https://example.com/broken"));
        assert!(report.markdown.contains("404 Not Found"));
        assert_eq!(report.score, Some(80)); // 4/5 = 80%
    }

    #[test]
    fn test_composite_report_generation() {
        let reports = vec![
            AnalyzerReport {
                analyzer_name: "Test".to_string(),
                markdown: "## Test\n\nTest content".to_string(),
                json_data: json!({"test": true}),
                status: AnalyzerStatus::Complete,
                duration_ms: 100,
                score: Some(80),
            },
        ];

        let composite = generate_composite_report("my-skill", "/path/to/skill", &reports);

        assert!(composite.contains("# Skill Analysis Report: my-skill"));
        assert!(composite.contains("Test content"));
        assert!(composite.contains("Quick Fix Instructions"));
    }
}

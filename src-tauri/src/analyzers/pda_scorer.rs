// Feature 021: PDA Scorer (FR-002, FR-003, US-021-002)
// Analyzes Progressive Disclosure Architecture compliance

use crate::models::analysis::{PDAAnalysis, TierBreakdown};

/// Analyze skill for PDA compliance
pub async fn analyze_pda(skill_content: &str) -> Result<PDAAnalysis, String> {
    // T070: Estimate total tokens
    let token_estimate = estimate_tokens(skill_content);

    // T071: Analyze tier breakdown (metadata vs orchestrator vs resources)
    let tier_breakdown = analyze_tier_breakdown(skill_content, 0);

    // T072: Calculate PDA score
    let score = calculate_pda_score(&tier_breakdown, token_estimate);

    // T076: Generate recommendations
    let recommendations = generate_recommendations(&tier_breakdown, score, token_estimate);

    // T077: Generate suggested structure
    let suggested_structure = if score < 70 {
        vec![
            "Move examples to references/examples.md".to_string(),
            "Move detailed API docs to references/api.md".to_string(),
            "Keep only essential info in SKILL.md".to_string(),
        ]
    } else {
        vec![]
    };

    Ok(PDAAnalysis {
        score,
        token_estimate,
        tier_breakdown,
        recommendations,
        suggested_structure,
    })
}

/// T070: Estimate tokens from content (word count / 0.75)
fn estimate_tokens(content: &str) -> usize {
    (content.split_whitespace().count() as f64 / 0.75) as usize
}

/// T071: Analyze tier breakdown (metadata vs orchestrator vs resources)
fn analyze_tier_breakdown(skill_content: &str, reference_tokens: usize) -> TierBreakdown {
    // Extract frontmatter (metadata)
    let (frontmatter, body) = extract_frontmatter_and_body(skill_content);

    let metadata_tokens = estimate_tokens(&frontmatter);
    let orchestrator_tokens = estimate_tokens(&body);

    TierBreakdown {
        metadata_tokens,
        orchestrator_tokens,
        resource_tokens: reference_tokens,
    }
}

/// Extract frontmatter and body from skill content
fn extract_frontmatter_and_body(content: &str) -> (String, String) {
    if content.starts_with("---") {
        // Find second delimiter
        if let Some(end_pos) = content[3..].find("---") {
            let frontmatter_end = end_pos + 6; // 3 for first "---" + 3 for second "---"
            let frontmatter = content[..frontmatter_end].to_string();
            let body = content[frontmatter_end..].trim().to_string();
            return (frontmatter, body);
        }
    }

    // No frontmatter found
    ("".to_string(), content.to_string())
}

/// T072: Calculate PDA score (0-100) based on tier breakdown
fn calculate_pda_score(breakdown: &TierBreakdown, total_tokens: usize) -> u8 {
    let mut score = 100;

    // Penalty for large orchestrator (>5000 tokens) - very aggressive penalty
    if breakdown.orchestrator_tokens > 5000 {
        let excess = breakdown.orchestrator_tokens - 5000;
        let penalty = (excess / 30).min(60); // Very aggressive: 1 point per 30 tokens over, max 60
        score -= penalty as i32;
    }

    // Penalty for no resource tier usage
    if breakdown.resource_tokens == 0 && total_tokens > 1000 {
        score -= 10;
    }

    // Penalty for moderately large orchestrator (3000-5000 tokens)
    if breakdown.orchestrator_tokens > 3000 && breakdown.orchestrator_tokens <= 5000 {
        let excess = breakdown.orchestrator_tokens - 3000;
        let penalty = (excess / 500).min(10); // Small penalty for being in warning zone
        score -= penalty as i32;
    }

    // Bonus for good tier separation
    let resource_ratio = breakdown.resource_tokens as f64 / total_tokens as f64;
    if resource_ratio > 0.5 {
        score += 5.min(100 - score); // Bonus for using resources
    }

    score.max(0).min(100) as u8
}

/// T076: Generate recommendations based on score and breakdown
fn generate_recommendations(breakdown: &TierBreakdown, score: u8, total_tokens: usize) -> Vec<String> {
    let mut recommendations = Vec::new();

    // Recommend splitting if orchestrator >5000 tokens
    if breakdown.orchestrator_tokens > 5000 {
        recommendations.push(format!(
            "Split SKILL.md content into references/ directory ({} tokens exceeds 5000 token limit)",
            breakdown.orchestrator_tokens
        ));
    }

    // Recommend using references if none exist
    if breakdown.resource_tokens == 0 && total_tokens > 1000 {
        recommendations.push(
            "Move detailed examples and API documentation to references/ directory for better progressive disclosure".to_string()
        );
    }

    // Recommend metadata optimization
    if breakdown.metadata_tokens > 200 {
        recommendations.push(
            "Simplify frontmatter to essential fields only (name, description, allowed-tools)".to_string()
        );
    }

    // Suggest structure improvements for low scores
    if score < 70 {
        recommendations.push(
            "Consider restructuring skill to follow PDA principles: metadata (~100 tokens) → orchestrator (<5k tokens) → resources (on-demand)".to_string()
        );
    }

    recommendations
}

#[cfg(test)]
mod tests {
    use super::*;

    // T078: Test token estimation formula (word count / 0.75)
    #[test]
    fn test_estimate_tokens_formula() {
        let content = "word1 word2 word3 word4"; // 4 words
        let tokens = estimate_tokens(content);
        // 4 / 0.75 = 5.33... = 5 tokens (rounded down)
        assert_eq!(tokens, 5);
    }

    #[test]
    fn test_estimate_tokens_empty_content() {
        let content = "";
        let tokens = estimate_tokens(content);
        assert_eq!(tokens, 0);
    }

    #[test]
    fn test_estimate_tokens_single_word() {
        let content = "hello";
        let tokens = estimate_tokens(content);
        // 1 / 0.75 = 1.33... = 1 token
        assert_eq!(tokens, 1);
    }

    #[test]
    fn test_estimate_tokens_large_content() {
        // Create content with exactly 3750 words (should be 5000 tokens)
        let words: Vec<String> = (0..3750).map(|i| format!("word{}", i)).collect();
        let content = words.join(" ");
        let tokens = estimate_tokens(&content);
        assert_eq!(tokens, 5000); // 3750 / 0.75 = 5000
    }

    // T079: Test PDA score calculation formula
    #[test]
    fn test_calculate_pda_score_perfect() {
        // Perfect PDA: small orchestrator, good tier separation
        let breakdown = TierBreakdown {
            metadata_tokens: 100,
            orchestrator_tokens: 500,
            resource_tokens: 2000,
        };
        let score = calculate_pda_score(&breakdown, 2600);
        assert_eq!(score, 100);
    }

    #[test]
    fn test_calculate_pda_score_large_orchestrator() {
        // Poor PDA: orchestrator >5000 tokens
        let breakdown = TierBreakdown {
            metadata_tokens: 100,
            orchestrator_tokens: 6000,
            resource_tokens: 1000,
        };
        let score = calculate_pda_score(&breakdown, 7100);
        assert!(score < 70); // Should be penalized
    }

    #[test]
    fn test_calculate_pda_score_no_resources() {
        // Moderate PDA: no resource tier
        let breakdown = TierBreakdown {
            metadata_tokens: 100,
            orchestrator_tokens: 2000,
            resource_tokens: 0,
        };
        let score = calculate_pda_score(&breakdown, 2100);
        assert!(score >= 70 && score <= 90); // Moderate score
    }

    // T080: Test tier breakdown calculation
    #[test]
    fn test_analyze_tier_breakdown_basic() {
        let skill_content = r#"---
name: test-skill
description: A test skill
---
# Test Skill

This is the orchestrator section with some content here.

## Usage

More content in the orchestrator.
"#;
        let breakdown = analyze_tier_breakdown(skill_content, 0);

        // Metadata should be ~50 tokens (frontmatter)
        assert!(breakdown.metadata_tokens > 0 && breakdown.metadata_tokens < 100);

        // Orchestrator should have the body content
        assert!(breakdown.orchestrator_tokens > 0);

        // No resources in this example
        assert_eq!(breakdown.resource_tokens, 0);
    }

    #[test]
    fn test_analyze_tier_breakdown_with_references() {
        let skill_content = "# Test\n\nSome content.";
        let reference_tokens = 1000;

        let breakdown = analyze_tier_breakdown(skill_content, reference_tokens);

        assert!(breakdown.orchestrator_tokens > 0);
        assert_eq!(breakdown.resource_tokens, reference_tokens);
    }

    // T078: Test recommendation for skills >5000 tokens
    #[test]
    fn test_generate_recommendations_large_skill() {
        let breakdown = TierBreakdown {
            metadata_tokens: 100,
            orchestrator_tokens: 6000,
            resource_tokens: 0,
        };
        let score = 65;
        let total_tokens = 6100;

        let recommendations = generate_recommendations(&breakdown, score, total_tokens);

        // Should recommend splitting content
        assert!(recommendations.iter().any(|r| r.contains("Split") || r.contains("split")));
    }

    #[test]
    fn test_generate_recommendations_no_resources() {
        let breakdown = TierBreakdown {
            metadata_tokens: 100,
            orchestrator_tokens: 2000,
            resource_tokens: 0,
        };
        let score = 80;
        let total_tokens = 2100;

        let recommendations = generate_recommendations(&breakdown, score, total_tokens);

        // Should recommend using references directory
        assert!(recommendations.iter().any(|r| r.contains("references/")));
    }

    #[test]
    fn test_generate_recommendations_perfect_score() {
        let breakdown = TierBreakdown {
            metadata_tokens: 100,
            orchestrator_tokens: 500,
            resource_tokens: 2000,
        };
        let score = 100;
        let total_tokens = 2600;

        let recommendations = generate_recommendations(&breakdown, score, total_tokens);

        // Perfect score should have no critical recommendations
        assert!(recommendations.is_empty() || recommendations.iter().all(|r| !r.contains("must") && !r.contains("should")));
    }

    // Integration test for full PDA analysis
    #[tokio::test]
    async fn test_analyze_pda_basic_skill() {
        let skill_content = r#"---
name: test-skill
description: Test
---
# Test Skill

Some content here for testing.
"#;

        let result = analyze_pda(skill_content).await;

        assert!(result.is_ok());
        let analysis = result.unwrap();

        assert!(analysis.score >= 0 && analysis.score <= 100);
        assert!(analysis.token_estimate > 0);
        assert!(analysis.tier_breakdown.metadata_tokens > 0);
        assert!(analysis.tier_breakdown.orchestrator_tokens > 0);
    }

    #[tokio::test]
    async fn test_analyze_pda_large_skill() {
        // Create a large skill (>5000 tokens)
        let large_content = format!(
            "---\nname: large\ndescription: Test\n---\n# Large\n\n{}",
            "word ".repeat(4000)
        );

        let result = analyze_pda(&large_content).await;

        assert!(result.is_ok());
        let analysis = result.unwrap();

        // Should have lower score due to size
        assert!(analysis.score < 80);

        // Should have recommendations to split
        assert!(!analysis.recommendations.is_empty());
    }
}

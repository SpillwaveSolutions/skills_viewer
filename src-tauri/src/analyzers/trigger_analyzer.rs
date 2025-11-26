// Feature 021: Trigger Analyzer (FR-005)
// Analyzes skill content to suggest optimal trigger keywords
// - Extracts keywords from description and content
// - Identifies domain-specific terms
// - Generates suggestions with confidence scores
// - Cross-references with existing triggers to avoid conflicts

use crate::models::analysis::TriggerSuggestion;
use regex::Regex;
use std::collections::{HashMap, HashSet};

/// Common stop words to filter out
const STOP_WORDS: &[&str] = &[
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "as", "is", "was", "are", "were", "been", "be", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may", "might", "must",
    "shall", "can", "need", "dare", "ought", "used", "this", "that", "these", "those",
    "i", "you", "he", "she", "it", "we", "they", "what", "which", "who", "whom", "when",
    "where", "why", "how", "all", "each", "every", "both", "few", "more", "most", "other",
    "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
    "very", "just", "also", "any", "about", "above", "across", "after", "again", "against",
    "along", "although", "always", "among", "around", "because", "before", "behind",
    "below", "beneath", "beside", "between", "beyond", "during", "except", "inside",
    "into", "like", "near", "off", "onto", "out", "outside", "over", "past", "since",
    "through", "throughout", "till", "toward", "towards", "under", "underneath", "until",
    "upon", "within", "without", "use", "using", "used", "file", "files", "code", "content",
    "skill", "skills", "claude", "tool", "tools", "then", "here", "there", "your", "my",
];

/// Technical domain indicators with associated keywords
const DOMAIN_KEYWORDS: &[(&str, &[&str], u8)] = &[
    // PDF domain
    ("pdf", &["pdf", "document", "adobe", "acrobat", "reader", "pages"], 95),
    // Excel/Spreadsheet domain
    ("excel", &["excel", "xlsx", "spreadsheet", "workbook", "cells", "formula"], 95),
    ("spreadsheet", &["spreadsheet", "csv", "worksheet", "column", "row", "table"], 90),
    // Documentation domain
    ("documentation", &["docs", "readme", "markdown", "wiki", "guide", "tutorial"], 85),
    ("markdown", &["markdown", "md", "formatting", "heading", "link"], 90),
    // API domain
    ("api", &["api", "rest", "graphql", "endpoint", "request", "response", "http"], 90),
    // Database domain
    ("database", &["database", "sql", "query", "table", "schema", "migration"], 90),
    ("postgres", &["postgres", "postgresql", "pg", "psql"], 95),
    ("mysql", &["mysql", "mariadb"], 95),
    // Git/Version control domain
    ("git", &["git", "commit", "branch", "merge", "pull", "push", "repository"], 85),
    ("github", &["github", "pr", "pull request", "issue", "fork", "actions"], 90),
    // Testing domain
    ("testing", &["test", "spec", "jest", "pytest", "unittest", "coverage", "assert"], 85),
    // Deployment domain
    ("deploy", &["deploy", "deployment", "ci", "cd", "pipeline", "release"], 85),
    ("docker", &["docker", "container", "dockerfile", "compose", "image"], 90),
    ("kubernetes", &["kubernetes", "k8s", "pod", "service", "helm"], 90),
    // Cloud providers
    ("aws", &["aws", "amazon", "s3", "ec2", "lambda", "cloudformation"], 90),
    ("gcp", &["gcp", "google cloud", "gcs", "bigquery", "pubsub"], 90),
    ("azure", &["azure", "microsoft", "blob", "cosmos"], 90),
    // Languages
    ("python", &["python", "pip", "venv", "django", "flask", "pytest"], 85),
    ("javascript", &["javascript", "js", "node", "npm", "react", "vue", "angular"], 85),
    ("typescript", &["typescript", "ts", "tsc", "interface", "type"], 85),
    ("rust", &["rust", "cargo", "crate", "tokio", "async"], 85),
    ("java", &["java", "maven", "gradle", "spring", "jvm"], 85),
    ("go", &["golang", "go mod", "goroutine"], 85),
    // Diagrams
    ("diagram", &["diagram", "mermaid", "plantuml", "flowchart", "uml"], 85),
    // Analysis
    ("analyze", &["analyze", "analysis", "review", "audit", "inspect"], 80),
    // Generation
    ("generate", &["generate", "create", "build", "scaffold", "template"], 80),
    // Refactoring
    ("refactor", &["refactor", "cleanup", "optimize", "improve", "modernize"], 80),
];

/// Suggest trigger keywords based on skill content analysis
pub fn suggest_triggers(skill_content: &str, current_triggers: &[String]) -> Result<Vec<TriggerSuggestion>, String> {
    if skill_content.is_empty() {
        return Ok(vec![]);
    }

    let mut suggestions: Vec<TriggerSuggestion> = Vec::new();
    let content_lower = skill_content.to_lowercase();
    let existing_triggers: HashSet<&str> = current_triggers.iter().map(|s| s.as_str()).collect();

    // 1. Extract keywords from content
    let word_frequencies = extract_word_frequencies(&content_lower);

    // 2. Check for domain-specific keywords
    let domain_suggestions = extract_domain_keywords(&content_lower, &existing_triggers);
    suggestions.extend(domain_suggestions);

    // 3. Generate keyword suggestions from frequency analysis
    let freq_suggestions = generate_frequency_suggestions(&word_frequencies, &existing_triggers, &suggestions);
    suggestions.extend(freq_suggestions);

    // 4. Extract potential multi-word triggers (bigrams)
    let bigram_suggestions = extract_bigram_triggers(&content_lower, &existing_triggers, &suggestions);
    suggestions.extend(bigram_suggestions);

    // 5. Sort by relevance score (descending)
    suggestions.sort_by(|a, b| b.relevance_score.cmp(&a.relevance_score));

    // 6. Deduplicate and limit to top 10
    let mut seen: HashSet<String> = HashSet::new();
    let unique_suggestions: Vec<TriggerSuggestion> = suggestions
        .into_iter()
        .filter(|s| seen.insert(s.keyword.clone()))
        .take(10)
        .collect();

    Ok(unique_suggestions)
}

/// Extract word frequencies from content
fn extract_word_frequencies(content: &str) -> HashMap<String, usize> {
    let mut frequencies: HashMap<String, usize> = HashMap::new();
    let word_re = Regex::new(r"\b[a-z][a-z0-9_-]{2,20}\b").unwrap();

    for cap in word_re.find_iter(content) {
        let word = cap.as_str().to_string();
        if !is_stop_word(&word) {
            *frequencies.entry(word).or_insert(0) += 1;
        }
    }

    frequencies
}

/// Check if a word is a stop word
fn is_stop_word(word: &str) -> bool {
    STOP_WORDS.contains(&word)
}

/// Extract domain-specific keywords that appear in content
fn extract_domain_keywords(content: &str, existing_triggers: &HashSet<&str>) -> Vec<TriggerSuggestion> {
    let mut suggestions = Vec::new();

    for (trigger, indicators, base_score) in DOMAIN_KEYWORDS {
        // Skip if already a trigger
        if existing_triggers.contains(*trigger) {
            continue;
        }

        // Count how many indicators are present
        let matches: usize = indicators
            .iter()
            .filter(|ind| content.contains(*ind))
            .count();

        if matches >= 2 {
            // Calculate score based on matches (more matches = higher confidence)
            let match_bonus = ((matches as u8).saturating_sub(1)).saturating_mul(3);
            let score = (*base_score).saturating_add(match_bonus).min(99);

            suggestions.push(TriggerSuggestion {
                keyword: trigger.to_string(),
                relevance_score: score,
                explanation: format!(
                    "Domain keyword '{}' detected ({} related terms found)",
                    trigger, matches
                ),
            });
        }
    }

    suggestions
}

/// Generate suggestions from word frequency analysis
fn generate_frequency_suggestions(
    frequencies: &HashMap<String, usize>,
    existing_triggers: &HashSet<&str>,
    current_suggestions: &[TriggerSuggestion],
) -> Vec<TriggerSuggestion> {
    let mut suggestions = Vec::new();
    let existing_keywords: HashSet<&str> = current_suggestions
        .iter()
        .map(|s| s.keyword.as_str())
        .collect();

    // Get high-frequency words (appearing 3+ times)
    let mut freq_words: Vec<_> = frequencies
        .iter()
        .filter(|(word, count)| {
            **count >= 3
                && !existing_triggers.contains(word.as_str())
                && !existing_keywords.contains(word.as_str())
                && word.len() >= 3
        })
        .collect();

    // Sort by frequency
    freq_words.sort_by(|a, b| b.1.cmp(a.1));

    // Take top candidates
    for (word, count) in freq_words.into_iter().take(5) {
        // Score based on frequency (cap at 85 for frequency-based suggestions)
        let score = (65 + (*count as u8).min(20)).min(85);

        suggestions.push(TriggerSuggestion {
            keyword: word.clone(),
            relevance_score: score,
            explanation: format!(
                "High-frequency term '{}' appears {} times in content",
                word, count
            ),
        });
    }

    suggestions
}

/// Extract bigram (two-word) triggers
fn extract_bigram_triggers(
    content: &str,
    existing_triggers: &HashSet<&str>,
    current_suggestions: &[TriggerSuggestion],
) -> Vec<TriggerSuggestion> {
    let mut suggestions = Vec::new();
    let existing_keywords: HashSet<&str> = current_suggestions
        .iter()
        .map(|s| s.keyword.as_str())
        .collect();

    // Known valuable bigrams
    let valuable_bigrams = [
        ("pull request", 90),
        ("code review", 88),
        ("unit test", 85),
        ("api endpoint", 85),
        ("data migration", 85),
        ("error handling", 80),
        ("log analysis", 80),
        ("security audit", 85),
        ("performance optimization", 82),
        ("dependency update", 80),
        ("database schema", 85),
        ("type definition", 80),
        ("config file", 75),
        ("environment variable", 78),
        ("build system", 78),
    ];

    for (bigram, score) in valuable_bigrams {
        if content.contains(bigram)
            && !existing_triggers.contains(bigram)
            && !existing_keywords.contains(bigram)
        {
            // Convert to trigger format (spaces to hyphens)
            let keyword = bigram.replace(' ', "-");

            suggestions.push(TriggerSuggestion {
                keyword,
                relevance_score: score,
                explanation: format!("Multi-word phrase '{}' found in content", bigram),
            });
        }
    }

    suggestions
}

#[cfg(test)]
mod tests {
    use super::*;

    // ==================== Stop Word Tests ====================

    #[test]
    fn test_is_stop_word_true() {
        assert!(is_stop_word("the"));
        assert!(is_stop_word("and"));
        assert!(is_stop_word("for"));
        assert!(is_stop_word("use"));
    }

    #[test]
    fn test_is_stop_word_false() {
        assert!(!is_stop_word("python"));
        assert!(!is_stop_word("database"));
        assert!(!is_stop_word("kubernetes"));
    }

    // ==================== Word Frequency Tests ====================

    #[test]
    fn test_extract_word_frequencies_basic() {
        let content = "python python python database database";
        let freq = extract_word_frequencies(content);

        assert_eq!(freq.get("python"), Some(&3));
        assert_eq!(freq.get("database"), Some(&2));
    }

    #[test]
    fn test_extract_word_frequencies_filters_stop_words() {
        let content = "the the the and and python";
        let freq = extract_word_frequencies(content);

        assert_eq!(freq.get("the"), None);
        assert_eq!(freq.get("and"), None);
        assert_eq!(freq.get("python"), Some(&1));
    }

    #[test]
    fn test_extract_word_frequencies_minimum_length() {
        let content = "a ab abc python";
        let freq = extract_word_frequencies(content);

        assert_eq!(freq.get("a"), None);
        assert_eq!(freq.get("ab"), None);
        assert_eq!(freq.get("abc"), Some(&1));
        assert_eq!(freq.get("python"), Some(&1));
    }

    // ==================== Domain Keyword Tests ====================

    #[test]
    fn test_extract_domain_keywords_pdf() {
        let content = "This skill processes PDF documents using Adobe reader to extract pages";
        let existing: HashSet<&str> = HashSet::new();
        let suggestions = extract_domain_keywords(content, &existing);

        assert!(suggestions.iter().any(|s| s.keyword == "pdf"));
    }

    #[test]
    fn test_extract_domain_keywords_excel() {
        let content = "Working with Excel spreadsheets and workbook formulas";
        let existing: HashSet<&str> = HashSet::new();
        let suggestions = extract_domain_keywords(content, &existing);

        assert!(suggestions.iter().any(|s| s.keyword == "excel"));
    }

    #[test]
    fn test_extract_domain_keywords_skips_existing() {
        let content = "This skill processes PDF documents using Adobe reader to extract pages";
        let existing: HashSet<&str> = ["pdf"].into_iter().collect();
        let suggestions = extract_domain_keywords(content, &existing);

        assert!(!suggestions.iter().any(|s| s.keyword == "pdf"));
    }

    #[test]
    fn test_extract_domain_keywords_requires_multiple_indicators() {
        // Only one indicator should not trigger suggestion
        let content = "Just mentioning pdf once";
        let existing: HashSet<&str> = HashSet::new();
        let suggestions = extract_domain_keywords(content, &existing);

        // pdf domain requires 2+ indicators
        assert!(suggestions.is_empty() || !suggestions.iter().any(|s| s.keyword == "pdf" && s.relevance_score > 90));
    }

    // ==================== Bigram Tests ====================

    #[test]
    fn test_extract_bigram_triggers_pull_request() {
        let content = "This skill helps with pull request reviews";
        let existing: HashSet<&str> = HashSet::new();
        let current: Vec<TriggerSuggestion> = vec![];
        let suggestions = extract_bigram_triggers(content, &existing, &current);

        assert!(suggestions.iter().any(|s| s.keyword == "pull-request"));
    }

    #[test]
    fn test_extract_bigram_triggers_code_review() {
        let content = "Automates code review process for developers";
        let existing: HashSet<&str> = HashSet::new();
        let current: Vec<TriggerSuggestion> = vec![];
        let suggestions = extract_bigram_triggers(content, &existing, &current);

        assert!(suggestions.iter().any(|s| s.keyword == "code-review"));
    }

    #[test]
    fn test_extract_bigram_triggers_skips_existing() {
        let content = "This skill helps with pull request reviews";
        let existing: HashSet<&str> = ["pull request"].into_iter().collect();
        let current: Vec<TriggerSuggestion> = vec![];
        let suggestions = extract_bigram_triggers(content, &existing, &current);

        assert!(!suggestions.iter().any(|s| s.keyword.contains("pull")));
    }

    // ==================== Full Analysis Tests ====================

    #[test]
    fn test_suggest_triggers_empty_content() {
        let suggestions = suggest_triggers("", &[]).unwrap();
        assert!(suggestions.is_empty());
    }

    #[test]
    fn test_suggest_triggers_pdf_skill() {
        let content = r#"
            # PDF Processing Skill
            This skill extracts text from PDF documents.
            It uses Adobe-compatible parsing to read pages and extract content.
            Document processing includes table extraction and formatting.
        "#;
        let suggestions = suggest_triggers(content, &[]).unwrap();

        assert!(!suggestions.is_empty());
        // Should suggest pdf as a trigger
        assert!(suggestions.iter().any(|s| s.keyword == "pdf" || s.keyword.contains("document")));
    }

    #[test]
    fn test_suggest_triggers_api_skill() {
        let content = r#"
            # API Documentation Generator
            Generate REST API documentation from code.
            Supports endpoint analysis and request/response examples.
            HTTP methods and GraphQL schemas supported.
        "#;
        let suggestions = suggest_triggers(content, &[]).unwrap();

        assert!(!suggestions.is_empty());
        assert!(suggestions.iter().any(|s| s.keyword == "api" || s.keyword.contains("rest")));
    }

    #[test]
    fn test_suggest_triggers_respects_existing() {
        let content = "PDF document processing with Adobe reader pages extraction";
        let existing = vec!["pdf".to_string()];
        let suggestions = suggest_triggers(content, &existing).unwrap();

        // Should not suggest pdf since it already exists
        assert!(!suggestions.iter().any(|s| s.keyword == "pdf"));
    }

    #[test]
    fn test_suggest_triggers_sorted_by_relevance() {
        let content = r#"
            Python python python python python
            database database database
            kubernetes kubernetes
        "#;
        let suggestions = suggest_triggers(content, &[]).unwrap();

        if suggestions.len() >= 2 {
            // Should be sorted by relevance (descending)
            for i in 0..suggestions.len() - 1 {
                assert!(suggestions[i].relevance_score >= suggestions[i + 1].relevance_score);
            }
        }
    }

    #[test]
    fn test_suggest_triggers_limited_to_10() {
        let content = r#"
            This skill covers python java rust golang typescript javascript
            database postgres mysql mongodb redis elasticsearch
            docker kubernetes aws gcp azure terraform
            testing pytest jest mocha cypress playwright
            api rest graphql http websocket grpc
        "#;
        let suggestions = suggest_triggers(content, &[]).unwrap();

        assert!(suggestions.len() <= 10);
    }

    #[test]
    fn test_suggest_triggers_no_duplicates() {
        let content = "python python python python python python python";
        let suggestions = suggest_triggers(content, &[]).unwrap();

        let keywords: Vec<&str> = suggestions.iter().map(|s| s.keyword.as_str()).collect();
        let unique: HashSet<&str> = keywords.iter().cloned().collect();

        assert_eq!(keywords.len(), unique.len());
    }

    #[test]
    fn test_suggest_triggers_has_explanations() {
        let content = "Python programming with database connections";
        let suggestions = suggest_triggers(content, &[]).unwrap();

        for suggestion in &suggestions {
            assert!(!suggestion.explanation.is_empty());
        }
    }

    // ==================== Relevance Score Tests ====================

    #[test]
    fn test_relevance_score_domain_keywords_high() {
        let content = "PDF documents with Adobe reader pages extraction text";
        let existing: HashSet<&str> = HashSet::new();
        let suggestions = extract_domain_keywords(content, &existing);

        // Domain keywords should have high scores
        for suggestion in suggestions {
            assert!(suggestion.relevance_score >= 80);
        }
    }

    #[test]
    fn test_relevance_score_within_bounds() {
        let content = r#"
            pdf document adobe reader pages extraction text
            python database kubernetes docker aws deployment
        "#;
        let suggestions = suggest_triggers(content, &[]).unwrap();

        for suggestion in &suggestions {
            assert!(suggestion.relevance_score > 0);
            assert!(suggestion.relevance_score <= 100);
        }
    }

    // ==================== Edge Cases ====================

    #[test]
    fn test_suggest_triggers_handles_special_chars() {
        let content = "Use mcp__github__create_issue for creating issues";
        let result = suggest_triggers(content, &[]);

        // Should handle underscores without crashing
        assert!(result.is_ok());
    }

    #[test]
    fn test_suggest_triggers_handles_numbers() {
        let content = "ES2020 features and Python3.9 compatibility";
        let result = suggest_triggers(content, &[]);

        // Should handle alphanumeric without crashing
        assert!(result.is_ok());
    }

    #[test]
    fn test_frequency_suggestions_minimum_occurrences() {
        let content = "python python database"; // python 2x, database 1x
        let freq = extract_word_frequencies(content);
        let existing: HashSet<&str> = HashSet::new();
        let current: Vec<TriggerSuggestion> = vec![];
        let suggestions = generate_frequency_suggestions(&freq, &existing, &current);

        // Should not include words appearing less than 3 times
        assert!(!suggestions.iter().any(|s| s.keyword == "python"));
        assert!(!suggestions.iter().any(|s| s.keyword == "database"));
    }

    #[test]
    fn test_frequency_suggestions_high_occurrences() {
        let content = "kubernetes kubernetes kubernetes kubernetes kubernetes";
        let freq = extract_word_frequencies(content);
        let existing: HashSet<&str> = HashSet::new();
        let current: Vec<TriggerSuggestion> = vec![];
        let suggestions = generate_frequency_suggestions(&freq, &existing, &current);

        assert!(suggestions.iter().any(|s| s.keyword == "kubernetes"));
    }
}

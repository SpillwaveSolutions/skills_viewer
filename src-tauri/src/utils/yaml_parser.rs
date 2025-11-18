use serde_json::Value;
use serde_yaml;

/// Extract YAML frontmatter from markdown content
/// Returns (frontmatter_json, content_without_frontmatter)
pub fn extract_frontmatter(content: &str) -> (Option<Value>, String) {
    let lines: Vec<&str> = content.lines().collect();

    if lines.is_empty() || !lines[0].trim().starts_with("---") {
        return (None, content.to_string());
    }

    // Find the closing ---
    let mut end_index = None;
    for (i, line) in lines.iter().enumerate().skip(1) {
        if line.trim().starts_with("---") {
            end_index = Some(i);
            break;
        }
    }

    match end_index {
        Some(end) => {
            let yaml_lines = &lines[1..end];
            let yaml_content = yaml_lines.join("\n");

            // Parse YAML to JSON
            let frontmatter = parse_yaml_to_json(&yaml_content);

            // Get content after frontmatter
            let remaining_content = lines[end + 1..].join("\n");

            (frontmatter, remaining_content)
        }
        None => (None, content.to_string()),
    }
}

/// Parse YAML string to JSON Value
fn parse_yaml_to_json(yaml: &str) -> Option<Value> {
    match serde_yaml::from_str::<serde_yaml::Value>(yaml) {
        Ok(yaml_value) => {
            // Convert serde_yaml::Value to serde_json::Value
            match serde_json::to_value(&yaml_value) {
                Ok(json_value) => Some(json_value),
                Err(e) => {
                    eprintln!("Error converting YAML to JSON: {}", e);
                    None
                }
            }
        }
        Err(e) => {
            eprintln!("Error parsing YAML: {}", e);
            None
        }
    }
}

/// Extract description from markdown content
/// Returns the first paragraph or None
pub fn extract_description(content: &str) -> Option<String> {
    let lines: Vec<&str> = content.lines().collect();
    let mut description_lines = Vec::new();
    let mut started = false;

    for line in lines {
        let trimmed = line.trim();

        // Skip empty lines before description starts
        if !started && trimmed.is_empty() {
            continue;
        }

        // Skip headers
        if trimmed.starts_with('#') {
            continue;
        }

        // If we hit a non-empty line, start collecting
        if !trimmed.is_empty() {
            started = true;
            description_lines.push(trimmed);
        } else if started {
            // Empty line after starting means end of first paragraph
            break;
        }
    }

    if description_lines.is_empty() {
        None
    } else {
        Some(description_lines.join(" "))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Helper function to create YAML test content
    fn create_yaml_test_content(yaml: &str, body: &str) -> String {
        format!("---\n{}\n---\n\n{}", yaml, body)
    }

    // T023: Test extract valid YAML frontmatter correctly
    #[test]
    fn test_extract_frontmatter_valid() {
        let content = create_yaml_test_content(
            "name: test-skill\nversion: 1.0.0\nauthor: Test",
            "# Test Skill\n\nContent here."
        );
        let (fm, rest) = extract_frontmatter(&content);

        assert!(fm.is_some(), "Should extract frontmatter");
        let fm = fm.unwrap();
        assert_eq!(fm["name"], "test-skill");
        assert_eq!(fm["version"], "1.0.0");
        assert_eq!(fm["author"], "Test");
        assert!(!rest.contains("---"), "Content should not contain delimiters");
    }

    // T024: Test handle missing opening delimiter (---)
    #[test]
    fn test_extract_frontmatter_missing_opening() {
        let content = "name: test\n---\n\nContent";
        let (fm, rest) = extract_frontmatter(content);

        assert!(fm.is_none(), "Should return None for missing opening delimiter");
        assert_eq!(rest, content, "Should return original content");
    }

    // T025: Test handle missing closing delimiter
    #[test]
    fn test_extract_frontmatter_missing_closing() {
        let content = "---\nname: test\nversion: 1.0\n\nContent without closing delimiter";
        let (fm, rest) = extract_frontmatter(content);

        assert!(fm.is_none(), "Should return None for missing closing delimiter");
        assert_eq!(rest, content, "Should return original content");
    }

    // T026: Test catch and log invalid YAML syntax errors
    #[test]
    fn test_extract_frontmatter_invalid_yaml() {
        let content = create_yaml_test_content(
            "invalid: [yaml: syntax: error",
            "Content"
        );
        let (fm, rest) = extract_frontmatter(&content);

        assert!(fm.is_none(), "Should return None for invalid YAML");
        assert!(!rest.is_empty(), "Should return content without frontmatter");
    }

    // T027: Test handle empty frontmatter without crashing
    #[test]
    fn test_extract_frontmatter_empty() {
        let content = "---\n---\n\n# Content\n\nBody text.";
        let (fm, rest) = extract_frontmatter(content);

        // Empty frontmatter should parse to empty object or null
        // Note: content after --- includes the newline
        assert_eq!(rest, "\n# Content\n\nBody text.");
    }

    // T028: Test correctly decode UTF-8 characters in frontmatter
    #[test]
    fn test_extract_frontmatter_utf8() {
        let content = create_yaml_test_content(
            "name: 日本語スキル\nauthor: François Müller\nemoji: 🚀",
            "Content"
        );
        let (fm, _) = extract_frontmatter(&content);

        assert!(fm.is_some(), "Should parse UTF-8 frontmatter");
        let fm = fm.unwrap();
        assert_eq!(fm["name"], "日本語スキル");
        assert_eq!(fm["author"], "François Müller");
        assert_eq!(fm["emoji"], "🚀");
    }

    // T029: Test parse various data types (arrays, objects, booleans)
    #[test]
    fn test_extract_frontmatter_data_types() {
        let content = create_yaml_test_content(
            "string: value\nnumber: 42\nfloat: 3.14\nbool: true\narray:\n  - item1\n  - item2\nobject:\n  key: value",
            "Content"
        );
        let (fm, _) = extract_frontmatter(&content);

        assert!(fm.is_some(), "Should parse various data types");
        let fm = fm.unwrap();
        assert_eq!(fm["string"], "value");
        assert_eq!(fm["number"], 42);
        assert_eq!(fm["float"], 3.14);
        assert_eq!(fm["bool"], true);
        assert!(fm["array"].is_array(), "Should parse array");
        assert_eq!(fm["array"][0], "item1");
        assert_eq!(fm["array"][1], "item2");
        assert!(fm["object"].is_object(), "Should parse object");
        assert_eq!(fm["object"]["key"], "value");
    }

    // T030: Test handle UTF-8 BOM encoded files
    #[test]
    fn test_extract_frontmatter_with_bom() {
        let content = format!("\u{FEFF}{}", create_yaml_test_content("name: bom-test", "Content"));
        let (fm, _) = extract_frontmatter(&content);

        // BOM at start means first line won't start with ---
        // This is expected behavior - BOM should be stripped by file reader
        assert!(fm.is_none(), "BOM prevents frontmatter detection (expected)");
    }

    // T031: Test handle extremely large frontmatter (>10KB)
    #[test]
    fn test_extract_frontmatter_large() {
        let large_value = "x".repeat(10000);
        let content = create_yaml_test_content(
            &format!("large: {}", large_value),
            "Content"
        );
        let (fm, _) = extract_frontmatter(&content);

        assert!(fm.is_some(), "Should handle large frontmatter");
        let fm = fm.unwrap();
        assert_eq!(fm["large"].as_str().unwrap().len(), 10000);
    }

    // Existing test - keep for compatibility
    #[test]
    fn test_extract_frontmatter_none() {
        let content = "# Hello\n\nThis is content.";
        let (fm, rest) = extract_frontmatter(content);
        assert!(fm.is_none());
        assert_eq!(rest, content);
    }

    // Test parse_yaml_to_json directly
    #[test]
    fn test_parse_yaml_to_json_valid() {
        let yaml = "name: test\nvalue: 123";
        let result = parse_yaml_to_json(yaml);

        assert!(result.is_some(), "Should parse valid YAML");
        let json = result.unwrap();
        assert_eq!(json["name"], "test");
        assert_eq!(json["value"], 123);
    }

    #[test]
    fn test_parse_yaml_to_json_invalid() {
        let yaml = "invalid: [yaml: syntax";
        let result = parse_yaml_to_json(yaml);

        assert!(result.is_none(), "Should return None for invalid YAML");
    }

    // Test extract_description
    #[test]
    fn test_extract_description() {
        let content = "# Title\n\nThis is the first paragraph.\nIt has multiple lines.\n\nSecond paragraph.";
        let desc = extract_description(content);
        assert!(desc.is_some());
        assert_eq!(desc.unwrap(), "This is the first paragraph. It has multiple lines.");
    }

    #[test]
    fn test_extract_description_no_content() {
        let content = "# Title\n\n";
        let desc = extract_description(content);
        assert!(desc.is_none(), "Should return None for no description");
    }

    #[test]
    fn test_extract_description_only_headers() {
        let content = "# Header 1\n## Header 2\n### Header 3";
        let desc = extract_description(content);
        assert!(desc.is_none(), "Should return None when only headers present");
    }

    #[test]
    fn test_extract_description_skip_empty_lines() {
        let content = "\n\n\n# Title\n\n\n\nFirst paragraph here.\n\nSecond.";
        let desc = extract_description(content);
        assert!(desc.is_some());
        assert_eq!(desc.unwrap(), "First paragraph here.");
    }
}

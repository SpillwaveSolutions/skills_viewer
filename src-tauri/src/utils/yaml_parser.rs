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

    #[test]
    fn test_extract_frontmatter_none() {
        let content = "# Hello\n\nThis is content.";
        let (fm, rest) = extract_frontmatter(content);
        assert!(fm.is_none());
        assert_eq!(rest, content);
    }

    #[test]
    fn test_extract_description() {
        let content = "# Title\n\nThis is the first paragraph.\nIt has multiple lines.\n\nSecond paragraph.";
        let desc = extract_description(content);
        assert!(desc.is_some());
        assert_eq!(desc.unwrap(), "This is the first paragraph. It has multiple lines.");
    }
}

// Feature 021: Link Validator (FR-006)
// Validates reference links in skill content
// - Extracts markdown links [text](url) and reference-style links
// - Validates file paths exist relative to skill directory
// - Reports broken links with line numbers

use crate::models::analysis::{BrokenLink, LinkValidation};
use regex::Regex;
use std::path::Path;

/// Represents an extracted link from markdown content
#[derive(Debug, Clone, PartialEq)]
pub struct ExtractedLink {
    pub url: String,
    pub line_number: usize,
    pub link_type: LinkType,
}

#[derive(Debug, Clone, PartialEq)]
pub enum LinkType {
    /// Local file path (relative or absolute)
    FilePath,
    /// HTTP/HTTPS URL
    HttpUrl,
    /// Anchor link within document
    Anchor,
    /// Unknown/other link type
    Other,
}

/// Extract all markdown links from content
/// Supports: [text](url), [text][ref], and reference definitions [ref]: url
pub fn extract_links(content: &str) -> Vec<ExtractedLink> {
    let mut links = Vec::new();

    // Regex for inline links: [text](url) - handles optional title
    let inline_re = Regex::new(r#"\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)"#).unwrap();

    // Regex for reference definitions: [ref]: url
    let ref_def_re = Regex::new(r#"^\s*\[([^\]]+)\]:\s*(\S+)"#).unwrap();

    for (line_idx, line) in content.lines().enumerate() {
        let line_number = line_idx + 1; // 1-indexed

        // Find inline links
        for cap in inline_re.captures_iter(line) {
            if let Some(url_match) = cap.get(2) {
                let url = url_match.as_str().to_string();
                let link_type = classify_link(&url);
                links.push(ExtractedLink {
                    url,
                    line_number,
                    link_type,
                });
            }
        }

        // Find reference definitions
        if let Some(cap) = ref_def_re.captures(line) {
            if let Some(url_match) = cap.get(2) {
                let url = url_match.as_str().to_string();
                let link_type = classify_link(&url);
                links.push(ExtractedLink {
                    url,
                    line_number,
                    link_type,
                });
            }
        }
    }

    links
}

/// Classify a link URL by type
fn classify_link(url: &str) -> LinkType {
    if url.starts_with('#') {
        LinkType::Anchor
    } else if url.starts_with("http://") || url.starts_with("https://") {
        LinkType::HttpUrl
    } else if url.starts_with("mailto:")
        || url.starts_with("tel:")
        || url.starts_with("javascript:")
    {
        LinkType::Other
    } else {
        // Assume it's a file path (relative or absolute)
        LinkType::FilePath
    }
}

/// Validate file links relative to a base directory
/// Returns list of broken links
pub fn validate_file_links(links: &[ExtractedLink], base_dir: &Path) -> Vec<BrokenLink> {
    let mut broken = Vec::new();

    for link in links {
        if link.link_type != LinkType::FilePath {
            continue;
        }

        // Remove any anchor from the path
        let path_str = link.url.split('#').next().unwrap_or(&link.url);

        // Skip empty paths
        if path_str.is_empty() {
            continue;
        }

        let full_path = base_dir.join(path_str);

        if !full_path.exists() {
            broken.push(BrokenLink {
                url: link.url.clone(),
                line_number: link.line_number,
                error: format!("File not found: {}", full_path.display()),
            });
        }
    }

    broken
}

/// Validate links in skill content without file path validation
/// This is a simplified version that extracts and counts links but cannot validate
/// file paths since no base directory is provided.
/// - skill_content: The markdown content of the skill
pub async fn validate_links_simple(skill_content: &str) -> Result<LinkValidation, String> {
    let links = extract_links(skill_content);
    let total_links = links.len();

    // Without a base directory, we cannot validate file paths
    // We report all links as valid (no broken links detected)
    // File path validation requires the skill directory context
    Ok(LinkValidation {
        total_links,
        valid_links: total_links,
        broken_links: vec![],
    })
}

/// Validate all links in skill content
/// - skill_content: The markdown content of the skill
/// - skill_dir: The directory containing the skill (for relative path resolution)
pub async fn validate_links(skill_content: &str, skill_dir: &Path) -> Result<LinkValidation, String> {
    let links = extract_links(skill_content);
    let total_links = links.len();

    // Only validate file links (HTTP validation would require network calls)
    let file_links: Vec<_> = links
        .iter()
        .filter(|l| l.link_type == LinkType::FilePath)
        .cloned()
        .collect();

    let broken_links = validate_file_links(&file_links, skill_dir);
    let valid_links = total_links - broken_links.len();

    Ok(LinkValidation {
        total_links,
        valid_links,
        broken_links,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    // ==================== Link Extraction Tests ====================

    #[test]
    fn test_extract_links_empty_content() {
        let links = extract_links("");
        assert!(links.is_empty());
    }

    #[test]
    fn test_extract_links_no_links() {
        let content = "This is plain text without any links.";
        let links = extract_links(content);
        assert!(links.is_empty());
    }

    #[test]
    fn test_extract_inline_link() {
        let content = "Check out [this guide](./references/guide.md) for more info.";
        let links = extract_links(content);

        assert_eq!(links.len(), 1);
        assert_eq!(links[0].url, "./references/guide.md");
        assert_eq!(links[0].line_number, 1);
        assert_eq!(links[0].link_type, LinkType::FilePath);
    }

    #[test]
    fn test_extract_multiple_links_same_line() {
        let content = "See [file1](./a.md) and [file2](./b.md) for details.";
        let links = extract_links(content);

        assert_eq!(links.len(), 2);
        assert_eq!(links[0].url, "./a.md");
        assert_eq!(links[1].url, "./b.md");
    }

    #[test]
    fn test_extract_links_multiple_lines() {
        let content = r#"# Header

Check [link1](./file1.md) on line 3.

And [link2](./file2.md) on line 5."#;
        let links = extract_links(content);

        assert_eq!(links.len(), 2);
        assert_eq!(links[0].line_number, 3);
        assert_eq!(links[1].line_number, 5);
    }

    #[test]
    fn test_extract_http_link() {
        let content = "Visit [Anthropic](https://anthropic.com) for more.";
        let links = extract_links(content);

        assert_eq!(links.len(), 1);
        assert_eq!(links[0].url, "https://anthropic.com");
        assert_eq!(links[0].link_type, LinkType::HttpUrl);
    }

    #[test]
    fn test_extract_anchor_link() {
        let content = "See the [installation section](#installation) below.";
        let links = extract_links(content);

        assert_eq!(links.len(), 1);
        assert_eq!(links[0].url, "#installation");
        assert_eq!(links[0].link_type, LinkType::Anchor);
    }

    #[test]
    fn test_extract_reference_definition() {
        let content = r#"Check the [guide][1] for details.

[1]: ./references/guide.md"#;
        let links = extract_links(content);

        // Should find the reference definition
        assert!(links.iter().any(|l| l.url == "./references/guide.md"));
    }

    #[test]
    fn test_extract_link_with_title() {
        let content = r#"Check [this](./file.md "A helpful guide") out."#;
        let links = extract_links(content);

        assert_eq!(links.len(), 1);
        assert_eq!(links[0].url, "./file.md");
    }

    // ==================== Link Classification Tests ====================

    #[test]
    fn test_classify_http_link() {
        assert_eq!(classify_link("http://example.com"), LinkType::HttpUrl);
        assert_eq!(classify_link("https://example.com"), LinkType::HttpUrl);
    }

    #[test]
    fn test_classify_anchor_link() {
        assert_eq!(classify_link("#section"), LinkType::Anchor);
        assert_eq!(classify_link("#"), LinkType::Anchor);
    }

    #[test]
    fn test_classify_file_path() {
        assert_eq!(classify_link("./file.md"), LinkType::FilePath);
        assert_eq!(classify_link("../parent/file.md"), LinkType::FilePath);
        assert_eq!(classify_link("references/guide.md"), LinkType::FilePath);
        assert_eq!(classify_link("/absolute/path.md"), LinkType::FilePath);
    }

    #[test]
    fn test_classify_other_links() {
        assert_eq!(classify_link("mailto:test@example.com"), LinkType::Other);
        assert_eq!(classify_link("tel:+1234567890"), LinkType::Other);
    }

    // ==================== File Validation Tests ====================

    #[test]
    fn test_validate_file_links_all_exist() {
        let dir = tempdir().unwrap();
        let base = dir.path();

        // Create test files
        fs::write(base.join("file1.md"), "content").unwrap();
        fs::write(base.join("file2.md"), "content").unwrap();

        let links = vec![
            ExtractedLink {
                url: "file1.md".to_string(),
                line_number: 1,
                link_type: LinkType::FilePath,
            },
            ExtractedLink {
                url: "file2.md".to_string(),
                line_number: 2,
                link_type: LinkType::FilePath,
            },
        ];

        let broken = validate_file_links(&links, base);
        assert!(broken.is_empty());
    }

    #[test]
    fn test_validate_file_links_some_broken() {
        let dir = tempdir().unwrap();
        let base = dir.path();

        // Create only one file
        fs::write(base.join("exists.md"), "content").unwrap();

        let links = vec![
            ExtractedLink {
                url: "exists.md".to_string(),
                line_number: 1,
                link_type: LinkType::FilePath,
            },
            ExtractedLink {
                url: "missing.md".to_string(),
                line_number: 2,
                link_type: LinkType::FilePath,
            },
        ];

        let broken = validate_file_links(&links, base);
        assert_eq!(broken.len(), 1);
        assert_eq!(broken[0].url, "missing.md");
        assert_eq!(broken[0].line_number, 2);
        assert!(broken[0].error.contains("not found"));
    }

    #[test]
    fn test_validate_file_links_with_subdirectory() {
        let dir = tempdir().unwrap();
        let base = dir.path();

        // Create subdirectory and file
        fs::create_dir_all(base.join("references")).unwrap();
        fs::write(base.join("references/guide.md"), "content").unwrap();

        let links = vec![ExtractedLink {
            url: "references/guide.md".to_string(),
            line_number: 1,
            link_type: LinkType::FilePath,
        }];

        let broken = validate_file_links(&links, base);
        assert!(broken.is_empty());
    }

    #[test]
    fn test_validate_file_links_skips_http() {
        let dir = tempdir().unwrap();
        let base = dir.path();

        let links = vec![ExtractedLink {
            url: "https://example.com".to_string(),
            line_number: 1,
            link_type: LinkType::HttpUrl,
        }];

        // Should not try to validate HTTP links as file paths
        let broken = validate_file_links(&links, base);
        assert!(broken.is_empty());
    }

    #[test]
    fn test_validate_file_links_with_anchor() {
        let dir = tempdir().unwrap();
        let base = dir.path();

        // Create file
        fs::write(base.join("guide.md"), "content").unwrap();

        let links = vec![ExtractedLink {
            url: "guide.md#section".to_string(),
            line_number: 1,
            link_type: LinkType::FilePath,
        }];

        // Should validate the file part, ignoring the anchor
        let broken = validate_file_links(&links, base);
        assert!(broken.is_empty());
    }

    // ==================== Integration Tests ====================

    #[tokio::test]
    async fn test_validate_links_empty_content() {
        let dir = tempdir().unwrap();
        let result = validate_links("", dir.path()).await.unwrap();

        assert_eq!(result.total_links, 0);
        assert_eq!(result.valid_links, 0);
        assert!(result.broken_links.is_empty());
    }

    #[tokio::test]
    async fn test_validate_links_full_integration() {
        let dir = tempdir().unwrap();
        let base = dir.path();

        // Create a reference file
        fs::create_dir_all(base.join("references")).unwrap();
        fs::write(base.join("references/exists.md"), "content").unwrap();

        let content = r#"# My Skill

See [existing file](references/exists.md) for details.
Also check [missing file](references/missing.md).
And visit [Anthropic](https://anthropic.com)."#;

        let result = validate_links(content, base).await.unwrap();

        assert_eq!(result.total_links, 3); // 2 file links + 1 HTTP
        assert_eq!(result.broken_links.len(), 1);
        assert_eq!(result.broken_links[0].url, "references/missing.md");
    }
}

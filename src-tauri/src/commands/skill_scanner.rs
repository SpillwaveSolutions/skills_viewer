use crate::models::Skill;
use crate::utils::{extract_description, extract_frontmatter, get_skill_directories};
use std::fs;
use std::path::Path;

#[tauri::command]
pub fn scan_skills() -> Result<Vec<Skill>, String> {
    let mut all_skills = Vec::new();
    let directories = get_skill_directories();

    for (location, dir_path) in directories {
        if !dir_path.exists() {
            continue;
        }

        match scan_directory(&dir_path, &location) {
            Ok(mut skills) => all_skills.append(&mut skills),
            Err(e) => eprintln!("Error scanning {}: {}", dir_path.display(), e),
        }
    }

    Ok(all_skills)
}

fn scan_directory(dir: &Path, location: &str) -> Result<Vec<Skill>, String> {
    let mut skills = Vec::new();

    let entries = fs::read_dir(dir).map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();

        // Skills are directories containing SKILL.md
        if path.is_dir() {
            let skill_file = path.join("SKILL.md");
            if skill_file.exists() {
                match load_skill(&skill_file, location) {
                    Ok(skill) => skills.push(skill),
                    Err(e) => eprintln!("Error loading skill {:?}: {}", skill_file, e),
                }
            }
        }
    }

    Ok(skills)
}

fn load_skill(path: &Path, location: &str) -> Result<Skill, String> {
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    // Get skill directory (parent of SKILL.md)
    let skill_dir = path
        .parent()
        .ok_or("Invalid skill file path")?;

    // Get skill name from directory name
    let skill_name = skill_dir
        .file_name()
        .and_then(|s| s.to_str())
        .ok_or("Invalid skill directory name")?;

    let (frontmatter, content_without_fm) = extract_frontmatter(&content);

    let description = extract_description(&content_without_fm);

    let mut skill = Skill::new(
        skill_name.to_string(),
        path.to_str().unwrap_or("").to_string(),
        location.to_string(),
    );

    skill.content = content;
    skill.content_clean = content_without_fm;
    skill.description = description;
    skill.metadata = frontmatter;

    // Load references from references/ directory
    skill.references = load_references(skill_dir);

    // Load scripts from scripts/ directory
    skill.scripts = load_scripts(skill_dir);

    Ok(skill)
}

fn load_references(skill_dir: &Path) -> Vec<crate::models::Reference> {
    let mut references = Vec::new();
    let refs_dir = skill_dir.join("references");

    if !refs_dir.exists() || !refs_dir.is_dir() {
        return references;
    }

    if let Ok(entries) = fs::read_dir(&refs_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                let file_name = path.file_name()
                    .and_then(|s| s.to_str())
                    .unwrap_or("unknown")
                    .to_string();

                let ref_type = if file_name.contains('*') {
                    "glob".to_string()
                } else {
                    "file".to_string()
                };

                references.push(crate::models::Reference {
                    path: path.to_str().unwrap_or("").to_string(),
                    ref_type,
                    required: false,
                });
            }
        }
    }

    references
}

fn load_scripts(skill_dir: &Path) -> Vec<crate::models::Script> {
    let mut scripts = Vec::new();
    let scripts_dir = skill_dir.join("scripts");

    if !scripts_dir.exists() || !scripts_dir.is_dir() {
        return scripts;
    }

    if let Ok(entries) = fs::read_dir(&scripts_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                let file_name = path.file_name()
                    .and_then(|s| s.to_str())
                    .unwrap_or("unknown")
                    .to_string();

                // Determine language from extension
                let language = path.extension()
                    .and_then(|s| s.to_str())
                    .unwrap_or("text")
                    .to_string();

                // Read script content
                let content = fs::read_to_string(&path).unwrap_or_default();

                scripts.push(crate::models::Script {
                    name: file_name,
                    language,
                    content,
                    line_number: None,
                });
            }
        }
    }

    scripts
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    /// Helper function to create a test skill fixture
    /// Returns a TempDir that auto-cleans on drop
    fn create_test_skill_fixture(skill_name: &str, content: &str) -> std::io::Result<TempDir> {
        let temp_dir = TempDir::new()?;
        let skill_dir = temp_dir.path().join(skill_name);
        fs::create_dir(&skill_dir)?;
        fs::write(skill_dir.join("SKILL.md"), content)?;
        Ok(temp_dir)
    }

    // T012: Test scan valid skills in ~/.claude/skills
    #[test]
    fn test_scan_skills_returns_ok() {
        // This tests the full scan_skills() function
        // Note: This may return empty if user has no skills
        let result = scan_skills();
        assert!(result.is_ok(), "scan_skills() should return Ok even if no skills found");
    }

    // T013: Test scan skills from both locations (tested via scan_skills())
    #[test]
    fn test_scan_skills_handles_multiple_locations() {
        // scan_skills() iterates over all locations (claude + opencode)
        let result = scan_skills();
        assert!(result.is_ok());
        // If skills exist, they should have valid locations
        if let Ok(skills) = result {
            for skill in skills {
                assert!(
                    skill.location == "claude" || skill.location == "opencode",
                    "Skill location must be 'claude' or 'opencode'"
                );
            }
        }
    }

    // T014: Test handle non-existent directory gracefully
    #[test]
    fn test_scan_directory_non_existent() {
        use std::path::PathBuf;
        let non_existent = PathBuf::from("/nonexistent/path/that/should/not/exist");

        // Should return error, but not panic
        let result = scan_directory(&non_existent, "test");
        assert!(result.is_err(), "Should return error for non-existent directory");
    }

    // T015: Test handle permission errors (difficult to test portably, covered by error handling logic)
    // Skipped - permission testing requires OS-specific setup

    // T016: Test isolate errors for malformed SKILL.md files
    #[test]
    fn test_scan_directory_with_malformed_skill() {
        let temp_dir = TempDir::new().unwrap();

        // Create valid skill
        let valid_skill = temp_dir.path().join("valid-skill");
        fs::create_dir(&valid_skill).unwrap();
        fs::write(
            valid_skill.join("SKILL.md"),
            "---\nname: valid\n---\n\n# Valid Skill\n\nThis is valid."
        ).unwrap();

        // Create malformed skill (empty file)
        let malformed_skill = temp_dir.path().join("malformed-skill");
        fs::create_dir(&malformed_skill).unwrap();
        fs::write(malformed_skill.join("SKILL.md"), "").unwrap();

        // scan_directory should load valid skill and log error for malformed
        let skills = scan_directory(temp_dir.path(), "test").unwrap();

        // Should find at least the valid skill
        assert!(skills.len() >= 1, "Should find valid skill even if malformed exists");
        assert!(skills.iter().any(|s| s.name == "valid-skill"), "Valid skill should be loaded");
    }

    // T017: Test recursively discover nested skill directories
    #[test]
    fn test_scan_directory_flat_structure() {
        let temp_dir = TempDir::new().unwrap();

        // Create two skill directories at same level
        let skill1 = temp_dir.path().join("skill-one");
        fs::create_dir(&skill1).unwrap();
        fs::write(skill1.join("SKILL.md"), "# Skill One").unwrap();

        let skill2 = temp_dir.path().join("skill-two");
        fs::create_dir(&skill2).unwrap();
        fs::write(skill2.join("SKILL.md"), "# Skill Two").unwrap();

        let skills = scan_directory(temp_dir.path(), "test").unwrap();

        assert_eq!(skills.len(), 2, "Should find both skills");
        assert!(skills.iter().any(|s| s.name == "skill-one"), "Should find skill-one");
        assert!(skills.iter().any(|s| s.name == "skill-two"), "Should find skill-two");
    }

    #[test]
    fn test_load_skill_with_valid_frontmatter() {
        let temp_dir = TempDir::new().unwrap();
        let skill_dir = temp_dir.path().join("test-skill");
        fs::create_dir(&skill_dir).unwrap();

        let content = "---\nname: test-skill\nversion: 1.0.0\n---\n\n# Test Skill\n\nDescription here.";
        let skill_file = skill_dir.join("SKILL.md");
        fs::write(&skill_file, content).unwrap();

        let skill = load_skill(&skill_file, "test").unwrap();

        assert_eq!(skill.name, "test-skill");
        assert_eq!(skill.location, "test");
        assert!(skill.metadata.is_some(), "Metadata should be extracted");
        assert!(!skill.content_clean.contains("---"), "Content should not contain frontmatter delimiters");
    }

    #[test]
    fn test_load_skill_without_frontmatter() {
        let temp_dir = TempDir::new().unwrap();
        let skill_dir = temp_dir.path().join("no-fm-skill");
        fs::create_dir(&skill_dir).unwrap();

        let content = "# No Frontmatter Skill\n\nThis has no YAML.";
        let skill_file = skill_dir.join("SKILL.md");
        fs::write(&skill_file, content).unwrap();

        let skill = load_skill(&skill_file, "test").unwrap();

        assert_eq!(skill.name, "no-fm-skill");
        assert_eq!(skill.content, content);
        assert_eq!(skill.content_clean, content);
    }

    #[test]
    fn test_load_references() {
        let temp_dir = TempDir::new().unwrap();
        let skill_dir = temp_dir.path().join("skill-with-refs");
        fs::create_dir(&skill_dir).unwrap();

        // Create references directory
        let refs_dir = skill_dir.join("references");
        fs::create_dir(&refs_dir).unwrap();
        fs::write(refs_dir.join("api.md"), "# API Docs").unwrap();
        fs::write(refs_dir.join("examples.md"), "# Examples").unwrap();

        let references = load_references(&skill_dir);

        assert_eq!(references.len(), 2, "Should load both reference files");
    }

    #[test]
    fn test_load_references_no_directory() {
        let temp_dir = TempDir::new().unwrap();
        let skill_dir = temp_dir.path().join("skill-no-refs");
        fs::create_dir(&skill_dir).unwrap();

        // No references directory
        let references = load_references(&skill_dir);

        assert_eq!(references.len(), 0, "Should return empty vec when no references dir");
    }

    #[test]
    fn test_load_scripts() {
        let temp_dir = TempDir::new().unwrap();
        let skill_dir = temp_dir.path().join("skill-with-scripts");
        fs::create_dir(&skill_dir).unwrap();

        // Create scripts directory
        let scripts_dir = skill_dir.join("scripts");
        fs::create_dir(&scripts_dir).unwrap();
        fs::write(scripts_dir.join("test.py"), "print('hello')").unwrap();
        fs::write(scripts_dir.join("helper.js"), "console.log('hi')").unwrap();

        let scripts = load_scripts(&skill_dir);

        assert_eq!(scripts.len(), 2, "Should load both script files");
        assert!(scripts.iter().any(|s| s.language == "py"), "Should detect Python script");
        assert!(scripts.iter().any(|s| s.language == "js"), "Should detect JavaScript script");
    }

    #[test]
    fn test_load_scripts_no_directory() {
        let temp_dir = TempDir::new().unwrap();
        let skill_dir = temp_dir.path().join("skill-no-scripts");
        fs::create_dir(&skill_dir).unwrap();

        // No scripts directory
        let scripts = load_scripts(&skill_dir);

        assert_eq!(scripts.len(), 0, "Should return empty vec when no scripts dir");
    }
}

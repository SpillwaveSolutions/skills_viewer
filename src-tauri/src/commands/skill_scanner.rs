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
    use std::path::PathBuf;

    #[test]
    fn test_scan_skills() {
        // This will scan actual user directories
        let result = scan_skills();
        assert!(result.is_ok());
    }

    #[test]
    fn test_scan_directory() {
        let temp_dir = std::env::temp_dir().join("test_skills");
        fs::create_dir_all(&temp_dir).unwrap();

        // Create a test skill file
        let test_skill = temp_dir.join("test.md");
        fs::write(&test_skill, "# Test Skill\n\nThis is a test.").unwrap();

        let skills = scan_directory(&temp_dir, "test").unwrap();
        assert_eq!(skills.len(), 1);
        assert_eq!(skills[0].name, "test");

        // Clean up
        fs::remove_dir_all(&temp_dir).ok();
    }
}

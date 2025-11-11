use std::path::PathBuf;

/// Get the Claude skills directory path
pub fn get_claude_skills_dir() -> Option<PathBuf> {
    dirs::home_dir().map(|home| home.join(".claude").join("skills"))
}

/// Get the OpenCode skills directory path
pub fn get_opencode_skills_dir() -> Option<PathBuf> {
    dirs::home_dir().map(|home| home.join(".config").join("opencode").join("skills"))
}

/// Get both skill directories
pub fn get_skill_directories() -> Vec<(String, PathBuf)> {
    let mut dirs = Vec::new();

    if let Some(claude_dir) = get_claude_skills_dir() {
        dirs.push(("claude".to_string(), claude_dir));
    }

    if let Some(opencode_dir) = get_opencode_skills_dir() {
        dirs.push(("opencode".to_string(), opencode_dir));
    }

    dirs
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_claude_skills_dir() {
        let dir = get_claude_skills_dir();
        assert!(dir.is_some());
        assert!(dir.unwrap().ends_with(".claude/skills"));
    }

    #[test]
    fn test_get_opencode_skills_dir() {
        let dir = get_opencode_skills_dir();
        assert!(dir.is_some());
        assert!(dir.unwrap().ends_with(".config/opencode/skills"));
    }

    #[test]
    fn test_get_skill_directories() {
        let dirs = get_skill_directories();
        assert_eq!(dirs.len(), 2);
        assert_eq!(dirs[0].0, "claude");
        assert_eq!(dirs[1].0, "opencode");
    }
}

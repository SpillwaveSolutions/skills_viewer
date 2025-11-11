use serde::{Deserialize, Serialize};
use super::reference::Reference;
use super::script::Script;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Skill {
    /// Skill name (from filename or metadata)
    pub name: String,

    /// Description from YAML frontmatter or first paragraph
    pub description: Option<String>,

    /// Location: "claude" or "opencode"
    pub location: String,

    /// Full filesystem path to the skill file
    pub path: String,

    /// File content (full markdown including YAML frontmatter)
    pub content: String,

    /// Clean markdown content without YAML frontmatter
    pub content_clean: String,

    /// List of references loaded by this skill
    pub references: Vec<Reference>,

    /// List of scripts included in this skill
    pub scripts: Vec<Script>,

    /// YAML frontmatter metadata
    pub metadata: Option<serde_json::Value>,
}

impl Skill {
    pub fn new(name: String, path: String, location: String) -> Self {
        Self {
            name,
            description: None,
            location,
            path,
            content: String::new(),
            content_clean: String::new(),
            references: Vec::new(),
            scripts: Vec::new(),
            metadata: None,
        }
    }
}

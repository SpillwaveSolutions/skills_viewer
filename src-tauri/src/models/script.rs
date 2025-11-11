use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Script {
    /// Script name or identifier
    pub name: String,

    /// Script language: "bash", "python", "javascript", etc.
    pub language: String,

    /// Script content
    pub content: String,

    /// Line number where script starts in the skill file
    pub line_number: Option<usize>,
}

impl Script {
    pub fn new(name: String, language: String, content: String) -> Self {
        Self {
            name,
            language,
            content,
            line_number: None,
        }
    }
}

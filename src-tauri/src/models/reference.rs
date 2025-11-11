use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Reference {
    /// File path or pattern
    pub path: String,

    /// Reference type: "file", "glob", or "directory"
    pub ref_type: String,

    /// Whether this is a required reference
    pub required: bool,
}

impl Reference {
    pub fn new(path: String, ref_type: String) -> Self {
        Self {
            path,
            ref_type,
            required: false,
        }
    }
}

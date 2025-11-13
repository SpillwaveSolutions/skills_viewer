# Backend Documentation - Skill Debugger

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Tauri Commands (API Layer)](#tauri-commands-api-layer)
5. [Core Modules](#core-modules)
6. [Data Models](#data-models)
7. [Utilities](#utilities)
8. [File System Operations](#file-system-operations)
9. [Performance Considerations](#performance-considerations)
10. [Tauri Configuration](#tauri-configuration)
11. [Frontend-Backend Integration](#frontend-backend-integration)
12. [Testing](#testing)
13. [Security Considerations](#security-considerations)

---

## Overview

The Skill Debugger backend is built with **Rust** and **Tauri 2.x**, providing a native desktop application framework with high performance and strong type safety. The backend serves as a safe, read-only file system scanner that discovers Claude Code skills from local directories and exposes them to the React frontend via Tauri's IPC (Inter-Process Communication) layer.

**Key Characteristics**:

- **Read-only by design**: No file modifications, only safe reads
- **Offline-first**: No network requests
- **Cross-platform**: Works on macOS, Linux, Windows
- **Type-safe**: Rust's type system prevents runtime errors
- **Efficient**: Fast directory scanning and parsing

---

## Technology Stack

### Dependencies (from `Cargo.toml`)

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
serde_yaml = "0.9"
dirs = "5.0"
```

**Dependency Breakdown**:

| Dependency            | Version | Purpose                                         |
| --------------------- | ------- | ----------------------------------------------- |
| `tauri`               | 2.x     | Core Tauri framework for building desktop apps  |
| `tauri-plugin-opener` | 2.x     | Opens files/URLs in system default applications |
| `serde`               | 1.x     | Serialization/deserialization framework         |
| `serde_json`          | 1.x     | JSON support for Serde                          |
| `serde_yaml`          | 0.9     | YAML parsing for skill frontmatter              |
| `dirs`                | 5.0     | Cross-platform user directory paths             |

**Build Dependencies**:

```toml
[build-dependencies]
tauri-build = { version = "2", features = [] }
```

---

## Project Structure

```
src-tauri/
├── Cargo.toml              # Rust dependencies and project metadata
├── tauri.conf.json         # Tauri application configuration
├── build.rs                # Build script (auto-generated)
└── src/
    ├── main.rs             # Entry point (delegates to lib.rs)
    ├── lib.rs              # Main application logic and Tauri setup
    ├── commands/           # Tauri commands (API endpoints)
    │   ├── mod.rs          # Module exports
    │   ├── skill_scanner.rs # Skill discovery and loading
    │   └── file_reader.rs  # Safe file reading utility
    ├── models/             # Data structures
    │   ├── mod.rs          # Module exports
    │   ├── skill.rs        # Skill struct
    │   ├── reference.rs    # Reference struct (skill dependencies)
    │   └── script.rs       # Script struct (embedded scripts)
    └── utils/              # Utility functions
        ├── mod.rs          # Module exports
        ├── paths.rs        # Path resolution (skill directories)
        └── yaml_parser.rs  # YAML frontmatter extraction
```

### Module Organization

**Module Hierarchy**:

```
skill_debugger_temp_lib (crate root)
├── commands
│   ├── scan_skills()          [Tauri command]
│   ├── read_file_content()    [Tauri command]
│   ├── scan_directory()       [internal]
│   ├── load_skill()           [internal]
│   ├── load_references()      [internal]
│   └── load_scripts()         [internal]
├── models
│   ├── Skill                  [public struct]
│   ├── Reference              [public struct]
│   └── Script                 [public struct]
└── utils
    ├── get_claude_skills_dir()
    ├── get_opencode_skills_dir()
    ├── get_skill_directories()
    ├── extract_frontmatter()
    ├── extract_description()
    └── parse_yaml_to_json()    [internal]
```

---

## Tauri Commands (API Layer)

Tauri commands are Rust functions decorated with `#[tauri::command]` that are exposed to the frontend via IPC. These are the **only** entry points the frontend can call.

### Command Reference Table

| Command             | Location                                        | Parameters     | Returns                      | Purpose                                      |
| ------------------- | ----------------------------------------------- | -------------- | ---------------------------- | -------------------------------------------- |
| `greet`             | `/src-tauri/src/lib.rs:6-9`                     | `name: &str`   | `String`                     | Demo greeting function (unused)              |
| `scan_skills`       | `/src-tauri/src/commands/skill_scanner.rs:6-23` | None           | `Result<Vec<Skill>, String>` | Scans all skill directories and loads skills |
| `read_file_content` | `/src-tauri/src/commands/file_reader.rs:3-7`    | `path: String` | `Result<String, String>`     | Reads a file's content safely                |

### Command Registration

All commands are registered in `/src-tauri/src/lib.rs:12-22`:

```rust
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::scan_skills,
            commands::read_file_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Key Points**:

- `tauri::generate_handler![]` macro auto-generates IPC bindings
- Commands are type-safe: Tauri validates parameters at runtime
- All commands return `Result<T, String>` for error handling

---

## Core Modules

### 1. Skill Scanner (`src-tauri/src/commands/skill_scanner.rs`)

**Purpose**: Discover and load all skills from configured directories.

#### Key Functions

##### `scan_skills()` - Main Entry Point

**Location**: Lines 6-23

```rust
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
```

**Flow**:

1. Get skill directories (`~/.claude/skills`, `~/.config/opencode/skills`)
2. Check if each directory exists
3. Scan each directory for skills
4. Aggregate results into single vector
5. Return combined list (errors logged but not propagated)

##### `scan_directory()` - Directory Scanner

**Location**: Lines 25-47

```rust
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
```

**Logic**:

- Only directories containing `SKILL.md` are considered skills
- Invalid skills are logged but don't stop scanning
- Error handling uses `?` operator for early returns

##### `load_skill()` - Skill Parser

**Location**: Lines 49-86

```rust
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
```

**Parsing Steps**:

1. Read `SKILL.md` file content
2. Extract skill name from directory name
3. Parse YAML frontmatter (if present)
4. Extract description (first paragraph)
5. Load references from `references/` subdirectory
6. Load scripts from `scripts/` subdirectory
7. Return populated `Skill` struct

##### `load_references()` - Reference Loader

**Location**: Lines 88-121

```rust
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
```

**Logic**:

- Checks for `references/` subdirectory
- Scans all files (not directories)
- Detects glob patterns (`*` in filename)
- Returns empty vector if no references exist

##### `load_scripts()` - Script Loader

**Location**: Lines 123-160

```rust
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
```

**Logic**:

- Checks for `scripts/` subdirectory
- Reads all script files
- Determines language from file extension (`.sh` → `sh`, `.py` → `py`)
- Returns empty vector if no scripts exist

---

### 2. File Reader (`src-tauri/src/commands/file_reader.rs`)

**Purpose**: Safely read file content (used for viewing reference files).

```rust
#[tauri::command]
pub fn read_file_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file {}: {}", path, e))
}
```

**Security Notes**:

- No path validation (trusted input from frontend)
- Read-only operation (no writes possible)
- UTF-8 encoding assumed (binary files will fail)

---

## Data Models

All models are located in `/src-tauri/src/models/` and implement `Serialize` and `Deserialize` for JSON transport.

### 1. Skill (`models/skill.rs`)

**Purpose**: Represents a complete skill with metadata, content, and dependencies.

```rust
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
```

**Location**: `/src-tauri/src/models/skill.rs:5-49`

**Constructor**:

```rust
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
```

**Field Details**:

- `name`: Directory name of the skill (e.g., "python-expert-engineer")
- `location`: Either "claude" (`~/.claude/skills`) or "opencode" (`~/.config/opencode/skills`)
- `path`: Absolute path to `SKILL.md` file
- `content`: Raw markdown including YAML frontmatter
- `content_clean`: Markdown without frontmatter (for rendering)
- `metadata`: JSON representation of YAML frontmatter
- `references`: Files in `references/` subdirectory
- `scripts`: Files in `scripts/` subdirectory

---

### 2. Reference (`models/reference.rs`)

**Purpose**: Represents a reference file or pattern that a skill depends on.

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Reference {
    /// File path or pattern
    pub path: String,

    /// Reference type: "file", "glob", or "directory"
    pub ref_type: String,

    /// Whether this is a required reference
    pub required: bool,
}
```

**Location**: `/src-tauri/src/models/reference.rs:3-23`

**Constructor**:

```rust
impl Reference {
    pub fn new(path: String, ref_type: String) -> Self {
        Self {
            path,
            ref_type,
            required: false,
        }
    }
}
```

**Field Details**:

- `path`: Absolute path to reference file
- `ref_type`: Type detection based on filename patterns:
  - `"glob"`: Filename contains `*` (e.g., `*.py`)
  - `"file"`: Regular file
  - `"directory"`: Not currently used
- `required`: Always `false` in current implementation

---

### 3. Script (`models/script.rs`)

**Purpose**: Represents an executable script embedded in a skill.

```rust
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
```

**Location**: `/src-tauri/src/models/script.rs:3-27`

**Constructor**:

```rust
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
```

**Field Details**:

- `name`: Filename of script (e.g., `deploy.sh`)
- `language`: File extension (e.g., `sh`, `py`, `js`)
- `content`: Full script content
- `line_number`: Not currently populated (reserved for inline scripts)

---

## Utilities

### 1. Path Resolution (`utils/paths.rs`)

**Purpose**: Cross-platform path resolution for skill directories.

#### Functions

##### `get_claude_skills_dir()`

**Location**: `/src-tauri/src/utils/paths.rs:3-6`

```rust
pub fn get_claude_skills_dir() -> Option<PathBuf> {
    dirs::home_dir().map(|home| home.join(".claude").join("skills"))
}
```

**Returns**: `~/.claude/skills` (cross-platform)

##### `get_opencode_skills_dir()`

**Location**: `/src-tauri/src/utils/paths.rs:8-11`

```rust
pub fn get_opencode_skills_dir() -> Option<PathBuf> {
    dirs::home_dir().map(|home| home.join(".config").join("opencode").join("skills"))
}
```

**Returns**: `~/.config/opencode/skills` (cross-platform)

##### `get_skill_directories()`

**Location**: `/src-tauri/src/utils/paths.rs:13-26`

```rust
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
```

**Returns**: Vector of `(location_name, path)` tuples

**Cross-Platform Support**:

- Uses `dirs` crate for home directory resolution
- Works on macOS, Linux, Windows
- Gracefully handles missing home directory (returns `None`)

---

### 2. YAML Parser (`utils/yaml_parser.rs`)

**Purpose**: Extract and parse YAML frontmatter from markdown files.

#### Functions

##### `extract_frontmatter()`

**Location**: `/src-tauri/src/utils/yaml_parser.rs:4-37`

```rust
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
```

**Returns**: `(frontmatter_json, content_without_frontmatter)`

**Logic**:

1. Check if content starts with `---`
2. Find closing `---` delimiter
3. Extract YAML block between delimiters
4. Parse YAML to JSON (using `parse_yaml_to_json()`)
5. Return remaining content without frontmatter

**Example**:

```markdown
---
name: Python Expert
version: 1.0.0
---

This is the skill description.
```

**Result**:

```rust
(
    Some(json!({"name": "Python Expert", "version": "1.0.0"})),
    "\nThis is the skill description."
)
```

##### `parse_yaml_to_json()` (Internal)

**Location**: `/src-tauri/src/utils/yaml_parser.rs:39-57`

```rust
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
```

**Logic**:

1. Parse YAML using `serde_yaml`
2. Convert `serde_yaml::Value` to `serde_json::Value`
3. Log errors to stderr (non-fatal)
4. Return `None` on parse failure

##### `extract_description()`

**Location**: `/src-tauri/src/utils/yaml_parser.rs:59-94`

```rust
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
```

**Returns**: First paragraph of content (excluding headers)

**Logic**:

1. Skip leading empty lines
2. Skip markdown headers (`# Title`)
3. Collect lines until first empty line
4. Join lines with spaces
5. Return `None` if no content found

**Example**:

```markdown
# Python Expert

This skill provides expert Python development assistance
following best practices and PEP standards.

It includes...
```

**Result**:

```rust
Some("This skill provides expert Python development assistance following best practices and PEP standards.")
```

---

## File System Operations

### Directory Scanning Strategy

**Approach**: Sequential directory traversal (not parallelized)

**Rationale**:

- Skill directories typically contain <100 skills
- I/O bound operation (disk is bottleneck, not CPU)
- Simpler error handling (no Arc/Mutex complexity)

**Scan Flow**:

```
scan_skills()
  ├─ get_skill_directories()
  │   ├─ ~/.claude/skills
  │   └─ ~/.config/opencode/skills
  │
  └─ for each directory:
      ├─ scan_directory()
      │   └─ for each subdirectory:
      │       └─ if SKILL.md exists:
      │           ├─ load_skill()
      │           │   ├─ read SKILL.md
      │           │   ├─ extract_frontmatter()
      │           │   ├─ extract_description()
      │           │   ├─ load_references()
      │           │   └─ load_scripts()
      │           └─ add to results
      └─ aggregate results
```

### Path Handling (Cross-Platform)

**Key Principles**:

1. Use `PathBuf` for all paths (not `String`)
2. Use `.join()` for path concatenation (not string interpolation)
3. Convert to `String` only when needed for serialization
4. Use `dirs` crate for user directories

**Example (Correct)**:

```rust
let skill_dir = home_dir.join(".claude").join("skills");
let skill_file = skill_dir.join("python-expert").join("SKILL.md");
```

**Example (Incorrect)**:

```rust
let skill_file = format!("{}/.claude/skills/python-expert/SKILL.md", home_dir);
// ❌ Fails on Windows (uses backslashes)
```

### Error Handling Patterns

**Pattern 1: Propagate Errors with `?`**

```rust
let content = fs::read_to_string(path)
    .map_err(|e| format!("Failed to read file: {}", e))?;
```

**Pattern 2: Log and Continue**

```rust
match load_skill(&skill_file, location) {
    Ok(skill) => skills.push(skill),
    Err(e) => eprintln!("Error loading skill {:?}: {}", skill_file, e),
}
```

**Pattern 3: Return Empty on Missing**

```rust
if !refs_dir.exists() || !refs_dir.is_dir() {
    return references; // Empty Vec
}
```

**Error Handling Strategy**:

- **Critical errors**: Propagate with `Result::Err` (e.g., directory unreadable)
- **Partial failures**: Log to stderr and continue (e.g., one skill fails to parse)
- **Expected missing data**: Return empty collections (e.g., no references/ directory)

---

## Performance Considerations

### Startup Performance

**Target**: <2 seconds to scan 50 skills

**Current Approach**:

- Sequential I/O (acceptable for local filesystems)
- No caching (skills loaded fresh on each scan)
- No lazy loading (all skills loaded upfront)

**Optimization Opportunities** (Future):

1. **Parallel scanning**: Use `rayon` to scan multiple directories concurrently
2. **Lazy loading**: Load skill content only when viewed
3. **Incremental scanning**: Watch filesystem for changes (inotify/FSEvents)
4. **Caching**: Cache parsed skills in memory

### Memory Efficiency

**Current Memory Usage**:

- Each skill: ~10-50 KB (depends on content size)
- 50 skills: ~500 KB - 2.5 MB total
- Acceptable for desktop application

**Considerations**:

- Skill content stored as `String` (UTF-8 validated)
- References and scripts cloned per skill (not shared)
- No streaming (entire files read into memory)

### Async/Await Usage

**Current Status**: **Not used** (all operations are synchronous)

**Rationale**:

- Tauri commands can be sync or async (no performance difference)
- File I/O is blocking (Rust stdlib has no async file I/O)
- Simplifies error handling (no `.await` points)

**Future Consideration**:

- Use `tokio::fs` for async file I/O
- Parallel scanning with `tokio::spawn`

---

## Tauri Configuration

### Configuration File (`tauri.conf.json`)

**Location**: `/src-tauri/tauri.conf.json`

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "skill-debugger-temp",
  "version": "0.1.0",
  "identifier": "com.richardhightower.skill-debugger-temp",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "skill-debugger-temp",
        "width": 800,
        "height": 600
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

### Key Configuration Sections

#### Build Configuration

```json
"build": {
  "beforeDevCommand": "npm run dev",
  "devUrl": "http://localhost:1420",
  "beforeBuildCommand": "npm run build",
  "frontendDist": "../dist"
}
```

**Explanation**:

- `beforeDevCommand`: Starts Vite dev server (port 1420)
- `devUrl`: Where Tauri loads frontend in dev mode
- `beforeBuildCommand`: Builds React app to `dist/`
- `frontendDist`: Where Tauri finds production build

#### Window Configuration

```json
"windows": [
  {
    "title": "skill-debugger-temp",
    "width": 800,
    "height": 600
  }
]
```

**Default Window**:

- 800x600 initial size (resizable)
- Title shown in window chrome

#### Security Configuration

```json
"security": {
  "csp": null
}
```

**CSP Disabled**: Content Security Policy disabled for development convenience

**Production Recommendation**:

```json
"csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
```

#### Bundle Configuration

```json
"bundle": {
  "active": true,
  "targets": "all",
  "icon": [...]
}
```

**Bundling**:

- `active: true`: Enables application bundling
- `targets: "all"`: Builds for all supported platforms
- Icons for macOS (.icns), Windows (.ico), Linux (.png)

### Permissions and Capabilities

**Current Permissions**: **All filesystem access granted**

**Tauri 2.x Security Model**:

- No explicit permissions required in `tauri.conf.json`
- All commands are implicitly allowed
- File access controlled by OS-level permissions

**Security Considerations**:

- `read_file_content()` accepts arbitrary paths (no validation)
- Relies on frontend to provide trusted paths
- Read-only operations (no writes possible)

**Future Enhancement**: Add path validation

```rust
#[tauri::command]
pub fn read_file_content(path: String) -> Result<String, String> {
    // Validate path is within skill directories
    let skill_dirs = get_skill_directories();
    let path_buf = PathBuf::from(&path);

    let is_valid = skill_dirs.iter().any(|(_, dir)| path_buf.starts_with(dir));
    if !is_valid {
        return Err("Path outside skill directories".to_string());
    }

    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file {}: {}", path, e))
}
```

---

## Frontend-Backend Integration

### IPC Communication Flow

**Architecture**: Asynchronous message passing via Tauri's IPC bridge

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│                   (TypeScript/JavaScript)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    invoke('command', args)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Tauri IPC Layer                         │
│               (Serialization/Deserialization)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                      Rust Handler
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Rust Backend                            │
│                   (Tauri Commands)                           │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Call Example

**React Hook: `useSkills.ts`**

**Location**: `/src/hooks/useSkills.ts:6-33`

```typescript
import { invoke } from '@tauri-apps/api/core';
import { Skill } from '../types';

export function useSkills() {
  const { skills, isLoading, error, setSkills, setLoading, setError } = useSkillStore();

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<Skill[]>('scan_skills');
      setSkills(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
      console.error('Error loading skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  return {
    skills,
    isLoading,
    error,
    reload: loadSkills,
  };
}
```

**Flow**:

1. `invoke<Skill[]>('scan_skills')` calls Rust backend
2. Tauri serializes request (no parameters)
3. Rust `scan_skills()` executes
4. Rust returns `Result<Vec<Skill>, String>`
5. Tauri deserializes response to JSON
6. TypeScript receives `Skill[]` array

### Reading Reference Files

**Component: `ReferencesTab.tsx`**

**Location**: `/src/components/ReferencesTab.tsx:33-39`

```typescript
const handleReferenceClick = async (path: string) => {
  setSelectedRef(path);

  try {
    // Use Tauri command to read the file content
    const content = await invoke<string>('read_file_content', { path });
    setRefContent(content);
  } catch (error) {
    setRefContent(`Error loading reference: ${path}\n\n${error}`);
  }
};
```

**Flow**:

1. User clicks reference file
2. `invoke<string>('read_file_content', { path })` calls Rust
3. Rust reads file and returns content
4. Content displayed in UI

### Type Safety

**TypeScript Types** (Frontend):

```typescript
export interface Skill {
  name: string;
  description?: string;
  location: string;
  path: string;
  content: string;
  content_clean: string;
  references: Reference[];
  scripts: Script[];
  metadata?: any;
}
```

**Rust Types** (Backend):

```rust
#[derive(Serialize, Deserialize)]
pub struct Skill {
    pub name: String,
    pub description: Option<String>,
    pub location: String,
    pub path: String,
    pub content: String,
    pub content_clean: String,
    pub references: Vec<Reference>,
    pub scripts: Vec<Script>,
    pub metadata: Option<serde_json::Value>,
}
```

**Type Mapping**:
| TypeScript | Rust | Notes |
|------------|------|-------|
| `string` | `String` | UTF-8 string |
| `string?` | `Option<String>` | Optional field |
| `any` | `serde_json::Value` | Dynamic JSON |
| `Array<T>` | `Vec<T>` | Array/vector |

---

## Testing

### Unit Tests

**Test Coverage**:

- ✅ Path resolution functions (`paths.rs:28-53`)
- ✅ YAML parsing functions (`yaml_parser.rs:96-115`)
- ✅ Directory scanning (`skill_scanner.rs:162-191`)

### Test Examples

#### Path Resolution Tests

**Location**: `/src-tauri/src/utils/paths.rs:28-53`

```rust
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
```

#### YAML Parser Tests

**Location**: `/src-tauri/src/utils/yaml_parser.rs:96-115`

```rust
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
```

### Running Tests

**Command**:

```bash
cd src-tauri
cargo test
```

**Output**:

```
running 6 tests
test utils::paths::tests::test_get_claude_skills_dir ... ok
test utils::paths::tests::test_get_opencode_skills_dir ... ok
test utils::paths::tests::test_get_skill_directories ... ok
test utils::yaml_parser::tests::test_extract_frontmatter_none ... ok
test utils::yaml_parser::tests::test_extract_description ... ok
test commands::skill_scanner::tests::test_scan_skills ... ok

test result: ok. 6 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

### Integration Testing Recommendations

**Current Gap**: No integration tests for Tauri commands

**Recommended Tests**:

1. **Command Invocation**: Test commands via `tauri::test::mock_invoke()`
2. **Error Handling**: Verify error messages are user-friendly
3. **Cross-Platform**: Test path resolution on Windows/Linux
4. **Performance**: Benchmark scanning 100+ skills

**Example Integration Test** (Not yet implemented):

```rust
#[cfg(test)]
mod integration_tests {
    use tauri::test::{mock_context, mock_invoke};

    #[test]
    fn test_scan_skills_command() {
        let result = mock_invoke::<Vec<Skill>>("scan_skills", serde_json::json!({}));
        assert!(result.is_ok());
        let skills = result.unwrap();
        assert!(!skills.is_empty());
    }
}
```

---

## Security Considerations

### Read-Only Access

**Design Principle**: Backend has no write capabilities

**Enforcement**:

- No `fs::write()` calls in codebase
- No file deletion or modification commands
- All operations use `fs::read_to_string()` or `fs::read_dir()`

### Path Traversal Risk

**Current Status**: ⚠️ **Unmitigated**

**Vulnerable Command**:

```rust
#[tauri::command]
pub fn read_file_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path)  // No validation
        .map_err(|e| format!("Failed to read file {}: {}", path, e))
}
```

**Attack Scenario**:

1. Malicious frontend (or XSS) calls: `invoke('read_file_content', { path: '/etc/passwd' })`
2. Backend reads arbitrary file
3. Content returned to frontend

**Mitigation** (Recommended):

```rust
use std::path::PathBuf;

#[tauri::command]
pub fn read_file_content(path: String) -> Result<String, String> {
    // Validate path is within allowed directories
    let path_buf = PathBuf::from(&path);
    let skill_dirs = get_skill_directories();

    let is_valid = skill_dirs.iter().any(|(_, dir)| {
        path_buf.canonicalize().ok()
            .and_then(|p| p.starts_with(dir).then_some(()))
            .is_some()
    });

    if !is_valid {
        return Err("Path outside skill directories".to_string());
    }

    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file {}: {}", path, e))
}
```

### YAML Parsing Risks

**Potential Risk**: YAML bombs (deeply nested structures)

**Mitigation**: `serde_yaml` has built-in depth limits (default: 128)

**Example Attack** (Blocked):

```yaml
---
a: &a
  b: *a
---
```

**Result**: Parse error (circular reference detected)

### Dependency Security

**Audit Dependencies**:

```bash
cd src-tauri
cargo audit
```

**Update Dependencies**:

```bash
cargo update
```

**Pin Critical Versions** (Recommended):

```toml
[dependencies]
serde = "=1.0.197"      # Pin exact version
serde_json = "=1.0.114"
```

---

## Summary

### Key Strengths

1. **Type Safety**: Rust's type system prevents runtime errors
2. **Cross-Platform**: Works identically on macOS, Linux, Windows
3. **Read-Only**: No file modification capabilities
4. **Simple Architecture**: Minimal dependencies, straightforward flow
5. **Error Handling**: Graceful degradation (partial failures don't crash app)

### Known Limitations

1. **No Caching**: Skills re-scanned on every `scan_skills()` call
2. **Synchronous I/O**: Blocks during file operations
3. **No Parallelization**: Sequential directory scanning
4. **Path Validation**: No security checks on `read_file_content()`
5. **No Incremental Updates**: No filesystem watching

### Future Enhancements

**Performance**:

- [ ] Parallel scanning with `rayon`
- [ ] Lazy loading of skill content
- [ ] Filesystem watching (`notify` crate)

**Security**:

- [ ] Path validation in `read_file_content()`
- [ ] CSP enforcement in production builds

**Features**:

- [ ] Search/filter skills on backend (reduce data transfer)
- [ ] Extract inline scripts from SKILL.md (regex parsing)
- [ ] Support skill.yaml (alternative to SKILL.md)

---

## Appendix: Full File Listings

### Entry Point (`src-tauri/src/lib.rs`)

```rust
mod commands;
mod models;
mod utils;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::scan_skills,
            commands::read_file_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Command Exports (`src-tauri/src/commands/mod.rs`)

```rust
pub mod skill_scanner;
pub mod file_reader;

pub use skill_scanner::*;
pub use file_reader::*;
```

### Model Exports (`src-tauri/src/models/mod.rs`)

```rust
pub mod skill;
pub mod reference;
pub mod script;

pub use skill::Skill;
pub use reference::Reference;
pub use script::Script;
```

### Utility Exports (`src-tauri/src/utils/mod.rs`)

```rust
pub mod paths;
pub mod yaml_parser;

pub use paths::*;
pub use yaml_parser::*;
```

---

## Contact and Contributions

For questions or contributions, see project README.

**Last Updated**: 2025-11-13
**Version**: 0.1.0
**Author**: Skill Debugger Team

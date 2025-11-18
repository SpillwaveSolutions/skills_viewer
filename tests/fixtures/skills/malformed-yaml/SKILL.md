---
name: malformed-yaml-skill
invalid: [yaml: content: missing closing bracket
version: 1.0.0
---

# Malformed YAML Skill

This skill has intentionally malformed YAML frontmatter for testing error handling.

The YAML parser should detect the syntax error and handle it gracefully without crashing.

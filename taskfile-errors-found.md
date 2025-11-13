# Taskfile YAML Errors Found During skill-debugger Setup

## Date

2025-11-11

## Context

While setting up Taskfile.yml for the skill-debugger monorepo project, I encountered YAML syntax errors that prevented Task from parsing the file correctly.

## Errors Encountered

### Error 1: Colon Inside Unquoted String in Echo Command

**Location**: `format:frontend` task
**Original Code**:

```yaml
format:frontend:
  desc: Format frontend code with Prettier (if configured)
  dir: '{{.FRONTEND_DIR}}'
  cmds:
    - echo "Prettier not configured. Consider adding: npm install --save-dev prettier"
```

**Error Message**:

```
invalid keys in command
file: /Users/richardhightower/src/skill-debugger/Taskfile.yml:145:9
  143 |     dir: "{{.FRONTEND_DIR}}"
  144 |     cmds:
> 145 |       - echo "Prettier not configured. Consider adding: npm install --save-dev prettier"
      |         ^
```

**Root Cause**:
The colon (`:`) after "adding" in the echo string confused the YAML parser. Even though the string was double-quoted, the YAML parser interpreted the colon as a potential key-value separator.

**Solution**:
Remove the colon from the echo message:

```yaml
cmds:
  - echo "Prettier not configured. Consider adding npm install --save-dev prettier"
```

---

### Error 2: Colon Inside Unquoted String (Second Instance)

**Location**: `outdated` task
**Original Code**:

```yaml
outdated:
  desc: Check for outdated dependencies
  cmds:
    - npm outdated || true
    - cd {{.BACKEND_DIR}} && cargo outdated || echo "Install cargo-outdated: cargo install cargo-outdated"
```

**Error Message**:

```
invalid keys in command
file: /Users/richardhightower/src/skill-debugger/Taskfile.yml:262:9
  260 |     cmds:
  261 |       - npm outdated || true
> 262 |       - cd {{.BACKEND_DIR}} && cargo outdated || echo "Install cargo-outdated: cargo install cargo-outdated"
      |         ^
```

**Root Cause**:
Same issue - the colon after "cargo-outdated" in the echo string caused YAML parsing confusion.

**Solution**:
Remove or rephrase to avoid the colon:

```yaml
cmds:
  - npm outdated || true
  - cd {{.BACKEND_DIR}} && cargo outdated || echo "Install cargo-outdated with cargo install cargo-outdated"
```

---

## Pattern Identified

**Common Issue**: Colons inside string values in YAML, even when double-quoted, can cause parsing errors in Task's YAML processor.

**Why This Happens**:

- YAML uses colons as key-value separators
- The YAML parser may scan ahead and get confused when it sees `"text: more text"` patterns
- Task's specific YAML library may be stricter than some others

**Best Practices to Avoid**:

1. **Avoid colons in echo/message strings** when possible
   - ❌ `echo "Error: Something went wrong"`
   - ✅ `echo "Error - Something went wrong"`
   - ✅ `echo "Error, something went wrong"`

2. **Use alternative phrasing**
   - ❌ `"Run: npm install"`
   - ✅ `"Run npm install"`
   - ✅ `"Execute npm install"`

3. **Use single quotes for strings with colons** (if needed)
   - ✅ `echo 'Error: Something went wrong'` (may work better)

4. **Break into multiple echo statements**

   ```yaml
   cmds:
     - echo "To install cargo-outdated, run the following command"
     - echo "cargo install cargo-outdated"
   ```

5. **Use printf instead of echo for complex strings**
   ```yaml
   cmds:
     - printf "Install cargo-outdated: %s\n" "cargo install cargo-outdated"
   ```

---

## Recommendations for Taskfile Skill

### 1. Add "Common YAML Pitfalls" Section

Create a new reference file: `references/common-yaml-pitfalls.md` that covers:

- Colon handling in strings
- Quoting best practices
- Multi-line string handling
- Special characters in YAML

### 2. Update All Templates

Review all template files in `assets/templates/` and ensure:

- No echo statements with colons in strings
- All examples use YAML-safe string formats
- Add comments warning about colon usage

### 3. Add Troubleshooting Entry

Update `references/taskfile-comprehensive-guide.md` Troubleshooting section with:

````markdown
### YAML Parsing Errors with Colons

**Symptom**: `invalid keys in command` error pointing to a `cmds:` line

**Cause**: Colons inside echo strings can confuse YAML parser

**Solution**:

- Remove colons from echo messages
- Use alternative punctuation (-, comma, semicolon)
- Break into multiple echo statements
- Use printf for complex strings

**Example**:

```yaml
# ❌ This may fail
cmds:
  - echo "Error: file not found"

# ✅ This works
cmds:
  - echo "Error - file not found"
  # OR
  - echo "Error, file not found"
```
````

```

### 4. Add Validation Checklist

Add to skill.md or a new `references/validation-checklist.md`:

**Before Using Generated Taskfile**:
- [ ] Run `task --list` to verify syntax
- [ ] Check all echo statements for colons
- [ ] Verify all variables are properly quoted with `"{{.VAR}}"`
- [ ] Test with `task --dry` to see what would execute
- [ ] Ensure all file paths use forward slashes (even on Windows)

---

## Impact

**Severity**: Medium
- Prevents Taskfile from loading at all
- Error messages are clear but require YAML knowledge to debug
- Easy to fix once identified

**Frequency**:
- Common in generated Taskfiles with user-facing messages
- Likely to affect echo statements, error messages, help text
- May occur in any task with informational output

**Prevention**:
- Template review and update
- Documentation of best practices
- Validation checklist

---

## Files to Update in Taskfile Skill

1. `references/common-yaml-pitfalls.md` (NEW)
2. `references/taskfile-comprehensive-guide.md` (UPDATE - Troubleshooting section)
3. `skill.md` (UPDATE - add warning about colons)
4. `assets/templates/*.yml` (REVIEW ALL - check for colons in strings)

---

## Additional Notes

- The error was caught immediately by running `task --list`
- Quick iteration and fix (minutes, not hours)
- No impact on functionality once fixed
- Good learning opportunity for YAML best practices
```

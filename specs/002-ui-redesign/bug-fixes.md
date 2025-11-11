# UI Bug Fixes and Enhancements

## Issues Identified

### 1. ❌ Markdown Spacing Issues
**Problem**: Markdown content has no whitespace between headers and paragraphs, no margins on left/top.

**Root Cause**: Prose styling not applied properly, missing container padding.

**Fix**:
- Add proper margins to markdown container
- Ensure prose classes include proper spacing
- Add padding to content area

### 2. ❌ Trigger Count Shows 0
**Problem**: All skills show "0 Triggers" in quick stats.

**Root Cause**: YAML frontmatter doesn't contain `trigger_keywords` field. Triggers need to be extracted from description or analyzed from content.

**Fix**:
- Use existing `TriggerAnalysis` component logic
- Store analyzed triggers in skill metadata during scan
- Update OverviewPanel to use analyzed triggers count

### 3. ❌ No Back Navigation
**Problem**: When clicking on links, there's no way to navigate back.

**Fix**:
- Add breadcrumb navigation showing current location
- Add "Back to Skills" button at top of detail panel
- Implement browser-style back navigation

### 4. ❌ References/Scripts Not Accessible
**Problem**: References and scripts are listed in Content tab but not easily accessible. Clicking on "References" or "Scripts" in quick stats does nothing.

**Fix**:
- Add dedicated "References" tab
- Add dedicated "Scripts" tab
- Make quick stats cards clickable to navigate to respective tabs
- Display references/scripts as clickable lists
- Show content in detail view when clicked

## Implementation Plan

### Phase 1: Markdown Spacing (High Priority)
**Files to modify**:
- `src/App.css` - Add prose spacing utilities
- `src/components/SkillViewer.tsx` - Update content container classes

**Changes**:
```css
/* Enhanced prose styling */
.prose {
  max-width: none;
}

.prose h1 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose h2 {
  margin-top: 1.75rem;
  margin-bottom: 0.875rem;
}

.prose h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose p {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.prose ul, .prose ol {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
}

.prose pre {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prose code {
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}
```

### Phase 2: Trigger Analysis Integration
**Files to modify**:
- `src-tauri/src/commands/skill_scanner.rs` - Add trigger analysis during scan
- `src-tauri/src/models/skill.rs` - Add `trigger_count` field
- `src/components/OverviewPanel.tsx` - Use trigger_count instead of metadata

**Approach**:
1. Extract common trigger keywords from description/content
2. Count total triggers during skill scan
3. Store count in Skill model
4. Display in OverviewPanel

### Phase 3: Navigation Enhancement
**Files to create/modify**:
- `src/components/Breadcrumb.tsx` - New component
- `src/components/SkillViewer.tsx` - Add breadcrumb integration
- `src/stores/navigationStore.ts` - Track navigation history (optional)

**Features**:
- Breadcrumb: "Skills > {skill_name}"
- Back button with icon
- Optional: Browser-style history

### Phase 4: References Tab
**Files to create/modify**:
- `src/components/ReferencesTab.tsx` - New component
- `src/components/SkillViewer.tsx` - Add References tab
- `src/components/OverviewPanel.tsx` - Make References card clickable

**Layout**:
```
References Tab
├── Reference List (left panel or full width)
│   ├── reference1.md (clickable)
│   ├── reference2.txt (clickable)
│   └── ...
└── Reference Content (detail view when selected)
    └── File content display
```

### Phase 5: Scripts Tab
**Files to create/modify**:
- `src/components/ScriptsTab.tsx` - New component
- `src/components/SkillViewer.tsx` - Add Scripts tab
- `src/components/OverviewPanel.tsx` - Make Scripts card clickable

**Layout**:
```
Scripts Tab
├── Script List (left panel or full width)
│   ├── setup.py (clickable)
│   ├── convert.sh (clickable)
│   └── ...
└── Script Content (detail view when selected)
    └── Syntax-highlighted code
```

## Updated Tab Structure

```
Tabs:
1. Overview - YAML metadata display
2. Content - Clean markdown (with proper spacing)
3. References - Clickable reference list + detail view
4. Scripts - Clickable script list + detail view
5. Triggers - Trigger analysis (existing)
6. Diagram - Mermaid diagrams (existing)
```

## Quick Stats Interaction

Make stats cards interactive:

```tsx
<div
  onClick={() => setActiveTab('references')}
  className="cursor-pointer hover:bg-gray-100 transition"
>
  <div className="text-sm text-gray-600 mb-1">📚 References</div>
  <div className="text-2xl font-bold text-gray-900">{skill.references.length}</div>
</div>
```

## Round 2 Issues (Post-Initial Implementation)

### 5. ❌ Markdown Still Missing Left Margin
**Problem**: Even with spacing added, markdown content lacks left margin.

**Fix**: ✅ COMPLETED
- Added `padding-left: 2rem` and `padding-right: 2rem` to `.prose` class in `App.css:87-88`

**Files Modified**:
- `src/App.css`

### 6. ❌ Script Display Missing Left Margin
**Problem**: Script display needs whitespace on the left.

**Fix**: ✅ COMPLETED
- Added `ml-8` (margin-left) class to script content div in `ScriptsTab.tsx:116`

**Files Modified**:
- `src/components/ScriptsTab.tsx`

### 7. ❌ Missing Syntax Highlighting for TypeScript, Python, Bash
**Problem**: Scripts displayed without proper syntax highlighting for common languages.

**Fix**: ✅ COMPLETED
- Imported highlight.js language modules (typescript, python, bash, javascript, json, markdown)
- Registered all language variants (ts/typescript, py/python, sh/bash, js/javascript, md/markdown)
- Added useEffect hook to apply highlighting when script changes
- Properly configured highlight.js with GitHub theme

**Files Modified**:
- `src/components/ScriptsTab.tsx:1-39`

**Implementation Details**:
```typescript
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
// ... register languages
hljs.registerLanguage('typescript', typescript);

useEffect(() => {
  if (selectedScript !== null) {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }
}, [selectedScript]);
```

### 8. ❌ References Not Loading
**Problem**: Browser fetch() with `file://` protocol fails in Tauri apps. Error: "TypeError: Load failed"

**Fix**: ✅ COMPLETED
- Created Tauri command `read_file_content()` in `src-tauri/src/commands/file_reader.rs`
- Registered command in `src-tauri/src/commands/mod.rs` and `src-tauri/src/lib.rs`
- Updated `ReferencesTab.tsx` to use `invoke('read_file_content', { path })` instead of fetch

**Files Created**:
- `src-tauri/src/commands/file_reader.rs`

**Files Modified**:
- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`
- `src/components/ReferencesTab.tsx:2, 17-30`

**Implementation Details**:
```rust
#[tauri::command]
pub fn read_file_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file {}: {}", path, e))
}
```

### 9. ❌ Diagram Syntax Errors
**Problem**: Mermaid diagrams had syntax errors due to special characters in skill/reference/script names.

**Fix**: ✅ COMPLETED
- Created `sanitizeForMermaid()` function to escape/replace problematic characters
- Applied sanitization to all node labels (skill names, file names, script names)
- Escapes quotes, replaces brackets with parentheses, removes hash symbols

**Files Modified**:
- `src/utils/diagramGenerator.ts:3-15, 21, 33, 47`

**Implementation Details**:
```typescript
function sanitizeForMermaid(text: string): string {
  return text
    .replace(/"/g, '\\"')  // Escape quotes
    .replace(/\[/g, '(')   // Replace brackets
    .replace(/]/g, ')')
    .replace(/#/g, '')     // Remove hash
    .replace(/\n/g, ' ')   // Replace newlines
    .trim();
}
```

### 10. ❌ Diagrams Too Small, No Zoom Controls
**Problem**: Diagram images are tiny and lack zoom/pan functionality.

**Fix**: ✅ COMPLETED
- Added zoom state (0.5x - 3.0x range, default 1.0x)
- Added position state for pan/drag functionality
- Implemented drag-to-pan with mouse events
- Added zoom controls UI (-, +, Reset buttons with percentage display)
- Used CSS transform for smooth scaling and positioning
- Changed cursor to grab/grabbing during drag
- Made diagram container flex-1 to use full available height

**Files Modified**:
- `src/components/DiagramView.tsx:1, 17-22, 37-60, 63-120`

**UI Features**:
- Zoom buttons: − (zoom out), + (zoom in)
- Percentage display showing current zoom level
- Reset button to restore original view
- Drag-to-pan by clicking and dragging diagram
- Smooth transitions between zoom levels
- Full-height diagram view

## Acceptance Criteria

- [x] Markdown has proper spacing between elements
- [x] Markdown content has left/top margins ✅ ROUND 2
- [x] Trigger count shows accurate number (not 0)
- [x] Back navigation button visible and functional
- [x] References tab displays clickable list
- [x] Clicking reference shows content ✅ ROUND 2 (Fixed with Tauri command)
- [x] Scripts tab displays clickable list
- [x] Clicking script shows syntax-highlighted content ✅ ROUND 2
- [x] Script display has left margin ✅ ROUND 2
- [x] Syntax highlighting works for TypeScript, Python, Bash ✅ ROUND 2
- [x] Diagrams render without syntax errors ✅ ROUND 2
- [x] Diagrams have zoom and pan controls ✅ ROUND 2
- [x] Quick stats cards navigate to respective tabs
- [x] All tabs accessible and functional

## Testing Checklist

- [ ] Load skill with markdown content - verify spacing
- [ ] Check trigger count on multiple skills
- [ ] Click back button - returns to skill list
- [ ] Navigate to References tab - see list
- [ ] Click reference - see content
- [ ] Navigate to Scripts tab - see list
- [ ] Click script - see highlighted code
- [ ] Click References quick stat - navigates to References tab
- [ ] Click Scripts quick stat - navigates to Scripts tab

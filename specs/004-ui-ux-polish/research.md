# Research: UI/UX Polish and Fixes

**Feature Branch**: `004-ui-ux-polish`
**Research Date**: 2025-01-12
**Status**: Complete
**Plan Reference**: [plan.md](./plan.md)

## Executive Summary

This research document provides technical decisions and implementation guidance for four critical UI/UX improvements: applying consistent 8px margins throughout the application, restructuring the Overview tab to display information logically, implementing accessible text truncation with tooltips, and fixing the Python syntax highlighting bug that only works on first visit to the Scripts tab.

All decisions align with constitutional principles (native desktop experience, developer-first design, cross-platform consistency) and WCAG 2.1 AA accessibility standards.

---

## Research Area 1: TailwindCSS Margin Strategy

### Question
What TailwindCSS utility classes should be used for 8px margins? Document the spacing scale and whether custom values are needed.

### Decision
**Use TailwindCSS default spacing scale with `p-2` and `m-2` utilities for 8px spacing.**

### Rationale

1. **TailwindCSS 4.x Spacing Scale**:
   - TailwindCSS uses a factor-based spacing scale where each unit = 0.25rem
   - With default 16px base font size: `1 unit = 0.25rem = 4px`
   - Therefore: `2 units = 0.5rem = 8px` (exact requirement)

2. **Utility Class Mapping**:
   ```
   p-2   = padding: 0.5rem;      (8px all sides)
   px-2  = padding: 0 0.5rem;    (8px left/right)
   py-2  = padding: 0.5rem 0;    (8px top/bottom)
   pt-2  = padding-top: 0.5rem;  (8px top)
   pb-2  = padding-bottom: 0.5rem; (8px bottom)
   pl-2  = padding-left: 0.5rem;   (8px left)
   pr-2  = padding-right: 0.5rem;  (8px right)

   m-2   = margin: 0.5rem;       (8px all sides)
   mx-2  = margin: 0 0.5rem;     (8px left/right)
   my-2  = margin: 0.5rem 0;     (8px top/bottom)
   gap-2 = gap: 0.5rem;          (8px flex/grid gap)
   space-y-2 = > * + * { margin-top: 0.5rem; } (8px vertical stack)
   ```

3. **Current Codebase Usage**:
   - Existing components use inconsistent spacing: `p-3` (12px), `p-4` (16px), `p-6` (24px)
   - Example from `/src/components/OverviewPanel.tsx`:
     - Line 19: `p-6` (24px) - too large for tight content areas
     - Line 21: `mb-6` (24px) - excessive spacing between sections
     - Line 35: `gap-4` (16px) - larger than needed for stat cards
   - Example from `/src/components/ScriptsTab.tsx`:
     - Line 86: `p-4` (16px) - can be reduced to `p-2` for consistent 8px
     - Line 91: `p-2` (8px) - already correct!

4. **No Custom Configuration Needed**:
   - Current `/tailwind.config.js` extends theme but doesn't modify spacing scale
   - Default scale provides all necessary values (0.5rem = 8px available out-of-box)
   - Custom spacing would violate principle of using standard TailwindCSS conventions

### Alternatives Considered

1. **Custom Spacing Scale** (REJECTED)
   - Add `'2': '8px'` to theme.extend.spacing in tailwind.config.js
   - **Why rejected**: Unnecessary complexity. Default scale already provides 0.5rem (8px) via `*-2` utilities. Custom values would deviate from TailwindCSS conventions and confuse future maintainers.

2. **Arbitrary Values** (`p-[8px]`) (REJECTED)
   - TailwindCSS 3+ supports arbitrary values like `p-[8px]`
   - **Why rejected**: Violates TailwindCSS best practices. Arbitrary values bypass design system constraints and make class names harder to read. Should only be used for truly one-off values, not standard spacing.

3. **CSS Variables** (REJECTED)
   - Define `--spacing-base: 8px` in CSS and use with arbitrary values
   - **Why rejected**: Over-engineering. TailwindCSS already provides a proven spacing scale. Custom CSS variables would duplicate functionality and break TailwindCSS purging/optimization.

4. **Use `p-3` (12px) as "close enough"** (REJECTED)
   - Accept 12px as minimum spacing instead of exact 8px
   - **Why rejected**: Spec explicitly requires 8px minimum. 12px would over-space compact UI elements like skill list items and stat cards, reducing information density (critical for developer tool).

### Implementation Notes

#### Padding vs Margin Guidelines

1. **Use Padding (`p-*`) for**:
   - Internal spacing within components (e.g., button text to button border)
   - Container spacing (e.g., card content to card edge)
   - Text area spacing (e.g., paragraph to container border)
   - **Example**: OverviewPanel stat cards should use `p-2` instead of current `p-4`

2. **Use Margin (`m-*`) for**:
   - Spacing between sibling elements
   - Component-level separation (e.g., sections in a page)
   - **Example**: Spacing between skill list items should use `mb-2` or `space-y-2`

3. **Use Gap (`gap-*`) for**:
   - Flex container spacing (`flex gap-2`)
   - Grid container spacing (`grid gap-2`)
   - **Example**: OverviewPanel stat grid should use `gap-2` instead of `gap-4`

#### Specific Components to Update

1. **OverviewPanel.tsx** (lines 19-99):
   ```typescript
   // Current: p-6 (24px)
   // Change to: p-2 (8px) for compact info density
   <div className="bg-white border-b border-gray-200 p-2">

   // Current: mb-6 (24px)
   // Change to: mb-2 (8px) between sections
   <div className="flex items-start justify-between mb-2">

   // Current: gap-4 (16px)
   // Change to: gap-2 (8px) for stat cards
   <div className="grid grid-cols-4 gap-2 mb-2">

   // Current: p-4 (16px) on stat cards
   // Change to: p-2 (8px) for tighter cards
   <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
   ```

2. **SkillList.tsx** (scan for `p-*` and `m-*`):
   - Ensure skill list items have `p-2` internal padding
   - Use `space-y-2` or `mb-2` between list items

3. **ScriptsTab.tsx** (lines 86, 91):
   - Line 86: Change `p-4` to `p-2` for header
   - Line 91: Keep `p-2` (already correct)

4. **ReferencesTab.tsx** (lines 60-96):
   - Similar to ScriptsTab, ensure consistent `p-2` padding

5. **DescriptionSection.tsx** (lines 17-20):
   - Line 17: Current `px-6 py-4` (24px horizontal, 16px vertical)
   - Change to: `p-2` (8px all sides) for consistency
   - Line 18: Keep `mb-2` for label spacing

#### Testing Strategy

1. **Visual Regression Tests** (Playwright):
   - Take screenshots of all tabs before/after changes
   - Measure actual pixel distances from text to borders using browser DevTools
   - Assert minimum 8px spacing in automated tests

2. **Manual Testing Checklist**:
   - [ ] Skill list items have 8px padding from left/right edges
   - [ ] Overview stat cards have 8px internal padding
   - [ ] Description section has 8px spacing from borders
   - [ ] Tab content areas have 8px spacing from container edges
   - [ ] Divider lines have 8px spacing from adjacent text

3. **Cross-Platform Validation**:
   - Test on macOS (primary development platform)
   - Test on Linux (via Docker or VM)
   - Test on Windows (via Tauri build)
   - Verify pixel-perfect spacing consistency across platforms

---

## Research Area 2: Syntax Highlighting Lifecycle

### Question
Why does highlight.js fail after first render in React? Research proper React integration patterns and useEffect dependencies.

### Rationale

1. **Root Cause: highlight.js State Mutation**:
   - `highlight.js` uses `highlightElement()` which mutates DOM by adding class names and span wrappers
   - React expects to own the DOM and re-renders can overwrite highlight.js modifications
   - When React re-renders the `<code>` element, it resets to original (unhighlighted) HTML
   - Subsequent calls to `highlightElement()` on already-highlighted code are ignored (highlight.js detects `hljs` class and skips)

2. **Current Bug in ScriptsTab.tsx** (lines 44-51):
   ```typescript
   // BUG: useEffect runs on every selectedScript change
   useEffect(() => {
     if (selectedScript !== null) {
       document.querySelectorAll('pre code').forEach((block) => {
         hljs.highlightElement(block as HTMLElement);
       });
     }
   }, [selectedScript]); // Re-runs when script changes
   ```
   - **Problem 1**: `querySelectorAll('pre code')` selects ALL code blocks (not scoped to current script)
   - **Problem 2**: highlight.js modifies DOM, but React may re-render and reset it
   - **Problem 3**: No cleanup function to remove highlight.js modifications before re-render

3. **React Lifecycle Conflict**:
   - **First visit**: highlight.js highlights code successfully
   - **Navigate away**: React unmounts component (but no cleanup happens)
   - **Return to tab**: React re-renders fresh `<code>` element
   - **Highlighting fails**: Either React overwrites it, or highlight.js detects already-highlighted element

4. **Recommended Solution: rehype-highlight** (Already Installed!):
   - Project uses `rehype-highlight@7.0.2` for ReactMarkdown (see `package.json` line 25)
   - `rehype-highlight` processes code at **build time** (unified/rehype pipeline), not runtime
   - Works by transforming markdown AST before React renders it
   - **Benefits**:
     - No runtime highlighting (better performance)
     - No React lifecycle conflicts (highlighting happens before React sees the DOM)
     - Consistent results (deterministic transformation)
     - Already used in `ReferencesTab.tsx` (line 6) and `SkillViewer.tsx` (line 4)

### Decision
**Replace direct `highlight.js` calls in ScriptsTab.tsx with rehype-highlight approach (already working in other tabs).**

### Implementation Notes

#### Current Working Implementation (ReferencesTab.tsx, lines 131-137)

```typescript
<div className="prose prose-slate max-w-none">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight]} // Syntax highlighting via rehype
  >
    {refContent}
  </ReactMarkdown>
</div>
```

**Why this works**:
- `rehype-highlight` transforms markdown AST before React render
- No DOM mutation after React renders
- Highlighting survives React re-renders

#### Proposed Fix for ScriptsTab.tsx

**Option 1: Use ReactMarkdown for Scripts (RECOMMENDED)**
```typescript
// Replace raw <code> element with ReactMarkdown
<div className="prose prose-slate max-w-none">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight]}
  >
    {`\`\`\`${script.language}\n${script.content}\n\`\`\``}
  </ReactMarkdown>
</div>
```

**Benefits**:
- Consistent with existing tabs (ReferencesTab, Content tab)
- No manual highlight.js calls needed
- Automatic language detection from markdown code fence
- Works on every render (no lifecycle bugs)

**Drawbacks**:
- Minor performance overhead (markdown parsing)
- Less control over code block rendering

**Option 2: Custom Hook with Proper Cleanup**
```typescript
// Extract to hooks/useSyntaxHighlight.ts
import { useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/core';

export const useSyntaxHighlight = (language: string, code: string) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && code) {
      // Clear previous highlighting
      codeRef.current.removeAttribute('data-highlighted');
      codeRef.current.classList.remove('hljs');

      // Apply new highlighting
      codeRef.current.textContent = code; // Reset text content
      hljs.highlightElement(codeRef.current);
    }
  }, [language, code]); // Re-run when language or code changes

  return codeRef;
};

// Usage in ScriptsTab.tsx
const codeRef = useSyntaxHighlight(script.language, script.content);

return (
  <pre className="p-4 bg-gray-50 overflow-x-auto text-sm">
    <code ref={codeRef} className={`language-${script.language}`} />
  </pre>
);
```

**Benefits**:
- Full control over rendering
- No markdown parsing overhead
- Can use refs to avoid querySelectorAll

**Drawbacks**:
- More complex than Option 1
- Still vulnerable to React re-render timing issues
- Requires manual cleanup logic

#### Recommended Approach: Option 1 (ReactMarkdown)

**Rationale**:
1. Already works perfectly in other tabs (proven solution)
2. Simpler implementation (fewer lines of code)
3. No lifecycle management complexity
4. Consistent with existing codebase patterns
5. Performance overhead negligible for script viewing (not a hot path)

#### Testing Strategy

1. **Integration Test** (`tests/integration/syntax-highlighting.test.tsx`):
   ```typescript
   test('syntax highlighting persists across tab navigation', async () => {
     // 1. Select skill with Python scripts
     // 2. Navigate to Scripts tab
     // 3. Verify highlighted code (check for .hljs class)
     // 4. Navigate to Overview tab
     // 5. Navigate back to Scripts tab
     // 6. Verify highlighted code still present
     // 7. Repeat 20 times (test persistence)
   });
   ```

2. **E2E Test** (`tests/e2e/syntax-highlighting.spec.ts`):
   ```typescript
   test('Python syntax highlighting works on all visits', async ({ page }) => {
     for (let i = 0; i < 20; i++) {
       await page.click('[data-tab="scripts"]');
       await expect(page.locator('pre code.hljs')).toBeVisible();
       await page.click('[data-tab="overview"]');
     }
   });
   ```

3. **Manual Testing**:
   - [ ] First visit to Scripts tab: highlighting works
   - [ ] Navigate away and back: highlighting still works
   - [ ] Switch between different skills: highlighting works for each
   - [ ] Extended session (30+ tab switches): no degradation

#### Dependencies

- `rehype-highlight@7.0.2` (already installed, line 25 in package.json)
- `lowlight@3.3.0` (transitive dependency via rehype-highlight)
- `highlight.js@11.11.1` (already installed, line 20)

---

## Research Area 3: Text Truncation Best Practices

### Question
What's the most accessible CSS approach for text truncation with tooltips? Must be WCAG 2.1 AA compliant.

### Decision
**Use CSS `text-overflow: ellipsis` with native browser tooltips (title attribute) for simple cases, and consider ARIA-based tooltips for critical information.**

### Rationale

1. **CSS Text Truncation (Single-Line)**:
   ```css
   .truncate {
     overflow: hidden;
     text-overflow: ellipsis;
     white-space: nowrap;
   }
   ```
   - TailwindCSS provides `.truncate` utility class (equivalent to above)
   - Works for single-line truncation only
   - Requires fixed or max-width container

2. **WCAG 2.1 AA Compliance Considerations**:

   **Success Criterion 1.4.4 (Resize Text)**:
   - Truncation is acceptable if full content is available on focus or after user activation
   - Must provide indication that full text can be accessed
   - ✅ **Passes** with tooltip implementation

   **Success Criterion 1.4.12 (Text Spacing)**:
   - Ellipses resulting from text-overflow do not fail Text Spacing requirements
   - Content is still available (screen readers read full text)
   - ✅ **Passes** naturally with CSS truncation

   **Success Criterion 1.3.1 (Info and Relationships)**:
   - Truncated text might fail if visual display doesn't match screen reader output
   - Sighted screen reader users may be confused if spoken text differs from visible text
   - ⚠️ **Caution**: Ensure tooltips reveal full text on hover/focus

3. **Screen Reader Accessibility**:
   - CSS `text-overflow: ellipsis` only affects visual display
   - Screen readers ignore CSS and read full text content (innerHTML)
   - ✅ **Accessible by default** - no special ARIA attributes needed

4. **Tooltip Implementation Options**:

   **Option A: Native Browser Tooltips (title attribute)**
   ```typescript
   <div className="truncate" title={fullText}>
     {fullText}
   </div>
   ```
   - **Pros**: Zero JavaScript, universally supported, screen reader accessible
   - **Cons**: Not keyboard accessible, not touch-screen accessible, cannot style
   - **WCAG Compliance**: ⚠️ Partial (fails keyboard access requirement)

   **Option B: ARIA-based Tooltips (Radix UI, Headless UI)**
   ```typescript
   <Tooltip.Root>
     <Tooltip.Trigger className="truncate">
       {fullText}
     </Tooltip.Trigger>
     <Tooltip.Content>{fullText}</Tooltip.Content>
   </Tooltip.Root>
   ```
   - **Pros**: Fully accessible (keyboard, focus, screen reader), styleable, dismissible
   - **Cons**: Requires library, more complex implementation, larger bundle size
   - **WCAG Compliance**: ✅ Full compliance when implemented correctly

   **Option C: CSS title attribute + Focus Indicator**
   ```typescript
   <div
     className="truncate focus:overflow-visible focus:whitespace-normal"
     title={fullText}
     tabIndex={0}
   >
     {fullText}
   </div>
   ```
   - **Pros**: No library needed, keyboard accessible (via tabIndex), shows full text on focus
   - **Cons**: Keyboard users must tab through all truncated elements, can break layout
   - **WCAG Compliance**: ✅ Compliant (keyboard accessible, focus reveals full text)

### Decision Breakdown by Use Case

1. **Skill Names in Skill List** (SkillList.tsx):
   - **Use**: Native title attribute (Option A)
   - **Rationale**: Skill names are clickable links (already keyboard accessible), title provides quick preview, full name visible in Overview tab after click
   - **Implementation**:
     ```typescript
     <div className="text-sm font-medium text-gray-900 truncate" title={skill.name}>
       {skill.name}
     </div>
     ```

2. **Trigger Keywords** (OverviewPanel.tsx, lines 85-92):
   - **Use**: Native title attribute (Option A)
   - **Rationale**: Trigger tags are informational (not critical navigation), full list available in Triggers tab
   - **Implementation**:
     ```typescript
     <span className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 truncate" title={keyword}>
       {keyword}
     </span>
     ```

3. **Reference/Script File Paths** (ReferencesTab.tsx, ScriptsTab.tsx):
   - **Use**: Native title attribute (Option A) with Option C fallback
   - **Rationale**: File paths are shown in detail view after selection, title provides quick preview
   - **Implementation**:
     ```typescript
     <div className="text-xs text-gray-500 mt-1 truncate" title={ref.path}>
       {ref.path}
     </div>
     ```

4. **Critical Action Buttons** (if needed):
   - **Use**: Avoid truncation entirely (use responsive text sizing or icon + text)
   - **Rationale**: Buttons should always show full text (bad UX to truncate action labels)

### Alternatives Considered

1. **Multi-Line Truncation (line-clamp)** (DEFERRED)
   ```css
   .line-clamp-2 {
     display: -webkit-box;
     -webkit-line-clamp: 2;
     -webkit-box-orient: vertical;
     overflow: hidden;
   }
   ```
   - TailwindCSS provides `line-clamp-{n}` utilities
   - **Why deferred**: Current spec only requires single-line truncation. Multi-line truncation may be needed for descriptions in future features.

2. **JavaScript-based Truncation** (REJECTED)
   ```typescript
   const truncateText = (text: string, maxLength: number) => {
     return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
   };
   ```
   - **Why rejected**: Breaks screen reader accessibility (screen reader reads truncated text, not full text). CSS truncation preserves full text in DOM.

3. **Third-Party Tooltip Library (Radix UI, Headless UI)** (DEFERRED)
   - **Why deferred**: Adds dependency and complexity. Native tooltips sufficient for v0.2.0. Can upgrade to ARIA tooltips in future if user feedback indicates keyboard accessibility is critical.

### Implementation Notes

#### TailwindCSS Utility Classes

```typescript
// Single-line truncation
className="truncate"  // overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

// Multi-line truncation (future use)
className="line-clamp-2"  // Truncate after 2 lines
className="line-clamp-3"  // Truncate after 3 lines

// Container requirements for truncation
className="min-w-0"  // Ensure flex/grid children can shrink below content width
className="max-w-xs"  // Set maximum width (adjust as needed: xs, sm, md, lg, xl, 2xl)
```

#### Common Pitfalls

1. **Flex/Grid Parent Prevents Truncation**:
   ```typescript
   // ❌ WRONG: Flex child won't truncate without min-w-0
   <div className="flex">
     <div className="truncate">{longText}</div>
   </div>

   // ✅ CORRECT: Add min-w-0 to flex child
   <div className="flex">
     <div className="truncate min-w-0">{longText}</div>
   </div>
   ```

2. **Missing Container Width**:
   ```typescript
   // ❌ WRONG: truncate has no effect without constrained width
   <div className="truncate">{longText}</div>

   // ✅ CORRECT: Add max-width or explicit width
   <div className="truncate max-w-xs">{longText}</div>
   ```

3. **Inline Elements Can't Truncate**:
   ```typescript
   // ❌ WRONG: <span> is inline, can't truncate
   <span className="truncate">{longText}</span>

   // ✅ CORRECT: Use block or inline-block
   <span className="truncate inline-block max-w-xs">{longText}</span>
   ```

#### Testing Strategy

1. **Unit Tests** (`tests/unit/textTruncation.test.ts`):
   ```typescript
   test('truncate class applies correct CSS properties', () => {
     const element = render(<div className="truncate">Long text</div>);
     expect(element).toHaveStyle({
       overflow: 'hidden',
       textOverflow: 'ellipsis',
       whiteSpace: 'nowrap'
     });
   });
   ```

2. **E2E Tests** (`tests/e2e/text-overflow.spec.ts`):
   ```typescript
   test('long skill names show tooltip on hover', async ({ page }) => {
     // Create skill with 100-character name
     const longName = 'A'.repeat(100);

     // Hover over truncated skill name
     const skillElement = page.locator(`[title="${longName}"]`);
     await skillElement.hover();

     // Verify tooltip appears (browser native tooltip cannot be tested directly)
     // Instead, verify title attribute is present
     await expect(skillElement).toHaveAttribute('title', longName);
   });
   ```

3. **Accessibility Tests** (`tests/e2e/ui-polish.spec.ts`):
   ```typescript
   test('truncated text is accessible to screen readers', async ({ page }) => {
     // Use @axe-core/playwright for accessibility checks
     const results = await analyzeAccessibility(page);

     // Verify no WCAG violations related to text content
     expect(results.violations.filter(v => v.id === 'label')).toHaveLength(0);
   });
   ```

4. **Manual Testing Checklist**:
   - [ ] Skill names >50 chars truncate with ellipsis
   - [ ] Hovering truncated text shows full text in tooltip
   - [ ] Screen reader reads full text (not truncated version)
   - [ ] Keyboard users can tab to clickable truncated elements
   - [ ] Truncation works at different window sizes
   - [ ] No layout breaks with extremely long text (200+ chars)

---

## Research Area 4: React Component Restructuring

### Question
Review the current OverviewPanel.tsx component and document how to safely reorder the information display.

### Decision
**Merge OverviewPanel and DescriptionSection into single Overview tab component with logical information hierarchy: name → location → description → stats grid → triggers.**

### Rationale

1. **Current Implementation Analysis**:

   **SkillViewer.tsx** (lines 78-82):
   ```typescript
   {/* Overview Panel (top banner) */}
   <OverviewPanel skill={selectedSkill} onNavigateToTab={handleNavigateToTab} />

   {/* Description Section */}
   <DescriptionSection skill={selectedSkill} />
   ```
   - Overview and Description are **separate components** rendered sequentially
   - Both have white backgrounds with border-bottom (visual separation)

   **OverviewPanel.tsx** (lines 19-101):
   - Line 19-32: Name + Location badge
   - Line 35-76: Stats grid (4 cards: References, Scripts, Triggers, Lines)
   - Line 79-99: Trigger preview (up to 5 triggers + "more" indicator)

   **DescriptionSection.tsx** (lines 17-20):
   - Line 17: White background container with padding
   - Line 18: "📝 Description" heading
   - Line 19: Description text from `skill.metadata?.description || skill.description`

2. **Problem: Illogical Information Order**:
   - Current order: **Name → Location → Stats Grid → Triggers → Description**
   - User mental model: **Name → Description (what it does) → Metadata (version, location) → Stats (counts) → Triggers (usage)**
   - Description should come **immediately after name** (most important context)

3. **Problem: Duplicate Descriptions**:
   - Spec mentions "remove duplicate descriptions" (FR-003)
   - Current code shows description once in DescriptionSection
   - **Hypothesis**: Duplicate may occur in Overview tab (line 111-137 in SkillViewer.tsx) which displays YAML frontmatter
   - Metadata display (lines 115-127) could show `description` field again if it exists in YAML
   - **Solution**: Filter out `description` from metadata display in Overview tab

4. **Proposed Information Hierarchy**:
   ```
   1. Skill Name (h1, bold, prominent)
   2. Location Badge (claude/opencode indicator)
   3. Description (if available) - expanded from current DescriptionSection
   4. Version (if available in metadata) - NEW POSITION
   5. Triggers Preview (top 5 triggers as tags)
   6. Stats Grid (References, Scripts, Triggers count, Lines)
   7. Remaining Metadata (YAML frontmatter fields, excluding description/version/name)
   ```

### Implementation Strategy

#### Step 1: Merge OverviewPanel and DescriptionSection

**Rationale**: Both components are part of the Overview tab conceptual space. Merging simplifies state management and allows flexible reordering without cross-component dependencies.

**New Component Structure** (`src/components/OverviewTab.tsx`):
```typescript
export const OverviewTab: React.FC<OverviewTabProps> = ({ skill, onNavigateToTab }) => {
  return (
    <div className="p-2 max-w-4xl mx-auto"> {/* 8px padding, centered content */}
      {/* 1. Name + Location */}
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>
        <LocationBadge location={skill.location} />
      </div>

      {/* 2. Description (if available) */}
      {description && (
        <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-base text-gray-800 leading-relaxed">{description}</p>
        </div>
      )}

      {/* 3. Version (if available) */}
      {metadata?.version && (
        <div className="mb-2">
          <span className="text-sm text-gray-600">Version: </span>
          <span className="text-sm font-medium text-gray-900">{metadata.version}</span>
        </div>
      )}

      {/* 4. Trigger Preview */}
      {triggerKeywords.length > 0 && (
        <TriggerPreview
          keywords={triggerKeywords}
          total={triggerPatterns.length}
          onNavigate={() => onNavigateToTab?.('triggers')}
        />
      )}

      {/* 5. Stats Grid */}
      <StatsGrid
        skill={skill}
        triggerCount={triggerPatterns.length}
        onNavigateToTab={onNavigateToTab}
      />

      {/* 6. Remaining Metadata (exclude name, description, version) */}
      {filteredMetadata && (
        <MetadataDisplay metadata={filteredMetadata} />
      )}
    </div>
  );
};
```

#### Step 2: Extract Sub-Components

**Benefits of Sub-Components**:
- Improved testability (test each section independently)
- Reusability (LocationBadge, StatsGrid can be used elsewhere)
- Separation of concerns (each component has single responsibility)

**New Files**:
1. `src/components/Overview/LocationBadge.tsx`:
   ```typescript
   interface LocationBadgeProps {
     location: string;
   }

   export const LocationBadge: React.FC<LocationBadgeProps> = ({ location }) => {
     const isClaudeLocation = location === 'claude';
     return (
       <span className={`text-sm px-2 py-1 rounded font-medium ${
         isClaudeLocation
           ? 'bg-purple-100 text-purple-700'
           : 'bg-green-100 text-green-700'
       }`}>
         📍 {location}
       </span>
     );
   };
   ```

2. `src/components/Overview/StatsGrid.tsx`:
   ```typescript
   interface StatsGridProps {
     skill: Skill;
     triggerCount: number;
     onNavigateToTab?: (tab: string) => void;
   }

   export const StatsGrid: React.FC<StatsGridProps> = ({ skill, triggerCount, onNavigateToTab }) => {
     const lineCount = skill.content.split('\n').length;

     const stats = [
       { label: 'References', icon: '📚', value: skill.references.length, tab: 'references' },
       { label: 'Scripts', icon: '🔧', value: skill.scripts.length, tab: 'scripts' },
       { label: 'Triggers', icon: '🎯', value: triggerCount, tab: 'triggers' },
       { label: 'Lines', icon: '📏', value: lineCount.toLocaleString(), tab: null },
     ];

     return (
       <div className="grid grid-cols-4 gap-2 mb-2">
         {stats.map((stat) => (
           <StatCard
             key={stat.label}
             {...stat}
             onClick={() => stat.tab && onNavigateToTab?.(stat.tab)}
           />
         ))}
       </div>
     );
   };
   ```

3. `src/components/Overview/TriggerPreview.tsx`:
   ```typescript
   interface TriggerPreviewProps {
     keywords: string[];
     total: number;
     onNavigate: () => void;
   }

   export const TriggerPreview: React.FC<TriggerPreviewProps> = ({ keywords, total, onNavigate }) => {
     return (
       <div className="mb-2">
         <div className="text-sm font-medium text-gray-700 mb-2">
           🎯 Common Triggers
         </div>
         <div className="flex flex-wrap gap-2">
           {keywords.map((keyword, idx) => (
             <span
               key={idx}
               className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 truncate max-w-xs"
               title={keyword} // Tooltip for long keywords
             >
               {keyword}
             </span>
           ))}
           {total > keywords.length && (
             <button
               onClick={onNavigate}
               className="text-sm px-2 py-1 text-blue-600 hover:text-blue-800 underline"
             >
               +{total - keywords.length} more
             </button>
           )}
         </div>
       </div>
     );
   };
   ```

4. `src/components/Overview/MetadataDisplay.tsx`:
   ```typescript
   interface MetadataDisplayProps {
     metadata: Record<string, any>;
   }

   export const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ metadata }) => {
     // Filter out fields already displayed in main overview
     const filteredFields = Object.entries(metadata).filter(
       ([key]) => !['name', 'description', 'version'].includes(key.toLowerCase())
     );

     if (filteredFields.length === 0) return null;

     return (
       <div className="space-y-2 mt-4">
         <h2 className="text-lg font-bold text-gray-900 mb-2">Additional Metadata</h2>
         {filteredFields.map(([key, value]) => (
           <div key={key} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
             <h3 className="text-sm font-semibold text-gray-700 mb-1 uppercase">{key}</h3>
             <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
               {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
             </pre>
           </div>
         ))}
       </div>
     );
   };
   ```

#### Step 3: Update SkillViewer.tsx

**Changes** (lines 111-137):
```typescript
// BEFORE: Separate Overview tab with YAML frontmatter display
{activeTab === 'overview' && (
  <div className="p-6">
    <div className="max-w-4xl mx-auto">
      {selectedSkill.metadata && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">YAML Frontmatter</h2>
          {Object.entries(selectedSkill.metadata).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {/* ... */}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

// AFTER: Use new OverviewTab component
{activeTab === 'overview' && (
  <OverviewTab skill={selectedSkill} onNavigateToTab={handleNavigateToTab} />
)}
```

**Remove** (lines 78-82):
```typescript
// DELETE: OverviewPanel and DescriptionSection (now merged into OverviewTab)
{/* Overview Panel (top banner) */}
<OverviewPanel skill={selectedSkill} onNavigateToTab={handleNavigateToTab} />

{/* Description Section */}
<DescriptionSection skill={selectedSkill} />
```

### Alternatives Considered

1. **Keep OverviewPanel as Top Banner** (REJECTED)
   - Display name/location/stats as persistent banner above tabs
   - Show description only in Overview tab
   - **Why rejected**: Creates visual hierarchy confusion (banner suggests persistent navigation, not tab content). Users expect tab content to be self-contained.

2. **Add Version Field to Stats Grid** (REJECTED)
   - Include version as 5th stat card alongside References, Scripts, Triggers, Lines
   - **Why rejected**: Version is metadata, not a count/statistic. Mixing categorical data (version string) with numerical data (counts) breaks cognitive model of stats grid.

3. **Use Accordion for Metadata** (DEFERRED)
   - Collapse YAML frontmatter fields into expandable accordion
   - **Why deferred**: Adds UI complexity without clear user benefit. Most skills have <5 metadata fields. Can implement in future if users report information overload.

4. **Split into Multiple Tabs** (REJECTED)
   - Create separate "Metadata" tab for YAML frontmatter
   - Keep Overview tab minimal (name, description, stats only)
   - **Why rejected**: Adds navigation complexity. Users expect Overview tab to be comprehensive (single place to see all high-level info). Metadata tab would be underutilized.

### Testing Strategy

1. **Unit Tests** (`tests/unit/OverviewTab.test.tsx`):
   ```typescript
   describe('OverviewTab', () => {
     test('displays information in correct order', () => {
       const skill = mockSkillWithAllFields();
       const { container } = render(<OverviewTab skill={skill} />);

       const elements = container.querySelectorAll('h1, h2, h3, p, div[data-testid]');
       expect(elements[0]).toHaveTextContent(skill.name); // Name first
       expect(elements[1]).toHaveTextContent(skill.description); // Description second
       expect(elements[2]).toHaveTextContent(skill.metadata.version); // Version third
     });

     test('does not display description twice', () => {
       const skill = mockSkillWithDescription();
       const { container } = render(<OverviewTab skill={skill} />);

       const descriptionElements = container.querySelectorAll(':contains("Test description")');
       expect(descriptionElements).toHaveLength(1); // Only one instance
     });

     test('handles missing fields gracefully', () => {
       const skill = mockSkillWithoutMetadata();
       const { queryByText } = render(<OverviewTab skill={skill} />);

       expect(queryByText('Version:')).not.toBeInTheDocument();
       expect(queryByText('Additional Metadata')).not.toBeInTheDocument();
     });
   });
   ```

2. **Integration Tests** (`tests/integration/overview-tab.test.tsx`):
   ```typescript
   test('clicking trigger preview navigates to Triggers tab', async () => {
     const mockNavigate = jest.fn();
     const skill = mockSkillWithTriggers(10);

     const { getByText } = render(
       <OverviewTab skill={skill} onNavigateToTab={mockNavigate} />
     );

     await userEvent.click(getByText('+5 more'));
     expect(mockNavigate).toHaveBeenCalledWith('triggers');
   });
   ```

3. **E2E Tests** (`tests/e2e/overview-restructure.spec.ts`):
   ```typescript
   test('Overview tab shows all information in correct order', async ({ page }) => {
     await page.click('[data-skill="example-skill"]');
     await page.click('[data-tab="overview"]');

     // Verify order using CSS selectors
     const sections = await page.locator('.overview-section').all();
     expect(await sections[0].textContent()).toContain('example-skill'); // Name
     expect(await sections[1].textContent()).toContain('Description'); // Description
     expect(await sections[2].textContent()).toContain('Version'); // Version
     expect(await sections[3].textContent()).toContain('Triggers'); // Triggers
     expect(await sections[4].textContent()).toContain('References'); // Stats
   });
   ```

4. **Manual Testing Checklist**:
   - [ ] Name appears at top of Overview tab
   - [ ] Description appears immediately below name (if available)
   - [ ] Version appears after description (if available)
   - [ ] Trigger preview appears before stats grid
   - [ ] Stats grid appears after triggers
   - [ ] YAML metadata appears at bottom (excluding name, description, version)
   - [ ] Description appears exactly once (no duplicates)
   - [ ] Skills without description/version display gracefully
   - [ ] Skills with no metadata show only name + stats

### Migration Path

1. **Phase 1: Create New Components** (no breaking changes)
   - Create `/src/components/Overview/` directory
   - Implement OverviewTab, LocationBadge, StatsGrid, TriggerPreview, MetadataDisplay
   - Add unit tests for each component
   - Keep existing OverviewPanel and DescriptionSection (not removed yet)

2. **Phase 2: Wire Up in SkillViewer** (feature flag)
   - Add feature flag: `USE_NEW_OVERVIEW = true`
   - Conditionally render new OverviewTab vs old OverviewPanel
   - Test both paths in CI
   - Verify no regressions in other tabs

3. **Phase 3: Remove Old Components** (after testing)
   - Delete `/src/components/OverviewPanel.tsx`
   - Delete `/src/components/DescriptionSection.tsx`
   - Remove feature flag
   - Update imports in SkillViewer.tsx

---

## Dependencies and Risks

### Dependencies
- TailwindCSS 4.1.17 (confirmed installed, no changes needed)
- rehype-highlight 7.0.2 (confirmed installed, already used in other tabs)
- React 19.1.0 (stable, no compatibility concerns)

### Risks and Mitigations

1. **Risk: TailwindCSS Purging**
   - **Description**: Changing class names might break purging configuration
   - **Mitigation**: TailwindCSS 4.x uses content-based purging (`content: ["./src/**/*.{js,ts,jsx,tsx}"]`). All changes are in `/src`, so purging will work automatically.
   - **Validation**: Run `npm run build` and verify bundle size doesn't explode

2. **Risk: Cross-Platform Spacing Inconsistencies**
   - **Description**: Different operating systems might render 8px differently
   - **Mitigation**: TailwindCSS uses `rem` units (not `px`), which are relative to root font size. Test on all three platforms (macOS, Linux, Windows).
   - **Validation**: Visual regression tests in CI across platforms

3. **Risk: Breaking Existing Tests**
   - **Description**: Component restructuring will break existing tests
   - **Mitigation**: Follow migration path (Phase 1-3). Add tests for new components before removing old ones.
   - **Validation**: CI must pass before merging

4. **Risk: Performance Regression with ReactMarkdown**
   - **Description**: Using ReactMarkdown for syntax highlighting might be slower than direct highlight.js
   - **Mitigation**: Profile rendering time before/after. Target: <100ms per code block (as per plan.md line 19).
   - **Validation**: Add performance test to measure rendering time

5. **Risk: Accessibility Regression with Tooltips**
   - **Description**: Native title tooltips aren't keyboard accessible
   - **Mitigation**: Use title attribute for non-critical truncation (skill names, paths). Add ARIA tooltips in future if user feedback indicates need.
   - **Validation**: Automated accessibility testing with `@axe-core/playwright`

---

## Next Steps

1. **Complete Phase 0**: Mark research.md as complete
2. **Proceed to Phase 1**: Create `data-model.md` defining component interfaces and state models
3. **Generate Contracts**: Create TypeScript interfaces in `specs/004-ui-ux-polish/contracts/`
4. **Run `/speckit.tasks`**: Generate implementation tasks based on this research
5. **Begin TDD Workflow**: Write tests first, then implement (as per constitutional Principle VII)

---

## Conclusion

This research provides clear technical decisions for all four UI/UX improvements:

1. **TailwindCSS Margins**: Use `*-2` utilities (8px spacing), no custom configuration needed
2. **Syntax Highlighting**: Replace direct highlight.js with rehype-highlight (proven in other tabs)
3. **Text Truncation**: Use CSS `.truncate` with native title tooltips (WCAG 2.1 AA compliant)
4. **Component Restructuring**: Merge OverviewPanel + DescriptionSection into new OverviewTab with logical hierarchy

All decisions align with constitutional principles, maintain cross-platform consistency, and prioritize accessibility. Implementation can proceed to Phase 1 (Design & Contracts).

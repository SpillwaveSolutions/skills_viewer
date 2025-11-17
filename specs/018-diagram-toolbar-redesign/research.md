# Research: Diagram Toolbar Design Patterns

**Feature**: 018-diagram-toolbar-redesign
**Created**: 2025-11-16
**Purpose**: Research TailwindCSS patterns, accessibility best practices, and performance optimizations for toolbar redesign

## Research Question 1: TailwindCSS Button Group Patterns

### Context

Need to create [− | 100% | +] zoom control with no visible separation between elements while maintaining proper borders and hover states.

### Decision

Use **border-collapse pattern** with negative margins and proper z-index stacking.

### Rationale

TailwindCSS doesn't have a built-in button group component, but the border-collapse pattern provides clean integration:

- Each button has border but shares borders with neighbors
- Middle elements use `border-x` to only show left/right borders
- Hover states use `z-10` to ensure hover borders appear above neighbors
- First child gets `rounded-l-md`, last child gets `rounded-r-md`

### Implementation Pattern

```tsx
<div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
  <button
    className="px-3 py-1 hover:bg-gray-100 hover:z-10 border-r border-gray-300"
    onClick={onZoomOut}
    aria-label="Zoom out"
  >
    −
  </button>
  <div className="px-3 py-1 bg-gray-50 border-r border-gray-300">{(zoom * 100).toFixed(0)}%</div>
  <button
    className="px-3 py-1 hover:bg-gray-100 hover:z-10"
    onClick={onZoomIn}
    aria-label="Zoom in"
  >
    +
  </button>
</div>
```

### Alternatives Considered

1. **Separate buttons with gap**: Rejected - doesn't achieve "integrated" look
2. **Custom CSS**: Rejected - violates constraint "TailwindCSS only"
3. **Flexbox with divide utilities**: Rejected - divide-x doesn't work well with hover states

### Sources

- TailwindCSS Documentation: Border utilities
- Headless UI Button Group examples
- Radix UI Toolbar component patterns

---

## Research Question 2: Disabled Button States with Accessibility

### Context

FR-012 requires disabling zoom in/out at maximum/minimum zoom levels with clear visual feedback and proper ARIA attributes.

### Decision

Use **`disabled` attribute + `disabled:` Tailwind modifiers + ARIA attributes**.

### Rationale

Native disabled attribute provides:

- Automatic keyboard navigation skip (disabled buttons not tabbable)
- Screen reader announcement ("button, zoom in, unavailable")
- Clear visual differentiation with opacity and cursor changes
- No additional JavaScript event handling needed

### Implementation Pattern

```tsx
<button
  onClick={onZoomIn}
  disabled={zoom >= MAX_ZOOM}
  className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
  aria-label="Zoom in"
  aria-disabled={zoom >= MAX_ZOOM}
  title={zoom >= MAX_ZOOM ? 'Maximum zoom reached' : 'Zoom in'}
>
  +
</button>
```

### Key Tailwind Utilities

- `disabled:opacity-50` - Visual feedback (50% opacity)
- `disabled:cursor-not-allowed` - Cursor change on hover
- `disabled:hover:bg-transparent` - Prevent hover state when disabled

### ARIA Best Practices

- Use `aria-disabled` in addition to `disabled` for screen readers
- Update `title` attribute based on state for tooltip context
- Ensure `aria-label` is present for screen reader users

### Alternatives Considered

1. **`aria-disabled` only (no native disabled)**: Rejected - requires manual event handling and keyboard navigation management
2. **Visual-only (opacity without disabled)**: Rejected - fails accessibility standards
3. **Remove button from DOM when disabled**: Rejected - causes layout shifts

### Sources

- WCAG 2.1 AA Success Criterion 3.2.4 (Consistent Identification)
- MDN Web Docs: disabled attribute
- TailwindCSS: disabled variant documentation

---

## Research Question 3: Responsive Toolbar Layouts (<800px)

### Context

FR-011 requires responsive layout on viewports <800px width without breaking functionality.

### Decision

Use **responsive utilities with graceful degradation** - hide less critical buttons on narrow viewports.

### Rationale

On <800px viewports, toolbar buttons can overflow. Best approach:

1. Keep critical controls visible (Layout, Zoom, Fit to View)
2. Hide export buttons on narrow screens (use responsive `md:` prefix)
3. Stack to two rows if needed (use `flex-wrap`)
4. Alternative: Overflow menu for hidden buttons (future enhancement)

### Implementation Pattern

```tsx
<div className="flex flex-wrap items-center gap-2">
  {/* Layout - always visible */}
  <select className="px-3 py-1 border rounded-md">...</select>

  {/* Zoom - always visible */}
  <div className="flex border rounded-md">...</div>

  {/* Fit to View - always visible */}
  <button className="px-3 py-1 bg-blue-600 text-white rounded-md">Fit to View</button>

  {/* Export buttons - hidden on small screens */}
  <button className="hidden md:block px-3 py-1 bg-indigo-600 text-white rounded-md">
    Download SVG
  </button>
  <button className="hidden md:block px-3 py-1 bg-gray-600 text-white rounded-md">
    Download Mermaid
  </button>

  {/* Regenerate - always visible (purple accent) */}
  <button className="px-3 py-1 bg-purple-600 text-white rounded-md">🔄 Regenerate</button>
</div>
```

### Breakpoints

- `md:` - ≥768px (medium screens and up)
- Below 768px: Export buttons hidden, core controls remain

### Alternatives Considered

1. **Horizontal scrolling**: Rejected - poor UX for toolbar controls
2. **Hamburger menu**: Rejected - adds complexity, not needed for 5 button groups
3. **Icon-only buttons**: Considered - would save space but requires tooltip library (deferred to future)

### Sources

- TailwindCSS: Responsive Design documentation
- Nielsen Norman Group: Mobile Toolbar Patterns
- Material Design: App bars and toolbars

---

## Research Question 4: Tooltip Implementation for Accessibility

### Context

FR-009 requires tooltips for icon-only buttons (if implemented) to maintain accessibility.

### Decision

Use **native `title` attribute** for initial implementation, with option to upgrade to Radix UI Tooltip later.

### Rationale

For MVP toolbar redesign:

- Native `title` provides basic tooltip on hover
- Zero dependencies, works across all browsers
- Meets WCAG 2.1 AA requirement for "visible label"
- Sufficient for text buttons with `aria-label`

For future icon-only buttons (out of scope for this feature):

- Radix UI Tooltip provides better control (positioning, timing, keyboard activation)
- Headless UI also viable option
- Both integrate well with TailwindCSS

### Implementation Pattern

```tsx
{
  /* Text button with tooltip */
}
<button
  onClick={onDownloadSVG}
  className="px-3 py-1 bg-indigo-600 text-white rounded-md"
  aria-label="Download diagram as SVG"
  title="Download as SVG - vector format for scaling"
>
  Download SVG
</button>;

{
  /* Zoom button with contextual tooltip */
}
<button
  onClick={onZoomIn}
  disabled={zoom >= MAX_ZOOM}
  className="px-3 py-1 hover:bg-gray-100"
  aria-label="Zoom in"
  title={zoom >= MAX_ZOOM ? 'Maximum zoom reached' : 'Zoom in (Ctrl++)'}
>
  +
</button>;
```

### Upgrade Path (Future)

If converting to icon-only buttons:

```tsx
import * as Tooltip from '@radix-ui/react-tooltip';

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger asChild>
      <button aria-label="Download SVG">
        <DownloadIcon />
      </button>
    </Tooltip.Trigger>
    <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-sm">
      Download as SVG
      <Tooltip.Arrow />
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>;
```

### Alternatives Considered

1. **No tooltips**: Rejected - fails accessibility for icon buttons
2. **Radix UI Tooltip (immediate)**: Rejected - adds dependency, not needed for text buttons
3. **Custom CSS tooltip**: Rejected - "TailwindCSS only" constraint
4. **Popover library**: Rejected - overkill for simple tooltips

### Sources

- WCAG 2.1 AA Success Criterion 1.3.1 (Info and Relationships)
- Radix UI Tooltip documentation
- MDN: title attribute accessibility

---

## Research Question 5: Performance Best Practices (Layout Shifts)

### Context

FR-014 requires no layout shifts during rendering, especially during button hover states.

### Decision

Use **explicit sizing with Tailwind utilities + CSS containment hints**.

### Rationale

Layout shifts occur when:

1. Elements change size on hover (e.g., border added/removed)
2. New elements injected during render
3. Fonts loading asynchronously

Prevention strategies:

- Use fixed padding/sizing (px-3 py-1) that doesn't change on hover
- Apply borders to all states (not just hover) using `border border-transparent` + `hover:border-gray-300`
- Use `will-change: transform` for animations (via Tailwind)
- Preload fonts if custom fonts used (N/A - using system fonts)

### Implementation Pattern

**❌ Bad - causes layout shift:**

```tsx
<button className="px-3 py-1 hover:border hover:border-gray-300">
  {/* Border added on hover shifts layout */}
</button>
```

**✅ Good - no layout shift:**

```tsx
<button className="px-3 py-1 border border-transparent hover:border-gray-300">
  {/* Border always present, just color changes */}
</button>
```

**Hover background pattern:**

```tsx
<button className="px-3 py-1 hover:bg-gray-100 transition-colors duration-150">
  {/* Background color transition, no size change */}
</button>
```

### CSS Containment (for complex components)

```tsx
<div className="contain-layout">{/* Tells browser this element's layout is isolated */}</div>
```

### Performance Monitoring

Use React DevTools Profiler to measure:

- Component render time target: <50ms
- Interaction response time target: <100ms

### Alternatives Considered

1. **`will-change` on all buttons**: Rejected - overuse can hurt performance
2. **Fixed width buttons**: Rejected - reduces flexibility for different content lengths
3. **Disable transitions**: Rejected - transitions improve perceived performance

### Sources

- Web.dev: Avoid Layout Shifts
- TailwindCSS: Transition utilities
- React DevTools Profiler documentation
- MDN: CSS Containment

---

## Summary of Research Decisions

| Research Question     | Decision                                            | Key Rationale                                 |
| --------------------- | --------------------------------------------------- | --------------------------------------------- |
| **Button Groups**     | Border-collapse pattern with z-index hover          | Clean integration without custom CSS          |
| **Disabled States**   | Native disabled + ARIA + Tailwind modifiers         | Accessibility + automatic keyboard navigation |
| **Responsive Layout** | Hide export buttons <800px, flex-wrap core controls | Graceful degradation, keep critical controls  |
| **Tooltips**          | Native title attribute (MVP), Radix UI (future)     | Simple, accessible, zero dependencies         |
| **Layout Shifts**     | Explicit sizing + transparent borders + transitions | No size changes on hover, smooth animations   |

## Next Steps

**Phase 1 artifacts to generate:**

1. `contracts/toolbar-props.ts` - TypeScript interfaces using research patterns
2. `quickstart.md` - Testing guide referencing performance monitoring tools
3. Update `CLAUDE.md` - Add TailwindCSS/Vitest/Playwright if not present

**Phase 2 (tasks.md):**

- TDD task sequence using patterns from this research
- Accessibility testing tasks (axe DevTools)
- Performance validation tasks (React DevTools Profiler)

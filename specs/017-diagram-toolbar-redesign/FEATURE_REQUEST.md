# Feature 017: Diagram Toolbar Redesign

**Created**: 2025-11-16
**Priority**: Medium
**Status**: Backlog
**User Request**: "we used to have a toolbar that looked more like this..."

---

## Problem Statement

Current diagram toolbar (from Feature 016) is functional but uses a basic layout with separate buttons. User has shown a reference design with a more polished, integrated toolbar UI.

**Current Toolbar** (Feature 016):

```
[Layout: TD/LR ▼] [− 100% +] [Fit to View] [Download SVG] [Download Mermaid] [🔄 Regenerate]
```

**Desired Toolbar** (from user screenshot):

Looking at the reference image, the desired toolbar appears to have:

- More compact, integrated button groups
- Cleaner visual separation between control sections
- Possibly icon-based buttons with tooltips
- More polished, professional appearance
- Better visual hierarchy

---

## User Story

**As a** user viewing skill diagrams
**I want** a more polished, professional-looking toolbar
**So that** the diagram viewer feels more refined and easier to use

---

## Acceptance Criteria

1. ✅ Toolbar layout matches reference design aesthetic
2. ✅ All existing functionality preserved:
   - Layout selector (TD/LR)
   - Zoom controls (in, out, reset, percentage display)
   - Fit to view
   - Download SVG
   - Download Mermaid source
   - Regenerate diagram
3. ✅ Improved visual design:
   - Button grouping with visual separation
   - Consistent spacing and alignment
   - Icon-based controls where appropriate
   - Tooltips for icon buttons
4. ✅ Responsive layout (works on different window sizes)
5. ✅ Maintains accessibility (keyboard navigation, ARIA labels)

---

## Technical Approach

### Option 1: Button Groups with Separators

```tsx
<div className="flex items-center gap-2">
  {/* Layout group */}
  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
    <select>...</select>
  </div>

  {/* Zoom group */}
  <div className="flex items-center gap-0 border border-gray-300 rounded">
    <button className="px-2 py-1 hover:bg-gray-100">−</button>
    <div className="px-2 py-1 border-x">100%</div>
    <button className="px-2 py-1 hover:bg-gray-100">+</button>
  </div>

  {/* View group */}
  <div className="flex items-center gap-1">
    <button>Fit to View</button>
  </div>

  {/* Actions group */}
  <div className="flex items-center gap-1">
    <button>Download SVG</button>
    <button>Download Mermaid</button>
    <button>🔄 Regenerate</button>
  </div>
</div>
```

### Option 2: Icon-Based Toolbar

Use icons from Heroicons or Lucide React:

- 🔍 Zoom controls
- 📐 Layout
- 💾 Download
- 🔄 Regenerate
- ⊡ Fit to view

---

## Design Assets Needed

From user's reference screenshot:

- Exact button styling (colors, borders, shadows)
- Spacing measurements
- Icon set (if using icons)
- Hover/active states
- Mobile/responsive behavior

**Action Item**: Need to analyze the reference screenshot in detail to extract exact design specifications.

---

## Dependencies

- Feature 016 (current toolbar implementation) ✅ Complete
- Design review/approval from user
- Icon library choice (if using icons)

---

## Out of Scope

- Customizable toolbars (user-defined button order)
- Toolbar position options (top/bottom/side)
- Additional diagram tools beyond current feature set

---

## Estimation

- **Design analysis**: 1 hour (extract specs from screenshot)
- **Implementation**: 2-3 hours
- **Testing**: 1 hour
- **Total**: 4-5 hours

---

## Notes

This is a UI polish feature - functionality already works perfectly (user said "works the best I have seen yet"). This is about making it look more professional and polished.

**Next Steps**:

1. Analyze reference screenshot in detail
2. Create mockup/wireframe for user approval
3. Implement approved design
4. Test across different window sizes

---

## Reference

**User's Screenshot**: [Attached - see Feature 017 directory]

The screenshot shows a toolbar with:

- Zoom out button (−)
- Zoom percentage display (100%)
- Zoom in button (+)
- Some kind of tool/mode selector (looks like a pointer/cursor icon)
- Font size controls (A− 14px A+)
- Reset button
- Undo/Redo buttons
- AI Regenerate button (purple/blue)

**Key Observations**:

- Compact, horizontal layout
- Clear visual grouping with spacing
- Mix of text and icon buttons
- Percentage/value displays integrated into button groups
- Purple accent button for primary action (AI Regenerate)

---

**Status**: Ready for specification phase - waiting for detailed design requirements

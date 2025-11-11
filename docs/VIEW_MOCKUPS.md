# View UI Mockups - Quick Reference

This document provides quick access to all UI mockup images for the Skill Debugger redesign.

## Recommended Design: Two-Column + Top Panel

![Revised Layout v2.0](mockups/05_revised_layout_v2.png)

**Key Features**:
- ✅ Full-width content area for comfortable reading
- ✅ Top overview banner with quick stats
- ✅ Description prominently displayed
- ✅ YAML metadata parsed and displayed separately
- ✅ Clean markdown rendering (no YAML in content)

**Read Full Specification**: [UI_SPECIFICATION_V2.md](UI_SPECIFICATION_V2.md)

---

## Alternative: Original Three-Column Design

![Original Three-Column Layout](mockups/01_main_layout.png)

**Trade-offs**:
- ⚠️ Middle column reduces detail panel width
- ✅ All information visible at once
- ⚠️ May feel cramped on smaller screens

**Read Full Specification**: [UI_SPECIFICATION.md](UI_SPECIFICATION.md)

---

## Tab Views (Same for Both Designs)

### Content Tab
![Content Tab](mockups/02_content_tab.png)

**Shows**:
- Rendered markdown (YAML stripped)
- Syntax-highlighted code
- Clean typography

---

### Triggers Tab
![Triggers Tab](mockups/03_triggers_tab.png)

**Shows**:
- Color-coded keyword badges
- Keywords grouped by category
- Example queries
- Analysis summary

**Color Coding**:
- 🔵 Blue: Action keywords
- 🟣 Purple: Technology keywords
- 🟢 Green: Format keywords
- 🟠 Orange: Topic keywords

---

### Diagram Tab
![Diagram Tab](mockups/04_diagram_tab.png)

**Shows**:
- Mermaid architecture diagram
- Skill dependencies
- Export controls
- Interactive zoom/pan

---

## Design Comparison

| Aspect | Original (3-Column) | Revised (2-Column + Top) |
|--------|---------------------|--------------------------|
| **Layout** | Vertical columns | Horizontal + vertical |
| **Overview** | Middle column (350px) | Top banner (180px) |
| **Content Width** | Reduced (sharing with overview) | Full width |
| **Description** | Middle panel | Detail panel top |
| **Screen Usage** | Good for wide screens | Better for all sizes |
| **Recommendation** | Alternative | **✅ Preferred** |

---

## Critical Issues Addressed

### 1. ✅ YAML Frontmatter Fixed
- **Before**: YAML displayed as plain text in markdown
- **After**: Parsed separately, displayed in Overview tab

### 2. ✅ Description Placement Fixed
- **Before**: In middle column (wasted space)
- **After**: Top of detail panel (full width, prominent)

### 3. ✅ Content Width Improved
- **Before**: Narrow detail panel
- **After**: Full-width for comfortable reading

### 4. ✅ Visual Hierarchy Enhanced
- Typography scale: 24px → 12px
- Proper spacing (8px grid)
- Card-based organization

---

## Implementation Documents

1. **[UI_SPECIFICATION_V2.md](UI_SPECIFICATION_V2.md)** ⭐ RECOMMENDED
   - Revised two-column + top panel design
   - YAML parsing implementation
   - Component code examples
   - Implementation checklist

2. **[UI_SPECIFICATION.md](UI_SPECIFICATION.md)**
   - Original three-column design
   - Complete design system
   - Alternative approach

3. **[UI_DESIGN_PROPOSAL.md](UI_DESIGN_PROPOSAL.md)**
   - Executive summary
   - Comparison tables
   - Design rationale
   - Discussion questions

4. **[mockups/README.md](mockups/README.md)**
   - Technical details of mockups
   - PlantUML Salt syntax
   - How to regenerate images
   - Color palette and spacing

---

## Next Steps

### Review Phase
1. ✅ View all mockup images above
2. ⏳ Review detailed specifications
3. ⏳ Provide feedback on preferred approach
4. ⏳ Identify any missing features

### Implementation Phase (After Approval)
1. **Week 1**: YAML parsing + top panel + description section
2. **Week 2**: Visual polish (typography, spacing, colors)
3. **Week 3**: Enhancements (transitions, loading states)

### Questions to Answer
- [ ] Prefer two-column + top panel vs. three-column?
- [ ] Any changes to color scheme?
- [ ] Any missing features in mockups?
- [ ] Ready to proceed with implementation?

---

## File Locations

All mockups and documentation are in:
```
docs/
├── UI_SPECIFICATION.md           # Original three-column design
├── UI_SPECIFICATION_V2.md        # Revised design (RECOMMENDED)
├── UI_DESIGN_PROPOSAL.md         # Executive summary
├── VIEW_MOCKUPS.md              # This file
└── mockups/
    ├── README.md                 # Technical details
    ├── 01_main_layout.png        # Original design
    ├── 02_content_tab.png        # Content view
    ├── 03_triggers_tab.png       # Triggers view
    ├── 04_diagram_tab.png        # Diagram view
    ├── 05_revised_layout_v2.png  # Revised design (RECOMMENDED)
    └── *.puml                    # Source PlantUML files
```

---

**Ready to provide feedback or start implementation? Review the mockups above and see the detailed specifications for more information.**

# UI Redesign Implementation Plan

## Overview
Implement the revised UI design (v2.0) with two-column layout, top overview panel, YAML parsing, and improved visual hierarchy.

## Implementation Phases

### Phase 1: Backend - YAML Parsing (Week 1, Days 1-2)
**Goal**: Parse YAML frontmatter separately from markdown content

#### Tasks:
1. Add `serde_yaml` dependency to `src-tauri/Cargo.toml`
2. Create `YamlFrontmatter` struct in Rust
3. Implement `parse_skill_content()` function to:
   - Extract YAML frontmatter (between `---` delimiters)
   - Parse YAML into structured data
   - Return clean markdown (without YAML)
4. Update `SkillMetadata` struct to include parsed YAML fields
5. Update Tauri commands to return separated YAML and markdown

**Acceptance Criteria**:
- YAML frontmatter extracted correctly
- Markdown content has no YAML headers
- All YAML fields accessible via API

### Phase 2: Layout Structure (Week 1, Days 3-4)
**Goal**: Implement two-column layout with top overview panel

#### Tasks:
1. Update `src/App.css` with new layout grid:
   - Sidebar: 250px fixed width
   - Main area: Flexible width with two rows
   - Top row: 180px fixed height (overview panel)
   - Bottom row: Flexible height (detail panel)
2. Create `OverviewPanel.tsx` component
3. Create `DescriptionSection.tsx` component
4. Update `Layout.tsx` to use new structure
5. Apply 8px grid spacing system

**Acceptance Criteria**:
- Sidebar and main area display correctly
- Overview panel spans full width above detail panel
- Layout responsive and well-proportioned

### Phase 3: Overview Panel Component (Week 1, Day 5)
**Goal**: Display quick stats and trigger preview in top banner

#### Tasks:
1. Implement `OverviewPanel` with:
   - Skill name (24px bold)
   - Location badge (Claude/OpenCode)
   - Quick stats cards (4-column grid):
     - References count
     - Scripts count
     - Triggers count
     - Lines count
   - Trigger preview section (5 common triggers)
2. Style with card-based design
3. Add icons for each stat type

**Acceptance Criteria**:
- All stats display correctly
- Trigger preview shows 5 most common keywords
- Clean, scannable layout

### Phase 4: Description Section (Week 2, Day 1)
**Goal**: Display skill description prominently at top of detail panel

#### Tasks:
1. Implement `DescriptionSection` component
2. Extract description from parsed YAML
3. Display with proper typography (16px body text)
4. Add subtle background card styling
5. Ensure full-width display

**Acceptance Criteria**:
- Description displays at top of detail panel
- Full-width, prominent placement
- Clean typography and spacing

### Phase 5: Updated Tab System (Week 2, Days 2-3)
**Goal**: Ensure Content tab shows only markdown, Overview tab shows YAML

#### Tasks:
1. Update `Overview` tab to display:
   - All YAML metadata fields
   - Structured display (not raw JSON)
   - Card-based organization
2. Update `Content` tab to:
   - Render markdown only (no YAML)
   - Apply syntax highlighting
   - Use proper typography scale
3. Keep existing Triggers and Diagram tabs
4. Add References and Scripts tabs (from spec)

**Acceptance Criteria**:
- Content tab shows clean markdown only
- Overview tab shows all YAML fields
- All tabs function correctly

### Phase 6: Visual Polish (Week 2, Days 4-5)
**Goal**: Apply design system (colors, typography, spacing)

#### Tasks:
1. Implement typography scale:
   - H1: 24px bold
   - H2: 20px semibold
   - H3: 16px semibold
   - Body: 14px regular
   - Small: 12px regular
2. Apply color palette:
   - Primary: #4F46E5 (Indigo-600)
   - Background: #F9FAFB (Gray-50)
   - Text: #111827 (Gray-900)
   - Borders: #E5E7EB (Gray-200)
3. Apply 8px grid spacing consistently
4. Add smooth transitions (200ms ease)
5. Implement hover states

**Acceptance Criteria**:
- Consistent typography throughout
- Proper color usage
- Smooth interactions
- Professional appearance

### Phase 7: Testing & Refinement (Week 3)
**Goal**: Test all features and refine based on feedback

#### Tasks:
1. Test YAML parsing with various skill files
2. Test layout on different window sizes
3. Verify all tabs work correctly
4. Check accessibility (keyboard navigation, screen readers)
5. Performance testing with large skill files
6. Fix any bugs or issues

**Acceptance Criteria**:
- All features work as specified
- No console errors
- Smooth performance
- Accessible to all users

## Dependencies

### Rust Dependencies (Cargo.toml):
```toml
serde_yaml = "0.9"
```

### Component Dependencies:
- React 18+
- TypeScript
- Tauri API

## Success Metrics

1. **YAML Parsing**: 100% of skills parse correctly
2. **Layout**: No layout breaks on window resize
3. **Performance**: Page load < 1 second
4. **Accessibility**: WCAG 2.1 AA compliance
5. **User Satisfaction**: Clean, professional appearance

## Rollback Plan

If critical issues arise:
1. Revert to previous UI (single column)
2. Keep YAML parsing improvements
3. Iterate on design based on feedback

## Timeline

- **Week 1**: Backend + Layout + Overview Panel + Description
- **Week 2**: Tabs + Visual Polish
- **Week 3**: Testing + Refinement

**Total**: 3 weeks for full implementation

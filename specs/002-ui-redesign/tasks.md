# UI Redesign Tasks

## Phase 1: Backend - YAML Parsing

- [ ] Add `serde_yaml = "0.9"` to `src-tauri/Cargo.toml`
- [ ] Create `YamlFrontmatter` struct in `src-tauri/src/skills.rs`
- [ ] Implement `parse_skill_content()` function
- [ ] Update `SkillMetadata` struct with YAML fields
- [ ] Update `get_skill_content` Tauri command
- [ ] Test YAML parsing with sample skill files

## Phase 2: Layout Structure

- [ ] Update `src/App.css` with two-row grid layout
- [ ] Create `src/components/OverviewPanel.tsx` file
- [ ] Create `src/components/DescriptionSection.tsx` file
- [ ] Update `src/components/Layout.tsx` for new structure
- [ ] Apply 8px grid spacing system throughout
- [ ] Test layout responsiveness

## Phase 3: Overview Panel Component

- [ ] Implement skill name display (24px bold)
- [ ] Add location badge (Claude/OpenCode)
- [ ] Create quick stats 4-column grid
- [ ] Add References count card
- [ ] Add Scripts count card
- [ ] Add Triggers count card
- [ ] Add Lines count card
- [ ] Implement trigger preview section
- [ ] Add icons for each stat type
- [ ] Style with card-based design

## Phase 4: Description Section

- [ ] Extract description from parsed YAML
- [ ] Create DescriptionSection component
- [ ] Apply 16px body typography
- [ ] Add card background styling
- [ ] Ensure full-width display
- [ ] Test with various description lengths

## Phase 5: Updated Tab System

- [ ] Update Overview tab to display YAML metadata
- [ ] Organize YAML fields in cards (not raw JSON)
- [ ] Update Content tab to render markdown only
- [ ] Remove YAML from Content tab display
- [ ] Keep existing Triggers tab
- [ ] Keep existing Diagram tab
- [ ] Add References tab component
- [ ] Add Scripts tab component
- [ ] Test all tab navigation

## Phase 6: Visual Polish

- [ ] Define typography scale CSS variables
- [ ] Apply H1 style (24px bold)
- [ ] Apply H2 style (20px semibold)
- [ ] Apply H3 style (16px semibold)
- [ ] Apply body style (14px regular)
- [ ] Apply small style (12px regular)
- [ ] Define color palette CSS variables
- [ ] Apply primary color (#4F46E5)
- [ ] Apply background color (#F9FAFB)
- [ ] Apply text color (#111827)
- [ ] Apply border color (#E5E7EB)
- [ ] Add 200ms ease transitions
- [ ] Implement hover states for interactive elements
- [ ] Add focus states for accessibility

## Phase 7: Testing & Refinement

- [ ] Test YAML parsing with all skill files
- [ ] Test layout on small windows (800px width)
- [ ] Test layout on large windows (1920px width)
- [ ] Verify Content tab shows no YAML
- [ ] Verify Overview tab shows all metadata
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Performance test with large skill files (5000+ lines)
- [ ] Check for console errors
- [ ] Fix any discovered bugs
- [ ] Get user feedback
- [ ] Refine based on feedback

## Acceptance Checklist

- [ ] YAML frontmatter parsed correctly for all skills
- [ ] Markdown content displays without YAML headers
- [ ] Two-column layout works on all screen sizes
- [ ] Overview panel displays quick stats accurately
- [ ] Description section prominent and readable
- [ ] All tabs function correctly
- [ ] Typography scale applied consistently
- [ ] Color palette applied consistently
- [ ] Spacing follows 8px grid system
- [ ] Smooth transitions on all interactions
- [ ] No accessibility issues (WCAG 2.1 AA)
- [ ] No console errors or warnings
- [ ] Performance acceptable (< 1s page load)

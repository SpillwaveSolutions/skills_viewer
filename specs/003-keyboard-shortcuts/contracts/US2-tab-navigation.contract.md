# Test Contract: US2 - Tab Navigation

**User Story**: As a power user viewing a selected skill, I want to press Cmd/Ctrl+1-6 to switch between tabs, so that I can quickly jump to different skill views without clicking tabs.

**Priority**: P2

---

## Test Scenarios

### Scenario 2.1: Switch to Overview tab (Cmd/Ctrl+1)

**Given**: I have selected a skill
**When**: I press Cmd/Ctrl+1
**Then**: The Overview tab becomes active

**Test Implementation**:
```typescript
// Unit test: TabSystem component
it('switches to Overview tab when activeTabIndex is 0', () => {
  const { result } = renderHook(() => useKeyboardStore());

  render(<TabSystem skillId="skill-123" />);

  act(() => {
    result.current.setActiveTabIndex(0);
  });

  const overviewTab = screen.getByRole('tab', { name: /overview/i });
  expect(overviewTab).toHaveAttribute('aria-selected', 'true');
});

// E2E test: Playwright
test('Cmd/Ctrl+1 switches to Overview tab', async ({ page }) => {
  await page.goto('/');
  await page.click('text=My First Skill'); // Select skill

  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? 'Meta+2' : 'Control+2'); // Switch to Content first
  await page.keyboard.press(isMac ? 'Meta+1' : 'Control+1'); // Switch back to Overview

  const overviewTab = page.locator('[role="tab"][aria-selected="true"]');
  await expect(overviewTab).toContainText('Overview');
});
```

---

### Scenario 2.2-2.6: Switch to other tabs (Cmd/Ctrl+2-6)

**Test Implementation Pattern**:
```typescript
// Unit tests: One test per tab
it.each([
  [1, 'Content'],
  [2, 'Triggers'],
  [3, 'Diagram'],
  [4, 'References'],
  [5, 'Scripts'],
])('switches to %s tab when activeTabIndex is %d', (index, tabName) => {
  const { result } = renderHook(() => useKeyboardStore());

  render(<TabSystem skillId="skill-123" />);

  act(() => {
    result.current.setActiveTabIndex(index);
  });

  const tab = screen.getByRole('tab', { name: new RegExp(tabName, 'i') });
  expect(tab).toHaveAttribute('aria-selected', 'true');
});

// E2E tests: One test per tab
test.each([
  ['Meta+2', 'Control+2', 'Content'],
  ['Meta+3', 'Control+3', 'Triggers'],
  ['Meta+4', 'Control+4', 'Diagram'],
  ['Meta+5', 'Control+5', 'References'],
  ['Meta+6', 'Control+6', 'Scripts'],
])('Shortcut %s/%s switches to %s tab', async ({ page }, macKey, winKey, tabName) => {
  await page.goto('/');
  await page.click('text=My First Skill');

  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? macKey : winKey);

  const activeTab = page.locator('[role="tab"][aria-selected="true"]');
  await expect(activeTab).toContainText(tabName);
});
```

---

### Scenario 2.7: Visual highlight on active tab

**Given**: I have selected a skill
**When**: I switch tabs with Cmd/Ctrl+[1-6]
**Then**: The active tab shows visual highlight

**Test Implementation**:
```typescript
// Unit test: Visual indicator
it('applies active class to selected tab', () => {
  const { result } = renderHook(() => useKeyboardStore());

  render(<TabSystem skillId="skill-123" />);

  act(() => {
    result.current.setActiveTabIndex(2); // Triggers tab
  });

  const triggersTab = screen.getByRole('tab', { name: /triggers/i });
  expect(triggersTab).toHaveClass('tab-active'); // Or similar class
});

// E2E test: Visual verification
test('active tab has visual highlight', async ({ page }) => {
  await page.goto('/');
  await page.click('text=My First Skill');

  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? 'Meta+2' : 'Control+2');

  const contentTab = page.locator('[role="tab"]', { hasText: 'Content' });

  // Verify visual highlight (check for active class or style)
  await expect(contentTab).toHaveClass(/active/);
});
```

---

### Scenario 2.8: No effect when no skill selected

**Given**: No skill is selected
**When**: I press Cmd/Ctrl+[1-6]
**Then**: The shortcut has no effect

**Test Implementation**:
```typescript
// Unit test: Guard condition
it('ignores tab shortcuts when no skill is selected', () => {
  const { result } = renderHook(() => useKeyboardStore());

  // No skill selected (TabSystem not rendered)
  const { container } = render(<SkillList skills={[]} selectedSkillId={null} />);

  const initialIndex = result.current.activeTabIndex;

  // Simulate Cmd/Ctrl+1
  const event = new KeyboardEvent('keydown', {
    key: '1',
    metaKey: true,
    bubbles: true,
  });
  container.dispatchEvent(event);

  // Verify activeTabIndex unchanged
  expect(result.current.activeTabIndex).toBe(initialIndex);
});

// E2E test: No effect verification
test('Cmd/Ctrl+1-6 has no effect when no skill selected', async ({ page }) => {
  await page.goto('/');

  // Verify no skill selected
  const detailView = page.locator('[data-testid="skill-detail"]');
  await expect(detailView).not.toBeVisible();

  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? 'Meta+1' : 'Control+1');

  // Verify still on list view (no tabs visible)
  await expect(detailView).not.toBeVisible();
});
```

---

## Success Criteria

- ✅ **SC-001 (partial)**: Tab switching contributes to 50% faster task completion
- ✅ **SC-002 (partial)**: 95% success rate on first attempt
- ✅ **SC-004 (partial)**: Visual UI elements exist (tabs)
- ✅ **SC-006 (full)**: Works on macOS, Windows, Linux

## Coverage Requirements

**Minimum Coverage**: >80% for all tab navigation logic

**Files to Test**:
- `src/components/TabSystem.tsx` (tab switching logic)
- `src/hooks/useKeyboardShortcuts.ts` (Cmd/Ctrl+1-6 detection)
- `src/stores/keyboardStore.ts` (activeTabIndex state)

**Test Types**:
- Unit: 8 tests (6 tabs + visual + guard condition)
- Integration: 1 test (full tab switching flow)
- E2E: 7 tests (6 tabs + no-effect edge case)

**Total**: 16 tests for US2

---

**Contract Version**: 1.0
**Created**: 2025-11-10
**Status**: Ready for TDD implementation

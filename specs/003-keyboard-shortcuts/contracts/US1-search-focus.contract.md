# Test Contract: US1 - Quick Search Access

**User Story**: As a power user viewing the skill list, I want to press Cmd/Ctrl+F to immediately focus the search bar, so that I can quickly filter skills without moving my hand to the mouse.

**Priority**: P1

---

## Test Scenarios

### Scenario 1.1: Focus search from skill list

**Given**: I am viewing the skill list
**When**: I press Cmd+F (macOS) or Ctrl+F (Windows/Linux)
**Then**: The search input receives keyboard focus

**Test Implementation**:
```typescript
// Unit test: SearchBar component
it('focuses search input when searchFocusRequested is true', () => {
  const { result } = renderHook(() => useKeyboardStore());

  render(<SearchBar />);

  act(() => {
    result.current.setSearchFocusRequested(true);
  });

  const searchInput = screen.getByRole('searchbox');
  expect(searchInput).toHaveFocus();
});

// E2E test: Playwright
test('Cmd/Ctrl+F focuses search input', async ({ page }) => {
  await page.goto('/');

  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? 'Meta+f' : 'Control+f');

  const searchInput = page.locator('input[type="search"]');
  await expect(searchInput).toBeFocused();
});
```

---

### Scenario 1.2: Select existing search text

**Given**: The search bar already contains text "react"
**When**: I press Cmd/Ctrl+F
**Then**: The existing text "react" is selected for easy replacement

**Test Implementation**:
```typescript
// Unit test: SearchBar component
it('selects existing text when focused via keyboard', () => {
  const { result } = renderHook(() => useKeyboardStore());

  render(<SearchBar initialValue="react" />);

  const searchInput = screen.getByRole('searchbox') as HTMLInputElement;

  act(() => {
    result.current.setSearchFocusRequested(true);
  });

  // Verify text is selected
  expect(searchInput.selectionStart).toBe(0);
  expect(searchInput.selectionEnd).toBe(5); // "react".length
});

// E2E test: Playwright
test('Cmd/Ctrl+F selects existing search text', async ({ page }) => {
  await page.goto('/');

  // Type search query
  await page.fill('input[type="search"]', 'react');

  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? 'Meta+f' : 'Control+f');

  // Verify text is selected
  const selectedText = await page.evaluate(() => window.getSelection()?.toString());
  expect(selectedText).toBe('react');
});
```

---

### Scenario 1.3: Focus search from skill detail page

**Given**: I am viewing a skill detail page
**When**: I press Cmd/Ctrl+F
**Then**: The search bar receives focus AND the view returns to the skill list

**Test Implementation**:
```typescript
// Integration test
it('navigates to skill list and focuses search when on detail page', () => {
  const navigate = vi.fn();

  render(
    <MemoryRouter initialEntries={['/skills/skill-123']}>
      <SkillDetailPage />
    </MemoryRouter>
  );

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  userEvent.keyboard(isMac ? '{Meta>}f{/Meta}' : '{Control>}f{/Control}');

  // Verify navigation to list
  expect(navigate).toHaveBeenCalledWith('/skills');

  // Verify search focused
  const searchInput = screen.getByRole('searchbox');
  expect(searchInput).toHaveFocus();
});

// E2E test: Playwright
test('Cmd/Ctrl+F from detail page returns to list and focuses search', async ({ page }) => {
  await page.goto('/');
  await page.click('text=My First Skill'); // Select a skill

  // Verify on detail page
  await expect(page.locator('h1')).toContainText('My First Skill');

  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? 'Meta+f' : 'Control+f');

  // Verify back on list page
  await expect(page).toHaveURL('/');

  // Verify search focused
  const searchInput = page.locator('input[type="search"]');
  await expect(searchInput).toBeFocused();
});
```

---

### Scenario 1.4: Clear search with Escape

**Given**: The search bar has focus
**When**: I press Escape
**Then**: Focus is removed AND search is cleared

**Test Implementation**:
```typescript
// Unit test: SearchBar component
it('clears search and removes focus when Escape is pressed', () => {
  render(<SearchBar />);

  const searchInput = screen.getByRole('searchbox') as HTMLInputElement;

  // Focus and type search
  searchInput.focus();
  userEvent.type(searchInput, 'test query');

  expect(searchInput.value).toBe('test query');
  expect(searchInput).toHaveFocus();

  // Press Escape
  userEvent.keyboard('{Escape}');

  // Verify cleared and unfocused
  expect(searchInput.value).toBe('');
  expect(searchInput).not.toHaveFocus();
});

// E2E test: Playwright
test('Escape clears search and removes focus', async ({ page }) => {
  await page.goto('/');

  await page.fill('input[type="search"]', 'test query');
  await page.keyboard.press('Escape');

  const searchInput = page.locator('input[type="search"]');
  await expect(searchInput).toHaveValue('');
  await expect(searchInput).not.toBeFocused();
});
```

---

## Success Criteria

- ✅ **SC-001 (partial)**: Search access contributes to 50% faster task completion
- ✅ **SC-002 (partial)**: 95% success rate on first attempt
- ✅ **SC-004 (partial)**: Visual UI element exists (search bar)
- ✅ **SC-006 (full)**: Works on macOS, Windows, Linux

## Coverage Requirements

**Minimum Coverage**: >80% for all search focus logic

**Files to Test**:
- `src/components/SearchBar.tsx` (focus logic)
- `src/hooks/useKeyboardShortcuts.ts` (Cmd/Ctrl+F detection)
- `src/stores/keyboardStore.ts` (searchFocusRequested state)

**Test Types**:
- Unit: 4 tests (component behavior)
- Integration: 1 test (navigation + focus)
- E2E: 4 tests (full user flows)

**Total**: 9 tests for US1

---

**Contract Version**: 1.0
**Created**: 2025-11-10
**Status**: Ready for TDD implementation

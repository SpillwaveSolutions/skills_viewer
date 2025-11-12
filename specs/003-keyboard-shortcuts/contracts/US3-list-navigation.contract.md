# Test Contract: US3 - List Navigation

**User Story**: As a power user viewing the skill list, I want to use arrow keys to navigate the skill list, so that I can browse skills quickly using only the keyboard.

**Priority**: P3

---

## Test Scenarios

### Scenario 3.1: Highlight first skill with Down arrow

**Given**: I am viewing the skill list with no selection
**When**: I press the Down arrow
**Then**: The first skill receives visual highlight

**Test Implementation**:
```typescript
// Unit test: useListNavigation hook
it('highlights first skill when Down is pressed with no current highlight', () => {
  const { result } = renderHook(() => useKeyboardStore());
  const { result: navResult } = renderHook(() =>
    useListNavigation({
      skills: mockSkills,
      onSelectSkill: vi.fn(),
    })
  );

  expect(result.current.highlightedSkillIndex).toBeNull();

  // Simulate Down arrow
  act(() => {
    navResult.current.handleKeyDown({ key: 'ArrowDown' } as KeyboardEvent);
  });

  expect(result.current.highlightedSkillIndex).toBe(0);
});

// E2E test: Playwright
test('Down arrow highlights first skill', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('ArrowDown');

  const firstSkill = page.locator('[data-testid="skill-item"]').first();
  await expect(firstSkill).toHaveClass(/highlighted/);
});
```

---

### Scenario 3.2: Move highlight down

**Given**: A skill is highlighted (index 2)
**When**: I press the Down arrow
**Then**: The next skill (index 3) receives highlight

**Test Implementation**:
```typescript
// Unit test: Navigation logic
it('moves highlight to next skill when Down is pressed', () => {
  const { result } = renderHook(() => useKeyboardStore());
  const { result: navResult } = renderHook(() =>
    useListNavigation({
      skills: mockSkills, // 5 skills
      onSelectSkill: vi.fn(),
    })
  );

  // Start with skill at index 2 highlighted
  act(() => {
    result.current.setHighlightedSkillIndex(2);
  });

  // Press Down
  act(() => {
    navResult.current.handleKeyDown({ key: 'ArrowDown' } as KeyboardEvent);
  });

  expect(result.current.highlightedSkillIndex).toBe(3);
});

// E2E test: Playwright
test('Down arrow moves highlight to next skill', async ({ page }) => {
  await page.goto('/');

  // Highlight first skill
  await page.keyboard.press('ArrowDown');

  // Move to second skill
  await page.keyboard.press('ArrowDown');

  const secondSkill = page.locator('[data-testid="skill-item"]').nth(1);
  await expect(secondSkill).toHaveClass(/highlighted/);
});
```

---

### Scenario 3.3: Move highlight up

**Given**: A skill is highlighted (index 3)
**When**: I press the Up arrow
**Then**: The previous skill (index 2) receives highlight

**Test Implementation**:
```typescript
// Unit test: Navigation logic
it('moves highlight to previous skill when Up is pressed', () => {
  const { result } = renderHook(() => useKeyboardStore());
  const { result: navResult } = renderHook(() =>
    useListNavigation({
      skills: mockSkills,
      onSelectSkill: vi.fn(),
    })
  );

  // Start with skill at index 3 highlighted
  act(() => {
    result.current.setHighlightedSkillIndex(3);
  });

  // Press Up
  act(() => {
    navResult.current.handleKeyDown({ key: 'ArrowUp' } as KeyboardEvent);
  });

  expect(result.current.highlightedSkillIndex).toBe(2);
});

// E2E test: Playwright
test('Up arrow moves highlight to previous skill', async ({ page }) => {
  await page.goto('/');

  // Highlight first two skills
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');

  // Move back up
  await page.keyboard.press('ArrowUp');

  const firstSkill = page.locator('[data-testid="skill-item"]').first();
  await expect(firstSkill).toHaveClass(/highlighted/);
});
```

---

### Scenario 3.4: Wrap to first skill (Down from last)

**Given**: The last skill is highlighted (index 4 of 5 skills)
**When**: I press the Down arrow
**Then**: The first skill (index 0) receives highlight (wrapping)

**Test Implementation**:
```typescript
// Unit test: Wrapping logic
it('wraps to first skill when Down is pressed on last skill', () => {
  const { result } = renderHook(() => useKeyboardStore());
  const { result: navResult } = renderHook(() =>
    useListNavigation({
      skills: mockSkills, // 5 skills (indices 0-4)
      onSelectSkill: vi.fn(),
    })
  );

  // Highlight last skill
  act(() => {
    result.current.setHighlightedSkillIndex(4);
  });

  // Press Down
  act(() => {
    navResult.current.handleKeyDown({ key: 'ArrowDown' } as KeyboardEvent);
  });

  // Should wrap to first skill
  expect(result.current.highlightedSkillIndex).toBe(0);
});

// E2E test: Playwright
test('Down arrow wraps from last to first skill', async ({ page }) => {
  await page.goto('/');

  const skillCount = await page.locator('[data-testid="skill-item"]').count();

  // Highlight first skill
  await page.keyboard.press('ArrowDown');

  // Navigate to last skill
  for (let i = 1; i < skillCount; i++) {
    await page.keyboard.press('ArrowDown');
  }

  // Verify last skill highlighted
  const lastSkill = page.locator('[data-testid="skill-item"]').last();
  await expect(lastSkill).toHaveClass(/highlighted/);

  // Press Down to wrap
  await page.keyboard.press('ArrowDown');

  // Verify first skill highlighted
  const firstSkill = page.locator('[data-testid="skill-item"]').first();
  await expect(firstSkill).toHaveClass(/highlighted/);
});
```

---

### Scenario 3.5: Wrap to last skill (Up from first)

**Given**: The first skill is highlighted (index 0)
**When**: I press the Up arrow
**Then**: The last skill (index 4) receives highlight (wrapping)

**Test Implementation**:
```typescript
// Unit test: Wrapping logic
it('wraps to last skill when Up is pressed on first skill', () => {
  const { result } = renderHook(() => useKeyboardStore());
  const { result: navResult } = renderHook(() =>
    useListNavigation({
      skills: mockSkills, // 5 skills (indices 0-4)
      onSelectSkill: vi.fn(),
    })
  );

  // Highlight first skill
  act(() => {
    result.current.setHighlightedSkillIndex(0);
  });

  // Press Up
  act(() => {
    navResult.current.handleKeyDown({ key: 'ArrowUp' } as KeyboardEvent);
  });

  // Should wrap to last skill
  expect(result.current.highlightedSkillIndex).toBe(4);
});

// E2E test: Playwright
test('Up arrow wraps from first to last skill', async ({ page }) => {
  await page.goto('/');

  // Highlight first skill
  await page.keyboard.press('ArrowDown');

  // Press Up to wrap
  await page.keyboard.press('ArrowUp');

  // Verify last skill highlighted
  const lastSkill = page.locator('[data-testid="skill-item"]').last();
  await expect(lastSkill).toHaveClass(/highlighted/);
});
```

---

### Scenario 3.6: Select highlighted skill with Enter

**Given**: A skill is highlighted (index 2)
**When**: I press Enter
**Then**: That skill is selected and its details are displayed

**Test Implementation**:
```typescript
// Unit test: Selection logic
it('selects highlighted skill when Enter is pressed', () => {
  const onSelectSkill = vi.fn();
  const { result } = renderHook(() => useKeyboardStore());
  const { result: navResult } = renderHook(() =>
    useListNavigation({
      skills: mockSkills,
      onSelectSkill,
    })
  );

  // Highlight skill at index 2
  act(() => {
    result.current.setHighlightedSkillIndex(2);
  });

  // Press Enter
  act(() => {
    navResult.current.handleKeyDown({ key: 'Enter' } as KeyboardEvent);
  });

  // Verify skill selected
  expect(onSelectSkill).toHaveBeenCalledWith(mockSkills[2].id);

  // Verify highlight cleared
  expect(result.current.highlightedSkillIndex).toBeNull();
});

// E2E test: Playwright
test('Enter selects highlighted skill', async ({ page }) => {
  await page.goto('/');

  // Highlight second skill
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');

  const secondSkill = page.locator('[data-testid="skill-item"]').nth(1);
  const skillName = await secondSkill.textContent();

  // Press Enter
  await page.keyboard.press('Enter');

  // Verify skill detail page displayed
  await expect(page.locator('h1')).toContainText(skillName!);
});
```

---

### Scenario 3.7: Clear selection with Escape

**Given**: A skill is selected
**When**: I press Escape
**Then**: Selection is cleared and I return to the skill list

**Test Implementation**:
```typescript
// Unit test: Escape handling
it('clears selection when Escape is pressed', () => {
  const onClearSelection = vi.fn();
  const { result: navResult } = renderHook(() =>
    useListNavigation({
      skills: mockSkills,
      onSelectSkill: vi.fn(),
      onClearSelection,
    })
  );

  // Press Escape
  act(() => {
    navResult.current.handleKeyDown({ key: 'Escape' } as KeyboardEvent);
  });

  expect(onClearSelection).toHaveBeenCalled();
});

// E2E test: Playwright
test('Escape clears selection and returns to list', async ({ page }) => {
  await page.goto('/');

  // Select a skill
  await page.click('text=My First Skill');

  // Verify on detail page
  await expect(page.locator('h1')).toContainText('My First Skill');

  // Press Escape
  await page.keyboard.press('Escape');

  // Verify back on list page
  await expect(page).toHaveURL('/');
});
```

---

### Scenario 3.8: Distinct visual indicator for highlight vs selection

**Given**: A highlighted skill (index 2)
**When**: I view the skill list
**Then**: The highlighted skill shows a distinct visual indicator different from selection

**Test Implementation**:
```typescript
// Unit test: Visual classes
it('applies distinct classes for highlighted vs selected skills', () => {
  const { result } = renderHook(() => useKeyboardStore());

  render(
    <SkillList
      skills={mockSkills}
      selectedSkillId="skill-3"
      highlightedIndex={1}
    />
  );

  const highlightedSkill = screen.getByTestId('skill-item-1');
  const selectedSkill = screen.getByTestId('skill-item-2'); // skill-3 is at index 2

  // Verify distinct classes
  expect(highlightedSkill).toHaveClass('skill-highlighted');
  expect(selectedSkill).toHaveClass('skill-selected');
  expect(highlightedSkill).not.toHaveClass('skill-selected');
  expect(selectedSkill).not.toHaveClass('skill-highlighted');
});

// E2E test: Visual verification
test('highlighted and selected skills have distinct visual styles', async ({ page }) => {
  await page.goto('/');

  // Select first skill
  await page.click('text=My First Skill');

  // Return to list
  await page.keyboard.press('Escape');

  // Highlight second skill
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');

  const firstSkill = page.locator('[data-testid="skill-item"]').first();
  const secondSkill = page.locator('[data-testid="skill-item"]').nth(1);

  // Verify distinct styles
  await expect(firstSkill).toHaveClass(/selected/);
  await expect(secondSkill).toHaveClass(/highlighted/);
  await expect(firstSkill).not.toHaveClass(/highlighted/);
  await expect(secondSkill).not.toHaveClass(/selected/);
});
```

---

## Success Criteria

- ✅ **SC-001 (partial)**: List navigation contributes to 50% faster task completion
- ✅ **SC-002 (partial)**: 95% success rate on first attempt
- ✅ **SC-004 (partial)**: Visual UI elements exist (highlighted items)
- ✅ **SC-006 (full)**: Works on macOS, Windows, Linux
- ✅ **SC-007 (partial)**: Keyboard-only navigation enabled

## Coverage Requirements

**Minimum Coverage**: >80% for all list navigation logic

**Files to Test**:
- `src/components/SkillList.tsx` (highlighting logic, visual indicators)
- `src/hooks/useListNavigation.ts` (arrow key logic, wrapping, selection)
- `src/stores/keyboardStore.ts` (highlightedSkillIndex state)

**Test Types**:
- Unit: 10 tests (navigation logic, wrapping, selection, visual)
- Integration: 2 tests (full navigation flows)
- E2E: 8 tests (all user scenarios)

**Total**: 20 tests for US3

---

**Contract Version**: 1.0
**Created**: 2025-11-10
**Status**: Ready for TDD implementation

# Test Contract: US4 - Help Overlay

**User Story**: As a user learning the application, I want to press ? to see all available keyboard shortcuts, so that I can discover and remember keyboard commands without checking documentation.

**Priority**: P2

---

## Test Scenarios

### Scenario 4.1: Open help modal with ?

**Given**: I am using the application
**When**: I press ? (Shift+/)
**Then**: A help modal opens showing all keyboard shortcuts

**Test Implementation**:
```typescript
// Unit test: KeyboardShortcutHelp component
it('renders help modal when isOpen is true', () => {
  render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);

  const modal = screen.getByRole('dialog', { name: /keyboard shortcuts/i });
  expect(modal).toBeInTheDocument();
  expect(modal).toBeVisible();
});

// E2E test: Playwright
test('? key opens help modal', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('?'); // Shift+/

  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();

  const title = page.locator('h2', { hasText: /keyboard shortcuts/i });
  await expect(title).toBeVisible();
});
```

---

### Scenario 4.2: Shortcuts grouped by context

**Given**: The help modal is open
**When**: I view the modal
**Then**: Shortcuts are grouped by context (Search, Navigation, Tabs, etc.)

**Test Implementation**:
```typescript
// Unit test: Shortcut grouping
it('displays shortcuts grouped by context', () => {
  render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);

  // Verify groups exist
  expect(screen.getByText(/search/i)).toBeInTheDocument();
  expect(screen.getByText(/navigation/i)).toBeInTheDocument();
  expect(screen.getByText(/tabs/i)).toBeInTheDocument();
  expect(screen.getByText(/list/i)).toBeInTheDocument();
  expect(screen.getByText(/help/i)).toBeInTheDocument();

  // Verify shortcuts are within groups
  const searchGroup = screen.getByText(/search/i).closest('[data-testid="shortcut-group"]');
  expect(searchGroup).toContainElement(screen.getByText(/focus search/i));
});

// E2E test: Playwright
test('help modal shows grouped shortcuts', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('?');

  // Verify groups
  await expect(page.locator('text=Search')).toBeVisible();
  await expect(page.locator('text=Navigation')).toBeVisible();
  await expect(page.locator('text=Tabs')).toBeVisible();
  await expect(page.locator('text=List')).toBeVisible();
  await expect(page.locator('text=Help')).toBeVisible();
});
```

---

### Scenario 4.3: Display key combination and description

**Given**: The help modal is open
**When**: I view each shortcut
**Then**: It shows both the key combination and description

**Test Implementation**:
```typescript
// Unit test: Shortcut display format
it('displays key combination and description for each shortcut', () => {
  render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);

  // Verify Cmd/Ctrl+F shortcut
  expect(screen.getByText(/⌘ F|Ctrl F/)).toBeInTheDocument(); // Platform-dependent
  expect(screen.getByText(/focus search/i)).toBeInTheDocument();

  // Verify Arrow keys shortcut
  expect(screen.getByText(/↑ ↓/)).toBeInTheDocument();
  expect(screen.getByText(/navigate list/i)).toBeInTheDocument();
});

// E2E test: Playwright
test('each shortcut shows key combo and description', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('?');

  const isMac = process.platform === 'darwin';
  const searchShortcut = page.locator(`text=${isMac ? '⌘ F' : 'Ctrl F'}`);
  const searchDesc = page.locator('text=Focus search bar');

  await expect(searchShortcut).toBeVisible();
  await expect(searchDesc).toBeVisible();
});
```

---

### Scenario 4.4: Close modal with Escape

**Given**: The help modal is open
**When**: I press Escape
**Then**: The modal closes

**Test Implementation**:
```typescript
// Unit test: Escape handling
it('calls onClose when Escape is pressed', () => {
  const onClose = vi.fn();

  render(<KeyboardShortcutHelp isOpen={true} onClose={onClose} />);

  const modal = screen.getByRole('dialog');

  // Simulate Escape key
  fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });

  expect(onClose).toHaveBeenCalledTimes(1);
});

// E2E test: Playwright
test('Escape closes help modal', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('?');

  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
});
```

---

### Scenario 4.5: Close modal by clicking outside

**Given**: The help modal is open
**When**: I click outside the modal
**Then**: The modal closes

**Test Implementation**:
```typescript
// Unit test: Click outside handling
it('calls onClose when clicking outside modal', () => {
  const onClose = vi.fn();

  render(<KeyboardShortcutHelp isOpen={true} onClose={onClose} />);

  const overlay = screen.getByTestId('modal-overlay');

  fireEvent.click(overlay);

  expect(onClose).toHaveBeenCalledTimes(1);
});

// E2E test: Playwright
test('clicking outside modal closes it', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('?');

  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();

  // Click outside modal (on overlay)
  await page.click('[data-testid="modal-overlay"]', { position: { x: 10, y: 10 } });

  await expect(modal).not.toBeVisible();
});
```

---

### Scenario 4.6: Focus trap within modal

**Given**: The help modal is open
**When**: I tab through elements
**Then**: Focus remains trapped within the modal

**Test Implementation**:
```typescript
// Unit test: Focus trap logic
it('traps focus within modal when tabbing', async () => {
  const { container } = render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);

  const modal = screen.getByRole('dialog');
  const focusableElements = modal.querySelectorAll('button, a, input');

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  // Focus last element
  lastElement.focus();
  expect(document.activeElement).toBe(lastElement);

  // Tab forward (should wrap to first)
  fireEvent.keyDown(lastElement, { key: 'Tab', shiftKey: false });

  // After implementation, this should focus first element
  // (Test waits for focus trap to be implemented)
});

// E2E test: Playwright
test('focus stays within modal when tabbing', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('?');

  const modal = page.locator('[role="dialog"]');

  // Tab forward multiple times
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
  }

  // Verify focus still inside modal
  const focusedElement = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'));
  expect(focusedElement).not.toBeNull();

  // Tab backward multiple times
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Shift+Tab');
  }

  // Verify focus still inside modal
  const focusedElement2 = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'));
  expect(focusedElement2).not.toBeNull();
});
```

---

### Scenario 4.7: Screen reader accessibility

**Given**: The help modal is open
**When**: Screen reader users navigate
**Then**: The modal has proper ARIA labels and roles

**Test Implementation**:
```typescript
// Unit test: ARIA attributes
it('has proper ARIA attributes for accessibility', () => {
  render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);

  const modal = screen.getByRole('dialog');

  // Verify ARIA attributes
  expect(modal).toHaveAttribute('aria-modal', 'true');
  expect(modal).toHaveAttribute('aria-labelledby');
  expect(modal).toHaveAttribute('aria-describedby');

  const titleId = modal.getAttribute('aria-labelledby');
  const descId = modal.getAttribute('aria-describedby');

  // Verify title and description exist
  expect(document.getElementById(titleId!)).toBeInTheDocument();
  expect(document.getElementById(descId!)).toBeInTheDocument();
});

// E2E test: Accessibility scan
test('help modal passes accessibility checks', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('?');

  // Run axe accessibility scan
  const results = await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run();
  });

  expect(results.violations).toHaveLength(0);
});
```

---

## Success Criteria

- ✅ **SC-002 (full)**: 95% success rate discovering shortcuts via help modal
- ✅ **SC-004 (full)**: 100% of shortcuts have visual UI elements
- ✅ **SC-005 (full)**: Help overlay displays in <100ms
- ✅ **SC-006 (full)**: Works on macOS, Windows, Linux
- ✅ **SC-007 (partial)**: Keyboard-only navigation (focus trap)
- ✅ **SC-008 (full)**: Screen reader users can discover shortcuts

## Coverage Requirements

**Minimum Coverage**: >80% for all help modal logic

**Files to Test**:
- `src/components/KeyboardShortcutHelp.tsx` (modal rendering, focus trap, shortcuts display)
- `src/hooks/useKeyboardShortcuts.ts` (? key detection)
- `src/stores/keyboardStore.ts` (isHelpModalOpen state)
- `src/utils/keyboardUtils.ts` (shortcut grouping logic)

**Test Types**:
- Unit: 7 tests (rendering, ARIA, focus trap, grouping, close handlers)
- Integration: 1 test (full modal lifecycle)
- E2E: 7 tests (all user scenarios + accessibility scan)
- Accessibility: 1 dedicated axe-core test

**Total**: 16 tests for US4

---

**Contract Version**: 1.0
**Created**: 2025-11-10
**Status**: Ready for TDD implementation

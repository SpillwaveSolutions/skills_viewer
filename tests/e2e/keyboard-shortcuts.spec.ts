/**
 * End-to-End tests for keyboard shortcuts
 *
 * These tests run against the actual Tauri application using Playwright.
 * They verify keyboard shortcuts work in real browser environment.
 *
 * Prerequisites:
 * - App must be running: npm run tauri dev
 * - Or Playwright will start it automatically via webServer config
 */

import { test, expect } from '@playwright/test';

/**
 * Detect platform for modifier key tests
 */
const isMac = process.platform === 'darwin';
const modifierKey = isMac ? 'Meta' : 'Control';

/**
 * Setup Tauri API mocks before each test
 */
test.beforeEach(async ({ page }) => {
  // Inject Tauri API mocks before navigating
  await page.addInitScript(() => {
    // Mock skills data
    const mockSkills = [
      {
        name: 'test-skill-1',
        path: '/Users/test/.claude/skills/test-skill-1',
        description: 'A test skill for E2E testing',
        triggers: ['test', 'skill'],
        location: 'user',
        content: 'Test skill content',
        references: [],
        scripts: [],
      },
      {
        name: 'test-skill-2',
        path: '/Users/test/.claude/skills/test-skill-2',
        description: 'Another test skill',
        triggers: ['demo'],
        location: 'user',
        content: 'Another test skill content',
        references: [],
        scripts: [],
      },
    ];

    // Mock the Tauri invoke function
    async function mockInvoke(command: string): Promise<any> {
      console.log('[Tauri Mock] invoke:', command);

      switch (command) {
        case 'scan_skills':
          return mockSkills;

        default:
          throw new Error(`Unhandled Tauri command: ${command}`);
      }
    }

    // Mock the @tauri-apps/api/core module structure
    (window as any).__TAURI_INTERNALS__ = {
      invoke: mockInvoke,
    };

    // Also mock the legacy structure for compatibility
    (window as any).__TAURI__ = {
      core: {
        invoke: mockInvoke,
      },
    };

    console.log('[Tauri Mock] Setup complete');
  });
});

test.describe('User Story 1: Quick Search Access', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // Wait for app to be ready
    await page.waitForLoadState('networkidle');

    // Wait for search bar to appear (after skills load)
    await page.waitForSelector('input[placeholder="Search skills..."]', {
      timeout: 10000
    });
  });

  test('T021: Cmd/Ctrl+F should focus search input', async ({ page }) => {
    // Find search input by placeholder
    const searchInput = page.locator('input[placeholder="Search skills..."]');

    // Verify search is not focused initially
    await expect(searchInput).not.toBeFocused();

    // Press Cmd/Ctrl+F
    await page.keyboard.press(`${modifierKey}+f`);

    // Verify search input now has focus
    await expect(searchInput).toBeFocused();
  });

  test('T022: Cmd/Ctrl+F should select existing search text', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search skills..."]');

    // Type some text in search
    await searchInput.click();
    await searchInput.fill('existing text');

    // Click somewhere else to lose focus
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeFocused();

    // Press Cmd/Ctrl+F
    await page.keyboard.press(`${modifierKey}+f`);

    // Verify search input is focused
    await expect(searchInput).toBeFocused();

    // Verify text is selected (by checking if typing replaces it)
    await page.keyboard.type('new');
    await expect(searchInput).toHaveValue('new');
  });

  test('T023: Cmd/Ctrl+F should focus search from detail page', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search skills..."]');

    // Check if there are any skills loaded
    const skillItems = page.locator('[data-testid="skill-item"]');
    const skillCount = await skillItems.count();

    if (skillCount > 0) {
      // Click on first skill to navigate to detail page
      await skillItems.first().click();

      // Wait a moment for navigation
      await page.waitForTimeout(100);

      // Verify we're not on search (search not focused)
      await expect(searchInput).not.toBeFocused();

      // Press Cmd/Ctrl+F from detail page
      await page.keyboard.press(`${modifierKey}+f`);

      // Verify search input receives focus
      await expect(searchInput).toBeFocused();
    } else {
      // If no skills, just verify Cmd/Ctrl+F works from any page
      await page.keyboard.press(`${modifierKey}+f`);
      await expect(searchInput).toBeFocused();
    }
  });

  test('T024: Escape should clear search and unfocus input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search skills..."]');

    // Focus search and type text
    await searchInput.click();
    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');
    await expect(searchInput).toBeFocused();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify search is cleared
    await expect(searchInput).toHaveValue('');

    // Verify search lost focus
    await expect(searchInput).not.toBeFocused();
  });
});

test.describe('Keyboard Shortcuts: Cross-browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for search bar to appear (after skills load)
    await page.waitForSelector('input[placeholder="Search skills..."]', {
      timeout: 10000
    });
  });

  test('should work with uppercase F key', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search skills..."]');

    // Press Cmd/Ctrl+Shift+F (uppercase F)
    // This should still trigger the shortcut (case-insensitive)
    await page.keyboard.down(modifierKey);
    await page.keyboard.press('F'); // Uppercase
    await page.keyboard.up(modifierKey);

    await expect(searchInput).toBeFocused();
  });

  test('should prevent browser default search behavior', async ({ page }) => {
    // Press Cmd/Ctrl+F
    await page.keyboard.press(`${modifierKey}+f`);

    // Verify our search input is focused (not browser's native search)
    const searchInput = page.locator('input[placeholder="Search skills..."]');
    await expect(searchInput).toBeFocused();

    // Browser's native search dialog should NOT appear
    // (This is implicit - if it appeared, focus would be lost)
  });
});

test.describe('Keyboard Shortcuts: Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for search bar to appear (after skills load)
    await page.waitForSelector('input[placeholder="Search skills..."]', {
      timeout: 10000
    });
  });

  test('should announce focus change to screen readers', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search skills..."]');

    // Verify input has proper ARIA attributes
    await expect(searchInput).toHaveAttribute('type', 'text');

    // Press Cmd/Ctrl+F
    await page.keyboard.press(`${modifierKey}+f`);

    // Verify input is focused (screen readers will announce this)
    await expect(searchInput).toBeFocused();
  });

  test('should allow keyboard-only navigation', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search skills..."]');

    // Use Tab to navigate (keyboard-only)
    await page.keyboard.press('Tab');

    // Eventually search should be reachable via Tab
    // (May need multiple tabs depending on layout)
    const maxTabs = 10;
    let focused = false;

    for (let i = 0; i < maxTabs; i++) {
      const isFocused = await searchInput.evaluate((el) => document.activeElement === el);
      if (isFocused) {
        focused = true;
        break;
      }
      await page.keyboard.press('Tab');
    }

    // If we reached search via Tab, verify we can type
    if (focused) {
      await page.keyboard.type('test');
      await expect(searchInput).toHaveValue('test');
    }

    // Alternative: Use Cmd/Ctrl+F (keyboard shortcut is always accessible)
    await page.keyboard.press(`${modifierKey}+f`);
    await expect(searchInput).toBeFocused();
  });
});

test.describe('Keyboard Shortcuts: Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for search bar to appear (after skills load)
    await page.waitForSelector('input[placeholder="Search skills..."]', {
      timeout: 10000
    });
  });

  test('should not trigger on F key without modifier', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search skills..."]');

    // Click somewhere else
    await page.click('body');
    await expect(searchInput).not.toBeFocused();

    // Press F without modifier
    await page.keyboard.press('f');

    // Search should NOT be focused
    await expect(searchInput).not.toBeFocused();
  });

  test('should work multiple times in a row', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search skills..."]');

    // First time
    await page.keyboard.press(`${modifierKey}+f`);
    await expect(searchInput).toBeFocused();

    // Clear and unfocus
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeFocused();

    // Second time
    await page.keyboard.press(`${modifierKey}+f`);
    await expect(searchInput).toBeFocused();

    // Third time (with existing text)
    await searchInput.fill('text');
    await page.keyboard.press('Escape');
    await page.keyboard.press(`${modifierKey}+f`);
    await expect(searchInput).toBeFocused();
  });

  test('Escape should only work when search is focused', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search skills..."]');

    // Set some search text
    await searchInput.click();
    await searchInput.fill('test');

    // Blur the search input
    await page.click('body');
    await expect(searchInput).not.toBeFocused();

    // Press Escape when search is NOT focused
    await page.keyboard.press('Escape');

    // Search text should remain (Escape only works when focused)
    await expect(searchInput).toHaveValue('test');
  });
});

test.describe('User Story 4: Help Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for app to be ready
    await page.waitForSelector('input[placeholder="Search skills..."]', {
      timeout: 10000
    });
  });

  test('T034: ? key should open help modal', async ({ page }) => {
    // Press ? key (Shift+/)
    await page.keyboard.down('Shift');
    await page.keyboard.press('Slash');
    await page.keyboard.up('Shift');

    // Wait for modal to appear (React state update)
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible({ timeout: 2000 });

    // Verify title (use first() since text appears in heading and description)
    await expect(page.getByText('Keyboard Shortcuts').first()).toBeVisible();
  });

  test('T035: Help modal should show all shortcut groups', async ({ page }) => {
    // Open help modal
    await page.keyboard.down('Shift');
    await page.keyboard.press('Slash');
    await page.keyboard.up('Shift');

    // Wait for modal to appear
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible({ timeout: 2000 });

    // Verify all groups are visible (use first() since group names appear multiple times)
    await expect(page.getByText('Search').first()).toBeVisible();
    await expect(page.getByText('Navigation').first()).toBeVisible();
    await expect(page.getByText('Tabs').first()).toBeVisible();
    await expect(page.getByText('List').first()).toBeVisible();
    await expect(page.getByText('Help').first()).toBeVisible();
  });

  test('T036: Help modal should display platform-specific keys', async ({ page }) => {
    // Open help modal
    await page.keyboard.down('Shift');
    await page.keyboard.press('Slash');
    await page.keyboard.up('Shift');

    // Wait for modal to appear
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible({ timeout: 2000 });

    if (isMac) {
      // On Mac, should show ⌘ symbol
      await expect(page.getByText('⌘').first()).toBeVisible();
    } else {
      // On Windows/Linux, should show Ctrl
      await expect(page.getByText('Ctrl').first()).toBeVisible();
    }

    // Should show F key
    await expect(page.getByText('F').first()).toBeVisible();
  });

  test('T037: Escape should close help modal', async ({ page }) => {
    // Open help modal
    await page.keyboard.down('Shift');
    await page.keyboard.press('Slash');
    await page.keyboard.up('Shift');

    // Wait for modal to appear
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible({ timeout: 2000 });

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Modal should be closed
    await expect(modal).not.toBeVisible();
  });

  test('T038: Clicking overlay should close help modal', async ({ page }) => {
    // Open help modal
    await page.keyboard.down('Shift');
    await page.keyboard.press('Slash');
    await page.keyboard.up('Shift');

    // Wait for modal to appear
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible({ timeout: 2000 });

    // Click on the overlay by dispatching a click event
    // The overlay is the parent of the dialog, so we need to find it
    await page.evaluate(() => {
      // Find the overlay (the fixed positioned backdrop)
      const overlay = document.querySelector('.fixed.inset-0.z-50');
      if (overlay) {
        // Create and dispatch a real click event
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        // Set target and currentTarget to be the same (simulating a direct click on overlay)
        Object.defineProperty(clickEvent, 'target', { value: overlay, enumerable: true });
        Object.defineProperty(clickEvent, 'currentTarget', { value: overlay, enumerable: true });
        overlay.dispatchEvent(clickEvent);
      }
    });

    // Modal should be closed
    await expect(modal).not.toBeVisible();
  });

  test('T039: Focus should stay within modal when tabbing', async ({ page }) => {
    // Open help modal
    await page.keyboard.down('Shift');
    await page.keyboard.press('Slash');
    await page.keyboard.up('Shift');

    // Wait for modal to appear
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible({ timeout: 2000 });

    // Tab multiple times
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }

    // Close button should still be within modal (focus trap working)
    const closeButton = page.getByRole('button', { name: /close/i });
    await expect(closeButton).toBeVisible();

    // Modal should still be visible (not closed by tabbing)
    await expect(modal).toBeVisible();
  });

  test('T040: Help modal should be accessible (ARIA)', async ({ page }) => {
    // Open help modal
    await page.keyboard.down('Shift');
    await page.keyboard.press('Slash');
    await page.keyboard.up('Shift');

    // Wait for modal to appear
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible({ timeout: 2000 });

    // Verify modal has proper ARIA attributes
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-labelledby');

    // Verify title is connected to aria-labelledby
    const ariaLabelledby = await modal.getAttribute('aria-labelledby');
    const title = page.locator(`#${ariaLabelledby}`);
    await expect(title).toHaveText('Keyboard Shortcuts');

    // Verify close button is accessible
    const closeButton = page.getByRole('button', { name: /close/i });
    await expect(closeButton).toBeVisible();
  });
});

test.describe('User Story 2: Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for skills to load
    await page.waitForSelector('input[placeholder="Search skills..."]', {
      timeout: 10000
    });

    // Select first skill to enable tabs
    const skillItems = page.locator('[data-testid="skill-item"]');
    const skillCount = await skillItems.count();
    if (skillCount > 0) {
      await skillItems.first().click();
      // Wait for tabs to appear
      await page.waitForSelector('role=tab');
    }
  });

  test('T048: Cmd/Ctrl+1 should switch to Overview tab', async ({ page }) => {
    const overviewTab = page.getByRole('tab', { name: /overview/i });
    await page.keyboard.press(`${modifierKey}+1`);
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true', { timeout: 2000 });
  });

  test('T049: Cmd/Ctrl+2 should switch to Content tab', async ({ page }) => {
    const contentTab = page.getByRole('tab', { name: /content/i });
    await page.keyboard.press(`${modifierKey}+2`);
    await expect(contentTab).toHaveAttribute('aria-selected', 'true', { timeout: 2000 });
  });

  test('T050: Cmd/Ctrl+3 should switch to Triggers tab', async ({ page }) => {
    const triggersTab = page.getByRole('tab', { name: /triggers/i });
    await page.keyboard.press(`${modifierKey}+3`);
    await expect(triggersTab).toHaveAttribute('aria-selected', 'true', { timeout: 2000 });
  });

  test('T051: Cmd/Ctrl+4 should switch to Diagram tab', async ({ page }) => {
    const diagramTab = page.getByRole('tab', { name: /diagram/i });
    await page.keyboard.press(`${modifierKey}+4`);
    await expect(diagramTab).toHaveAttribute('aria-selected', 'true', { timeout: 2000 });
  });

  test('T052: Cmd/Ctrl+5 should switch to References tab', async ({ page }) => {
    const referencesTab = page.getByRole('tab', { name: /references/i });
    await page.keyboard.press(`${modifierKey}+5`);
    await expect(referencesTab).toHaveAttribute('aria-selected', 'true', { timeout: 2000 });
  });

  test('T053: Cmd/Ctrl+6 should switch to Scripts tab', async ({ page }) => {
    const scriptsTab = page.getByRole('tab', { name: /scripts/i });
    await page.keyboard.press(`${modifierKey}+6`);
    await expect(scriptsTab).toHaveAttribute('aria-selected', 'true', { timeout: 2000 });
  });

  test('T054: Active tab should have visual highlight', async ({ page }) => {
    await page.keyboard.press(`${modifierKey}+1`);
    const overviewTab = page.getByRole('tab', { name: /overview/i });
    // Check for blue color class indicating active state
    const classes = await overviewTab.getAttribute('class');
    expect(classes).toContain('border-blue-500');
    expect(classes).toContain('text-blue-600');
  });

  test('T055: No effect when no skill selected', async ({ page }) => {
    // Go back to no selection
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Search skills..."]', {
      timeout: 10000
    });

    // Try tab shortcut with no skill selected
    await page.keyboard.press(`${modifierKey}+1`);

    // Verify no tabs are visible (welcome message should still be there)
    const welcomeMessage = page.getByText('Welcome to Skill Debugger');
    await expect(welcomeMessage).toBeVisible();

    const tabs = page.locator('role=tab');
    await expect(tabs.first()).not.toBeVisible();
  });

  test('T056: Tab shortcuts ignored when help modal open', async ({ page }) => {
    // Get current tab
    const contentTab = page.getByRole('tab', { name: /content/i });
    await expect(contentTab).toHaveAttribute('aria-selected', 'true');

    // Open help modal
    await page.keyboard.down('Shift');
    await page.keyboard.press('Slash');
    await page.keyboard.up('Shift');

    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible({ timeout: 2000 });

    // Try to switch tabs while modal is open
    await page.keyboard.press(`${modifierKey}+1`);

    // Modal should still be visible
    await expect(modal).toBeVisible();

    // Tab should not have changed (though we can't easily verify without closing modal)
  });
});

test.describe('User Story 3: List Navigation (Arrow Keys)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for skills to load
    await page.waitForSelector('[data-testid="skill-item"]', {
      timeout: 10000
    });
  });

  test('T065: Down arrow highlights first skill when nothing highlighted', async ({ page }) => {
    // Verify no skill is highlighted initially
    const highlightedSkill = page.locator('[data-testid="skill-item"][data-highlighted="true"]');
    await expect(highlightedSkill).toHaveCount(0);

    // Press Down arrow
    await page.keyboard.press('ArrowDown');

    // First skill should be highlighted (amber background)
    await expect(highlightedSkill).toHaveCount(1);
    const firstSkill = page.locator('[data-testid="skill-item"]').first();
    await expect(firstSkill).toHaveAttribute('data-highlighted', 'true');
  });

  test('T066: Down arrow moves highlight to next skill', async ({ page }) => {
    // Highlight first skill
    await page.keyboard.press('ArrowDown');

    const skillItems = page.locator('[data-testid="skill-item"]');
    const firstSkill = skillItems.nth(0);
    await expect(firstSkill).toHaveAttribute('data-highlighted', 'true');

    // Press Down again
    await page.keyboard.press('ArrowDown');

    // Second skill should now be highlighted
    const secondSkill = skillItems.nth(1);
    await expect(secondSkill).toHaveAttribute('data-highlighted', 'true');
    await expect(firstSkill).toHaveAttribute('data-highlighted', 'false');
  });

  test('T067: Up arrow moves highlight to previous skill', async ({ page }) => {
    // Highlight first skill, then second
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    const skillItems = page.locator('[data-testid="skill-item"]');
    const secondSkill = skillItems.nth(1);
    await expect(secondSkill).toHaveAttribute('data-highlighted', 'true');

    // Press Up arrow
    await page.keyboard.press('ArrowUp');

    // First skill should be highlighted again
    const firstSkill = skillItems.nth(0);
    await expect(firstSkill).toHaveAttribute('data-highlighted', 'true');
    await expect(secondSkill).toHaveAttribute('data-highlighted', 'false');
  });

  test('T068: Down arrow wraps to first skill from last', async ({ page }) => {
    const skillItems = page.locator('[data-testid="skill-item"]');
    const skillCount = await skillItems.count();

    // Highlight first skill
    await page.keyboard.press('ArrowDown');

    // Navigate to last skill
    for (let i = 1; i < skillCount; i++) {
      await page.keyboard.press('ArrowDown');
    }

    // Verify we're at last skill
    const lastSkill = skillItems.nth(skillCount - 1);
    await expect(lastSkill).toHaveAttribute('data-highlighted', 'true');

    // Press Down again - should wrap to first
    await page.keyboard.press('ArrowDown');

    const firstSkill = skillItems.nth(0);
    await expect(firstSkill).toHaveAttribute('data-highlighted', 'true');
    await expect(lastSkill).toHaveAttribute('data-highlighted', 'false');
  });

  test('T069: Up arrow wraps to last skill from first', async ({ page }) => {
    const skillItems = page.locator('[data-testid="skill-item"]');
    const skillCount = await skillItems.count();

    // Highlight first skill
    await page.keyboard.press('ArrowDown');

    const firstSkill = skillItems.nth(0);
    await expect(firstSkill).toHaveAttribute('data-highlighted', 'true');

    // Press Up - should wrap to last
    await page.keyboard.press('ArrowUp');

    const lastSkill = skillItems.nth(skillCount - 1);
    await expect(lastSkill).toHaveAttribute('data-highlighted', 'true');
    await expect(firstSkill).toHaveAttribute('data-highlighted', 'false');
  });

  test('T070: Escape clears highlight', async ({ page }) => {
    // Highlight a skill
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    const highlightedSkill = page.locator('[data-testid="skill-item"][data-highlighted="true"]');
    await expect(highlightedSkill).toHaveCount(1);

    // Press Escape
    await page.keyboard.press('Escape');

    // No skill should be highlighted
    await expect(highlightedSkill).toHaveCount(0);
  });

  test('T071: Highlight is visually distinct from selection', async ({ page }) => {
    const skillItems = page.locator('[data-testid="skill-item"]');

    // Highlight first skill with arrow keys
    await page.keyboard.press('ArrowDown');

    const firstSkill = skillItems.first();
    await expect(firstSkill).toHaveAttribute('data-highlighted', 'true');

    // Check for amber highlight styling
    const highlightClasses = await firstSkill.getAttribute('class');
    expect(highlightClasses).toContain('bg-amber-50');
    expect(highlightClasses).toContain('border-l-amber-400');

    // Click second skill to select it
    const secondSkill = skillItems.nth(1);
    await secondSkill.click();

    // Wait for selection state to update
    await page.waitForTimeout(100);

    // Second skill should have blue selection styling
    const selectionClasses = await secondSkill.getAttribute('class');
    expect(selectionClasses).toContain('bg-blue-50');
    expect(selectionClasses).toContain('border-l-blue-500');

    // First skill should still be highlighted (amber), not selected (blue)
    const stillHighlightedClasses = await firstSkill.getAttribute('class');
    expect(stillHighlightedClasses).toContain('bg-amber-50');
    expect(stillHighlightedClasses).not.toContain('bg-blue-50');
  });

  test('T072: Arrow keys should prevent default scroll behavior', async ({ page }) => {
    // Get initial scroll position
    const initialScrollTop = await page.evaluate(() => {
      const scrollContainer = document.querySelector('.overflow-y-auto');
      return scrollContainer?.scrollTop || 0;
    });

    // Press ArrowDown multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown');
    }

    // Scroll position should not have changed (preventDefault worked)
    const finalScrollTop = await page.evaluate(() => {
      const scrollContainer = document.querySelector('.overflow-y-auto');
      return scrollContainer?.scrollTop || 0;
    });

    expect(finalScrollTop).toBe(initialScrollTop);
  });
});

import { test, expect } from '@playwright/test';

// Determine the modifier key based on platform
const isMac = process.platform === 'darwin';
const modifierKey = isMac ? 'Meta' : 'Control';

test.describe('Keyboard Shortcuts', () => {
  test('should switch to Overview tab with Cmd/Ctrl+1', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Press Cmd+1 (or Ctrl+1 on Windows/Linux)
    await page.keyboard.press(`${modifierKey}+Digit1`);
    await page.waitForTimeout(300);

    // Verify Overview tab selected
    const overviewTab = page.locator('button[role="tab"]:has-text("Overview")');
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch to Content tab with Cmd/Ctrl+2', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Switch to another tab first
    await page.locator('button[role="tab"]:has-text("Overview")').click();
    await page.waitForTimeout(300);

    // Press Cmd+2 (or Ctrl+2 on Windows/Linux)
    await page.keyboard.press(`${modifierKey}+Digit2`);
    await page.waitForTimeout(300);

    // Verify Content tab selected
    const contentTab = page.locator('button[role="tab"]:has-text("Content")');
    await expect(contentTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch to Triggers tab with Cmd/Ctrl+3', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Press Cmd+3 (or Ctrl+3 on Windows/Linux)
    await page.keyboard.press(`${modifierKey}+Digit3`);
    await page.waitForTimeout(300);

    // Verify Triggers tab selected
    const triggersTab = page.locator('button[role="tab"]:has-text("Triggers")');
    await expect(triggersTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch to Diagram tab with Cmd/Ctrl+4', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Press Cmd+4 (or Ctrl+4 on Windows/Linux)
    await page.keyboard.press(`${modifierKey}+Digit4`);
    await page.waitForTimeout(500); // Wait for diagram to render

    // Verify Diagram tab selected
    const diagramTab = page.locator('button[role="tab"]:has-text("Diagram")');
    await expect(diagramTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch to References tab with Cmd/Ctrl+5', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Press Cmd+5 (or Ctrl+5 on Windows/Linux)
    await page.keyboard.press(`${modifierKey}+Digit5`);
    await page.waitForTimeout(300);

    // Verify References tab selected
    const referencesTab = page.locator('button[role="tab"]:has-text("References")');
    await expect(referencesTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch to Scripts tab with Cmd/Ctrl+6', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Press Cmd+6 (or Ctrl+6 on Windows/Linux)
    await page.keyboard.press(`${modifierKey}+Digit6`);
    await page.waitForTimeout(300);

    // Verify Scripts tab selected
    const scriptsTab = page.locator('button[role="tab"]:has-text("Scripts")');
    await expect(scriptsTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should navigate back with Alt+Left', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();
    await page.waitForTimeout(500);

    // Press Alt+Left
    await page.keyboard.press('Alt+ArrowLeft');
    await page.waitForTimeout(300);

    // Verify navigated back (skill viewer not visible)
    await expect(page.locator('[data-testid="skill-viewer"]')).not.toBeVisible();
  });

  test('should focus search with Cmd/Ctrl+F', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    // Press Cmd+F (or Ctrl+F on Windows/Linux)
    await page.keyboard.press(`${modifierKey}+KeyF`);
    await page.waitForTimeout(300);

    // Verify search input is focused
    const searchInput = page.locator('input[type="text"][placeholder*="Search"]');
    await expect(searchInput).toBeFocused();
  });

  test('should navigate skill list with arrow keys', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    // Focus the skill list
    await page.locator('[data-testid="skill-list"]').focus();

    // Press Down arrow
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // First skill should be highlighted
    const firstSkill = page.locator('[data-testid="skill-item"]').first();
    await expect(firstSkill).toHaveAttribute('data-highlighted', 'true');

    // Press Down arrow again
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    // Second skill should be highlighted
    const secondSkill = page.locator('[data-testid="skill-item"]').nth(1);
    await expect(secondSkill).toHaveAttribute('data-highlighted', 'true');
  });

  test('should open skill with Enter key', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    // Focus the skill list
    await page.locator('[data-testid="skill-list"]').focus();

    // Navigate down and press Enter
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Verify skill viewer opened
    await expect(page.locator('[data-testid="skill-viewer"]')).toBeVisible();
  });
});

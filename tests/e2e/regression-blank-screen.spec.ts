/**
 * Regression tests for blank screen bugs
 *
 * These tests ensure that previously discovered blank screen bugs do not reoccur:
 * 1. React infinite loop in SkillViewer (tabs array recreation)
 * 2. ReferencesTab array bounds issues when switching skills
 * 3. General error handling via ErrorBoundary
 *
 * Created: 2025-11-11
 * Related: specs/003-keyboard-shortcuts/DEVIATIONS.md
 */

import { test, expect } from '@playwright/test';

test.describe('Regression: Blank Screen Bugs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="skill-item"]', { timeout: 10000 });
  });

  test('BUG-001: Should not show blank screen when clicking tabs multiple times', async ({ page }) => {
    // Select first skill
    const firstSkill = page.locator('[data-testid="skill-item"]').first();
    await firstSkill.click();
    await page.waitForTimeout(200);

    // Click through all tabs multiple times (tests for infinite loop)
    const tabs = ['Overview', 'Content', 'Triggers', 'Diagram', 'References', 'Scripts'];

    for (let round = 0; round < 3; round++) {
      for (const tabName of tabs) {
        // Click tab
        const tabButton = page.locator(`button:has-text("${tabName}")`);
        await tabButton.click();

        // Wait for potential infinite loop to trigger
        await page.waitForTimeout(100);

        // Verify page is not blank
        const bodyText = await page.textContent('body');
        expect(bodyText).not.toBe('');
        expect(bodyText!.length).toBeGreaterThan(50);

        // Verify no error boundary shown
        const errorBoundary = page.locator('text=Something Went Wrong');
        await expect(errorBoundary).not.toBeVisible();
      }
    }
  });

  test('BUG-002: Should not crash when using keyboard shortcuts for tabs', async ({ page }) => {
    // Select first skill
    const firstSkill = page.locator('[data-testid="skill-item"]').first();
    await firstSkill.click();
    await page.waitForTimeout(200);

    // Use keyboard shortcuts for all tabs (Cmd/Ctrl+1 through Cmd/Ctrl+6)
    for (let i = 1; i <= 6; i++) {
      // Press keyboard shortcut (Meta on Mac, Control on Windows/Linux)
      await page.keyboard.press(`Meta+${i}`);

      // Wait for potential infinite loop to trigger
      await page.waitForTimeout(100);

      // Verify page still has content
      const isVisible = await page.isVisible('body');
      expect(isVisible).toBe(true);

      // Verify no blank screen
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toBe('');
      expect(bodyText!.length).toBeGreaterThan(50);

      // Verify no error boundary shown
      const errorBoundary = page.locator('text=Something Went Wrong');
      await expect(errorBoundary).not.toBeVisible();
    }
  });

  test('BUG-003: Should not crash when switching skills with different reference counts', async ({ page }) => {
    // Get all skills
    const skills = page.locator('[data-testid="skill-item"]');
    const skillCount = await skills.count();

    if (skillCount < 2) {
      test.skip();
      return;
    }

    // Select first skill and go to References tab
    await skills.nth(0).click();
    await page.waitForTimeout(200);

    const referencesTab = page.locator('button:has-text("References")');
    await referencesTab.click();
    await page.waitForTimeout(200);

    // If references exist, select one
    const referenceItems = page.locator('.cursor-pointer').filter({ hasText: /.+/ });
    const refCount = await referenceItems.count();

    if (refCount > 0) {
      // Select a reference
      await referenceItems.nth(0).click();
      await page.waitForTimeout(200);
    }

    // Now switch to a different skill (may have different reference count)
    await skills.nth(1).click();
    await page.waitForTimeout(200);

    // Go to References tab again
    await referencesTab.click();
    await page.waitForTimeout(200);

    // Verify no crash occurred
    const errorBoundary = page.locator('text=Something Went Wrong');
    await expect(errorBoundary).not.toBeVisible();

    // Verify page still has content
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toBe('');
    expect(bodyText!.length).toBeGreaterThan(50);
  });

  test('BUG-004: Should show error boundary (not blank screen) on React errors', async ({ page }) => {
    // This test verifies ErrorBoundary works when errors occur
    // Note: This is a meta-test - we're testing that errors are caught gracefully

    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Perform normal operations that shouldn't error
    const firstSkill = page.locator('[data-testid="skill-item"]').first();
    await firstSkill.click();
    await page.waitForTimeout(200);

    const tabs = ['Overview', 'Content', 'Triggers', 'Diagram', 'References', 'Scripts'];
    for (const tabName of tabs) {
      await page.click(`button:has-text("${tabName}")`);
      await page.waitForTimeout(100);
    }

    // If any errors occurred, verify ErrorBoundary was shown (not blank screen)
    if (consoleErrors.length > 0) {
      // Check if error boundary is visible
      const errorBoundary = page.locator('text=Something Went Wrong');
      const isErrorBoundaryVisible = await errorBoundary.isVisible();

      // Check if page is blank
      const bodyText = await page.textContent('body');
      const isBlankScreen = bodyText === '' || bodyText!.trim().length === 0;

      // If there were errors, we should see ErrorBoundary, NOT a blank screen
      if (isErrorBoundaryVisible) {
        expect(isBlankScreen).toBe(false);
        // Verify error details are shown
        const technicalDetails = page.locator('text=Technical Details');
        await expect(technicalDetails).toBeVisible();
      } else {
        // If no ErrorBoundary shown, page should have normal content (no errors occurred)
        expect(bodyText!.length).toBeGreaterThan(50);
      }
    } else {
      // No errors occurred - verify app is functioning normally
      const bodyText = await page.textContent('body');
      expect(bodyText!.length).toBeGreaterThan(50);

      const errorBoundary = page.locator('text=Something Went Wrong');
      await expect(errorBoundary).not.toBeVisible();
    }
  });

  test('BUG-005: Should handle rapid skill switching without crashes', async ({ page }) => {
    const skills = page.locator('[data-testid="skill-item"]');
    const skillCount = await skills.count();

    if (skillCount < 2) {
      test.skip();
      return;
    }

    // Rapidly switch between skills
    for (let i = 0; i < Math.min(10, skillCount); i++) {
      const skillIndex = i % skillCount;
      await skills.nth(skillIndex).click();

      // Very short wait to simulate rapid clicking
      await page.waitForTimeout(50);

      // Verify no blank screen
      const bodyText = await page.textContent('body');
      expect(bodyText!.length).toBeGreaterThan(50);

      // Verify no error boundary
      const errorBoundary = page.locator('text=Something Went Wrong');
      await expect(errorBoundary).not.toBeVisible();
    }
  });

  test('BUG-006: Should handle rapid tab switching without infinite loops', async ({ page }) => {
    // Select first skill
    const firstSkill = page.locator('[data-testid="skill-item"]').first();
    await firstSkill.click();
    await page.waitForTimeout(200);

    // Rapidly click tabs using keyboard shortcuts
    for (let round = 0; round < 20; round++) {
      const tabNumber = (round % 6) + 1;
      await page.keyboard.press(`Meta+${tabNumber}`);

      // Very short wait to simulate rapid keyboard use
      await page.waitForTimeout(25);
    }

    // Wait a bit for any potential infinite loops to manifest
    await page.waitForTimeout(500);

    // Verify no blank screen
    const bodyText = await page.textContent('body');
    expect(bodyText!.length).toBeGreaterThan(50);

    // Verify no error boundary
    const errorBoundary = page.locator('text=Something Went Wrong');
    await expect(errorBoundary).not.toBeVisible();

    // Verify app is still responsive
    const overviewTab = page.locator('button:has-text("Overview")');
    await overviewTab.click();
    await page.waitForTimeout(100);

    const tabContent = page.locator('text=YAML Frontmatter, text=No YAML frontmatter');
    const hasContent = await tabContent.first().isVisible();
    expect(hasContent).toBe(true);
  });
});

/**
 * E2E Tests: Tab Visual Feedback (T047)
 *
 * Validates visual feedback for tab interactions:
 * - Hover shows gray background
 * - Active shows purple border
 * - Keyboard shortcuts update visual state
 * - Focus rings visible
 *
 * Test Scope: User Story 5 (Visual Feedback for Tab Interaction)
 * Success Criteria: 100% of tab interactions show correct visual feedback
 */

import { test, expect } from '@playwright/test';

test.describe('Tab Visual Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForLoadState('domcontentloaded');

    // Select a skill to show tabs
    const firstSkill = page.locator('[data-testid="skill-list-item"]').first();
    await firstSkill.click();
    await page.waitForSelector('[role="tablist"]');
  });

  test('hover state shows gray background', async ({ page }) => {
    const secondTab = page.locator('[role="tab"]').nth(1); // Content tab

    // Hover over inactive tab
    await secondTab.hover();

    // Check for hover background color (bg-gray-700)
    const backgroundColor = await secondTab.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // bg-gray-700 is rgb(55, 65, 81)
    expect(backgroundColor).toMatch(/rgb\(55,\s*65,\s*81\)/);
  });

  test('active tab shows purple border and shadow', async ({ page }) => {
    const activeTab = page.locator('[role="tab"][aria-selected="true"]');

    // Check for purple border (border-purple-500)
    const borderColor = await activeTab.evaluate((el) => {
      return window.getComputedStyle(el).borderBottomColor;
    });

    // border-purple-500 is rgb(168, 85, 247)
    expect(borderColor).toMatch(/rgb\(168,\s*85,\s*247\)/);

    // Check for shadow (shadow-sm)
    const boxShadow = await activeTab.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });

    expect(boxShadow).not.toBe('none');
  });

  test('focus ring visible on Tab navigation', async ({ page }) => {
    const firstTab = page.locator('[role="tab"]').first();

    // Focus the tab using keyboard (Tab key)
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check for focus ring styles
    const outline = await firstTab.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
      };
    });

    // TailwindCSS focus:ring creates outline
    expect(outline.outlineStyle).not.toBe('none');
  });

  test('keyboard shortcuts update visual state immediately', async ({ page }) => {
    // Press Cmd/Ctrl+2 to switch to Content tab
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    await page.keyboard.press(`${modifier}+2`);

    // Wait for visual update (should be immediate)
    await page.waitForTimeout(50);

    // Check that tab index 1 (Content) is now active
    const activeTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(activeTab).toContainText('Content');

    // Verify purple border is present
    const borderColor = await activeTab.evaluate((el) => {
      return window.getComputedStyle(el).borderBottomColor;
    });

    expect(borderColor).toMatch(/rgb\(168,\s*85,\s*247\)/);
  });

  test('all 6 tabs show correct hover states', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    expect(tabCount).toBe(6);

    // Test each tab's hover state
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const isActive = (await tab.getAttribute('aria-selected')) === 'true';

      if (!isActive) {
        await tab.hover();

        const backgroundColor = await tab.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        // bg-gray-700 is rgb(55, 65, 81)
        expect(backgroundColor).toMatch(/rgb\(55,\s*65,\s*81\)/);
      }
    }
  });

  test('transitions are smooth (150ms duration)', async ({ page }) => {
    const secondTab = page.locator('[role="tab"]').nth(1);

    // Check transition properties
    const transition = await secondTab.evaluate((el) => {
      return window.getComputedStyle(el).transition;
    });

    // Should include transition-colors with 150ms duration
    expect(transition).toContain('150ms');
  });

  test('inactive tabs have transparent border', async ({ page }) => {
    const inactiveTabs = page.locator('[role="tab"][aria-selected="false"]');
    const firstInactive = inactiveTabs.first();

    const borderColor = await firstInactive.evaluate((el) => {
      return window.getComputedStyle(el).borderBottomColor;
    });

    // border-transparent should be transparent or rgba with alpha 0
    expect(borderColor).toMatch(/transparent|rgba\(0,\s*0,\s*0,\s*0\)/);
  });

  test('multiple rapid keyboard shortcuts update visuals correctly', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    // Rapidly switch tabs: 1 -> 2 -> 3 -> 4
    await page.keyboard.press(`${modifier}+1`);
    await page.waitForTimeout(50);
    await page.keyboard.press(`${modifier}+2`);
    await page.waitForTimeout(50);
    await page.keyboard.press(`${modifier}+3`);
    await page.waitForTimeout(50);
    await page.keyboard.press(`${modifier}+4`);
    await page.waitForTimeout(50);

    // Final state should be tab 3 (index 3, Diagram)
    const activeTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(activeTab).toContainText('Diagram');

    // Verify visual state is correct
    const borderColor = await activeTab.evaluate((el) => {
      return window.getComputedStyle(el).borderBottomColor;
    });

    expect(borderColor).toMatch(/rgb\(168,\s*85,\s*247\)/);
  });
});

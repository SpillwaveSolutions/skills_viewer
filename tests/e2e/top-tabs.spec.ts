/**
 * End-to-end tests for top tabs feature
 *
 * Tests cover:
 * - Top tabs visible and positioned correctly
 * - Tab switching works in running application
 * - Visual appearance matches design spec (purple borders, hover states)
 * - Keyboard shortcuts work end-to-end
 * - Tabs persist across page refreshes
 * - Screen reader announces tab changes
 */

import { test, expect } from '@playwright/test';

test.describe('Top Tabs Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and wait for skills to load
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]', { timeout: 10000 });

    // Click on first skill to open SkillViewer
    const firstSkill = page.locator('[data-testid="skill-item"]').first();
    await firstSkill.click();

    // Wait for skill viewer to load
    await page.waitForSelector('[data-testid="skill-viewer"]', { timeout: 5000 });
  });

  test.describe('Tab Bar Rendering', () => {
    test('should display tab bar at top of skill viewer', async ({ page }) => {
      const tabBar = page.locator('[role="tablist"]');
      await expect(tabBar).toBeVisible();

      // Get position of tab bar and skill header
      const tabBarBox = await tabBar.boundingBox();
      const skillViewer = page.locator('[data-testid="skill-viewer"]');
      const skillViewerBox = await skillViewer.boundingBox();

      // TabBar should be near top of SkillViewer
      expect(tabBarBox).toBeTruthy();
      expect(skillViewerBox).toBeTruthy();
      expect(tabBarBox!.y).toBeLessThan(skillViewerBox!.y + 200);
    });

    test('should display all 6 tabs in correct order', async ({ page }) => {
      const tabs = page.locator('[role="tab"]');
      await expect(tabs).toHaveCount(6);

      // Verify tab labels in order
      const expectedLabels = [
        'Overview',
        'Content',
        'Triggers',
        'Diagram',
        'References',
        'Scripts',
      ];
      for (let i = 0; i < expectedLabels.length; i++) {
        const tab = tabs.nth(i);
        await expect(tab).toContainText(expectedLabels[i]);
      }
    });

    test('should display tab icons', async ({ page }) => {
      const expectedIcons = ['📊', '📄', '⚡', '🔷', '📚', '📜'];

      for (const icon of expectedIcons) {
        const tabWithIcon = page.locator('[role="tab"]', { hasText: icon });
        await expect(tabWithIcon).toBeVisible();
      }
    });

    test('should display keyboard shortcut hints (1-6)', async ({ page }) => {
      const tabs = page.locator('[role="tab"]');

      for (let i = 1; i <= 6; i++) {
        const tab = tabs.nth(i - 1);
        await expect(tab).toContainText(String(i));
      }
    });
  });

  test.describe('Tab Switching via Click', () => {
    test('should switch to Content tab when clicked', async ({ page }) => {
      const contentTab = page.locator('[role="tab"][aria-label*="Content tab"]');
      await contentTab.click();

      // Content tab should be active
      await expect(contentTab).toHaveAttribute('aria-selected', 'true');

      // Content area should be visible
      const contentArea = page.locator('[data-testid="content-tab"]');
      await expect(contentArea).toBeVisible();
    });

    test('should switch to Diagram tab when clicked', async ({ page }) => {
      const diagramTab = page.locator('[role="tab"][aria-label*="Diagram tab"]');
      await diagramTab.click();

      await expect(diagramTab).toHaveAttribute('aria-selected', 'true');

      // Diagram should be visible
      const diagramArea = page.locator('[data-testid="diagram-tab"]');
      await expect(diagramArea).toBeVisible();
    });

    test('should cycle through all tabs correctly', async ({ page }) => {
      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();

      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        await tab.click();

        // This tab should be active
        await expect(tab).toHaveAttribute('aria-selected', 'true');

        // All other tabs should be inactive
        for (let j = 0; j < tabCount; j++) {
          if (j !== i) {
            const otherTab = tabs.nth(j);
            await expect(otherTab).toHaveAttribute('aria-selected', 'false');
          }
        }
      }
    });
  });

  test.describe('Visual Styling', () => {
    test('should show purple border on active tab', async ({ page }) => {
      const overviewTab = page.locator('[role="tab"][aria-label*="Overview tab"]');

      // Get computed style
      const borderColor = await overviewTab.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.borderBottomColor;
      });

      // Purple border should be visible (rgb(168, 85, 247) = purple-500)
      expect(borderColor).toContain('168, 85, 247');
    });

    test('should show transparent border on inactive tabs', async ({ page }) => {
      const contentTab = page.locator('[role="tab"][aria-label*="Content tab"]');

      // Content tab should be inactive initially
      const borderColor = await contentTab.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.borderBottomColor;
      });

      // Should have transparent or matching background border
      expect(borderColor).toMatch(/transparent|rgba\(0, 0, 0, 0\)/);
    });

    test('should show hover effect on tabs', async ({ page }) => {
      const contentTab = page.locator('[role="tab"][aria-label*="Content tab"]');

      // Hover over tab
      await contentTab.hover();

      // Give time for CSS transition
      await page.waitForTimeout(100);

      // Background should change on hover
      const bgColor = await contentTab.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.backgroundColor;
      });

      // Should have gray background on hover
      expect(bgColor).not.toContain('rgba(0, 0, 0, 0)');
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('should switch to Overview tab with Cmd/Ctrl+1', async ({ page }) => {
      const isMac = process.platform === 'darwin';
      const modifier = isMac ? 'Meta' : 'Control';

      // Press Cmd/Ctrl+1
      await page.keyboard.press(`${modifier}+Digit1`);

      const overviewTab = page.locator('[role="tab"][aria-label*="Overview tab"]');
      await expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    });

    test('should switch to Diagram tab with Cmd/Ctrl+4', async ({ page }) => {
      const isMac = process.platform === 'darwin';
      const modifier = isMac ? 'Meta' : 'Control';

      // Press Cmd/Ctrl+4
      await page.keyboard.press(`${modifier}+Digit4`);

      const diagramTab = page.locator('[role="tab"][aria-label*="Diagram tab"]');
      await expect(diagramTab).toHaveAttribute('aria-selected', 'true');
    });

    test('should cycle through all tabs with Cmd/Ctrl+1-6', async ({ page }) => {
      const isMac = process.platform === 'darwin';
      const modifier = isMac ? 'Meta' : 'Control';

      const tabLabels = ['Overview', 'Content', 'Triggers', 'Diagram', 'References', 'Scripts'];

      for (let i = 1; i <= 6; i++) {
        await page.keyboard.press(`${modifier}+Digit${i}`);

        const activeTab = page.locator(`[role="tab"][aria-label*="${tabLabels[i - 1]} tab"]`);
        await expect(activeTab).toHaveAttribute('aria-selected', 'true');
      }
    });
  });

  test.describe('Space Gain Verification', () => {
    test('should provide more vertical space for content', async ({ page }) => {
      // Switch to Diagram tab
      const diagramTab = page.locator('[role="tab"][aria-label*="Diagram tab"]');
      await diagramTab.click();

      // Get diagram area height
      const diagramArea = page.locator('[data-testid="diagram-tab"]');
      const diagramBox = await diagramArea.boundingBox();

      // Diagram should have at least 600px height (target is +200px from old design)
      expect(diagramBox).toBeTruthy();
      expect(diagramBox!.height).toBeGreaterThan(600);
    });

    test('should not have bottom tab bar', async ({ page }) => {
      // Old design had tabs at bottom - verify they're gone
      const bottomTabs = page.locator('[data-testid="bottom-tabs"]');
      await expect(bottomTabs).not.toBeVisible();
    });
  });

  test.describe('State Persistence', () => {
    test('should persist active tab across page refresh', async ({ page }) => {
      // Switch to References tab
      const referencesTab = page.locator('[role="tab"][aria-label*="References tab"]');
      await referencesTab.click();

      await expect(referencesTab).toHaveAttribute('aria-selected', 'true');

      // Refresh page
      await page.reload();

      // Wait for skill viewer to load again
      await page.waitForSelector('[data-testid="skill-viewer"]', { timeout: 5000 });

      // Click same skill again
      const firstSkill = page.locator('[data-testid="skill-item"]').first();
      await firstSkill.click();

      // References tab should still be active (from keyboardStore persistence)
      const referencesTabAfter = page.locator('[role="tab"][aria-label*="References tab"]');
      await expect(referencesTabAfter).toHaveAttribute('aria-selected', 'true');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA roles', async ({ page }) => {
      // TabList role
      const tabList = page.locator('[role="tablist"]');
      await expect(tabList).toBeVisible();

      // Tab roles
      const tabs = page.locator('[role="tab"]');
      await expect(tabs).toHaveCount(6);
    });

    test('should have ARIA labels for screen readers', async ({ page }) => {
      const expectedLabels = [
        'Overview tab',
        'Content tab',
        'Triggers tab',
        'Diagram tab',
        'References tab',
        'Scripts tab',
      ];

      for (const label of expectedLabels) {
        const tab = page.locator(`[role="tab"][aria-label*="${label}"]`);
        await expect(tab).toBeVisible();
      }
    });

    test('should update aria-selected when switching tabs', async ({ page }) => {
      const contentTab = page.locator('[role="tab"][aria-label*="Content tab"]');

      // Initially not selected
      await expect(contentTab).toHaveAttribute('aria-selected', 'false');

      // Click tab
      await contentTab.click();

      // Now selected
      await expect(contentTab).toHaveAttribute('aria-selected', 'true');
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Tab to TabBar
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // First tab should be focused
      const overviewTab = page.locator('[role="tab"][aria-label*="Overview tab"]');
      await expect(overviewTab).toBeFocused();

      // Arrow right to next tab
      await page.keyboard.press('ArrowRight');

      const contentTab = page.locator('[role="tab"][aria-label*="Content tab"]');
      await expect(contentTab).toBeFocused();
    });
  });

  test.describe('Cross-Platform Consistency', () => {
    test('should display identically across viewport sizes', async ({ page }) => {
      const viewportSizes = [
        { width: 1024, height: 768 },
        { width: 1440, height: 900 },
        { width: 1920, height: 1080 },
      ];

      for (const size of viewportSizes) {
        await page.setViewportSize(size);

        // TabBar should remain visible
        const tabBar = page.locator('[role="tablist"]');
        await expect(tabBar).toBeVisible();

        // All 6 tabs should be visible
        const tabs = page.locator('[role="tab"]');
        await expect(tabs).toHaveCount(6);
      }
    });
  });
});

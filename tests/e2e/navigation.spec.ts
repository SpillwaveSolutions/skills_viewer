import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should enable back button after selecting skill', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Verify back button enabled
    const backButton = page.locator('button[aria-label="Return to skills list"]');
    await expect(backButton).toBeVisible();
    await expect(backButton).toBeEnabled();
  });

  test('should navigate back when back button clicked', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();
    await page.waitForTimeout(500);

    // Verify skill viewer is visible
    await expect(page.locator('[data-testid="skill-viewer"]')).toBeVisible();

    // Click back
    await page.locator('button[aria-label="Return to skills list"]').click();

    // Verify back at list (no skill viewer)
    await expect(page.locator('[data-testid="skill-viewer"]')).not.toBeVisible();

    // Verify skill list is visible
    await expect(page.locator('[data-testid="skill-list"]')).toBeVisible();
  });

  test('should maintain skill list selection when navigating back', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    // Click first skill
    const firstSkill = page.locator('[data-testid="skill-item"]').first();
    await firstSkill.click();

    // Navigate back
    await page.locator('button[aria-label="Return to skills list"]').click();

    // The skill should still be marked as selected in the list
    const selectedSkill = page.locator('[data-testid="skill-item"][aria-selected="true"]');
    await expect(selectedSkill).toBeVisible();
  });

  test('should allow selecting different skill after navigating back', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    // Click first skill
    await page.locator('[data-testid="skill-item"]').first().click();
    await page.waitForTimeout(300);

    // Navigate back
    await page.locator('button[aria-label="Return to skills list"]').click();
    await page.waitForTimeout(300);

    // Click second skill (if exists)
    const skillCount = await page.locator('[data-testid="skill-item"]').count();
    if (skillCount > 1) {
      const secondSkill = page.locator('[data-testid="skill-item"]').nth(1);
      await secondSkill.click();

      // Verify skill viewer opened again
      await expect(page.locator('[data-testid="skill-viewer"]')).toBeVisible();
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Skill Discovery', () => {
  test('should load and display skill list on startup', async ({ page }) => {
    await page.goto('http://localhost:1420');

    // Wait for skills to load
    await page.waitForSelector('[data-testid="skill-list"]', { timeout: 10000 });

    // Verify skills are displayed
    const skillItems = page.locator('[data-testid="skill-item"]');
    const count = await skillItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display skill name and location', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    const firstSkill = page.locator('[data-testid="skill-item"]').first();
    await expect(firstSkill).toContainText(/\w+/); // Has some text

    // Verify location badge is present (either "claude" or "opencode")
    const locationBadge = firstSkill.locator('span.text-xs.px-2.py-0\\.5.rounded');
    await expect(locationBadge).toBeVisible();
    const locationText = await locationBadge.textContent();
    expect(['claude', 'opencode']).toContain(locationText);
  });

  test('should show skill count', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    // Check for skill count display (format: "X of Y skills")
    const countDisplay = page.locator('text=/\\d+ of \\d+ skills/');
    await expect(countDisplay).toBeVisible();
  });

  test('should show refresh button', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    const refreshButton = page.locator('button[aria-label="Refresh skill list"]');
    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeEnabled();
  });

  test('should show filter button', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    const filterButton = page.locator('button[aria-label="Open filter panel"]');
    await expect(filterButton).toBeVisible();
    await expect(filterButton).toBeEnabled();
  });
});

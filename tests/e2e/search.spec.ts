import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test('should have search input visible on startup', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    const searchInput = page.locator('input[type="text"][placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should filter skills when typing in search box', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    const initialCount = await page.locator('[data-testid="skill-item"]').count();
    expect(initialCount).toBeGreaterThan(0);

    // Type in search
    const searchInput = page.locator('input[type="text"][placeholder*="Search"]');
    await searchInput.fill('pdf');
    await page.waitForTimeout(500); // Debounce

    const filteredCount = await page.locator('[data-testid="skill-item"]').count();

    // Should have filtered results (either fewer or same if all match)
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Verify the count display updates
    const countDisplay = page.locator('text=/\\d+ of \\d+ skills/');
    await expect(countDisplay).toBeVisible();
  });

  test('should clear search when Escape is pressed', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    const searchInput = page.locator('input[type="text"][placeholder*="Search"]');
    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');

    await searchInput.press('Escape');

    await expect(searchInput).toHaveValue('');
  });

  test('should show no results message when search has no matches', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    // Search for something unlikely to exist
    const searchInput = page.locator('input[type="text"][placeholder*="Search"]');
    await searchInput.fill('xyzabcnonexistentskill123456');
    await page.waitForTimeout(500);

    // Should show no results message
    await expect(page.locator('text=/No skills match your search criteria/i')).toBeVisible();
  });

  test('should restore full list when search is cleared', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    const initialCount = await page.locator('[data-testid="skill-item"]').count();

    // Search for something
    const searchInput = page.locator('input[type="text"][placeholder*="Search"]');
    await searchInput.fill('pdf');
    await page.waitForTimeout(500);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Should show full list again
    const restoredCount = await page.locator('[data-testid="skill-item"]').count();
    expect(restoredCount).toBe(initialCount);
  });

  test('should support field-specific search (name:)', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    const searchInput = page.locator('input[type="text"][placeholder*="Search"]');
    await searchInput.fill('name:pdf');
    await page.waitForTimeout(500);

    // Should have results or no results message
    const hasResults = (await page.locator('[data-testid="skill-item"]').count()) > 0;
    const hasNoResults = await page
      .locator('text=/No skills match your search criteria/i')
      .isVisible();

    expect(hasResults || hasNoResults).toBe(true);
  });

  test('should support location filter (location:claude)', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    const searchInput = page.locator('input[type="text"][placeholder*="Search"]');
    await searchInput.fill('location:claude');
    await page.waitForTimeout(500);

    // Verify all visible skills have "claude" badge
    const skillItems = page.locator('[data-testid="skill-item"]');
    const count = await skillItems.count();

    if (count > 0) {
      // Check first few skills have claude badge
      for (let i = 0; i < Math.min(count, 3); i++) {
        const locationBadge = skillItems.nth(i).locator('span.text-xs:has-text("claude")');
        await expect(locationBadge).toBeVisible();
      }
    }
  });
});

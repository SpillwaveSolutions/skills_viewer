import { test, expect } from '@playwright/test';

test.describe('Skill Viewing', () => {
  test('should open skill viewer when skill is clicked', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    // Click first skill
    const firstSkill = page.locator('[data-testid="skill-item"]').first();
    await firstSkill.click();

    // Verify skill viewer opened
    await expect(page.locator('[data-testid="skill-viewer"]')).toBeVisible();
  });

  test('should display all tabs (Overview, Content, Triggers, Diagram, References, Scripts)', async ({
    page,
  }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Verify tabs exist (in order: Overview, Content, Triggers, Diagram, References, Scripts)
    await expect(page.locator('button[role="tab"]:has-text("Overview")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Content")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Triggers")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Diagram")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("References")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Scripts")')).toBeVisible();
  });

  test('should default to Content tab when skill is opened', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Verify Content tab is active by default
    const contentTab = page.locator('button[role="tab"]:has-text("Content")');
    await expect(contentTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch tabs when tab is clicked', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Click References tab
    await page.locator('button[role="tab"]:has-text("References")').click();

    // Verify References tab is active
    const referencesTab = page.locator('button[role="tab"]:has-text("References")');
    await expect(referencesTab).toHaveAttribute('aria-selected', 'true');

    // Verify References panel visible
    await expect(page.locator('[role="tabpanel"][id="tabpanel-references"]')).toBeVisible();
  });

  test('should display skill name in viewer', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    // Get the skill name from the list
    const firstSkill = page.locator('[data-testid="skill-item"]').first();
    const skillName = await firstSkill.locator('h3').textContent();

    await firstSkill.click();

    // Verify skill name is displayed in the viewer
    await expect(page.locator('[data-testid="skill-viewer"]')).toContainText(skillName || '');
  });

  test('should show back button in skill viewer', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Verify back button exists and is visible
    const backButton = page.locator('button[aria-label="Return to skills list"]');
    await expect(backButton).toBeVisible();
    await expect(backButton).toContainText('Back to Skills');
  });
});

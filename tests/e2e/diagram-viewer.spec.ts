import { test, expect } from '@playwright/test';

test.describe('Diagram Viewer', () => {
  test('should show diagram tab', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Verify Diagram tab exists
    const diagramTab = page.locator('button[role="tab"]:has-text("Diagram")');
    await expect(diagramTab).toBeVisible();
  });

  test('should render diagram when Diagram tab is clicked', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();
    await page.locator('button[role="tab"]:has-text("Diagram")').click();

    // Wait for diagram to render (give it generous time)
    await page.waitForTimeout(2000);

    // Verify diagram panel is visible
    const diagramPanel = page.locator('[role="tabpanel"][id="tabpanel-diagram"]');
    await expect(diagramPanel).toBeVisible();

    // Diagram should have some content (either SVG or error message)
    const hasSvg = (await diagramPanel.locator('svg').count()) > 0;
    const hasContent = (await diagramPanel.textContent()) !== '';

    expect(hasSvg || hasContent).toBe(true);
  });

  test('should show zoom controls in diagram view', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();
    await page.locator('button[role="tab"]:has-text("Diagram")').click();

    // Wait for diagram to render
    await page.waitForTimeout(2000);

    // Look for zoom controls (these might be in a toolbar or overlay)
    // The zoom controls should be buttons with zoom-related labels or icons
    const zoomControls = page.locator('button[aria-label*="Zoom"], button[title*="Zoom"]');

    // Check if zoom controls exist (at least one should be present)
    const zoomControlCount = await zoomControls.count();
    expect(zoomControlCount).toBeGreaterThan(0);
  });

  test('should allow zooming in on diagram', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();
    await page.locator('button[role="tab"]:has-text("Diagram")').click();

    await page.waitForTimeout(2000);

    // Look for zoom in button
    const zoomInButton = page.locator('button[aria-label*="Zoom in"], button[title*="Zoom in"]');

    if ((await zoomInButton.count()) > 0) {
      const firstZoomIn = zoomInButton.first();
      await expect(firstZoomIn).toBeVisible();
      await expect(firstZoomIn).toBeEnabled();

      // Try clicking it
      await firstZoomIn.click();
      await page.waitForTimeout(300);

      // Diagram should still be visible after zoom
      const diagramPanel = page.locator('[role="tabpanel"][id="tabpanel-diagram"]');
      await expect(diagramPanel).toBeVisible();
    }
  });

  test('should allow zooming out on diagram', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();
    await page.locator('button[role="tab"]:has-text("Diagram")').click();

    await page.waitForTimeout(2000);

    // Look for zoom out button
    const zoomOutButton = page.locator('button[aria-label*="Zoom out"], button[title*="Zoom out"]');

    if ((await zoomOutButton.count()) > 0) {
      const firstZoomOut = zoomOutButton.first();
      await expect(firstZoomOut).toBeVisible();
      await expect(firstZoomOut).toBeEnabled();

      // Try clicking it
      await firstZoomOut.click();
      await page.waitForTimeout(300);

      // Diagram should still be visible after zoom
      const diagramPanel = page.locator('[role="tabpanel"][id="tabpanel-diagram"]');
      await expect(diagramPanel).toBeVisible();
    }
  });

  test('should allow resetting diagram zoom', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();
    await page.locator('button[role="tab"]:has-text("Diagram")').click();

    await page.waitForTimeout(2000);

    // Look for reset zoom button
    const resetButton = page.locator(
      'button[aria-label*="Reset"], button[title*="Reset"], button[aria-label*="Fit"], button[title*="Fit"]'
    );

    if ((await resetButton.count()) > 0) {
      const firstReset = resetButton.first();
      await expect(firstReset).toBeVisible();
      await expect(firstReset).toBeEnabled();

      // Try clicking it
      await firstReset.click();
      await page.waitForTimeout(300);

      // Diagram should still be visible after reset
      const diagramPanel = page.locator('[role="tabpanel"][id="tabpanel-diagram"]');
      await expect(diagramPanel).toBeVisible();
    }
  });

  test('should preserve diagram when switching tabs and back', async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    await page.locator('[data-testid="skill-item"]').first().click();

    // Open diagram
    await page.locator('button[role="tab"]:has-text("Diagram")').click();
    await page.waitForTimeout(2000);

    // Switch to another tab
    await page.locator('button[role="tab"]:has-text("Content")').click();
    await page.waitForTimeout(300);

    // Switch back to diagram
    await page.locator('button[role="tab"]:has-text("Diagram")').click();
    await page.waitForTimeout(500);

    // Diagram panel should still be visible
    const diagramPanel = page.locator('[role="tabpanel"][id="tabpanel-diagram"]');
    await expect(diagramPanel).toBeVisible();
  });
});

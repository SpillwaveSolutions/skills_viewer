import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Diagnostic test to capture actual diagram interaction behavior
 * for Claude Code vision API analysis
 */

test.describe('Diagram Interaction Diagnostic', () => {
  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    await page.goto('http://localhost:1420');
    await page.waitForLoadState('networkidle');

    // Wait for skills to load (check for any skill in the sidebar)
    await page.waitForSelector('[data-skill-name], .skill-item, button:has-text("puml")', {
      timeout: 15000,
    });
  });

  test('Capture puml diagram interaction behavior', async () => {
    // Create diagnostic directory
    const diagnosticDir = path.join('test-results', 'diagnostic');
    await fs.mkdir(diagnosticDir, { recursive: true });

    // Navigate to puml skill - try multiple selectors
    const pumlButton = page.locator('button:has-text("puml")').first();
    await pumlButton.waitFor({ timeout: 10000 });
    await pumlButton.click();
    await page.waitForTimeout(1000);

    // Click on Diagram tab
    await page.click('button:has-text("Diagram")');
    await page.waitForTimeout(1000);

    // Wait for diagram to render
    await page.waitForSelector('svg.mermaid', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // 1. Initial state
    await page.screenshot({
      path: path.join(diagnosticDir, 'puml-01-initial.png'),
      fullPage: false,
    });

    // Get diagram container position for dragging
    const diagramContainer = await page.locator('.react-transform-component').first();
    const box = await diagramContainer.boundingBox();

    if (!box) throw new Error('Could not find diagram container');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // 2. After dragging right 200px
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 200, centerY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(diagnosticDir, 'puml-02-dragged-right-200px.png'),
      fullPage: false,
    });

    // 3. After dragging down 150px
    await page.mouse.move(centerX + 200, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 200, centerY + 150, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(diagnosticDir, 'puml-03-dragged-down-150px.png'),
      fullPage: false,
    });

    // 4. After zooming in (mouse wheel)
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -200); // Scroll up to zoom in
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(diagnosticDir, 'puml-04-zoomed-in.png'),
      fullPage: false,
    });

    // 5. After zooming out
    await page.mouse.wheel(0, 400); // Scroll down to zoom out
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(diagnosticDir, 'puml-05-zoomed-out.png'),
      fullPage: false,
    });

    // 6. Try dragging very far right (test bounds)
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 1000, centerY, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(diagnosticDir, 'puml-06-dragged-far-right.png'),
      fullPage: false,
    });

    // 7. Click reset button
    await page.click('button[aria-label*="Reset"], button:has-text("Reset")');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(diagnosticDir, 'puml-07-after-reset.png'),
      fullPage: false,
    });

    // Create analysis prompt file
    const analysisPrompt = {
      skill: 'puml',
      expectedBehavior: {
        initial: 'Diagram should be visible and properly sized within container',
        dragRight: 'Diagram should move 200px to the right and stay there (not recenter)',
        dragDown: 'Diagram should move 150px down from previous position and stay there',
        zoomIn: 'Diagram should zoom in without recentering or jumping',
        zoomOut: 'Diagram should zoom out without recentering or jumping',
        dragFar: 'Diagram should stop at boundary (~2000px), not drag infinitely',
        reset: 'Diagram should return to initial centered position',
      },
      actualIssuesReported: [
        'Diagram recenters after drag (previous report)',
        'Can drag too far in any direction before boundary stops it',
        'Diagram window smaller than container',
        'Diagram being cut off',
      ],
      questions: [
        'Does the diagram stay in position after dragging, or does it recenter?',
        'Does zooming cause the diagram to jump or recenter?',
        'Are the panning boundaries working correctly (stops at ~2000px)?',
        'Is the diagram properly sized within its container?',
        'Is any part of the diagram cut off or clipped?',
        'Does the reset button properly center the diagram?',
      ],
    };

    await fs.writeFile(
      path.join(diagnosticDir, 'puml-analysis-prompt.json'),
      JSON.stringify(analysisPrompt, null, 2)
    );

    console.log('\n✅ puml diagnostic screenshots captured in test-results/diagnostic/');
  });

  test('Capture taskfile diagram interaction behavior', async () => {
    const diagnosticDir = path.join('test-results', 'diagnostic');
    await fs.mkdir(diagnosticDir, { recursive: true });

    // Navigate to taskfile skill
    const taskfileButton = page.locator('button:has-text("taskfile")').first();
    await taskfileButton.waitFor({ timeout: 10000 });
    await taskfileButton.click();
    await page.waitForTimeout(1000);

    // Click on Diagram tab
    await page.click('button:has-text("Diagram")');
    await page.waitForTimeout(1000);

    // Wait for diagram to render
    await page.waitForSelector('svg.mermaid', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // 1. Initial state
    await page.screenshot({
      path: path.join(diagnosticDir, 'taskfile-01-initial.png'),
      fullPage: false,
    });

    const diagramContainer = await page.locator('.react-transform-component').first();
    const box = await diagramContainer.boundingBox();

    if (!box) throw new Error('Could not find diagram container');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // 2. After dragging left 250px
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX - 250, centerY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(diagnosticDir, 'taskfile-02-dragged-left-250px.png'),
      fullPage: false,
    });

    // 3. After zooming in
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(diagnosticDir, 'taskfile-03-zoomed-in.png'),
      fullPage: false,
    });

    // 4. Try dragging after zoom
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 300, centerY - 200, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(diagnosticDir, 'taskfile-04-dragged-after-zoom.png'),
      fullPage: false,
    });

    const analysisPrompt = {
      skill: 'taskfile',
      expectedBehavior: {
        initial: 'Diagram should be visible and properly sized',
        dragLeft: 'Diagram should move 250px left and stay there',
        zoomIn: 'Diagram should zoom in without recentering',
        dragAfterZoom: 'Should be able to drag freely after zooming',
      },
      actualIssuesReported: ['Same issues as puml: recentering, excessive drag boundaries'],
    };

    await fs.writeFile(
      path.join(diagnosticDir, 'taskfile-analysis-prompt.json'),
      JSON.stringify(analysisPrompt, null, 2)
    );

    console.log('\n✅ taskfile diagnostic screenshots captured in test-results/diagnostic/');
  });
});

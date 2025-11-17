/**
 * Visual Regression Testing - Screenshot Capture
 *
 * Captures screenshots of all tabs for the puml skill for visual verification.
 * Run with: npm run test:visual
 *
 * Prerequisites:
 * - App must be running on localhost:1420
 * - Uses Playwright fixtures to mock Tauri API (no Tauri runtime required)
 */

import { test, expect } from './fixtures/mock-tauri';
import {
  captureAndDescribe,
  archiveScreenshots,
  VisualExpectation,
} from './helpers/visual-verification';

const SKILL_NAME = 'puml';

test.describe(`Visual Regression: ${SKILL_NAME} Skill`, () => {
  test.beforeAll(async () => {
    // Archive previous screenshots before starting new run
    const archivePath = await archiveScreenshots();
    if (archivePath) {
      console.log(`✓ Archived previous screenshots to: ${archivePath}`);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForLoadState('networkidle');

    // Navigate to puml skill
    const skillItem = page.locator(`[data-testid="skill-item"]:has-text("${SKILL_NAME}")`).first();
    await skillItem.waitFor({ timeout: 15000 });
    await skillItem.click();
    await page.waitForTimeout(1000);
  });

  test('Overview Panel - Visual Verification', async ({ page }) => {
    // Overview tab should be active by default - just wait for skill name to be visible
    await page.waitForSelector(`h1:has-text("${SKILL_NAME}")`, { timeout: 5000 });

    const expectation: VisualExpectation = {
      should: [
        `Skill name "${SKILL_NAME}" displayed prominently at top`,
        'Overview heading visible',
        'Skill description text visible',
        'Tab navigation (Overview, Content, Diagram, etc.) visible',
        'Skill metadata (location, type) visible',
      ],
      shouldNot: [
        'Blank white screen',
        'Error messages or stack traces',
        'Loading spinner (should be fully loaded)',
        '404 or not found messages',
      ],
      description: `Overview panel showing ${SKILL_NAME} skill metadata and description`,
    };

    const { screenshot } = await captureAndDescribe(page, `${SKILL_NAME}-overview`, expectation);

    console.log(`✓ Captured: ${screenshot}`);
  });

  test('Content Tab - Visual Verification', async ({ page }) => {
    await page.click('button:has-text("Content")');
    await page.waitForTimeout(1000);

    const expectation: VisualExpectation = {
      should: [
        `Skill name "${SKILL_NAME}" displayed at top`,
        'Content tab highlighted/active',
        'Markdown content rendered (headings, paragraphs, code blocks)',
        'Syntax highlighting in code blocks',
        'Readable typography and spacing',
      ],
      shouldNot: [
        'Blank content area',
        'Raw markdown source visible (should be rendered)',
        'Error messages',
        'Broken image placeholders',
      ],
      description: `Content tab showing rendered markdown documentation for ${SKILL_NAME}`,
    };

    const { screenshot } = await captureAndDescribe(page, `${SKILL_NAME}-content`, expectation);

    console.log(`✓ Captured: ${screenshot}`);
  });

  test('Diagram Tab - Visual Verification', async ({ page }) => {
    await page.click('button:has-text("Diagram")');
    await page.waitForTimeout(2000);

    // Wait for Mermaid diagram to render (or timeout gracefully for mock skills without diagrams)
    try {
      await page.waitForSelector('svg.mermaid', { timeout: 5000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      // Mock skills may not have diagrams - that's ok, continue with screenshot
      console.log('No Mermaid diagram found (expected for mock skills)');
    }

    const expectation: VisualExpectation = {
      should: [
        `Skill name "${SKILL_NAME}" displayed at top`,
        'Diagram tab highlighted/active',
        'Mermaid diagram rendered as SVG graphic with visible nodes and edges',
        'Zoom controls visible (+ - reset buttons)',
        'Export controls visible (PNG, SVG buttons)',
        'Layout selector dropdown visible',
      ],
      shouldNot: [
        'Blank white screen or empty diagram area',
        'Error messages or stack traces',
        'Raw Mermaid syntax visible as plain text',
        'Broken SVG rendering (missing diagram)',
        'Loading spinner (should be fully rendered)',
      ],
      description: `Diagram tab showing interactive Mermaid skill architecture for ${SKILL_NAME}`,
    };

    const { screenshot } = await captureAndDescribe(page, `${SKILL_NAME}-diagram`, expectation);

    console.log(`✓ Captured: ${screenshot}`);
  });

  test('References Tab - Visual Verification', async ({ page }) => {
    await page.click('button:has-text("References")');
    await page.waitForTimeout(1000);

    const expectation: VisualExpectation = {
      should: [
        `Skill name "${SKILL_NAME}" displayed at top`,
        'References tab highlighted/active',
        'List of reference files/links visible',
        'File paths or URLs displayed',
        'Reference count indicator visible',
      ],
      shouldNot: [
        'Blank references list',
        'Error messages',
        '"No references" message (puml should have references)',
        'Broken link styling',
      ],
      description: `References tab showing external resources for ${SKILL_NAME}`,
    };

    const { screenshot } = await captureAndDescribe(page, `${SKILL_NAME}-references`, expectation);

    console.log(`✓ Captured: ${screenshot}`);
  });

  test('Scripts Tab - Visual Verification', async ({ page }) => {
    await page.click('button:has-text("Scripts")');
    await page.waitForTimeout(1000);

    const expectation: VisualExpectation = {
      should: [
        `Skill name "${SKILL_NAME}" displayed at top`,
        'Scripts tab highlighted/active',
        'List of script files visible',
        'Script names and paths displayed',
        'Script count or metadata visible',
      ],
      shouldNot: [
        'Blank scripts list',
        'Error messages',
        'Raw file paths without formatting',
        'Broken list styling',
      ],
      description: `Scripts tab showing automation scripts for ${SKILL_NAME}`,
    };

    const { screenshot } = await captureAndDescribe(page, `${SKILL_NAME}-scripts`, expectation);

    console.log(`✓ Captured: ${screenshot}`);
  });

  test('Triggers Tab - Visual Verification', async ({ page }) => {
    await page.click('button:has-text("Triggers")');
    await page.waitForTimeout(1000);

    const expectation: VisualExpectation = {
      should: [
        `Skill name "${SKILL_NAME}" displayed at top`,
        'Triggers tab highlighted/active',
        'List of trigger patterns visible',
        'Trigger descriptions or conditions displayed',
        'Trigger count or metadata visible',
      ],
      shouldNot: [
        'Blank triggers list',
        'Error messages',
        '"No triggers configured" (puml should have triggers)',
        'Raw trigger syntax without formatting',
      ],
      description: `Triggers tab showing activation patterns for ${SKILL_NAME}`,
    };

    const { screenshot } = await captureAndDescribe(page, `${SKILL_NAME}-triggers`, expectation);

    console.log(`✓ Captured: ${screenshot}`);
  });
});

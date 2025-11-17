/**
 * Visual Verification Helpers for Screenshot-Based Testing
 *
 * Provides functions for capturing screenshots, managing visual expectations,
 * and archiving test artifacts for Playwright E2E tests.
 */

import { Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Visual expectation criteria for screenshot verification
 */
export interface VisualExpectation {
  /** Array of visual criteria that MUST be present in the screenshot */
  should: string[];

  /** Array of visual criteria that MUST NOT be present in the screenshot */
  shouldNot: string[];

  /** One-sentence summary of expected visual state */
  description: string;
}

/**
 * Captured screenshot with metadata
 */
export interface VisualTestResult {
  /** Absolute file path to PNG screenshot */
  screenshot: string;

  /** Visual expectations for this screenshot */
  expectation: VisualExpectation;

  /** ISO 8601 timestamp of capture */
  timestamp: string;

  /** Unique test identifier (kebab-case, e.g., "puml-diagram") */
  testName: string;
}

/**
 * Screenshot capture options
 */
export interface CaptureOptions {
  /** Capture entire scrollable page (default: true) */
  fullPage?: boolean;

  /** Maximum wait time in ms before screenshot (default: 5000) */
  timeout?: number;

  /** Wait for network idle before capture (default: true) */
  waitForStable?: boolean;
}

/**
 * Validate VisualExpectation object
 *
 * Ensures expectation meets requirements:
 * - `should` array has at least 1 criterion
 * - `shouldNot` array has at least 1 criterion
 * - `description` is non-empty string (max 200 chars)
 *
 * @param expectation - Expectation object to validate
 * @throws Error if validation fails
 */
export function validateExpectation(expectation: VisualExpectation): void {
  if (!expectation.should || expectation.should.length === 0) {
    throw new Error('VisualExpectation must have at least one "should" criterion');
  }

  if (!expectation.shouldNot || expectation.shouldNot.length === 0) {
    throw new Error('VisualExpectation must have at least one "shouldNot" criterion');
  }

  if (
    !expectation.description ||
    typeof expectation.description !== 'string' ||
    expectation.description.trim().length === 0
  ) {
    throw new Error('VisualExpectation must have a non-empty description string');
  }

  if (expectation.description.length > 200) {
    throw new Error(
      `VisualExpectation description too long (${expectation.description.length} chars, max 200)`
    );
  }
}

/**
 * Archive existing screenshots before new capture
 *
 * Moves all files in test-results/visual/ to test-results/visual-archive/[timestamp]/
 * to prevent overwriting previous test runs.
 *
 * @returns Promise resolving to path of archive directory (empty string if nothing to archive)
 */
export async function archiveScreenshots(): Promise<string> {
  const visualDir = path.join('test-results', 'visual');
  const archiveBaseDir = path.join('test-results', 'visual-archive');

  try {
    // Create archive directory if it doesn't exist
    await fs.mkdir(archiveBaseDir, { recursive: true });

    // Check if visual directory exists and has files
    let files: string[] = [];
    try {
      files = await fs.readdir(visualDir);
    } catch (error) {
      // visual/ directory doesn't exist yet, nothing to archive
      return '';
    }

    if (files.length === 0) {
      return ''; // Nothing to archive
    }

    // Create timestamped archive directory
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, '-') // 2025-11-13T10:30:00 -> 2025-11-13T10-30-00
      .replace(/\..+/, ''); // Remove milliseconds

    const archiveDir = path.join(archiveBaseDir, timestamp);
    await fs.mkdir(archiveDir, { recursive: true });

    // Move all files from visual/ to archive/[timestamp]/
    for (const file of files) {
      const srcPath = path.join(visualDir, file);
      const destPath = path.join(archiveDir, file);
      await fs.rename(srcPath, destPath);
    }

    return archiveDir;
  } catch (error) {
    console.error('Error archiving screenshots:', error);
    throw error;
  }
}

/**
 * Capture screenshot and save metadata
 *
 * Core function for visual regression testing. Captures full-page screenshot,
 * waits for stable rendering, and saves both PNG and JSON metadata.
 *
 * @param page - Playwright Page instance
 * @param testName - Unique identifier for test (e.g., "puml-diagram")
 * @param expectation - Visual expectations for this screenshot
 * @param options - Screenshot capture options (optional)
 * @returns Promise resolving to paths of saved screenshot and metadata
 */
export async function captureAndDescribe(
  page: Page,
  testName: string,
  expectation: VisualExpectation,
  options?: CaptureOptions
): Promise<{ screenshot: string; metadata: string }> {
  // Validate expectation first
  validateExpectation(expectation);

  // Apply default options
  const opts = {
    fullPage: options?.fullPage ?? true,
    timeout: options?.timeout ?? 5000,
    waitForStable: options?.waitForStable ?? true,
  };

  // Wait for page to be fully rendered
  if (opts.waitForStable) {
    await page.waitForLoadState('networkidle', { timeout: opts.timeout });
  }

  // Generate timestamp and file paths
  const timestamp = Date.now();
  const screenshotPath = path.join('test-results', 'visual', `${testName}-${timestamp}.png`);
  const metadataPath = screenshotPath.replace('.png', '.json');

  // Ensure visual directory exists
  await fs.mkdir(path.join('test-results', 'visual'), { recursive: true });

  // Capture screenshot
  await page.screenshot({
    path: screenshotPath,
    fullPage: opts.fullPage,
    type: 'png',
  });

  // Create metadata object
  const result: VisualTestResult = {
    screenshot: path.resolve(screenshotPath),
    expectation,
    timestamp: new Date().toISOString(),
    testName,
  };

  // Save metadata JSON
  await fs.writeFile(metadataPath, JSON.stringify(result, null, 2));

  return {
    screenshot: screenshotPath,
    metadata: metadataPath,
  };
}

/**
 * Load visual test results from directory
 *
 * Reads all .json files in test-results/visual/ and loads associated screenshots.
 * Useful for batch processing or automated analysis.
 *
 * @returns Promise resolving to array of VisualTestResult objects
 */
export async function loadVisualTestResults(): Promise<VisualTestResult[]> {
  const visualDir = path.join('test-results', 'visual');
  const results: VisualTestResult[] = [];

  try {
    const files = await fs.readdir(visualDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    for (const jsonFile of jsonFiles) {
      const jsonPath = path.join(visualDir, jsonFile);
      const content = await fs.readFile(jsonPath, 'utf-8');
      const result: VisualTestResult = JSON.parse(content);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error('Error loading visual test results:', error);
    return [];
  }
}

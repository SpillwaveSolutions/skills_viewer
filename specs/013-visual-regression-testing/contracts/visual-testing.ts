/**
 * Visual Testing Infrastructure Contracts
 *
 * Defines TypeScript interfaces for screenshot-based visual regression testing
 * using Playwright capture + Claude vision analysis.
 *
 * @packageDocumentation
 */

import { Page } from '@playwright/test';

/**
 * Expected visual state for a screenshot
 *
 * Defines criteria for visual verification:
 * - `should`: What MUST be visible
 * - `shouldNot`: What MUST NOT be visible
 * - `description`: Human-readable summary
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
 * Captured screenshot with associated metadata
 *
 * Links screenshot file to visual expectations and provides metadata
 * for analysis and archiving.
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
 * Configuration options for screenshot capture
 *
 * Controls Playwright screenshot behavior for optimal visual testing.
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
 * Result of automated Claude vision API analysis (future enhancement)
 *
 * NOT USED in v1 implementation - manual analysis via Read tool instead.
 * Reserved for future automation (Phase 3).
 */
export interface VisualAnalysisReport {
  /** Test name linking to VisualTestResult */
  testName: string;

  /** Overall pass/fail status */
  passed: boolean;

  /** Array of observations from Claude (what was actually seen) */
  findings: string[];

  /** Specific failures (expected but missing or unexpected present) */
  failures: string[];

  /** Confidence level of analysis */
  confidence: 'high' | 'medium' | 'low';

  /** ISO 8601 timestamp when analysis completed */
  timestamp: string;
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
 *
 * @example
 * ```typescript
 * const expectation: VisualExpectation = {
 *   should: ["Skill name visible", "Diagram rendered"],
 *   shouldNot: ["Blank screen", "Error messages"],
 *   description: "Diagram tab showing skill architecture"
 * };
 *
 * const result = await captureAndDescribe(
 *   page,
 *   'puml-diagram',
 *   expectation
 * );
 * // Returns: { screenshot: "/path/to/screenshot.png", metadata: "/path/to/metadata.json" }
 * ```
 */
export async function captureAndDescribe(
  page: Page,
  testName: string,
  expectation: VisualExpectation,
  options?: CaptureOptions
): Promise<{ screenshot: string; metadata: string }>;

/**
 * Archive existing screenshots before new capture
 *
 * Moves all files in test-results/visual/ to test-results/visual-archive/[timestamp]/
 * to prevent overwriting previous test runs.
 *
 * @returns Promise resolving to path of archive directory (empty string if nothing to archive)
 *
 * @example
 * ```typescript
 * const archivePath = await archiveScreenshots();
 * // Returns: "test-results/visual-archive/2025-11-13T10-30-00"
 * ```
 */
export async function archiveScreenshots(): Promise<string>;

/**
 * Load visual test results from directory
 *
 * Reads all .json files in test-results/visual/ and loads associated screenshots.
 * Useful for batch processing or automated analysis.
 *
 * @returns Promise resolving to array of VisualTestResult objects
 *
 * @example
 * ```typescript
 * const results = await loadVisualTestResults();
 * // Returns: Array of VisualTestResult with screenshot paths and expectations
 *
 * for (const result of results) {
 *   console.log(`Test: ${result.testName}`);
 *   console.log(`Screenshot: ${result.screenshot}`);
 *   console.log(`Expected: ${result.expectation.description}`);
 * }
 * ```
 */
export async function loadVisualTestResults(): Promise<VisualTestResult[]>;

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
 *
 * @example
 * ```typescript
 * const expectation: VisualExpectation = {
 *   should: ["Diagram visible"],
 *   shouldNot: ["Blank screen"],
 *   description: "Diagram tab"
 * };
 *
 * validateExpectation(expectation); // No error
 *
 * const invalid: VisualExpectation = {
 *   should: [],  // ERROR: must have at least 1 criterion
 *   shouldNot: ["Blank screen"],
 *   description: ""
 * };
 *
 * validateExpectation(invalid); // Throws Error
 * ```
 */
export function validateExpectation(expectation: VisualExpectation): void;

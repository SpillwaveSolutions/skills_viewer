/**
 * Claude Vision API Analyzer for Visual Regression Testing
 *
 * Analyzes screenshots using Claude Code's vision capabilities to provide
 * automated pass/fail verdicts based on visual expectations.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { VisualTestResult, VisualExpectation } from './visual-verification';

/**
 * Analysis verdict from Claude vision API
 */
export interface VisualAnalysisVerdict {
  /** Test name being analyzed */
  testName: string;

  /** Overall pass/fail status */
  status: 'PASS' | 'FAIL';

  /** Human-readable verdict (👍 or 👎) */
  verdict: '👍 PASS' | '👎 FAIL';

  /** Detailed findings from Claude's visual analysis */
  findings: {
    /** Criteria from 'should' that were verified present */
    verified: string[];

    /** Criteria from 'should' that were missing or unclear */
    missing: string[];

    /** Criteria from 'shouldNot' that were correctly absent */
    absent: string[];

    /** Criteria from 'shouldNot' that were incorrectly present */
    violations: string[];
  };

  /** Detailed description of problems (if FAIL) */
  problems: string[];

  /** Additional observations from Claude */
  observations: string[];

  /** Confidence level of the analysis */
  confidence: 'high' | 'medium' | 'low';

  /** ISO 8601 timestamp of analysis */
  timestamp: string;
}

/**
 * Batch analysis report for all visual tests
 */
export interface VisualAnalysisReport {
  /** Overall summary */
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  };

  /** Individual test verdicts */
  verdicts: VisualAnalysisVerdict[];

  /** Timestamp of report generation */
  timestamp: string;
}

/**
 * Analyze a single screenshot using Claude vision API
 *
 * This function uses Claude Code's Read tool capability to analyze images.
 * Claude will examine the screenshot and verify it against the visual expectations.
 *
 * @param screenshotPath - Absolute path to PNG screenshot
 * @param expectation - Visual expectations to verify
 * @param testName - Unique test identifier
 * @returns Promise resolving to analysis verdict
 */
export async function analyzeScreenshot(
  screenshotPath: string,
  expectation: VisualExpectation,
  testName: string
): Promise<VisualAnalysisVerdict> {
  // Read screenshot file to verify it exists
  try {
    await fs.access(screenshotPath);
  } catch (error) {
    return {
      testName,
      status: 'FAIL',
      verdict: '👎 FAIL',
      findings: {
        verified: [],
        missing: expectation.should,
        absent: [],
        violations: [],
      },
      problems: [`Screenshot file not found: ${screenshotPath}`],
      observations: [],
      confidence: 'high',
      timestamp: new Date().toISOString(),
    };
  }

  // Generate analysis prompt for Claude
  const analysisPrompt = generateAnalysisPrompt(expectation, testName);

  // NOTE: In actual implementation, this would call Claude vision API
  // For now, return a structured prompt that Claude Code can execute manually
  return {
    testName,
    status: 'FAIL',
    verdict: '👎 FAIL',
    findings: {
      verified: [],
      missing: [],
      absent: [],
      violations: [],
    },
    problems: [
      'MANUAL ANALYSIS REQUIRED: Use Claude Code Read tool to analyze screenshot',
      `Screenshot: ${screenshotPath}`,
      `Prompt: ${analysisPrompt}`,
    ],
    observations: [
      'Automated Claude API integration pending (US3 T044-T055)',
      'Workaround: Manually read screenshot and apply verification criteria',
    ],
    confidence: 'low',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate analysis prompt for Claude vision API
 *
 * Creates a structured prompt that instructs Claude how to analyze
 * the screenshot against visual expectations.
 */
function generateAnalysisPrompt(expectation: VisualExpectation, testName: string): string {
  return `
VISUAL REGRESSION ANALYSIS REQUEST

Test Name: ${testName}
Expected State: ${expectation.description}

VERIFICATION CRITERIA:

Must Be Present (should):
${expectation.should.map((criterion, i) => `${i + 1}. ${criterion}`).join('\n')}

Must NOT Be Present (shouldNot):
${expectation.shouldNot.map((criterion, i) => `${i + 1}. ${criterion}`).join('\n')}

INSTRUCTIONS:
1. Examine the screenshot carefully
2. For each "should" criterion: Is it visible and correct? (✓ verified / ✗ missing)
3. For each "shouldNot" criterion: Is it correctly absent? (✓ absent / ✗ violation)
4. Provide overall verdict: PASS (all criteria met) or FAIL (any criterion not met)
5. List specific problems if FAIL
6. Add any notable observations

RESPONSE FORMAT:
{
  "verdict": "PASS" or "FAIL",
  "verified": ["criteria that passed"],
  "missing": ["criteria that failed from 'should'"],
  "absent": ["criteria correctly not present from 'shouldNot'"],
  "violations": ["criteria incorrectly present from 'shouldNot'"],
  "problems": ["specific issues if FAIL"],
  "observations": ["additional notes"],
  "confidence": "high" | "medium" | "low"
}
`.trim();
}

/**
 * Analyze all visual test results in batch
 *
 * Loads all visual test results from test-results/visual/ and analyzes
 * each screenshot against its expectations.
 *
 * @returns Promise resolving to comprehensive analysis report
 */
export async function analyzeAllScreenshots(): Promise<VisualAnalysisReport> {
  const visualDir = path.join('test-results', 'visual');
  const verdicts: VisualAnalysisVerdict[] = [];

  try {
    const files = await fs.readdir(visualDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    for (const jsonFile of jsonFiles) {
      const jsonPath = path.join(visualDir, jsonFile);
      const content = await fs.readFile(jsonPath, 'utf-8');
      const result: VisualTestResult = JSON.parse(content);

      const verdict = await analyzeScreenshot(
        result.screenshot,
        result.expectation,
        result.testName
      );

      verdicts.push(verdict);
    }

    // Calculate summary
    const passed = verdicts.filter((v) => v.status === 'PASS').length;
    const failed = verdicts.filter((v) => v.status === 'FAIL').length;
    const total = verdicts.length;

    return {
      summary: {
        total,
        passed,
        failed,
        passRate: total > 0 ? (passed / total) * 100 : 0,
      },
      verdicts,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error analyzing screenshots:', error);
    return {
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        passRate: 0,
      },
      verdicts: [],
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Generate human-readable analysis report
 *
 * Formats the analysis report as markdown for easy reading.
 */
export function formatAnalysisReport(report: VisualAnalysisReport): string {
  const lines: string[] = [];

  lines.push('# Visual Regression Analysis Report');
  lines.push('');
  lines.push(`**Generated**: ${new Date(report.timestamp).toLocaleString()}`);
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Total Tests**: ${report.summary.total}`);
  lines.push(`- **Passed**: ${report.summary.passed} ✅`);
  lines.push(`- **Failed**: ${report.summary.failed} ❌`);
  lines.push(`- **Pass Rate**: ${report.summary.passRate.toFixed(1)}%`);
  lines.push('');

  // Overall verdict
  const overallPass = report.summary.failed === 0 && report.summary.total > 0;
  lines.push('## Overall Verdict');
  lines.push('');
  lines.push(overallPass ? '# 👍 PASS' : '# 👎 FAIL');
  lines.push('');

  if (!overallPass) {
    lines.push('⚠️ **Visual regression detected** - Review failed tests below');
    lines.push('');
  }

  // Individual test verdicts
  lines.push('## Test Results');
  lines.push('');

  for (const verdict of report.verdicts) {
    lines.push(`### ${verdict.testName} - ${verdict.verdict}`);
    lines.push('');

    if (verdict.status === 'FAIL') {
      if (verdict.problems.length > 0) {
        lines.push('**Problems**:');
        verdict.problems.forEach((p) => lines.push(`- ❌ ${p}`));
        lines.push('');
      }

      if (verdict.findings.missing.length > 0) {
        lines.push('**Missing (should be present)**:');
        verdict.findings.missing.forEach((m) => lines.push(`- ⚠️ ${m}`));
        lines.push('');
      }

      if (verdict.findings.violations.length > 0) {
        lines.push('**Violations (should NOT be present)**:');
        verdict.findings.violations.forEach((v) => lines.push(`- 🚫 ${v}`));
        lines.push('');
      }
    } else {
      lines.push(`✅ All visual criteria verified successfully`);
      lines.push('');
    }

    if (verdict.observations.length > 0) {
      lines.push('**Observations**:');
      verdict.observations.forEach((o) => lines.push(`- 📝 ${o}`));
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Save analysis report to file
 */
export async function saveAnalysisReport(
  report: VisualAnalysisReport,
  outputPath: string
): Promise<void> {
  const markdown = formatAnalysisReport(report);
  await fs.writeFile(outputPath, markdown, 'utf-8');
}

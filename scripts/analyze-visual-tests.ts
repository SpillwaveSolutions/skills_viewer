#!/usr/bin/env tsx
/**
 * Visual Regression Test Analyzer
 *
 * CURRENT STATUS: This script attempts to analyze screenshots using Claude Code CLI,
 * but has a known limitation - the CLI cannot read image files via file paths in
 * non-interactive mode (claude -p).
 *
 * LIMITATION: Claude CLI requires drag-and-drop or clipboard paste for images,
 * which isn't available in automated scripts. The -p flag works for text but not images.
 *
 * WORKAROUND: Manual screenshot inspection in test-results/visual/
 * FUTURE: Replace with Perplexity API, vision API, or image diff tool
 *
 * Usage:
 *   npm run test:visual:analyze
 *   OR
 *   tsx scripts/analyze-visual-tests.ts
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface VisualExpectation {
  should: string[];
  shouldNot: string[];
  description: string;
}

interface VisualTestResult {
  screenshot: string;
  expectation: VisualExpectation;
  timestamp: string;
  testName: string;
}

interface AnalysisVerdict {
  testName: string;
  verdict: '👍 PASS' | '👎 FAIL';
  findings: string;
  rawOutput: string;
}

/**
 * Generate Claude Code prompt for analyzing a screenshot
 */
function generateAnalysisPrompt(result: VisualTestResult): string {
  const shouldList = result.expectation.should.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const shouldNotList = result.expectation.shouldNot.map((s, i) => `${i + 1}. ${s}`).join('\n');

  return `Analyze this screenshot: ${result.screenshot}

Test: ${result.testName}
Description: ${result.expectation.description}

MUST Be Present (should):
${shouldList}

Must NOT Be Present (shouldNot):
${shouldNotList}

Please read the screenshot and provide:
1. Verdict: "PASS" if all "should" criteria present AND all "shouldNot" absent, otherwise "FAIL"
2. Findings: List what you verified, what's missing, or any violations

Format your response as:
VERDICT: [PASS/FAIL]
FINDINGS: [your detailed findings]`;
}

/**
 * Invoke Claude Code CLI to analyze a screenshot
 */
async function analyzeWithClaude(result: VisualTestResult): Promise<AnalysisVerdict> {
  const prompt = generateAnalysisPrompt(result);

  try {
    // Invoke Claude Code CLI with -p flag for non-interactive mode
    const { stdout, stderr } = await execAsync(
      `claude -p "${prompt.replace(/"/g, '\\"')}"`,
      { maxBuffer: 1024 * 1024 * 10, timeout: 60000 } // 10MB buffer, 60s timeout
    );

    const output = stdout || stderr;

    // Parse the output to extract verdict
    const verdictMatch = output.match(/VERDICT:\s*(PASS|FAIL)/i);
    const verdict = verdictMatch
      ? verdictMatch[1].toUpperCase() === 'PASS'
        ? '👍 PASS'
        : '👎 FAIL'
      : '👎 FAIL'; // Default to FAIL if can't parse

    // Extract findings
    const findingsMatch = output.match(/FINDINGS:\s*(.+)/is);
    const findings = findingsMatch ? findingsMatch[1].trim() : output;

    return {
      testName: result.testName,
      verdict,
      findings,
      rawOutput: output,
    };
  } catch (error: unknown) {
    // If Claude Code CLI fails, return FAIL verdict with error details
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      testName: result.testName,
      verdict: '👎 FAIL',
      findings: `Error invoking Claude Code CLI: ${errorMessage}`,
      rawOutput: errorMessage,
    };
  }
}

/**
 * Main analysis function
 */
async function main() {
  console.log('🔍 Visual Regression Test Analyzer');
  console.log('📡 Using Claude Code CLI for automated analysis\n');

  const visualDir = path.join('test-results', 'visual');

  // Check if visual directory exists
  try {
    await fs.access(visualDir);
  } catch (error) {
    console.error('❌ Error: test-results/visual/ directory not found');
    console.error('Run "npm run test:visual" first to capture screenshots\n');
    process.exit(1);
  }

  // Load all test results
  const files = await fs.readdir(visualDir);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  if (jsonFiles.length === 0) {
    console.error('❌ Error: No visual test results found');
    console.error('Run "npm run test:visual" first to capture screenshots\n');
    process.exit(1);
  }

  console.log(`Found ${jsonFiles.length} visual tests to analyze\n`);

  const results: VisualTestResult[] = [];

  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(visualDir, jsonFile);
    const content = await fs.readFile(jsonPath, 'utf-8');
    const result: VisualTestResult = JSON.parse(content);
    results.push(result);
  }

  // Analyze all screenshots in PARALLEL with Claude Code CLI
  console.log('═'.repeat(80));
  console.log('ANALYZING SCREENSHOTS WITH CLAUDE CODE CLI (PARALLEL)');
  console.log('═'.repeat(80));
  console.log('');
  console.log(`🚀 Analyzing ${results.length} screenshots in parallel...`);
  console.log('');

  // Run all analyses concurrently
  const verdictPromises = results.map(async (result, i) => {
    const num = i + 1;
    console.log(`[${num}/${results.length}] Starting analysis: ${result.testName}`);

    const verdict = await analyzeWithClaude(result);

    console.log(`[${num}/${results.length}] ✓ Completed: ${result.testName} - ${verdict.verdict}`);
    return verdict;
  });

  const verdicts = await Promise.all(verdictPromises);

  console.log('');
  console.log('✅ All analyses complete!');
  console.log('');

  // Generate summary report
  console.log('\n' + '='.repeat(80));
  console.log('ANALYSIS REPORT');
  console.log('='.repeat(80));
  console.log('');

  const passed = verdicts.filter((v) => v.verdict === '👍 PASS').length;
  const failed = verdicts.filter((v) => v.verdict === '👎 FAIL').length;
  const total = verdicts.length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';

  const overallVerdict = failed === 0 && total > 0 ? '👍 PASS' : '👎 FAIL';

  console.log(`## Overall Verdict: ${overallVerdict}`);
  console.log('');
  console.log('## Summary:');
  console.log(`- Total Tests: ${total}`);
  console.log(`- Passed: ${passed} ✅`);
  console.log(`- Failed: ${failed} ❌`);
  console.log(`- Pass Rate: ${passRate}%`);
  console.log('');
  console.log('## Individual Results:');

  verdicts.forEach((v, idx) => {
    console.log(`${idx + 1}. ${v.testName}: ${v.verdict}`);
    if (v.verdict === '👎 FAIL') {
      console.log(`   Problems: ${v.findings}`);
    }
  });

  console.log('');
  console.log('═'.repeat(80));
  console.log('');

  // Save detailed report to file
  const reportPath = path.join('test-results', 'visual', 'analysis-report.md');
  const reportContent = generateMarkdownReport(verdicts, { total, passed, failed, passRate });
  await fs.writeFile(reportPath, reportContent, 'utf-8');

  console.log(`📄 Detailed report saved to: ${reportPath}`);
  console.log('');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(
  verdicts: AnalysisVerdict[],
  summary: { total: number; passed: number; failed: number; passRate: string }
): string {
  const lines: string[] = [];

  lines.push('# Visual Regression Analysis Report');
  lines.push('');
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push(`**Analyzer**: Claude Code CLI`);
  lines.push('');

  // Overall verdict
  const overallVerdict = summary.failed === 0 && summary.total > 0 ? '👍 PASS' : '👎 FAIL';
  lines.push('## Overall Verdict');
  lines.push('');
  lines.push(`# ${overallVerdict}`);
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Total Tests**: ${summary.total}`);
  lines.push(`- **Passed**: ${summary.passed} ✅`);
  lines.push(`- **Failed**: ${summary.failed} ❌`);
  lines.push(`- **Pass Rate**: ${summary.passRate}%`);
  lines.push('');

  // Individual results
  lines.push('## Test Results');
  lines.push('');

  verdicts.forEach((v) => {
    lines.push(`### ${v.testName} - ${v.verdict}`);
    lines.push('');
    lines.push('**Findings**:');
    lines.push(v.findings);
    lines.push('');
    lines.push('<details>');
    lines.push('<summary>Raw Claude Code Output</summary>');
    lines.push('');
    lines.push('```');
    lines.push(v.rawOutput);
    lines.push('```');
    lines.push('');
    lines.push('</details>');
    lines.push('');
  });

  return lines.join('\n');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

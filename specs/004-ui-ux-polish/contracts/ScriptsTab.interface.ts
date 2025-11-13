/**
 * Component Interface Contract: ScriptsTab
 * Feature: 004-ui-ux-polish
 *
 * This contract defines the props and behavior for the ScriptsTab component
 * with fixed syntax highlighting that works on every visit.
 */

import { Script } from '../../../src/types/skill';

/**
 * Props for the ScriptsTab component
 */
export interface ScriptsTabProps {
  /**
   * Array of scripts to display with syntax highlighting
   */
  scripts: Script[];
}

/**
 * Syntax highlighting approach
 *
 * REQUIREMENT (FR-006): Apply syntax highlighting on every visit (not just first)
 *
 * OLD APPROACH (BUGGY):
 * - Direct highlight.js calls in useEffect
 * - Mutates DOM, conflicts with React render cycle
 * - Fails on subsequent visits
 *
 * NEW APPROACH (FIXED):
 * - Use ReactMarkdown with rehype-highlight plugin
 * - Declarative rendering (no useEffect needed)
 * - Works consistently on every render
 */
export interface SyntaxHighlightingStrategy {
  /**
   * Library used for syntax highlighting
   */
  library: 'rehype-highlight'; // Build-time highlighting

  /**
   * Rendering approach
   */
  approach: 'declarative'; // Not imperative

  /**
   * Lifecycle management
   */
  lifecycle: 'none-needed'; // No useEffect, no cleanup

  /**
   * Supported languages
   */
  languages: string[]; // ['python', 'javascript', 'typescript', 'bash', 'json', 'yaml']
}

/**
 * Component behavior contract
 */
export interface ScriptsTabBehavior {
  /**
   * Renders a single script with syntax highlighting
   * @param script - The script to render
   * @returns JSX element with highlighted code
   */
  renderScript(script: Script): JSX.Element;

  /**
   * Wraps script content in markdown code block format
   * @param script - The script to wrap
   * @returns Markdown string with code fence
   */
  wrapInCodeBlock(script: Script): string;

  /**
   * Handles empty scripts list
   * @returns JSX element for empty state
   */
  renderEmptyState(): JSX.Element;

  /**
   * Groups scripts by language (if multiple languages present)
   * @param scripts - All scripts
   * @returns Scripts grouped by language
   */
  groupScriptsByLanguage(scripts: Script[]): Map<string, Script[]>;
}

/**
 * CSS classes contract for proper spacing
 *
 * REQUIREMENT (FR-001): Minimum 8px margin from borders
 */
export interface ScriptsTabStyling {
  container: 'p-6'; // 24px padding for main container
  scriptWrapper: 'mb-6'; // 24px margin bottom between scripts
  scriptHeader: 'mb-2 font-semibold'; // 8px margin bottom for script name
  codeBlock: 'rounded-md overflow-x-auto'; // Code block styling
  emptyState: 'text-center text-gray-500 py-12'; // Empty state styling
}

/**
 * ReactMarkdown configuration
 */
export interface ReactMarkdownConfig {
  /**
   * Rehype plugins to use
   */
  rehypePlugins: ['rehype-highlight'];

  /**
   * Components override (if needed for custom rendering)
   */
  components?: {
    code?: (props: any) => JSX.Element;
    pre?: (props: any) => JSX.Element;
  };
}

/**
 * Accessibility contract
 */
export interface ScriptsTabAccessibility {
  /**
   * Code block semantic structure
   * WCAG 1.3.1: Info and Relationships
   */
  codeSemanticTag: 'pre' | 'code';

  /**
   * Language attribute for code blocks
   * WCAG 3.1.2: Language of Parts
   */
  langAttribute: string; // e.g., "python", "javascript"

  /**
   * Aria label for code blocks
   * WCAG 1.1.1: Non-text Content
   */
  ariaLabel: string; // e.g., "Python script: script_name.py"

  /**
   * Keyboard navigation for code scrolling
   * WCAG 2.1.1: Keyboard accessible
   */
  keyboardScroll: {
    arrowLeft: 'Scroll code left';
    arrowRight: 'Scroll code right';
    home: 'Scroll to start';
    end: 'Scroll to end';
  };
}

/**
 * Code block rendering contract
 */
export interface CodeBlockRendering {
  /**
   * Format for markdown code block
   * @example
   * ```python
   * def hello():
   *     print("world")
   * ```
   */
  markdownFormat: (script: Script) => string;

  /**
   * Expected output HTML structure
   * @example
   * <pre><code class="language-python hljs">
   *   <span class="hljs-keyword">def</span> ...
   * </code></pre>
   */
  expectedHTMLStructure: {
    outerTag: 'pre';
    innerTag: 'code';
    languageClass: string; // e.g., "language-python"
    highlightClass: 'hljs'; // Added by rehype-highlight
    tokenClasses: string[]; // e.g., ["hljs-keyword", "hljs-string", "hljs-comment"]
  };
}

/**
 * Test data contract
 */
export interface ScriptsTabTestData {
  /**
   * Mock Python script for testing syntax highlighting
   */
  mockPythonScript: Script;

  /**
   * Mock JavaScript script
   */
  mockJavaScriptScript: Script;

  /**
   * Mock Bash script
   */
  mockBashScript: Script;

  /**
   * Mock script with very long lines (tests horizontal scrolling)
   */
  mockLongLineScript: Script;

  /**
   * Mock empty script (edge case)
   */
  mockEmptyScript: Script;

  /**
   * Mock scripts list with multiple languages
   */
  mockMixedLanguageScripts: Script[];
}

/**
 * Performance requirements
 *
 * REQUIREMENT (SC-004): Syntax highlighting must work on 100% of visits
 * REQUIREMENT (Constitution Principle V): 60fps rendering
 */
export interface ScriptsTabPerformance {
  /**
   * Maximum time to render syntax highlighting
   * Must be under 16ms for 60fps
   */
  maxHighlightTime: 16; // milliseconds

  /**
   * Test reliability: Highlighting must work N times consecutively
   */
  reliabilityTestIterations: 20; // visits

  /**
   * Expected success rate
   */
  expectedSuccessRate: 100; // percent (must be 100%)
}

/**
 * Migration notes (OLD → NEW approach)
 */
export interface MigrationNotes {
  /**
   * Code to REMOVE from ScriptsTab.tsx
   */
  codeToRemove: {
    imports: ['import hljs from "highlight.js"'];
    state: ['const [highlightedCode, setHighlightedCode] = useState<string>("")'];
    effects: [
      'useEffect(() => { hljs.highlightAll(); }, [script])'
    ];
  };

  /**
   * Code to ADD to ScriptsTab.tsx
   */
  codeToAdd: {
    imports: [
      'import ReactMarkdown from "react-markdown"',
      'import rehypeHighlight from "rehype-highlight"'
    ];
    rendering: [
      '<ReactMarkdown rehypePlugins={[rehypeHighlight]}>',
      '  {`\\`\\`\\`${script.language}\\n${script.content}\\n\\`\\`\\``}',
      '</ReactMarkdown>'
    ];
  };
}

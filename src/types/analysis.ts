// Feature 021: Analysis Type Definitions
// TypeScript interfaces mirroring Rust data models

/**
 * Analysis execution status
 */
export type AnalysisStatus = 'running' | 'completed' | 'failed';

/**
 * Main analysis result container
 */
export interface SkillAnalysisResult {
  /** Unique identifier for this analysis (UUID v4) */
  analysis_id: string;

  /** Skill directory name */
  skill_name: string;

  /** Absolute path to SKILL.md */
  skill_path: string;

  /** Analysis start timestamp (ISO 8601) */
  timestamp: string;

  /** Current analysis status */
  status: AnalysisStatus;

  /** Progress percentage (0-100) */
  progress: number;

  /** Spec compliance results (FR-001) */
  spec_compliance?: SpecCompliance;

  /** PDA analysis results (FR-002, FR-003) */
  pda_analysis?: PDAAnalysis;

  /** Security review results (FR-004) */
  security_review?: SecurityReview;

  /** Trigger keyword suggestions (FR-005) */
  trigger_suggestions?: TriggerSuggestion[];

  /** Link validation results (FR-006) */
  link_validation?: LinkValidation;

  /** Error message if analysis failed */
  error?: string;
}

/**
 * Anthropic Skills Specification compliance results
 */
export interface SpecCompliance {
  /** Overall compliance score (0-100) */
  score: number;

  /** List of specification violations */
  violations: Violation[];

  /** List of warnings */
  warnings: Warning[];
}

/**
 * A specification violation
 */
export interface Violation {
  /** Machine-readable rule identifier */
  rule: string;

  /** Human-readable error message */
  message: string;

  /** Optional fix suggestion */
  fix_suggestion?: string;

  /** Line number where violation occurs */
  line_number?: number;
}

/**
 * A specification warning
 */
export interface Warning {
  /** Machine-readable rule identifier */
  rule: string;

  /** Human-readable warning message */
  message: string;

  /** Optional recommendation */
  recommendation?: string;
}

/**
 * Progressive Disclosure Architecture analysis results
 */
export interface PDAAnalysis {
  /** PDA compliance score (0-100) */
  score: number;

  /** Estimated token count */
  token_estimate: number;

  /** Token breakdown by tier */
  tier_breakdown: TierBreakdown;

  /** Recommendations for improvement */
  recommendations: string[];

  /** Suggested structural changes */
  suggested_structure: string[];

  /** AI-powered insights (only present in LLM-enhanced analysis) */
  ai_insights?: string[];
}

/**
 * Token distribution across PDA tiers
 */
export interface TierBreakdown {
  /** Tokens in frontmatter */
  metadata_tokens: number;

  /** Tokens in main SKILL.md */
  orchestrator_tokens: number;

  /** Tokens in references/ */
  resource_tokens: number;
}

/**
 * Risk severity levels
 */
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * Permissions security analysis results
 */
export interface SecurityReview {
  /** Security score (0-100) */
  score: number;

  /** Unused permissions */
  unused_permissions: string[];

  /** High-risk permission combinations */
  high_risk_permissions: RiskFlag[];

  /** Minimum required permissions */
  minimum_required: string[];
}

/**
 * A security risk flag
 */
export interface RiskFlag {
  /** Permission name */
  permission: string;

  /** Severity level */
  risk_level: RiskLevel;

  /** Explanation of risk */
  explanation: string;

  /** Optional mitigation advice */
  mitigation?: string;
}

/**
 * A suggested trigger keyword
 */
export interface TriggerSuggestion {
  /** Suggested keyword */
  keyword: string;

  /** Relevance score (0-100) */
  relevance_score: number;

  /** Explanation of relevance */
  explanation: string;
}

/**
 * Link validation results
 */
export interface LinkValidation {
  /** Total links found */
  total_links: number;

  /** Valid (reachable) links */
  valid_links: number;

  /** Broken links */
  broken_links: BrokenLink[];
}

/**
 * A broken link
 */
export interface BrokenLink {
  /** Broken URL or file path */
  url: string;

  /** Line number in SKILL.md */
  line_number: number;

  /** Error message */
  error: string;
}

/**
 * CLI tool detection results
 */
export interface CLIDetectionResult {
  /** Whether Claude CLI is available */
  claude_available: boolean;

  /** Whether OpenCode CLI is available */
  opencode_available: boolean;

  /** Whether Gemini CLI is available */
  gemini_available: boolean;

  /** Path to claude binary */
  claude_path?: string;

  /** Path to opencode binary */
  opencode_path?: string;

  /** Path to gemini binary */
  gemini_path?: string;
}

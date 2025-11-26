/**
 * EvaluationTab Component (Feature 021: Phase 5)
 * Two-tier PDA analysis: Quick (script-based) + Detailed (LLM-based)
 * Shows quick results immediately while LLM runs in background
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Skill } from '../../types/skill';
import { useAnalysisStore } from '../../stores/analysisStore';

interface SpecCompliance {
  score: number;
  violations: Violation[];
  warnings: Warning[];
}

interface Violation {
  rule: string;
  message: string;
  fix_suggestion?: string;
  line_number?: number;
}

interface Warning {
  rule: string;
  message: string;
  recommendation?: string;
}

interface PDAAnalysis {
  score: number;
  token_estimate: number;
  tier_breakdown: TierBreakdown;
  recommendations: string[];
  suggested_structure: string[];
  ai_insights?: string[]; // Only present in LLM-based analysis
}

interface TierBreakdown {
  metadata_tokens: number;
  orchestrator_tokens: number;
  resource_tokens: number;
}

interface LinkValidation {
  total_links: number;
  valid_links: number;
  broken_links: BrokenLink[];
}

interface BrokenLink {
  url: string;
  line_number: number;
  error: string;
}

interface SecurityReview {
  score: number;
  unused_permissions: string[];
  high_risk_permissions: RiskFlag[];
  minimum_required: string[];
}

interface RiskFlag {
  permission: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  explanation: string;
  mitigation?: string;
}

interface TriggerSuggestion {
  keyword: string;
  relevance_score: number;
  explanation: string;
}

// Background analysis job status
type AnalysisJobStatus = 'running' | 'completed' | 'failed';

interface AnalysisJobState {
  status: AnalysisJobStatus;
  progress?: number;
  result?: PDAAnalysis;
  error?: string;
}

interface EvaluationTabProps {
  skill: Skill;
}

export const EvaluationTab: React.FC<EvaluationTabProps> = ({ skill }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Two-tier analysis state
  const [quickPdaAnalysis, setQuickPdaAnalysis] = useState<PDAAnalysis | null>(null);
  const [detailedPdaAnalysis, setDetailedPdaAnalysis] = useState<PDAAnalysis | null>(null);
  const [specCompliance, setSpecCompliance] = useState<SpecCompliance | null>(null);
  const [linkValidation, setLinkValidation] = useState<LinkValidation | null>(null);
  const [securityReview, setSecurityReview] = useState<SecurityReview | null>(null);
  const [triggerSuggestions, setTriggerSuggestions] = useState<TriggerSuggestion[] | null>(null);

  // Background job tracking
  const [backgroundJob, setBackgroundJob] = useState<{
    analysisId: string;
    state: AnalysisJobState;
  } | null>(null);

  // UI state
  const [activeView, setActiveView] = useState<'quick' | 'detailed'>('quick');

  const {
    getCachedAnalysis,
    setCachedAnalysis,
    setDetailedPdaAnalysis: cacheDetailedPdaAnalysis,
    clearCache,
  } = useAnalysisStore();

  // Load cached analysis on mount or skill change
  useEffect(() => {
    const cached = getCachedAnalysis(skill.name);
    if (cached) {
      setSpecCompliance(cached.specCompliance);
      setQuickPdaAnalysis(cached.quickPdaAnalysis);
      setDetailedPdaAnalysis(cached.detailedPdaAnalysis ?? null);
    } else {
      setSpecCompliance(null);
      setQuickPdaAnalysis(null);
      setDetailedPdaAnalysis(null);
    }
    setLinkValidation(null); // Reset link validation on skill change
    setSecurityReview(null); // Reset security review on skill change
    setTriggerSuggestions(null); // Reset trigger suggestions on skill change
    setError(null);
  }, [skill.name, getCachedAnalysis]);

  // Polling effect for background LLM analysis
  useEffect(() => {
    if (!backgroundJob || backgroundJob.state.status !== 'running') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await invoke<AnalysisJobState>('get_pda_analysis_status', {
          analysisId: backgroundJob.analysisId,
        });

        if (statusResponse.status === 'completed' && statusResponse.result) {
          setDetailedPdaAnalysis(statusResponse.result);
          cacheDetailedPdaAnalysis(skill.name, statusResponse.result);
          setBackgroundJob({
            analysisId: backgroundJob.analysisId,
            state: statusResponse,
          });
        } else if (statusResponse.status === 'failed') {
          setBackgroundJob({
            analysisId: backgroundJob.analysisId,
            state: statusResponse,
          });
        } else {
          // Still running - update progress
          setBackgroundJob({
            analysisId: backgroundJob.analysisId,
            state: statusResponse,
          });
        }
      } catch (err) {
        console.error('Polling error:', err);
        setBackgroundJob({
          analysisId: backgroundJob.analysisId,
          state: {
            status: 'failed',
            error: err instanceof Error ? err.message : String(err),
          },
        });
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [backgroundJob]);

  const handleAnalyzeSkill = async (forceRefresh = false) => {
    if (forceRefresh) {
      clearCache(skill.name); // Clears both quick and detailed analyses
      setQuickPdaAnalysis(null);
      setDetailedPdaAnalysis(null);
      setLinkValidation(null);
      setSecurityReview(null);
      setTriggerSuggestions(null);
      setBackgroundJob(null);
    }

    setLoading(true);
    setError(null);

    try {
      // Extract skill directory from path (parent of skill.md)
      const skillDir = skill.path.substring(0, skill.path.lastIndexOf('/'));

      // Extract allowed_tools from metadata (if available)
      const allowedTools: string[] = (skill.metadata?.['allowed-tools'] as string[]) ?? [];
      const currentTriggers: string[] = (skill.metadata?.triggers as string[]) ?? [];

      // Step 1: Run quick analyses in parallel (spec + quick PDA + link validation + security + triggers)
      const [specResult, quickPdaResult, linkResult, securityResult, triggerResult] =
        await Promise.all([
          invoke<SpecCompliance>('validate_skill', { skillContent: skill.content }),
          invoke<PDAAnalysis>('analyze_pda', { skillContent: skill.content }),
          invoke<LinkValidation>('validate_skill_links', {
            skillContent: skill.content,
            skillDir: skillDir,
          }),
          invoke<SecurityReview>('analyze_permissions', {
            allowedTools: allowedTools,
            skillContent: skill.content,
          }),
          invoke<TriggerSuggestion[]>('suggest_triggers', {
            skillContent: skill.content,
            currentTriggers: currentTriggers,
          }),
        ]);

      // Step 2: Display quick results immediately
      setSpecCompliance(specResult);
      setQuickPdaAnalysis(quickPdaResult);
      setLinkValidation(linkResult);
      setSecurityReview(securityResult);
      setTriggerSuggestions(triggerResult);
      setCachedAnalysis(skill.name, specResult, quickPdaResult);
      setLoading(false);

      // Step 3: Start background LLM analysis (fire-and-forget)
      try {
        const analysisId = await invoke<string>('start_detailed_pda_analysis', {
          skillName: skill.name,
          skillContent: skill.content,
        });

        setBackgroundJob({
          analysisId,
          state: { status: 'running', progress: 0 },
        });
      } catch (backgroundErr) {
        console.error('Failed to start background analysis:', backgroundErr);
        // Don't fail the whole operation if background analysis fails
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const renderSpecCompliance = (compliance: SpecCompliance) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Spec Compliance</h3>
        <div
          className={`text-2xl font-bold ${compliance.score >= 80 ? 'text-green-600' : compliance.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
        >
          {compliance.score}/100
        </div>
      </div>

      {/* Violations */}
      {compliance.violations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-red-700 mb-2">
            Violations ({compliance.violations.length})
          </h4>
          <div className="space-y-2">
            {compliance.violations.map((violation, idx) => (
              <div key={idx} className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <div className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">•</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">{violation.message}</p>
                    {violation.fix_suggestion && (
                      <p className="text-xs text-red-600 mt-1">💡 {violation.fix_suggestion}</p>
                    )}
                    {violation.line_number && (
                      <p className="text-xs text-gray-500 mt-1">Line {violation.line_number}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {compliance.warnings.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-yellow-700 mb-2">
            Warnings ({compliance.warnings.length})
          </h4>
          <div className="space-y-2">
            {compliance.warnings.map((warning, idx) => (
              <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                <div className="flex items-start">
                  <span className="text-yellow-600 font-bold mr-2">⚠</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">{warning.message}</p>
                    {warning.recommendation && (
                      <p className="text-xs text-yellow-600 mt-1">💡 {warning.recommendation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Issues */}
      {compliance.violations.length === 0 && compliance.warnings.length === 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-sm text-green-700">✓ No compliance issues found</p>
        </div>
      )}
    </div>
  );

  const renderPDAAnalysis = (pda: PDAAnalysis, analysisType: 'quick' | 'detailed') => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">PDA Analysis</h3>
          <p className="text-xs text-gray-500 mt-1">
            {analysisType === 'quick'
              ? '⚡ Script-based (instant)'
              : '🤖 AI-powered (LLM-enhanced)'}
          </p>
        </div>
        <div
          className={`text-2xl font-bold ${pda.score >= 80 ? 'text-green-600' : pda.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
        >
          {pda.score}/100
        </div>
      </div>

      {/* Token Breakdown */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Token Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Tokens:</span>
            <span className="font-mono font-semibold text-gray-800">
              {pda.token_estimate.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Metadata:</span>
            <span className="font-mono text-gray-700">
              {pda.tier_breakdown.metadata_tokens.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Orchestrator:</span>
            <span className="font-mono text-gray-700">
              {pda.tier_breakdown.orchestrator_tokens.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Resources:</span>
            <span className="font-mono text-gray-700">
              {pda.tier_breakdown.resource_tokens.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* AI Insights (detailed analysis only) */}
      {pda.ai_insights && pda.ai_insights.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-indigo-700 mb-2">🤖 AI Insights</h4>
          <div className="space-y-2">
            {pda.ai_insights.map((insight, idx) => (
              <div key={idx} className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded">
                <p className="text-sm text-indigo-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {pda.recommendations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-blue-700 mb-2">Recommendations</h4>
          <div className="space-y-2">
            {pda.recommendations.map((rec, idx) => (
              <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <p className="text-sm text-blue-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Structure */}
      {pda.suggested_structure.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-purple-700 mb-2">Suggested Structure</h4>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <ul className="space-y-1 text-sm text-purple-800 font-mono">
              {pda.suggested_structure.map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderLinkValidation = (validation: LinkValidation) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🔗 Link Validation</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {validation.valid_links}/{validation.total_links} valid
          </span>
          {validation.broken_links.length === 0 ? (
            <span className="text-green-600 font-bold text-lg">✓</span>
          ) : (
            <span className="text-red-600 font-bold text-lg">
              {validation.broken_links.length} broken
            </span>
          )}
        </div>
      </div>

      {/* All Links Valid */}
      {validation.broken_links.length === 0 && validation.total_links > 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-sm text-green-700">
            ✓ All {validation.total_links} link{validation.total_links !== 1 ? 's' : ''} are valid
          </p>
        </div>
      )}

      {/* No Links Found */}
      {validation.total_links === 0 && (
        <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
          <p className="text-sm text-gray-600">No links found in skill content</p>
        </div>
      )}

      {/* Broken Links */}
      {validation.broken_links.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-700 mb-2">
            Broken Links ({validation.broken_links.length})
          </h4>
          <div className="space-y-2">
            {validation.broken_links.map((link, idx) => (
              <div key={idx} className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <div className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">✗</span>
                  <div className="flex-1">
                    <p className="text-sm font-mono text-red-800">{link.url}</p>
                    <p className="text-xs text-red-600 mt-1">{link.error}</p>
                    <p className="text-xs text-gray-500 mt-1">Line {link.line_number}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSecurityReview = (review: SecurityReview) => {
    const getRiskColor = (level: string) => {
      switch (level) {
        case 'critical':
          return 'bg-red-100 border-red-500 text-red-800';
        case 'high':
          return 'bg-orange-100 border-orange-500 text-orange-800';
        case 'medium':
          return 'bg-yellow-100 border-yellow-500 text-yellow-800';
        case 'low':
          return 'bg-blue-100 border-blue-500 text-blue-800';
        default:
          return 'bg-gray-100 border-gray-500 text-gray-800';
      }
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Security Review</h3>
          <div
            className={`text-2xl font-bold ${review.score >= 80 ? 'text-green-600' : review.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
          >
            {review.score}/100
          </div>
        </div>

        {/* High Risk Permissions */}
        {review.high_risk_permissions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-red-700 mb-2">
              Security Risks ({review.high_risk_permissions.length})
            </h4>
            <div className="space-y-2">
              {review.high_risk_permissions.map((risk, idx) => (
                <div
                  key={idx}
                  className={`border-l-4 p-3 rounded ${getRiskColor(risk.risk_level)}`}
                >
                  <div className="flex items-start">
                    <span className="font-bold mr-2">
                      {risk.risk_level === 'critical' ? '!!' : '!'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        <span className="font-mono">{risk.permission}</span> -{' '}
                        <span className="uppercase text-xs">{risk.risk_level}</span>
                      </p>
                      <p className="text-xs mt-1">{risk.explanation}</p>
                      {risk.mitigation && (
                        <p className="text-xs mt-1 opacity-80">Mitigation: {risk.mitigation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unused Permissions */}
        {review.unused_permissions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-yellow-700 mb-2">
              Unused Permissions ({review.unused_permissions.length})
            </h4>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
              <p className="text-sm text-yellow-800">
                These permissions are declared but not referenced in the skill content:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {review.unused_permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded font-mono text-xs"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Minimum Required */}
        {review.minimum_required.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-blue-700 mb-2">
              Suggested Minimum Permissions
            </h4>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <div className="flex flex-wrap gap-2">
                {review.minimum_required.map((perm, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-200 text-blue-800 rounded font-mono text-xs"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Clear */}
        {review.high_risk_permissions.length === 0 && review.unused_permissions.length === 0 && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-sm text-green-700">No security issues found</p>
          </div>
        )}
      </div>
    );
  };

  const renderTriggerSuggestions = (suggestions: TriggerSuggestion[]) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Trigger Suggestions</h3>
        <span className="text-sm text-gray-500">{suggestions.length} suggestions</span>
      </div>

      {suggestions.length === 0 ? (
        <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
          <p className="text-sm text-gray-600">No trigger suggestions available for this skill</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-purple-700">
                    {suggestion.keyword}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      suggestion.relevance_score >= 90
                        ? 'bg-green-100 text-green-700'
                        : suggestion.relevance_score >= 75
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {suggestion.relevance_score}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{suggestion.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Skill Evaluation</h2>
            <p className="text-sm text-gray-600 mt-1">
              Two-tier analysis: Quick (script) + Detailed (AI-powered)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Analyzing: <span className="font-mono font-semibold text-gray-700">{skill.name}</span>
            </p>
          </div>
          <div className="flex gap-3">
            {(specCompliance || quickPdaAnalysis) && (
              <button
                onClick={() => handleAnalyzeSkill(true)}
                disabled={loading}
                className={`px-4 py-3 rounded-lg font-semibold transition-all border-2 shadow-sm ${
                  loading
                    ? 'bg-gray-300 text-gray-600 border-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-800 hover:shadow-md'
                }`}
                title="Clear cache and re-analyze"
              >
                🔄 Refresh
              </button>
            )}
            <button
              onClick={() => handleAnalyzeSkill(false)}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 shadow-sm ${
                loading
                  ? 'bg-gray-300 text-gray-600 border-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 hover:border-blue-800 hover:shadow-md'
              }`}
            >
              {loading ? '⏳ Analyzing...' : '🎯 Analyze Skill'}
            </button>
          </div>
        </div>

        {/* Background Analysis Status Banner */}
        {backgroundJob && backgroundJob.state.status === 'running' && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-indigo-900">
                  🤖 Running detailed AI-powered analysis...
                </h4>
                <p className="text-xs text-indigo-700 mt-1">
                  Using Claude/OpenCode/Gemini CLI for deep PDA insights (updates every 5s)
                </p>
              </div>
              {backgroundJob.state.progress !== undefined && (
                <div className="text-xs font-mono text-indigo-600">
                  {backgroundJob.state.progress}%
                </div>
              )}
            </div>
          </div>
        )}

        {/* Background Analysis Success Banner */}
        {backgroundJob && backgroundJob.state.status === 'completed' && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-600 font-bold text-lg mr-2">✓</span>
              <div>
                <h4 className="text-sm font-semibold text-green-800">
                  Detailed AI analysis complete!
                </h4>
                <p className="text-xs text-green-700 mt-1">
                  Switch to "Detailed Analysis" tab to view AI insights
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Background Analysis Error Banner */}
        {backgroundJob && backgroundJob.state.status === 'failed' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-start">
              <span className="text-yellow-600 font-bold text-lg mr-2">⚠</span>
              <div>
                <h4 className="text-sm font-semibold text-yellow-800">Detailed analysis failed</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  {backgroundJob.state.error || 'Unknown error'} - Quick analysis still available
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <span className="text-red-600 font-bold text-lg mr-2">✗</span>
              <div>
                <h4 className="text-sm font-semibold text-red-800">Analysis Failed</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Running quick analysis for {skill.name}...</p>
            </div>
          </div>
        )}

        {/* Tab Switcher (shown when at least quick analysis is available) */}
        {!loading && quickPdaAnalysis && (
          <div className="border-b border-gray-200">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveView('quick')}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeView === 'quick'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                ⚡ Quick Analysis
              </button>
              <button
                onClick={() => setActiveView('detailed')}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeView === 'detailed'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
                disabled={!detailedPdaAnalysis}
              >
                🤖 Detailed Analysis
                {!detailedPdaAnalysis && backgroundJob?.state.status !== 'running' && (
                  <span className="ml-2 text-xs text-gray-400">(not available)</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && specCompliance && (
          <div className="space-y-6">
            {renderSpecCompliance(specCompliance)}

            {/* Link Validation (always shown when available) */}
            {linkValidation && renderLinkValidation(linkValidation)}

            {/* Security Review (always shown when available) */}
            {securityReview && renderSecurityReview(securityReview)}

            {/* Trigger Suggestions (always shown when available) */}
            {triggerSuggestions && renderTriggerSuggestions(triggerSuggestions)}

            {/* Quick Analysis View */}
            {activeView === 'quick' &&
              quickPdaAnalysis &&
              renderPDAAnalysis(quickPdaAnalysis, 'quick')}

            {/* Detailed Analysis View */}
            {activeView === 'detailed' &&
              detailedPdaAnalysis &&
              renderPDAAnalysis(detailedPdaAnalysis, 'detailed')}

            {/* Detailed Analysis Not Yet Available */}
            {activeView === 'detailed' && !detailedPdaAnalysis && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Detailed Analysis</h3>
                {backgroundJob?.state.status === 'running' ? (
                  <p className="text-sm text-gray-600">
                    AI analysis in progress... Check back in a moment
                  </p>
                ) : backgroundJob?.state.status === 'failed' ? (
                  <p className="text-sm text-red-600">
                    AI analysis failed. Quick analysis is still available.
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Click "Analyze Skill" to start both quick and detailed analysis
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !specCompliance && !quickPdaAnalysis && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Analyze</h3>
            <p className="text-sm text-gray-600 mb-1">
              Click "Analyze Skill" to run two-tier analysis:
            </p>
            <p className="text-xs text-gray-500 mt-2">
              ⚡ Quick (script-based, instant) + 🤖 Detailed (AI-powered, ~30s)
            </p>
            <p className="text-xs text-gray-500 mt-1">Results cached for 24 hours per skill</p>
          </div>
        )}
      </div>
    </div>
  );
};

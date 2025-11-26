/**
 * EvaluationTab Component (Feature 021: Phase 5)
 * Unified skill evaluation with three sub-tabs:
 * - Quick Analysis (script-based, instant)
 * - Detailed Analysis (LLM-powered)
 * - Reports (markdown reports from all analyzers)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { Skill } from '../../types/skill';
import { useAnalysisStore } from '../../stores/analysisStore';
import { useShallow } from 'zustand/react/shallow';

// Types
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
  ai_insights?: string[];
}

interface TierBreakdown {
  metadata_tokens: number;
  orchestrator_tokens: number;
  resource_tokens: number;
}

type AnalysisJobStatus = 'running' | 'completed' | 'failed';

interface AnalysisJobState {
  status: AnalysisJobStatus;
  progress?: number;
  result?: PDAAnalysis;
  error?: string;
}

type MainTab = 'quick' | 'detailed' | 'reports';
type AnalyzerType = 'spec' | 'pda' | 'permissions' | 'triggers' | 'links';
type ReportTab = 'composite' | AnalyzerType;
type ReportSubTab = 'results' | 'description';

interface EvaluationTabProps {
  skill: Skill;
}

// Report descriptions for each analyzer
const REPORT_DESCRIPTIONS: Record<
  ReportTab,
  { title: string; description: string; checks: string[] }
> = {
  composite: {
    title: 'Composite Report',
    description:
      'A combined report from all analyzers, formatted for easy copy/paste to Claude Code for automated fixes.',
    checks: [
      'Concatenates all individual analyzer reports',
      'Includes JSON data blocks for structured processing',
      'Formatted for Claude Code consumption',
      'Single-click copy to clipboard',
    ],
  },
  spec: {
    title: 'Spec Compliance',
    description:
      'Validates the skill against the Anthropic Skills Specification to ensure proper structure and required fields.',
    checks: [
      'Required frontmatter fields (name, description, allowed-tools)',
      'Valid YAML syntax in frontmatter',
      'Proper markdown structure',
      'Section headings and organization',
      'Trigger definitions and format',
    ],
  },
  pda: {
    title: 'PDA Analysis',
    description:
      'Analyzes the skill for Progressive Disclosure of Authority compliance - ensuring minimal context loading.',
    checks: [
      'Token count estimation',
      'Tier breakdown (metadata, orchestrator, resources)',
      'Context efficiency score',
      'Recommendations for reducing token usage',
      'Suggested file structure for large skills',
    ],
  },
  permissions: {
    title: 'Security & Permissions',
    description:
      'Reviews the allowed-tools configuration for security risks and unused permissions.',
    checks: [
      'Identifies unused permissions',
      'Flags high-risk permission combinations',
      'Suggests minimum required permissions',
      'Security risk assessment',
      'Mitigation recommendations',
    ],
  },
  triggers: {
    title: 'Trigger Suggestions',
    description: 'Analyzes skill content to suggest optimal trigger keywords for skill activation.',
    checks: [
      'Extracts key concepts from skill content',
      'Suggests relevant trigger keywords',
      'Evaluates existing triggers',
      'Relevance scoring for suggestions',
      'Coverage analysis',
    ],
  },
  links: {
    title: 'Link Validation',
    description:
      'Validates all links referenced in the skill content to ensure they are accessible.',
    checks: [
      'Extracts markdown links from content',
      'Validates file path references',
      'Checks HTTP/HTTPS URLs (HEAD requests)',
      'Reports broken or inaccessible links',
      'Suggests fixes for common issues',
    ],
  },
};

const ANALYZER_ORDER: AnalyzerType[] = ['spec', 'pda', 'permissions', 'triggers', 'links'];

export const EvaluationTab: React.FC<EvaluationTabProps> = ({ skill }) => {
  // Main tab state
  const [mainTab, setMainTab] = useState<MainTab>('quick');
  const [reportTab, setReportTab] = useState<ReportTab>('composite');
  const [reportSubTab, setReportSubTab] = useState<ReportSubTab>('results');

  // Quick/Detailed analysis state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickPdaAnalysis, setQuickPdaAnalysis] = useState<PDAAnalysis | null>(null);
  const [detailedPdaAnalysis, setDetailedPdaAnalysis] = useState<PDAAnalysis | null>(null);
  const [specCompliance, setSpecCompliance] = useState<SpecCompliance | null>(null);
  const [backgroundJob, setBackgroundJob] = useState<{
    analysisId: string;
    state: AnalysisJobState;
  } | null>(null);

  // Copy state
  const [copySuccess, setCopySuccess] = useState(false);

  // Analysis store for markdown reports
  const {
    analysisStatus,
    currentAnalysisId,
    analyzerProgress,
    analyzerReports,
    compositeReport,
    analysisError,
    startFullAnalysis,
    pollAnalysisProgress,
    resetAnalysis,
  } = useAnalysisStore(
    useShallow((state) => ({
      analysisStatus: state.analysisStatus,
      currentAnalysisId: state.currentAnalysisId,
      analyzerProgress: state.analyzerProgress,
      analyzerReports: state.analyzerReports,
      compositeReport: state.compositeReport,
      analysisError: state.analysisError,
      startFullAnalysis: state.startFullAnalysis,
      pollAnalysisProgress: state.pollAnalysisProgress,
      resetAnalysis: state.resetAnalysis,
    }))
  );

  // Legacy cache store
  const {
    getCachedAnalysis,
    setCachedAnalysis,
    setDetailedPdaAnalysis: cacheDetailedPdaAnalysis,
    clearCache,
  } = useAnalysisStore();

  // Load cached analysis on mount
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
    setError(null);
  }, [skill.name, getCachedAnalysis]);

  // Polling for background LLM analysis
  useEffect(() => {
    if (!backgroundJob || backgroundJob.state.status !== 'running') return;

    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await invoke<AnalysisJobState>('get_pda_analysis_status', {
          analysisId: backgroundJob.analysisId,
        });

        if (statusResponse.status === 'completed' && statusResponse.result) {
          setDetailedPdaAnalysis(statusResponse.result);
          cacheDetailedPdaAnalysis(skill.name, statusResponse.result);
        }
        setBackgroundJob({ analysisId: backgroundJob.analysisId, state: statusResponse });
      } catch (err) {
        setBackgroundJob({
          analysisId: backgroundJob.analysisId,
          state: { status: 'failed', error: err instanceof Error ? err.message : String(err) },
        });
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [backgroundJob, skill.name, cacheDetailedPdaAnalysis]);

  // Polling for markdown reports
  useEffect(() => {
    if (analysisStatus !== 'running' || !currentAnalysisId) return;

    const interval = setInterval(() => {
      pollAnalysisProgress();
    }, 2000);

    return () => clearInterval(interval);
  }, [analysisStatus, currentAnalysisId, pollAnalysisProgress]);

  // Single unified analysis handler
  const handleAnalyzeSkill = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        clearCache(skill.name);
        resetAnalysis();
        setQuickPdaAnalysis(null);
        setDetailedPdaAnalysis(null);
        setBackgroundJob(null);
      }

      setLoading(true);
      setError(null);

      try {
        // Run all analyses in parallel
        const [specResult, quickPdaResult] = await Promise.all([
          invoke<SpecCompliance>('validate_skill', { skillContent: skill.content }),
          invoke<PDAAnalysis>('analyze_pda', { skillContent: skill.content }),
        ]);

        setSpecCompliance(specResult);
        setQuickPdaAnalysis(quickPdaResult);
        setCachedAnalysis(skill.name, specResult, quickPdaResult);
        setLoading(false);

        // Start background LLM analysis
        try {
          const analysisId = await invoke<string>('start_detailed_pda_analysis', {
            skillName: skill.name,
            skillContent: skill.content,
          });
          setBackgroundJob({ analysisId, state: { status: 'running', progress: 0 } });
        } catch (bgErr) {
          console.error('Background analysis failed:', bgErr);
        }

        // Start full markdown report analysis
        await startFullAnalysis(skill.name, skill.location, skill.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    },
    [skill, clearCache, resetAnalysis, setCachedAnalysis, startFullAnalysis]
  );

  const handleCopyComposite = useCallback(async () => {
    if (!compositeReport) return;
    try {
      await navigator.clipboard.writeText(compositeReport);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [compositeReport]);

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'complete':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '○';
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'running':
        return 'text-purple-600';
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getCurrentReportContent = () => {
    if (reportTab === 'composite') return compositeReport;
    return analyzerReports[reportTab]?.markdown;
  };

  const hasAnalysisResults = specCompliance || quickPdaAnalysis;
  const isAnalyzing = loading || analysisStatus === 'running';

  // Render spec compliance results
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

      {compliance.violations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-red-700 mb-2">
            Violations ({compliance.violations.length})
          </h4>
          <div className="space-y-2">
            {compliance.violations.map((v, i) => (
              <div key={i} className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm font-medium text-red-800">{v.message}</p>
                {v.fix_suggestion && (
                  <p className="text-xs text-red-600 mt-1">💡 {v.fix_suggestion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {compliance.warnings.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-yellow-700 mb-2">
            Warnings ({compliance.warnings.length})
          </h4>
          <div className="space-y-2">
            {compliance.warnings.map((w, i) => (
              <div key={i} className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                <p className="text-sm font-medium text-yellow-800">{w.message}</p>
                {w.recommendation && (
                  <p className="text-xs text-yellow-600 mt-1">💡 {w.recommendation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {compliance.violations.length === 0 && compliance.warnings.length === 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-sm text-green-700">✓ No compliance issues found</p>
        </div>
      )}
    </div>
  );

  // Render PDA analysis results
  const renderPDAAnalysis = (pda: PDAAnalysis, type: 'quick' | 'detailed') => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">PDA Analysis</h3>
          <p className="text-xs text-gray-500 mt-1">
            {type === 'quick' ? '⚡ Script-based (instant)' : '🤖 AI-powered (LLM-enhanced)'}
          </p>
        </div>
        <div
          className={`text-2xl font-bold ${pda.score >= 80 ? 'text-green-600' : pda.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
        >
          {pda.score}/100
        </div>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Token Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-mono font-semibold">{pda.token_estimate.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Metadata:</span>
            <span className="font-mono">{pda.tier_breakdown.metadata_tokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Orchestrator:</span>
            <span className="font-mono">
              {pda.tier_breakdown.orchestrator_tokens.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Resources:</span>
            <span className="font-mono">{pda.tier_breakdown.resource_tokens.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {pda.ai_insights && pda.ai_insights.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-indigo-700 mb-2">🤖 AI Insights</h4>
          <div className="space-y-2">
            {pda.ai_insights.map((insight, i) => (
              <div key={i} className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded">
                <p className="text-sm text-indigo-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pda.recommendations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-blue-700 mb-2">Recommendations</h4>
          <div className="space-y-2">
            {pda.recommendations.map((rec, i) => (
              <div key={i} className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <p className="text-sm text-blue-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header with single Analyze button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Skill Evaluation</h2>
          <p className="text-sm text-gray-600 mt-1">
            Analyzing: <span className="font-mono font-semibold">{skill.name}</span>
          </p>
        </div>

        <div className="flex gap-3">
          {hasAnalysisResults && (
            <button
              onClick={() => handleAnalyzeSkill(true)}
              disabled={isAnalyzing}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isAnalyzing
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔄 Refresh
            </button>
          )}
          <button
            onClick={() => handleAnalyzeSkill(false)}
            disabled={isAnalyzing}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
              isAnalyzing
                ? 'bg-purple-200 text-purple-700 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isAnalyzing ? '⏳ Analyzing...' : '🎯 Analyze Skill'}
          </button>
        </div>
      </div>

      {/* Error display */}
      {(error || analysisError) && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-sm text-red-700">{error || analysisError}</p>
        </div>
      )}

      {/* Main tab navigation */}
      <div className="border-b border-gray-200 mb-4">
        <div className="flex gap-1">
          <button
            onClick={() => setMainTab('quick')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              mainTab === 'quick'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            ⚡ Quick Analysis
          </button>
          <button
            onClick={() => setMainTab('detailed')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              mainTab === 'detailed'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            🤖 Detailed Analysis
            {backgroundJob?.state.status === 'running' && (
              <span className="ml-2 inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setMainTab('reports')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              mainTab === 'reports'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 Reports
            {analysisStatus === 'running' && (
              <span className="ml-2 inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {/* Quick Analysis Tab */}
        {mainTab === 'quick' && (
          <div className="space-y-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                  <p className="mt-4 text-gray-600">Running quick analysis...</p>
                </div>
              </div>
            )}

            {!loading && !hasAnalysisResults && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Quick Analysis</h3>
                <p className="text-sm text-gray-600">
                  Click "Analyze Skill" to run instant script-based analysis
                </p>
              </div>
            )}

            {!loading && specCompliance && renderSpecCompliance(specCompliance)}
            {!loading && quickPdaAnalysis && renderPDAAnalysis(quickPdaAnalysis, 'quick')}
          </div>
        )}

        {/* Detailed Analysis Tab */}
        {mainTab === 'detailed' && (
          <div className="space-y-6">
            {backgroundJob?.state.status === 'running' && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-900">
                      Running AI-powered analysis...
                    </h4>
                    <p className="text-xs text-indigo-700">Using CLI for deep insights</p>
                  </div>
                </div>
              </div>
            )}

            {detailedPdaAnalysis ? (
              renderPDAAnalysis(detailedPdaAnalysis, 'detailed')
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Detailed Analysis</h3>
                <p className="text-sm text-gray-600">
                  {backgroundJob?.state.status === 'running'
                    ? 'AI analysis in progress...'
                    : backgroundJob?.state.status === 'failed'
                      ? 'AI analysis failed - quick analysis still available'
                      : 'Click "Analyze Skill" to start AI-powered analysis'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {mainTab === 'reports' && (
          <div className="flex flex-col h-full">
            {/* Report type tabs */}
            <div className="flex gap-1 mb-4 border-b border-gray-200 overflow-x-auto pb-px">
              <button
                onClick={() => {
                  setReportTab('composite');
                  setReportSubTab('results');
                }}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                  reportTab === 'composite'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                📑 Composite
              </button>
              {ANALYZER_ORDER.map((analyzer) => (
                <button
                  key={analyzer}
                  onClick={() => {
                    setReportTab(analyzer);
                    setReportSubTab('results');
                  }}
                  className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all flex items-center gap-1 ${
                    reportTab === analyzer
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className={getStatusColor(analyzerProgress?.[analyzer])}>
                    {getStatusIcon(analyzerProgress?.[analyzer])}
                  </span>
                  {REPORT_DESCRIPTIONS[analyzer].title}
                </button>
              ))}
            </div>

            {/* Results/Description sub-tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setReportSubTab('results')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  reportSubTab === 'results'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Results
              </button>
              <button
                onClick={() => setReportSubTab('description')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  reportSubTab === 'description'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Description
              </button>

              {/* Copy button - only for composite */}
              {reportTab === 'composite' && reportSubTab === 'results' && compositeReport && (
                <button
                  onClick={handleCopyComposite}
                  className={`ml-auto px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                    copySuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {copySuccess ? '✓ Copied!' : '📋 Copy Report'}
                </button>
              )}
            </div>

            {/* Report content */}
            <div className="flex-1 overflow-auto bg-white border border-gray-200 rounded-lg p-6">
              {reportSubTab === 'description' ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {REPORT_DESCRIPTIONS[reportTab].title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {REPORT_DESCRIPTIONS[reportTab].description}
                  </p>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">What we check:</h4>
                    <ul className="space-y-1">
                      {REPORT_DESCRIPTIONS[reportTab].checks.map((check, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          {check}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : getCurrentReportContent() ? (
                <article className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {getCurrentReportContent()!}
                  </ReactMarkdown>
                </article>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {analysisStatus === 'running' ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" />
                      <p>Generating report...</p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-4">📊</div>
                      <p>No report available yet.</p>
                      <p className="text-sm mt-2">Click "Analyze Skill" to generate reports.</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quick fix instructions for composite */}
            {reportTab === 'composite' && reportSubTab === 'results' && compositeReport && (
              <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="text-sm font-semibold text-indigo-900 mb-2">
                  💡 Quick Fix with Claude Code
                </h4>
                <p className="text-xs text-indigo-700">
                  Copy this report and paste into Claude Code:
                  <span className="block mt-1 font-mono bg-white/50 px-2 py-1 rounded">
                    "Please review this skill analysis and help me fix the issues."
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

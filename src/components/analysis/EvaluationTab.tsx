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
      setBackgroundJob(null);
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Run quick analyses in parallel (spec + quick PDA)
      const [specResult, quickPdaResult] = await Promise.all([
        invoke<SpecCompliance>('validate_skill', { skillContent: skill.content }),
        invoke<PDAAnalysis>('analyze_pda', { skillContent: skill.content }),
      ]);

      // Step 2: Display quick results immediately
      setSpecCompliance(specResult);
      setQuickPdaAnalysis(quickPdaResult);
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
                  : 'bg-blue-100 text-gray-900 border-blue-300 hover:bg-blue-200 hover:border-blue-400 hover:shadow-md'
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

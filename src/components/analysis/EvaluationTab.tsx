/**
 * EvaluationTab Component (Feature 021: Phase 9)
 * Displays spec compliance and PDA analysis results
 */

import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Skill } from '../../types/skill';

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
}

interface TierBreakdown {
  metadata_tokens: number;
  orchestrator_tokens: number;
  resource_tokens: number;
}

interface AnalysisState {
  loading: boolean;
  error: string | null;
  specCompliance: SpecCompliance | null;
  pdaAnalysis: PDAAnalysis | null;
}

interface EvaluationTabProps {
  skill: Skill;
}

export const EvaluationTab: React.FC<EvaluationTabProps> = ({ skill }) => {
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    error: null,
    specCompliance: null,
    pdaAnalysis: null,
  });

  const handleAnalyzeSkill = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Run both analyses in parallel
      const [specResult, pdaResult] = await Promise.all([
        invoke<SpecCompliance>('validate_skill', { skillContent: skill.content }),
        invoke<PDAAnalysis>('analyze_pda', { skillContent: skill.content }),
      ]);

      setState({
        loading: false,
        error: null,
        specCompliance: specResult,
        pdaAnalysis: pdaResult,
      });
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
        specCompliance: null,
        pdaAnalysis: null,
      });
    }
  };

  const renderSpecCompliance = (compliance: SpecCompliance) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Spec Compliance</h3>
        <div className={`text-2xl font-bold ${compliance.score >= 80 ? 'text-green-600' : compliance.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
          {compliance.score}/100
        </div>
      </div>

      {/* Violations */}
      {compliance.violations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-red-700 mb-2">Violations ({compliance.violations.length})</h4>
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
          <h4 className="text-sm font-semibold text-yellow-700 mb-2">Warnings ({compliance.warnings.length})</h4>
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

  const renderPDAAnalysis = (pda: PDAAnalysis) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">PDA Analysis</h3>
        <div className={`text-2xl font-bold ${pda.score >= 80 ? 'text-green-600' : pda.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
          {pda.score}/100
        </div>
      </div>

      {/* Token Breakdown */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Token Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Tokens:</span>
            <span className="font-mono font-semibold text-gray-800">{pda.token_estimate.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Metadata:</span>
            <span className="font-mono text-gray-700">{pda.tier_breakdown.metadata_tokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Orchestrator:</span>
            <span className="font-mono text-gray-700">{pda.tier_breakdown.orchestrator_tokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Resources:</span>
            <span className="font-mono text-gray-700">{pda.tier_breakdown.resource_tokens.toLocaleString()}</span>
          </div>
        </div>
      </div>

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
              Analyze spec compliance and Progressive Disclosure Architecture (PDA)
            </p>
          </div>
          <button
            onClick={handleAnalyzeSkill}
            disabled={state.loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              state.loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {state.loading ? 'Analyzing...' : 'Analyze Skill'}
          </button>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <span className="text-red-600 font-bold text-lg mr-2">✗</span>
              <div>
                <h4 className="text-sm font-semibold text-red-800">Analysis Failed</h4>
                <p className="text-sm text-red-700 mt-1">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {state.loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Analyzing skill...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!state.loading && state.specCompliance && state.pdaAnalysis && (
          <div className="space-y-6">
            {renderSpecCompliance(state.specCompliance)}
            {renderPDAAnalysis(state.pdaAnalysis)}
          </div>
        )}

        {/* Empty State */}
        {!state.loading && !state.error && !state.specCompliance && !state.pdaAnalysis && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Analyze</h3>
            <p className="text-sm text-gray-600">Click "Analyze Skill" to evaluate spec compliance and PDA structure</p>
          </div>
        )}
      </div>
    </div>
  );
};

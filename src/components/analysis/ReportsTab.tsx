/**
 * ReportsTab Component (Feature 021: FR-009, FR-010)
 * Displays markdown reports from analyzers with progressive loading
 * and composite report generation for copy/paste to Claude Code
 */

import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useAnalysisStore } from '../../stores/analysisStore';
import { useShallow } from 'zustand/react/shallow';
import type { Skill } from '../../types/skill';

type ReportType = 'composite' | 'spec' | 'pda' | 'permissions' | 'triggers' | 'links';

interface ReportsTabProps {
  skill: Skill;
}

const REPORT_LABELS: Record<ReportType, string> = {
  composite: 'Composite Report',
  spec: 'Spec Compliance',
  pda: 'PDA Analysis',
  permissions: 'Security & Permissions',
  triggers: 'Trigger Suggestions',
  links: 'Link Validation',
};

const ANALYZER_ORDER: ('spec' | 'pda' | 'permissions' | 'triggers' | 'links')[] = [
  'spec',
  'pda',
  'permissions',
  'triggers',
  'links',
];

export const ReportsTab: React.FC<ReportsTabProps> = ({ skill }) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('composite');
  const [copySuccess, setCopySuccess] = useState(false);

  const {
    analysisStatus,
    currentAnalysisId,
    currentSkillName,
    analyzerProgress,
    analyzerReports,
    compositeReport,
    analysisError,
    startFullAnalysis,
    pollAnalysisProgress,
  } = useAnalysisStore(
    useShallow((state) => ({
      analysisStatus: state.analysisStatus,
      currentAnalysisId: state.currentAnalysisId,
      currentSkillName: state.currentSkillName,
      analyzerProgress: state.analyzerProgress,
      analyzerReports: state.analyzerReports,
      compositeReport: state.compositeReport,
      analysisError: state.analysisError,
      startFullAnalysis: state.startFullAnalysis,
      pollAnalysisProgress: state.pollAnalysisProgress,
    }))
  );

  // Start polling when analysis is running
  useEffect(() => {
    if (analysisStatus !== 'running' || !currentAnalysisId) {
      return;
    }

    const interval = setInterval(() => {
      pollAnalysisProgress();
    }, 2000);

    return () => clearInterval(interval);
  }, [analysisStatus, currentAnalysisId, pollAnalysisProgress]);

  const handleStartAnalysis = useCallback(async () => {
    await startFullAnalysis(skill.name, skill.location, skill.content);
  }, [skill, startFullAnalysis]);

  const handleCopyReport = useCallback(async () => {
    const reportToCopy =
      selectedReport === 'composite' ? compositeReport : analyzerReports[selectedReport]?.markdown;

    if (!reportToCopy) return;

    try {
      await navigator.clipboard.writeText(reportToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [selectedReport, compositeReport, analyzerReports]);

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
        return '⏳';
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'running':
        return 'text-purple-600';
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getCurrentReportContent = () => {
    if (selectedReport === 'composite') {
      return compositeReport;
    }
    return analyzerReports[selectedReport]?.markdown;
  };

  const hasAnyReports = Object.values(analyzerReports).some((r) => r !== null) || compositeReport;

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analysis Reports</h2>
          <p className="text-sm text-gray-600 mt-1">
            {currentSkillName
              ? `Viewing reports for: ${currentSkillName}`
              : `Ready to analyze: ${skill.name}`}
          </p>
        </div>

        <div className="flex gap-3">
          {hasAnyReports && (
            <button
              onClick={handleCopyReport}
              disabled={!getCurrentReportContent()}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                copySuccess
                  ? 'bg-green-500 text-white'
                  : getCurrentReportContent()
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {copySuccess ? '✓ Copied!' : '📋 Copy Report'}
            </button>
          )}

          <button
            onClick={handleStartAnalysis}
            disabled={analysisStatus === 'running'}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
              analysisStatus === 'running'
                ? 'bg-purple-200 text-purple-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-900 border border-purple-300 hover:from-purple-200 hover:to-indigo-200 shadow-sm hover:shadow-md'
            }`}
          >
            {analysisStatus === 'running' ? '⏳ Analyzing...' : '🎯 Analyze Skill'}
          </button>
        </div>
      </div>

      {/* Progress Section (shown during analysis) */}
      {analysisStatus === 'running' && analyzerProgress && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
          <h3 className="text-sm font-semibold text-purple-900 mb-3">Analysis Progress</h3>
          <div className="grid grid-cols-5 gap-3">
            {ANALYZER_ORDER.map((analyzer) => {
              const status = analyzerProgress[analyzer];
              return (
                <div
                  key={analyzer}
                  className={`flex items-center gap-2 text-xs ${getStatusColor(status)}`}
                >
                  <span>{getStatusIcon(status)}</span>
                  <span className="font-medium capitalize">{analyzer}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Display */}
      {analysisError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <span className="text-red-600 font-bold mr-2">✗</span>
            <div>
              <h4 className="text-sm font-semibold text-red-800">Analysis Error</h4>
              <p className="text-sm text-red-700 mt-1">{analysisError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Report Selector and Content */}
      {hasAnyReports ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Report Type Tabs */}
          <div className="flex gap-1 mb-4 border-b border-gray-200 overflow-x-auto pb-px">
            <button
              onClick={() => setSelectedReport('composite')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                selectedReport === 'composite'
                  ? 'border-purple-600 text-purple-600'
                  : compositeReport
                    ? 'border-transparent text-gray-600 hover:text-gray-800'
                    : 'border-transparent text-gray-400 cursor-not-allowed'
              }`}
              disabled={!compositeReport}
            >
              📑 {REPORT_LABELS.composite}
            </button>
            {ANALYZER_ORDER.map((analyzer) => {
              const report = analyzerReports[analyzer];
              return (
                <button
                  key={analyzer}
                  onClick={() => setSelectedReport(analyzer)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                    selectedReport === analyzer
                      ? 'border-blue-600 text-blue-600'
                      : report
                        ? 'border-transparent text-gray-600 hover:text-gray-800'
                        : 'border-transparent text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!report}
                >
                  {report?.score !== undefined && (
                    <span
                      className={`mr-1 ${
                        report.score >= 80
                          ? 'text-green-600'
                          : report.score >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {report.score}
                    </span>
                  )}
                  {REPORT_LABELS[analyzer]}
                </button>
              );
            })}
          </div>

          {/* Markdown Content */}
          <div className="flex-1 overflow-auto bg-white border border-gray-200 rounded-lg p-6">
            {getCurrentReportContent() ? (
              <article className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {getCurrentReportContent()!}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No report available for this analyzer yet.</p>
                {analysisStatus === 'running' && (
                  <p className="mt-2 text-sm">Analysis in progress...</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reports Yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Click "Analyze Skill" to run all analyzers and generate markdown reports.
            </p>
            <p className="text-xs text-gray-500">
              Reports include: Spec Compliance, PDA Analysis, Security Review, Trigger Suggestions,
              and Link Validation
            </p>
          </div>
        </div>
      )}

      {/* Quick Fix Instructions (shown with composite report) */}
      {selectedReport === 'composite' && compositeReport && (
        <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
          <h4 className="text-sm font-semibold text-indigo-900 mb-2">
            💡 Quick Fix with Claude Code
          </h4>
          <p className="text-xs text-indigo-700">
            Copy this report and paste it into Claude Code with the prompt:
            <span className="block mt-1 font-mono bg-white/50 px-2 py-1 rounded">
              "Please review this skill analysis and help me fix the issues identified."
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;

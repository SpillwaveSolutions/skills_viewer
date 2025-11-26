import React from 'react';
import { useAnalysisStore, AnalysisTaskStatus } from '../../stores/analysisStore';
import { useShallow } from 'zustand/react/shallow';

interface IndicatorState {
  analysisStatus: AnalysisTaskStatus;
  currentSkillName: string | null;
  analysisError: string | null;
}

/**
 * AnalysisTaskIndicator - LED-style status indicator for skill analysis tasks
 *
 * Shows a small circular LED in the header area:
 * - Purple (pulsing): Analysis is running
 * - Green: Analysis completed successfully
 * - Red: Analysis encountered an error
 * - Hidden: No analysis running (idle)
 */
export const AnalysisTaskIndicator: React.FC = () => {
  const { analysisStatus, currentSkillName, analysisError } = useAnalysisStore(
    useShallow(
      (state): IndicatorState => ({
        analysisStatus: state.analysisStatus,
        currentSkillName: state.currentSkillName,
        analysisError: state.analysisError,
      })
    )
  );

  // Don't show indicator if idle
  if (analysisStatus === 'idle') {
    return null;
  }

  const config = (() => {
    switch (analysisStatus) {
      case 'running':
        return {
          color: 'bg-purple-500',
          glow: 'shadow-purple-500/50',
          animate: 'animate-pulse',
          title: `Analyzing: ${currentSkillName || 'processing'}`,
          icon: '🔬',
        };
      case 'completed':
        return {
          color: 'bg-green-500',
          glow: 'shadow-green-500/50',
          animate: '',
          title: 'Analysis complete',
          icon: '✓',
        };
      case 'error':
        return {
          color: 'bg-red-500',
          glow: 'shadow-red-500/50',
          animate: '',
          title: `Error: ${analysisError || 'Unknown error'}`,
          icon: '✗',
        };
      default:
        return {
          color: 'bg-gray-400',
          glow: '',
          animate: '',
          title: 'Idle',
          icon: '',
        };
    }
  })();

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 bg-white/90 rounded-full shadow-sm border border-gray-200"
      role="status"
      aria-live="polite"
    >
      {/* LED indicator */}
      <div
        className={`w-2.5 h-2.5 rounded-full ${config.color} ${config.animate} shadow-lg ${config.glow}`}
        title={config.title}
        aria-label={config.title}
      />

      {/* Status text */}
      <span className="text-xs text-gray-700 font-medium">
        {analysisStatus === 'running' && (
          <>
            <span className="text-purple-600">Analyzing</span>
            {currentSkillName && (
              <span className="text-gray-500 ml-1 max-w-[120px] truncate inline-block align-bottom">
                {currentSkillName}
              </span>
            )}
          </>
        )}
        {analysisStatus === 'completed' && <span className="text-green-600">Complete</span>}
        {analysisStatus === 'error' && <span className="text-red-600">Error</span>}
      </span>
    </div>
  );
};

export default AnalysisTaskIndicator;

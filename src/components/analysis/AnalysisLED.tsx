/**
 * AnalysisLED Component (Feature 021: FR-011)
 * LED-style status indicator for skill analysis
 *
 * States:
 * - Idle (gray): No analysis running
 * - Running (purple pulse): Analysis in progress
 * - Complete (green): Analysis finished successfully
 * - Error (red): Analysis encountered an error
 */

import React from 'react';
import { useAnalysisStore, type OverallStatus } from '../../stores/analysisStore';
import { useShallow } from 'zustand/react/shallow';

interface LEDConfig {
  color: string;
  glow: string;
  animate: string;
  label: string;
}

const getLEDConfig = (status: OverallStatus, skillName: string | null): LEDConfig => {
  switch (status) {
    case 'running':
      return {
        color: 'bg-purple-500',
        glow: 'shadow-purple-500/50',
        animate: 'animate-pulse',
        label: `Analyzing: ${skillName || 'skill'}`,
      };
    case 'complete':
      return {
        color: 'bg-green-500',
        glow: 'shadow-green-500/50',
        animate: '',
        label: 'Analysis Complete',
      };
    case 'error':
      return {
        color: 'bg-red-500',
        glow: 'shadow-red-500/50',
        animate: '',
        label: 'Analysis Error',
      };
    case 'idle':
    default:
      return {
        color: 'bg-gray-400',
        glow: '',
        animate: '',
        label: 'Ready',
      };
  }
};

export const AnalysisLED: React.FC = () => {
  const { analysisStatus, currentSkillName, analysisError } = useAnalysisStore(
    useShallow((state) => ({
      analysisStatus: state.analysisStatus,
      currentSkillName: state.currentSkillName,
      analysisError: state.analysisError,
    }))
  );

  const config = getLEDConfig(analysisStatus, currentSkillName);

  // Don't show if idle
  if (analysisStatus === 'idle') {
    return null;
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 bg-white/90 rounded-full shadow-sm border border-gray-200"
      role="status"
      aria-live="polite"
    >
      {/* LED indicator */}
      <div
        className={`w-2.5 h-2.5 rounded-full ${config.color} ${config.animate} shadow-lg ${config.glow}`}
        aria-hidden="true"
      />

      {/* Status text */}
      <span className="text-xs font-medium text-gray-700 max-w-[200px] truncate">
        {analysisError ? `Error: ${analysisError.slice(0, 30)}` : config.label}
      </span>
    </div>
  );
};

export default AnalysisLED;

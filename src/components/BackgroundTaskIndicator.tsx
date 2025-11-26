import React, { useMemo } from 'react';
import { useDiagramCacheStore } from '../stores/diagramCacheStore';

/**
 * BackgroundTaskIndicator - LED-style status indicator for background tasks
 *
 * Shows a small circular LED in the top-right corner:
 * - Green (pulsing): Background task is running
 * - Red: Background task encountered an error
 * - Off/Gray: No background tasks running (idle)
 *
 * OPTIMIZED: Uses individual primitive selectors to prevent infinite re-renders.
 * Object selectors with custom equality can cause issues in React 19.
 * Only re-renders when status, error, or skill name actually changes.
 */
export const BackgroundTaskIndicator: React.FC = () => {
  // Use individual primitive selectors to prevent infinite re-render loops
  // This is the safest pattern for Zustand with React 19
  const backgroundStatus = useDiagramCacheStore((state) => state.backgroundStatus);
  const currentlyRendering = useDiagramCacheStore((state) => state.currentlyRendering);
  const lastError = useDiagramCacheStore((state) => state.lastError);

  // Memoize config to avoid recalculating on every render
  const config = useMemo(() => {
    switch (backgroundStatus) {
      case 'running':
        return {
          color: 'bg-green-500',
          glow: 'shadow-green-500/50',
          animate: 'animate-pulse',
          title: `Rendering: ${currentlyRendering || 'processing'}`,
        };
      case 'error':
        return {
          color: 'bg-red-500',
          glow: 'shadow-red-500/50',
          animate: '',
          title: `Error: ${lastError || 'Unknown error'}`,
        };
      case 'idle':
      default:
        return {
          color: 'bg-gray-400',
          glow: '',
          animate: '',
          title: 'Background tasks idle',
        };
    }
  }, [backgroundStatus, currentlyRendering, lastError]);

  // Don't show indicator if idle
  if (backgroundStatus === 'idle') {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-2"
      role="status"
      aria-live="polite"
    >
      {/* LED indicator */}
      <div
        className={`w-3 h-3 rounded-full ${config.color} ${config.animate} shadow-lg ${config.glow}`}
        title={config.title}
        aria-label={config.title}
      />

      {/* Show current skill name when running */}
      {backgroundStatus === 'running' && currentlyRendering && (
        <span className="text-xs text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm max-w-[200px] truncate">
          {currentlyRendering}
        </span>
      )}

      {/* Error message */}
      {backgroundStatus === 'error' && (
        <span className="text-xs text-red-600 bg-white/90 px-2 py-1 rounded shadow-sm max-w-xs truncate">
          Error: {lastError?.slice(0, 50)}
        </span>
      )}
    </div>
  );
};

export default BackgroundTaskIndicator;

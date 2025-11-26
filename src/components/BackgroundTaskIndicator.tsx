import React, { useMemo } from 'react';
import { useDiagramCacheStore, BackgroundTaskStatus } from '../stores/diagramCacheStore';

/**
 * BackgroundTaskIndicator - LED-style status indicator for background tasks
 *
 * Shows a small circular LED in the top-right corner:
 * - Green (pulsing): Background task is running
 * - Red: Background task encountered an error
 * - Off/Gray: No background tasks running (idle)
 */
export const BackgroundTaskIndicator: React.FC = () => {
  const backgroundStatus = useDiagramCacheStore((state) => state.backgroundStatus);
  const currentlyRendering = useDiagramCacheStore((state) => state.currentlyRendering);
  const lastError = useDiagramCacheStore((state) => state.lastError);
  const renderQueueLength = useDiagramCacheStore((state) => state.renderQueue.length);
  const priorityQueueLength = useDiagramCacheStore((state) => state.priorityQueue.length);

  // Memoize the computed queue length to avoid re-render loops
  const queueLength = useMemo(
    () => renderQueueLength + priorityQueueLength,
    [renderQueueLength, priorityQueueLength]
  );

  const getStatusConfig = (status: BackgroundTaskStatus) => {
    switch (status) {
      case 'running':
        return {
          color: 'bg-green-500',
          glow: 'shadow-green-500/50',
          animate: 'animate-pulse',
          title: `Rendering: ${currentlyRendering || 'processing'} (${queueLength} in queue)`,
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
  };

  const config = getStatusConfig(backgroundStatus);

  // Don't show indicator if idle and no recent activity
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

      {/* Optional: Show text for running status */}
      {backgroundStatus === 'running' && (
        <span className="text-xs text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm">
          {queueLength > 0 ? `${queueLength} diagrams` : 'Processing...'}
        </span>
      )}

      {/* Error tooltip */}
      {backgroundStatus === 'error' && (
        <span className="text-xs text-red-600 bg-white/90 px-2 py-1 rounded shadow-sm max-w-xs truncate">
          Error: {lastError?.slice(0, 50)}
        </span>
      )}
    </div>
  );
};

export default BackgroundTaskIndicator;

import React from 'react';
import type { DiagramToolbarProps, DiagramLayout } from './DiagramToolbar.types';

/**
 * DiagramToolbar Component
 * Feature: 018-diagram-toolbar-redesign
 *
 * Professional toolbar for diagram controls with clear visual grouping.
 * Extracted from InteractiveDiagram.tsx to improve maintainability.
 *
 * Props are defined in DiagramToolbar.types.ts following strict interface contract.
 */
export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
  layout,
  onLayoutChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToView,
  svgContent,
  mermaidSource,
  onDownloadSVG,
  onDownloadMermaid,
  isLoading,
  onRegenerate,
  skillName: _skillName, // Unused but required by interface for download filenames
}) => {
  return (
    <div
      className="flex flex-wrap items-center gap-2 mb-4"
      role="toolbar"
      aria-label="Diagram toolbar"
    >
      {/* Layout Group */}
      <select
        value={layout}
        onChange={(e) => onLayoutChange(e.target.value as DiagramLayout)}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        aria-label="Diagram layout direction"
      >
        <option value="TD">Top to Bottom</option>
        <option value="LR">Left to Right</option>
      </select>

      {/* Zoom Group */}
      <div className="flex items-center gap-1 border border-gray-300 rounded-md">
        <button
          onClick={onZoomOut}
          className="px-3 py-1 text-sm hover:bg-gray-100"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={onResetZoom}
          className="px-3 py-1 text-sm hover:bg-gray-100 border-x border-gray-300"
          title="Reset Zoom"
          aria-label="Reset zoom to 100%"
        >
          {(zoom * 100).toFixed(0)}%
        </button>
        <button
          onClick={onZoomIn}
          className="px-3 py-1 text-sm hover:bg-gray-100"
          title="Zoom In"
          aria-label="Zoom in"
        >
          +
        </button>
      </div>

      {/* View Group */}
      <button
        onClick={onFitToView}
        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        aria-label="Fit diagram to viewport"
      >
        Fit to View
      </button>

      {/* Export Group */}
      <button
        onClick={onDownloadSVG}
        disabled={!svgContent}
        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
        aria-label="Download diagram as SVG file"
      >
        Download SVG
      </button>
      <button
        onClick={onDownloadMermaid}
        disabled={!mermaidSource}
        className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:bg-gray-300"
        aria-label="Download Mermaid source code"
      >
        Download Mermaid
      </button>

      {/* Regenerate Group */}
      <button
        onClick={onRegenerate}
        disabled={isLoading}
        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-300"
        aria-label="Force regenerate diagram"
      >
        {isLoading ? 'Rendering...' : '🔄 Regenerate'}
      </button>
    </div>
  );
};

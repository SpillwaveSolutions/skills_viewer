import React from 'react';
import type { DiagramToolbarProps, DiagramLayout } from './DiagramToolbar.types';
import { ZOOM_LIMITS } from './DiagramToolbar.types';

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
        className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-colors"
        aria-label="Diagram layout direction"
      >
        <option value="TD">Top to Bottom</option>
        <option value="LR">Left to Right</option>
      </select>

      {/* Zoom Group - Integrated button group with disabled states */}
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <button
          onClick={onZoomOut}
          disabled={zoom <= ZOOM_LIMITS.MIN}
          aria-disabled={zoom <= ZOOM_LIMITS.MIN}
          className="px-3 py-1 text-sm hover:bg-gray-100 hover:z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          title={zoom <= ZOOM_LIMITS.MIN ? 'Minimum zoom reached' : 'Zoom Out'}
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={onResetZoom}
          className="px-3 py-1 text-sm bg-gray-50 hover:bg-gray-100 hover:z-10 border-x border-gray-300 transition-colors"
          title="Reset Zoom"
          aria-label="Reset zoom to 100%"
        >
          {(zoom * 100).toFixed(0)}%
        </button>
        <button
          onClick={onZoomIn}
          disabled={zoom >= ZOOM_LIMITS.MAX}
          aria-disabled={zoom >= ZOOM_LIMITS.MAX}
          className="px-3 py-1 text-sm hover:bg-gray-100 hover:z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          title={zoom >= ZOOM_LIMITS.MAX ? 'Maximum zoom reached' : 'Zoom In'}
          aria-label="Zoom in"
        >
          +
        </button>
      </div>

      {/* View Group */}
      <button
        onClick={onFitToView}
        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-colors"
        aria-label="Fit diagram to viewport"
        title="Automatically scale diagram to fit view"
      >
        Fit to View
      </button>

      {/* Export Group */}
      <button
        onClick={onDownloadSVG}
        disabled={!svgContent}
        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
        aria-label="Download diagram as SVG file"
        title="Download as scalable vector graphic (SVG) - editable in design tools"
      >
        Download SVG
      </button>
      <button
        onClick={onDownloadMermaid}
        disabled={!mermaidSource}
        className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:bg-gray-300 transition-colors"
        aria-label="Download Mermaid source code"
        title="Download Mermaid source (.mmd) - editable diagram markup"
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

import React from 'react';
import { ZoomControls } from './ZoomControls';
import { FontSizeControls } from './FontSizeControls';
import { ExportControls } from './ExportControls';
import { LayoutSelector, DiagramLayout } from './LayoutSelector';

interface DiagramToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  fontSize: number;
  onFontSizeIncrease: () => void;
  onFontSizeDecrease: () => void;
  onFontSizeReset: () => void;
  layout: DiagramLayout;
  onLayoutChange: (layout: DiagramLayout) => void;
  diagramRef: React.RefObject<HTMLDivElement | null>;
  mermaidSource: string;
  skillName: string;
  onRegenerateDiagram?: () => void;
}

export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  fontSize,
  onFontSizeIncrease,
  onFontSizeDecrease,
  onFontSizeReset,
  layout,
  onLayoutChange,
  diagramRef,
  mermaidSource,
  skillName,
  onRegenerateDiagram,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-gray-100 rounded-lg p-3">
      <ZoomControls
        zoom={zoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomReset={onZoomReset}
      />

      <div className="w-px h-6 bg-gray-300" aria-hidden="true" />

      <FontSizeControls
        fontSize={fontSize}
        onIncrease={onFontSizeIncrease}
        onDecrease={onFontSizeDecrease}
        onReset={onFontSizeReset}
      />

      <div className="w-px h-6 bg-gray-300" aria-hidden="true" />

      <LayoutSelector layout={layout} onLayoutChange={onLayoutChange} />

      {onRegenerateDiagram && (
        <>
          <div className="w-px h-6 bg-gray-300" aria-hidden="true" />

          <button
            onClick={onRegenerateDiagram}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm flex items-center gap-2"
            title="Regenerate diagram using Claude AI (Feature 013)"
            aria-label="Regenerate diagram with AI"
          >
            <span className="text-lg">✨</span>
            <span>AI Regenerate</span>
          </button>
        </>
      )}

      <div className="w-px h-6 bg-gray-300" aria-hidden="true" />

      <ExportControls diagramRef={diagramRef} mermaidSource={mermaidSource} skillName={skillName} />

      <div className="ml-auto text-xs text-gray-600">
        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Cmd/Ctrl</kbd> +{' '}
        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">+/-/0</kbd> to zoom
      </div>
    </div>
  );
};

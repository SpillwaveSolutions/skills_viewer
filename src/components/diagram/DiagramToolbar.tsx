import React from 'react';
import { ZoomControls } from './ZoomControls';
import { ExportControls } from './ExportControls';
import { LayoutSelector, DiagramLayout } from './LayoutSelector';

interface DiagramToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  layout: DiagramLayout;
  onLayoutChange: (layout: DiagramLayout) => void;
  diagramRef: React.RefObject<HTMLDivElement>;
  mermaidSource: string;
  skillName: string;
}

export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  layout,
  onLayoutChange,
  diagramRef,
  mermaidSource,
  skillName,
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

      <LayoutSelector layout={layout} onLayoutChange={onLayoutChange} />

      <div className="w-px h-6 bg-gray-300" aria-hidden="true" />

      <ExportControls diagramRef={diagramRef} mermaidSource={mermaidSource} skillName={skillName} />

      <div className="ml-auto text-xs text-gray-600">
        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Cmd/Ctrl</kbd> +{' '}
        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">+/-/0</kbd> to zoom
      </div>
    </div>
  );
};

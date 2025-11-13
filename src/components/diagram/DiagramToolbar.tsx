import React from 'react';
import { ZoomControls } from './ZoomControls';
import { ExportControls } from './ExportControls';
import { LayoutSelector, DiagramLayout } from './LayoutSelector';

interface DiagramToolbarProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToFit: () => void;
  diagramRef: React.RefObject<HTMLDivElement | null>;
  mermaidSource: string;
  skillName: string;
  currentLayout: DiagramLayout;
  onLayoutChange: (layout: DiagramLayout) => void;
}

export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  diagramRef,
  mermaidSource,
  skillName,
  currentLayout,
  onLayoutChange,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
      <LayoutSelector currentLayout={currentLayout} onLayoutChange={onLayoutChange} />
      <div className="flex items-center gap-4">
        <ZoomControls
          zoomLevel={zoomLevel}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onZoomToFit={onZoomToFit}
        />
        <ExportControls
          diagramRef={diagramRef}
          mermaidSource={mermaidSource}
          skillName={skillName}
        />
      </div>
    </div>
  );
};

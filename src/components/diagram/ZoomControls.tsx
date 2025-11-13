import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToFit: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
}) => {
  return (
    <div className="flex items-center gap-2 bg-white border rounded-lg p-1">
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        aria-label="Zoom out"
        title="Zoom out (Cmd/Ctrl + -)"
      >
        <ZoomOut size={18} />
      </button>
      <span className="px-2 text-sm text-gray-600 min-w-[4rem] text-center">
        {Math.round(zoomLevel * 100)}%
      </span>
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        aria-label="Zoom in"
        title="Zoom in (Cmd/Ctrl + +)"
      >
        <ZoomIn size={18} />
      </button>
      <div className="w-px h-6 bg-gray-300" />
      <button
        onClick={onZoomToFit}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        aria-label="Zoom to fit"
        title="Fit to screen (Cmd/Ctrl + 0)"
      >
        <Maximize2 size={18} />
      </button>
    </div>
  );
};

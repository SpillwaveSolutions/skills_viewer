import React, { useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  className?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          onZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          onZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          onZoomReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onZoomIn, onZoomOut, onZoomReset]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={onZoomOut}
        className="p-2 bg-white rounded hover:bg-gray-50 border border-gray-300 transition-colors"
        aria-label="Zoom out (Cmd/Ctrl + -)"
        title="Zoom Out (Cmd/Ctrl + -)"
      >
        <ZoomOut className="w-4 h-4 text-gray-700" />
      </button>
      <span
        className="text-sm font-medium text-gray-700 min-w-[4rem] text-center"
        role="status"
        aria-label={`Current zoom level: ${Math.round(zoom * 100)} percent`}
      >
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={onZoomIn}
        className="p-2 bg-white rounded hover:bg-gray-50 border border-gray-300 transition-colors"
        aria-label="Zoom in (Cmd/Ctrl + +)"
        title="Zoom In (Cmd/Ctrl + +)"
      >
        <ZoomIn className="w-4 h-4 text-gray-700" />
      </button>
      <button
        onClick={onZoomReset}
        className="p-2 bg-white rounded hover:bg-gray-50 border border-gray-300 transition-colors"
        aria-label="Reset view to fit (Cmd/Ctrl + 0)"
        title="Zoom to Fit (Cmd/Ctrl + 0)"
      >
        <Maximize2 className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );
};

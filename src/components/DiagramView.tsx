import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Skill } from '../types';
import { generateSkillDiagram } from '../utils/diagramGenerator';

interface DiagramViewProps {
  skill: Skill;
}

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: false,
  },
});

export const DiagramView: React.FC<DiagramViewProps> = ({ skill }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1.0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(48);

  useEffect(() => {
    if (containerRef.current) {
      const diagram = generateSkillDiagram(skill);
      const id = `mermaid-${Date.now()}`;

      containerRef.current.innerHTML = `<div class="mermaid" id="${id}" style="font-size: ${fontSize}px !important;">${diagram}</div>`;

      mermaid.run({
        nodes: [containerRef.current.querySelector(`#${id}`)!],
      });
    }
  }, [skill, fontSize]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 50));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.5, 0.1));
  const handleZoomReset = () => {
    // Calculate zoom to fit diagram in window
    if (containerRef.current) {
      const diagram = containerRef.current.querySelector('.mermaid');
      if (diagram) {
        const diagramRect = diagram.getBoundingClientRect();
        const containerRect = containerRef.current.parentElement?.getBoundingClientRect();
        if (containerRect) {
          const scaleX = (containerRect.width * 0.9) / diagramRect.width;
          const scaleY = (containerRect.height * 0.9) / diagramRect.height;
          const fitZoom = Math.min(scaleX, scaleY, 1.0); // Don't zoom in beyond 100%
          setZoom(fitZoom);
          setPosition({ x: 0, y: 0 });
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY / 500; // Normalize wheel delta
    setZoom((z) => Math.min(Math.max(z + delta, 0.1), 50));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="p-6 bg-white h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Skill Architecture</h2>
          <p className="text-sm text-gray-600">
            Visual representation of {skill.name} and its dependencies
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-4 bg-gray-100 rounded-lg p-3">
          <button
            onClick={handleZoomOut}
            className="px-4 py-2 bg-white rounded hover:bg-gray-50 border border-gray-300 text-sm font-medium"
            title="Zoom Out"
          >
            🔍−
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[5rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="px-4 py-2 bg-white rounded hover:bg-gray-50 border border-gray-300 text-sm font-medium"
            title="Zoom In"
          >
            🔍+
          </button>
          <div className="w-px h-6 bg-gray-300"></div>
          <button
            onClick={handleZoomReset}
            className="px-4 py-2 bg-white rounded hover:bg-gray-50 border border-gray-300 text-sm font-medium"
            title="Reset View"
          >
            Reset
          </button>
          <div className="w-px h-6 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <label htmlFor="fontSize" className="text-sm font-medium text-gray-700">
              Font:
            </label>
            <input
              id="fontSize"
              type="number"
              min="8"
              max="200"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-white border border-gray-300 rounded text-sm text-center"
            />
            <span className="text-sm text-gray-600">px</span>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-hidden bg-gray-50 rounded-lg border border-gray-200 relative"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          ref={containerRef}
          className="flex items-center justify-center p-8 h-full"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        />
      </div>
    </div>
  );
};

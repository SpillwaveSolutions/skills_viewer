import React, { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Skill } from '../../types';
import { generateSkillDiagram, DiagramLayout } from '../../utils/diagramGenerator';
import { useDiagramCacheStore } from '../../stores/diagramCacheStore';
import { DiagramToolbar } from './DiagramToolbar';

interface InteractiveDiagramProps {
  skill: Skill;
  onNavigateToReference?: (path: string) => void;
  onNavigateToScript?: (name: string) => void;
}

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({
  skill,
  onNavigateToReference: _onNavigateToReference,
  onNavigateToScript: _onNavigateToScript,
}) => {
  const { getCachedSVG, setCachedSVG } = useDiagramCacheStore();
  const [svgContent, setSvgContent] = useState<string>('');
  const [mermaidSource, setMermaidSource] = useState<string>('');
  const [layout, setLayout] = useState<DiagramLayout>('TD');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom pan/zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(Math.max(0.1, prev * delta), 5));
  };

  // Mouse drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.1));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFitToView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Render diagram using cache or Rust backend
  const renderDiagram = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cachedSVG = getCachedSVG(skill.name, layout);
      if (cachedSVG) {
        console.log(`✅ Using cached diagram for ${skill.name} (${layout})`);
        setSvgContent(cachedSVG);
        setMermaidSource(generateSkillDiagram(skill, layout));
        setIsLoading(false);
        return;
      }

      // Generate fresh diagram
      const diagram = generateSkillDiagram(skill, layout);
      setMermaidSource(diagram);

      console.log(`🎨 Rendering diagram for ${skill.name} (${layout})...`);
      const svg = await invoke<string>('render_mermaid_to_svg', {
        mermaidCode: diagram,
      });

      console.log(`✅ Received SVG from backend, length: ${svg.length}`);

      // Cache the result
      setCachedSVG(skill.name, layout, svg, diagram);
      setSvgContent(svg);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ Failed to render diagram:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger render on skill or layout change
  useEffect(() => {
    renderDiagram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill.name, layout]);

  // Handle layout changes
  const handleLayoutChange = (newLayout: DiagramLayout) => {
    setLayout(newLayout);
  };

  // Download diagram as SVG
  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.name}-diagram.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download Mermaid source
  const handleDownloadMermaid = () => {
    if (!mermaidSource) return;
    const blob = new Blob([mermaidSource], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.name}-diagram.mmd`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-white h-full flex flex-col overflow-hidden">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Skill Architecture</h2>
        <p className="text-sm text-gray-600 mb-4">
          Visual representation of {skill.name} and its dependencies
        </p>

        {/* Toolbar - Feature 018 */}
        <DiagramToolbar
          layout={layout}
          onLayoutChange={handleLayoutChange}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onFitToView={handleFitToView}
          svgContent={svgContent}
          mermaidSource={mermaidSource}
          onDownloadSVG={handleDownloadSVG}
          onDownloadMermaid={handleDownloadMermaid}
          isLoading={isLoading}
          onRegenerate={renderDiagram}
          skillName={skill.name}
        />
      </div>

      {/* Diagram viewer */}
      <div
        className="flex-1 min-h-0 bg-gray-50 rounded-lg border border-gray-200 relative"
        ref={containerRef}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-gray-700 font-medium">Rendering diagram...</p>
              <p className="text-gray-500 text-sm mt-1">Calling Rust backend</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl">
              <h3 className="text-red-800 font-semibold text-lg mb-2">Diagram Rendering Error</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={renderDiagram}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && svgContent && (
          <div
            role="img"
            aria-label="Skill architecture diagram"
            tabIndex={0}
            className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onKeyDown={(e) => {
              // Handle keyboard zoom with + and - keys
              if (e.key === '+' || e.key === '=') handleZoomIn();
              if (e.key === '-' || e.key === '_') handleZoomOut();
              if (e.key === '0') handleResetZoom();
            }}
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-3 text-xs text-gray-500 flex-shrink-0">
        <p>
          <strong>Controls:</strong> Mouse wheel to zoom, click and drag to pan. Keyboard: +/- to
          zoom, 0 to reset. Current zoom: {(zoom * 100).toFixed(0)}%
        </p>
      </div>
    </div>
  );
};

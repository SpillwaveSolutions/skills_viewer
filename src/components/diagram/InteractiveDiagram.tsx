import React, { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Skill } from '../../types';
import { generateSkillDiagram, DiagramLayout } from '../../utils/diagramGenerator';
import { useDiagramCacheStore } from '../../stores/diagramCacheStore';
import { DiagramToolbar } from './DiagramToolbar';
import { diagramLogger as logger } from '../../utils/logger';

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
  const { getCachedSVG, setCachedSVG, addToPriorityQueue } = useDiagramCacheStore();
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
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Render diagram using cache or Rust backend (non-blocking with polling)
  const renderDiagram = async () => {
    // Clear any existing poll interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setError(null);

    try {
      // Check cache first (ALWAYS)
      const cachedSVG = getCachedSVG(skill.name, layout);
      if (cachedSVG) {
        logger.debug(`Using cached diagram for ${skill.name} (${layout})`);
        setSvgContent(cachedSVG);
        setMermaidSource(generateSkillDiagram(skill, layout));
        setIsLoading(false);
        return;
      }

      // NOT cached - show generating message (non-blocking)
      logger.info(`Diagram not cached, queuing for ${skill.name}`);
      setIsLoading(true); // Just a flag, not blocking UI
      addToPriorityQueue([skill.name]); // Add to high-priority background queue

      // Generate the Mermaid source immediately for display
      const diagram = generateSkillDiagram(skill, layout);
      setMermaidSource(diagram);

      // Start background rendering (fire and forget)
      invoke<string>('render_mermaid_to_svg', { mermaidCode: diagram })
        .then((svg) => {
          logger.debug(`Background render complete for ${skill.name}, caching...`);
          setCachedSVG(skill.name, layout, svg, diagram);
        })
        .catch((err) => {
          logger.error('Background render failed', err);
        });

      // Poll cache every 5 seconds until available (max 60 seconds)
      let attempts = 0;
      pollIntervalRef.current = setInterval(() => {
        const cached = getCachedSVG(skill.name, layout);
        if (cached) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setSvgContent(cached);
          setMermaidSource(generateSkillDiagram(skill, layout));
          setIsLoading(false);
          logger.info(`Diagram ready for ${skill.name} after ${attempts * 5}s`);
        } else if (attempts++ > 12) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setError('Diagram generation timed out. Please try regenerating.');
          setIsLoading(false);
          logger.warn(`Timeout waiting for ${skill.name} diagram after 60s`);
        }
      }, 5000); // Check every 5 seconds
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error('Failed to render diagram', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  // Trigger render on skill or layout change
  useEffect(() => {
    renderDiagram();

    // Cleanup: clear interval on unmount or when skill/layout changes
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
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
        {isLoading && !svgContent && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md text-center">
              <div className="text-blue-600 text-5xl mb-3">⏳</div>
              <h3 className="text-blue-900 font-semibold text-lg mb-2">Diagram Generating</h3>
              <p className="text-blue-700 mb-4">
                Your diagram is being generated in the background. Check back in a moment or click
                refresh.
              </p>
              <p className="text-blue-600 text-sm mb-4">Auto-checking every 5 seconds...</p>
              <button
                onClick={renderDiagram}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh Now
              </button>
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

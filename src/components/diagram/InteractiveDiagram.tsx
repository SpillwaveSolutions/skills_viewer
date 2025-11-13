import React, { useRef, useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import mermaid from 'mermaid';
import { ZoomControls } from './ZoomControls';

interface InteractiveDiagramProps {
  mermaidSource: string;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({
  mermaidSource,
  onNodeClick,
  className = '',
}) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (diagramRef.current && mermaidSource) {
      const renderDiagram = async () => {
        try {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral',
            securityLevel: 'loose',
            flowchart: {
              useMaxWidth: false,
            },
          });

          const id = `diagram-${Date.now()}`;
          const { svg } = await mermaid.render(id, mermaidSource);

          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
            setError(null);

            // Add click handlers to nodes
            if (onNodeClick) {
              const nodes = diagramRef.current.querySelectorAll('.node');
              nodes.forEach((node) => {
                const element = node as HTMLElement;
                element.style.cursor = 'pointer';
                element.addEventListener('click', (e) => {
                  e.stopPropagation();
                  const id = element.id || element.getAttribute('data-id');
                  if (id) onNodeClick(id);
                });
              });
            }
          }
        } catch (err) {
          console.error('Failed to render diagram:', err);
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      };

      renderDiagram();
    }
  }, [mermaidSource, onNodeClick]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-semibold">Failed to render diagram</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.1}
      maxScale={3}
      onZoom={(ref) => setZoomLevel(ref.state.scale)}
      wheel={{ step: 0.1 }}
      doubleClick={{ disabled: false, mode: 'zoomIn' }}
      panning={{ disabled: false }}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className={`relative h-full ${className}`}>
          <div className="absolute top-4 right-4 z-10">
            <ZoomControls
              zoomLevel={zoomLevel}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onZoomToFit={resetTransform}
            />
          </div>
          <TransformComponent
            wrapperClass="w-full h-full"
            contentClass="flex items-center justify-center"
          >
            <div ref={diagramRef} className="diagram-container p-8" />
          </TransformComponent>
        </div>
      )}
    </TransformWrapper>
  );
};

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import mermaid from 'mermaid';
import { Skill } from '../types';
import { generateSkillDiagram } from '../utils/diagramGenerator';
import { DiagramToolbar, DiagramLayout } from './diagram';

interface DiagramViewProps {
  skill: Skill;
}

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: false,
  },
});

export const DiagramView: React.FC<DiagramViewProps> = ({ skill }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<DiagramLayout>('TD');
  const [zoomLevel, setZoomLevel] = useState(1);
  const transformRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetTransform: () => void;
  } | null>(null);

  // Generate and render diagram
  useEffect(() => {
    if (diagramRef.current && skill) {
      const renderDiagram = async () => {
        try {
          const diagramSource = generateSkillDiagram(skill, layout);
          const id = `mermaid-${Date.now()}`;
          const { svg } = await mermaid.render(id, diagramSource);

          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Failed to render diagram:', error);
          if (diagramRef.current) {
            diagramRef.current.innerHTML = `
              <div class="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="font-semibold">Failed to render diagram</p>
                <p class="text-sm mt-2">${error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            `;
          }
        }
      };

      renderDiagram();
    }
  }, [skill, layout]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (isMod && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (isMod && e.key === '0') {
        e.preventDefault();
        handleZoomToFit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomToFit]);

  const handleZoomIn = useCallback(() => {
    if (transformRef.current) {
      transformRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (transformRef.current) {
      transformRef.current.zoomOut();
    }
  }, []);

  const handleZoomToFit = useCallback(() => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  }, []);

  const handleLayoutChange = useCallback((newLayout: DiagramLayout) => {
    setLayout(newLayout);
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      <DiagramToolbar
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomToFit={handleZoomToFit}
        diagramRef={diagramRef}
        mermaidSource={generateSkillDiagram(skill, layout)}
        skillName={skill.name}
        currentLayout={layout}
        onLayoutChange={handleLayoutChange}
      />

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-gray-50 relative"
        role="img"
        aria-label={`Architecture diagram for ${skill.name} showing ${skill.references.length} references and ${skill.scripts.length} scripts`}
      >
        <TransformWrapper
          initialScale={1}
          minScale={0.1}
          maxScale={3}
          onZoom={(ref) => setZoomLevel(ref.state.scale)}
          wheel={{ step: 0.1 }}
          doubleClick={{ disabled: false, mode: 'zoomIn' }}
          panning={{ disabled: false }}
          ref={transformRef}
        >
          <TransformComponent
            wrapperClass="w-full h-full"
            contentClass="flex items-center justify-center"
          >
            <div ref={diagramRef} className="diagram-container p-8" />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
};

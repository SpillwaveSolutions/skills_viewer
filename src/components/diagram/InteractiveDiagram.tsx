import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Skill } from '../../types';
import { generateSkillDiagram, DiagramLayout } from '../../utils/diagramGenerator';
import { DiagramToolbar } from './DiagramToolbar';

interface InteractiveDiagramProps {
  skill: Skill;
  onNavigateToReference?: (path: string) => void;
  onNavigateToScript?: (name: string) => void;
}

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: false,
  },
});

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({
  skill,
  onNavigateToReference,
  onNavigateToScript,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformRef = useRef<any>(null);
  const [layout, setLayout] = useState<DiagramLayout>('TD');
  const [mermaidSource, setMermaidSource] = useState('');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const addInteractivity = useCallback(() => {
    if (!containerRef.current) return;

    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    // Find all nodes in the diagram
    const nodes = svg.querySelectorAll('.node');

    nodes.forEach((node) => {
      const nodeElement = node as SVGElement;

      // Add hover effect
      nodeElement.style.cursor = 'pointer';

      nodeElement.addEventListener('mouseenter', () => {
        const nodeId = nodeElement.id || '';
        setHoveredNode(nodeId);

        // Highlight the node
        const rect = nodeElement.querySelector('rect, circle, polygon');
        if (rect) {
          rect.setAttribute('data-original-stroke', rect.getAttribute('stroke') || '');
          rect.setAttribute('data-original-stroke-width', rect.getAttribute('stroke-width') || '');
          rect.setAttribute('stroke', '#4F46E5');
          rect.setAttribute('stroke-width', '4');
        }
      });

      nodeElement.addEventListener('mouseleave', () => {
        setHoveredNode(null);

        // Restore original styling
        const rect = nodeElement.querySelector('rect, circle, polygon');
        if (rect) {
          rect.setAttribute('stroke', rect.getAttribute('data-original-stroke') || '');
          rect.setAttribute('stroke-width', rect.getAttribute('data-original-stroke-width') || '');
        }
      });

      // Add click handler
      nodeElement.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeId = nodeElement.id || '';

        // Extract node type and index from ID
        if (nodeId.startsWith('REF')) {
          const index = parseInt(nodeId.replace('REF', ''), 10);
          if (!isNaN(index) && skill.references[index] && onNavigateToReference) {
            onNavigateToReference(skill.references[index].path);
          }
        } else if (nodeId.startsWith('SCRIPT')) {
          const index = parseInt(nodeId.replace('SCRIPT', ''), 10);
          if (!isNaN(index) && skill.scripts[index] && onNavigateToScript) {
            onNavigateToScript(skill.scripts[index].name);
          }
        }
      });
    });
  }, [skill.references, skill.scripts, onNavigateToReference, onNavigateToScript]);

  useEffect(() => {
    const renderDiagram = async () => {
      if (containerRef.current) {
        const diagram = generateSkillDiagram(skill, layout);
        setMermaidSource(diagram);
        const id = `mermaid-${Date.now()}`;

        containerRef.current.innerHTML = `<div class="mermaid" id="${id}">${diagram}</div>`;

        try {
          await mermaid.run({
            nodes: [containerRef.current.querySelector(`#${id}`)!],
          });

          // Add click and hover handlers to diagram nodes
          addInteractivity();
        } catch (error) {
          console.error('Failed to render diagram:', error);
        }
      }
    };

    renderDiagram();
  }, [skill, layout, addInteractivity]);

  const handleZoomIn = () => {
    transformRef.current?.zoomIn(0.5);
  };

  const handleZoomOut = () => {
    transformRef.current?.zoomOut(0.5);
  };

  const handleZoomReset = () => {
    transformRef.current?.resetTransform();
  };

  return (
    <div className="p-6 bg-white h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Skill Architecture</h2>
        <p className="text-sm text-gray-600">
          Visual representation of {skill.name} and its dependencies
        </p>
      </div>

      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.1}
        maxScale={5}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
      >
        {({ ...rest }) => (
          <>
            <DiagramToolbar
              zoom={rest.state.scale}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomReset={handleZoomReset}
              layout={layout}
              onLayoutChange={setLayout}
              diagramRef={containerRef}
              mermaidSource={mermaidSource}
              skillName={skill.name}
            />

            <div className="flex-1 overflow-hidden bg-gray-50 rounded-lg border border-gray-200 relative mt-4">
              <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="w-full h-full flex items-center justify-center"
              >
                <div
                  ref={containerRef}
                  className="p-8"
                  role="img"
                  aria-label={`Architecture diagram for ${skill.name} showing ${skill.references.length} references and ${skill.scripts.length} scripts. Click nodes to navigate, scroll to zoom, drag to pan.`}
                />
              </TransformComponent>

              {hoveredNode && (
                <div className="absolute bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg px-3 py-2 text-sm">
                  <span className="text-gray-600">Click to navigate to </span>
                  <span className="font-medium text-gray-900">{hoveredNode}</span>
                </div>
              )}
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

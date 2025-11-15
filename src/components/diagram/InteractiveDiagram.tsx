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
  const containerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformRef = useRef<any>(null);
  const [layout, setLayout] = useState<DiagramLayout>('TD');
  const [mermaidSource, setMermaidSource] = useState('');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(14);

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

  // Apply font size to existing SVG (separate from render)
  useEffect(() => {
    if (containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.style.fontSize = `${fontSize}px`;
      }
    }
  }, [fontSize]);

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

          // Apply font size to SVG after render
          const svg = containerRef.current.querySelector('svg');
          if (svg) {
            svg.style.fontSize = `${fontSize}px`;
          }

          // Add click and hover handlers to diagram nodes
          addInteractivity();
        } catch (error) {
          console.error('Failed to render diagram:', error);
        }
      }
    };

    renderDiagram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill, layout]);

  const handleZoomIn = () => {
    transformRef.current?.zoomIn(0.5);
  };

  const handleZoomOut = () => {
    transformRef.current?.zoomOut(0.5);
  };

  const handleZoomReset = () => {
    transformRef.current?.resetTransform();
  };

  const handleFontSizeIncrease = () => {
    setFontSize((prev) => Math.min(prev + 2, 32));
  };

  const handleFontSizeDecrease = () => {
    setFontSize((prev) => Math.max(prev - 2, 8));
  };

  const handleFontSizeReset = () => {
    setFontSize(14);
  };

  const handleRegenerateDiagram = async () => {
    console.log('✨ AI Regenerate clicked for skill:', skill.name);
    console.log('📝 Feature 013: Intelligent Diagram Generation will be implemented here');
    console.log('Will call Claude CLI to generate improved Mermaid diagram');
    // TODO: Implement Claude CLI integration per Feature 013 spec (FR-003, FR-004, FR-005)
    // 1. Validate current Mermaid syntax (FR-001)
    // 2. Call `claude -p` with skill content (FR-003, FR-004)
    // 3. Parse response for Mermaid syntax (FR-005)
    // 4. Update diagram with generated content
    // 5. Show loading/error states (FR-013, FR-016)
  };

  return (
    <div className="p-6 bg-white h-full flex flex-col overflow-hidden">
      <div className="mb-4 flex-shrink-0">
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
        centerOnInit={false}
        centerZoomedOut={false}
        limitToBounds={false}
        alignmentAnimation={{ disabled: true }}
        velocityAnimation={{ disabled: true }}
        wheel={{
          step: 0.1,
          disabled: false,
        }}
        panning={{
          disabled: false,
          velocityDisabled: true,
        }}
        doubleClick={{ disabled: true }}
      >
        {({ ...rest }) => (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0">
              <DiagramToolbar
                zoom={rest.instance?.transformState.scale || 1}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomReset={handleZoomReset}
                fontSize={fontSize}
                onFontSizeIncrease={handleFontSizeIncrease}
                onFontSizeDecrease={handleFontSizeDecrease}
                onFontSizeReset={handleFontSizeReset}
                layout={layout}
                onLayoutChange={setLayout}
                diagramRef={containerRef}
                mermaidSource={mermaidSource}
                skillName={skill.name}
                onRegenerateDiagram={handleRegenerateDiagram}
              />
            </div>

            <div className="flex-1 min-h-0 overflow-hidden bg-gray-50 rounded-lg border border-gray-200 relative mt-4">
              <TransformComponent
                wrapperClass="w-full h-full !overflow-visible"
                contentClass="w-full h-full !overflow-visible"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    ref={containerRef}
                    className="p-8"
                    role="img"
                    aria-label={`Architecture diagram for ${skill.name} showing ${skill.references.length} references and ${skill.scripts.length} scripts. Click nodes to navigate, scroll to zoom, drag to pan.`}
                  />
                </div>
              </TransformComponent>

              {hoveredNode && (
                <div className="absolute bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg px-3 py-2 text-sm">
                  <span className="text-gray-600">Click to navigate to </span>
                  <span className="font-medium text-gray-900">{hoveredNode}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </TransformWrapper>
    </div>
  );
};

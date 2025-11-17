# Data Model: Diagram Toolbar Redesign

**Feature**: 018-diagram-toolbar-redesign
**Status**: N/A - No Data Model Changes

## Summary

This feature is a **pure UI redesign** with no data model changes. All state management uses existing patterns from Feature 016:

- **Zoom state**: Local React state in InteractiveDiagram component (`zoom`, `pan`)
- **Layout state**: Local React state in InteractiveDiagram component (`layout: DiagramLayout`)
- **Diagram cache**: Existing Zustand store (`useDiagramCacheStore`)
- **Loading state**: Local React state (`isLoading`)

## Existing State (Unchanged)

### InteractiveDiagram Component State

```typescript
// From src/components/diagram/InteractiveDiagram.tsx

const [zoom, setZoom] = useState(1); // Zoom level (0.1 to 5.0)
const [pan, setPan] = useState({ x: 0, y: 0 }); // Pan offset
const [layout, setLayout] = useState<DiagramLayout>('TD'); // TD or LR
const [isLoading, setIsLoading] = useState(false); // Backend rendering
const [svgContent, setSvgContent] = useState<string>(''); // Cached SVG
const [mermaidSource, setMermaidSource] = useState<string>(''); // Mermaid code
```

### Zustand Store (Unchanged)

```typescript
// From src/stores/diagramCacheStore.ts

interface DiagramCacheStore {
  cache: Map<string, { svg: string; mermaid: string; timestamp: number }>;
  getCachedSVG: (skillName: string, layout: DiagramLayout) => string | null;
  setCachedSVG: (skillName: string, layout: DiagramLayout, svg: string, mermaid: string) => void;
  clearCache: () => void;
}
```

## Why No Data Model?

This feature:

- Refactors toolbar JSX for better visual grouping
- Extracts toolbar into separate DiagramToolbar component
- Passes existing state as props (no new state introduced)
- Preserves all existing functionality

**No new entities, no new state, no storage changes.**

## Component Prop Flow

```
InteractiveDiagram (parent)
  │
  ├─ State: zoom, pan, layout, isLoading, svgContent, mermaidSource
  │
  └─ DiagramToolbar (child - new component)
       └─ Props: {
            layout, onLayoutChange,
            zoom, onZoomIn, onZoomOut, onResetZoom, onFitToView,
            svgContent, mermaidSource, onDownloadSVG, onDownloadMermaid,
            isLoading, onRegenerate,
            skillName
          }
```

See [contracts/toolbar-props.ts](./contracts/toolbar-props.ts) for detailed prop interface.

## Next Steps

Since there's no data model to design, proceed directly to:

1. **quickstart.md** - Testing guide
2. **Update agent context** - Add TailwindCSS, Vitest, Playwright (if not present)
3. **tasks.md** (/speckit.tasks command) - TDD task breakdown

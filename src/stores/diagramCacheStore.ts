import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DiagramLayout = 'TD' | 'TB' | 'LR' | 'RL';

interface CachedDiagram {
  svg: string;
  mermaidSource: string;
  timestamp: number;
}

interface DiagramCache {
  [skillName: string]: {
    [layout: string]: CachedDiagram;
  };
}

interface DiagramCacheState {
  cache: DiagramCache;
  renderQueue: string[]; // Queue of skill names to pre-render
  currentlyRendering: string | null;

  // Cache operations
  getCachedSVG: (skillName: string, layout: DiagramLayout) => string | null;
  setCachedSVG: (
    skillName: string,
    layout: DiagramLayout,
    svg: string,
    mermaidSource: string
  ) => void;
  hasCached: (skillName: string, layout: DiagramLayout) => boolean;

  // Queue operations
  addToQueue: (skillNames: string[]) => void;
  setCurrentlyRendering: (skillName: string | null) => void;
  removeFromQueue: (skillName: string) => void;
  getNextInQueue: () => string | null;

  // Clear cache
  clearCache: () => void;
}

export const useDiagramCacheStore = create<DiagramCacheState>()(
  persist(
    (set, get) => ({
      cache: {},
      renderQueue: [],
      currentlyRendering: null,

      getCachedSVG: (skillName: string, layout: DiagramLayout) => {
        const cached = get().cache[skillName]?.[layout];
        if (!cached) return null;

        // Check if cache is still fresh (24 hours)
        const now = Date.now();
        const age = now - cached.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (age > maxAge) {
          // Cache expired
          return null;
        }

        return cached.svg;
      },

      setCachedSVG: (
        skillName: string,
        layout: DiagramLayout,
        svg: string,
        mermaidSource: string
      ) => {
        set((state) => ({
          cache: {
            ...state.cache,
            [skillName]: {
              ...state.cache[skillName],
              [layout]: {
                svg,
                mermaidSource,
                timestamp: Date.now(),
              },
            },
          },
        }));
      },

      hasCached: (skillName: string, layout: DiagramLayout) => {
        return get().getCachedSVG(skillName, layout) !== null;
      },

      addToQueue: (skillNames: string[]) => {
        set((state) => {
          const uniqueSkills = [...new Set([...state.renderQueue, ...skillNames])];
          return { renderQueue: uniqueSkills };
        });
      },

      setCurrentlyRendering: (skillName: string | null) => {
        set({ currentlyRendering: skillName });
      },

      removeFromQueue: (skillName: string) => {
        set((state) => ({
          renderQueue: state.renderQueue.filter((name) => name !== skillName),
        }));
      },

      getNextInQueue: () => {
        const queue = get().renderQueue;
        return queue.length > 0 ? queue[0] : null;
      },

      clearCache: () => {
        set({ cache: {}, renderQueue: [], currentlyRendering: null });
      },
    }),
    {
      name: 'diagram-cache-storage',
      // Only persist the cache, not the queue
      partialize: (state) => ({ cache: state.cache }),
    }
  )
);

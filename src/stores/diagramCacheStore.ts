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
  priorityQueue: string[]; // High-priority queue for user-selected skills
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
  addToPriorityQueue: (skillNames: string[]) => void;
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
      priorityQueue: [],
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

      addToPriorityQueue: (skillNames: string[]) => {
        set((state) => ({
          priorityQueue: [...new Set([...skillNames, ...state.priorityQueue])],
        }));
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
        const state = get();
        // Check priority queue first
        if (state.priorityQueue.length > 0) {
          const next = state.priorityQueue[0];
          set({ priorityQueue: state.priorityQueue.slice(1) });
          return next;
        }
        // Fall back to regular queue
        if (state.renderQueue.length > 0) {
          const next = state.renderQueue[0];
          set({ renderQueue: state.renderQueue.slice(1) });
          return next;
        }
        return null;
      },

      clearCache: () => {
        set({ cache: {}, renderQueue: [], priorityQueue: [], currentlyRendering: null });
      },
    }),
    {
      name: 'diagram-cache-storage',
      // Only persist the cache, not the queue
      partialize: (state) => ({ cache: state.cache }),
    }
  )
);

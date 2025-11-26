import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SpecCompliance {
  score: number;
  violations: Array<{
    rule: string;
    message: string;
    fix_suggestion?: string;
    line_number?: number;
  }>;
  warnings: Array<{
    rule: string;
    message: string;
    recommendation?: string;
  }>;
}

interface PDAAnalysis {
  score: number;
  token_estimate: number;
  tier_breakdown: {
    metadata_tokens: number;
    orchestrator_tokens: number;
    resource_tokens: number;
  };
  recommendations: string[];
  suggested_structure: string[];
  ai_insights?: string[]; // Only present in detailed (LLM-based) analysis
}

interface CachedAnalysis {
  specCompliance: SpecCompliance;
  quickPdaAnalysis: PDAAnalysis; // Script-based, instant
  detailedPdaAnalysis?: PDAAnalysis; // LLM-based, optional
  timestamp: number;
  detailedTimestamp?: number; // Separate timestamp for detailed analysis
}

interface AnalysisCache {
  [skillName: string]: CachedAnalysis;
}

export type AnalysisTaskStatus = 'idle' | 'running' | 'completed' | 'error';

interface AnalysisState {
  cache: AnalysisCache;

  // Analysis task status (for LED indicator)
  analysisStatus: AnalysisTaskStatus;
  currentSkillName: string | null;
  analysisError: string | null;

  // Cache operations
  getCachedAnalysis: (skillName: string) => CachedAnalysis | null;

  // Set quick analysis (spec + quick PDA)
  setCachedAnalysis: (
    skillName: string,
    specCompliance: SpecCompliance,
    quickPdaAnalysis: PDAAnalysis
  ) => void;

  // Set detailed PDA analysis (called when LLM analysis completes)
  setDetailedPdaAnalysis: (skillName: string, detailedPdaAnalysis: PDAAnalysis) => void;

  hasCached: (skillName: string) => boolean;
  clearCache: (skillName?: string) => void;

  // Analysis status operations
  setAnalysisRunning: (skillName: string) => void;
  setAnalysisCompleted: () => void;
  setAnalysisError: (error: string) => void;
  clearAnalysisStatus: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      cache: {},
      analysisStatus: 'idle',
      currentSkillName: null,
      analysisError: null,

      getCachedAnalysis: (skillName: string) => {
        const cached = get().cache[skillName];
        if (!cached) return null;

        // Check if cache is still fresh (24 hours)
        const now = Date.now();
        const age = now - cached.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (age > maxAge) {
          // Cache expired
          return null;
        }

        return cached;
      },

      setCachedAnalysis: (
        skillName: string,
        specCompliance: SpecCompliance,
        quickPdaAnalysis: PDAAnalysis
      ) => {
        set((state) => ({
          cache: {
            ...state.cache,
            [skillName]: {
              specCompliance,
              quickPdaAnalysis,
              detailedPdaAnalysis: state.cache[skillName]?.detailedPdaAnalysis, // Preserve existing detailed analysis
              timestamp: Date.now(),
              detailedTimestamp: state.cache[skillName]?.detailedTimestamp, // Preserve detailed timestamp
            },
          },
        }));
      },

      setDetailedPdaAnalysis: (skillName: string, detailedPdaAnalysis: PDAAnalysis) => {
        set((state) => {
          const existing = state.cache[skillName];
          if (!existing) {
            // No quick analysis yet - should not happen in normal flow
            console.warn(
              `Setting detailed analysis for ${skillName} but no quick analysis exists yet`
            );
            return state;
          }

          return {
            cache: {
              ...state.cache,
              [skillName]: {
                ...existing,
                detailedPdaAnalysis,
                detailedTimestamp: Date.now(),
              },
            },
          };
        });
      },

      hasCached: (skillName: string) => {
        return get().getCachedAnalysis(skillName) !== null;
      },

      clearCache: (skillName?: string) => {
        if (skillName) {
          // Clear specific skill
          set((state) => {
            const newCache = { ...state.cache };
            delete newCache[skillName];
            return { cache: newCache };
          });
        } else {
          // Clear all
          set({ cache: {} });
        }
      },

      // Analysis status operations (for LED indicator)
      setAnalysisRunning: (skillName: string) => {
        set({
          analysisStatus: 'running',
          currentSkillName: skillName,
          analysisError: null,
        });
      },

      setAnalysisCompleted: () => {
        set({
          analysisStatus: 'completed',
          analysisError: null,
        });
        // Auto-clear after 3 seconds
        setTimeout(() => {
          const state = get();
          if (state.analysisStatus === 'completed') {
            set({ analysisStatus: 'idle', currentSkillName: null });
          }
        }, 3000);
      },

      setAnalysisError: (error: string) => {
        set({
          analysisStatus: 'error',
          analysisError: error,
        });
      },

      clearAnalysisStatus: () => {
        set({
          analysisStatus: 'idle',
          currentSkillName: null,
          analysisError: null,
        });
      },
    }),
    {
      name: 'analysis-cache-storage',
      partialize: (state) => ({ cache: state.cache }), // Don't persist status, only cache
    }
  )
);

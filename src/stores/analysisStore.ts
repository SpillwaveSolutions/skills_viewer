import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';

// =============================================================================
// Types for FR-009, FR-010, FR-011: Markdown Report System
// =============================================================================

export type AnalyzerStatus = 'pending' | 'running' | 'complete' | 'error';
export type OverallStatus = 'idle' | 'running' | 'complete' | 'error';
// Backward compatibility alias (note: 'completed' maps to 'complete')
export type AnalysisTaskStatus = OverallStatus;

export interface AnalyzerReport {
  analyzer_name: string;
  markdown: string;
  json_data: unknown;
  status: AnalyzerStatus;
  duration_ms: number;
  score?: number;
}

export interface AnalysisProgressStatus {
  analysis_id: string;
  skill_name: string;
  overall_status: OverallStatus;
  spec: AnalyzerStatus;
  pda: AnalyzerStatus;
  permissions: AnalyzerStatus;
  triggers: AnalyzerStatus;
  links: AnalyzerStatus;
  error?: string;
}

// =============================================================================
// Existing Types (backward compatibility)
// =============================================================================

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
  contentHash: string; // Hash of skill content for cache invalidation
}

interface AnalysisCache {
  [skillName: string]: CachedAnalysis;
}

// Simple hash function for content-based cache invalidation
function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16) + '-' + content.length;
}

interface AnalysisState {
  cache: AnalysisCache;

  // =============================================================================
  // FR-009, FR-010, FR-011: Markdown Report State
  // =============================================================================
  currentAnalysisId: string | null;
  currentSkillName: string | null;
  analysisStatus: OverallStatus;
  analyzerProgress: AnalysisProgressStatus | null;
  analyzerReports: {
    spec: AnalyzerReport | null;
    pda: AnalyzerReport | null;
    permissions: AnalyzerReport | null;
    triggers: AnalyzerReport | null;
    links: AnalyzerReport | null;
  };
  compositeReport: string | null;
  analysisError: string | null;

  // Markdown Report Actions
  startFullAnalysis: (skillName: string, skillPath: string, skillContent: string) => Promise<void>;
  pollAnalysisProgress: () => Promise<void>;
  fetchAnalyzerReport: (
    analyzer: 'spec' | 'pda' | 'permissions' | 'triggers' | 'links'
  ) => Promise<void>;
  fetchCompositeReport: () => Promise<void>;
  resetAnalysis: () => void;

  // =============================================================================
  // Cache Operations
  // =============================================================================
  getCachedAnalysis: (skillName: string, content?: string) => CachedAnalysis | null;

  // Set quick analysis (spec + quick PDA)
  setCachedAnalysis: (
    skillName: string,
    specCompliance: SpecCompliance,
    quickPdaAnalysis: PDAAnalysis,
    content: string
  ) => void;

  // Set detailed PDA analysis (called when LLM analysis completes)
  setDetailedPdaAnalysis: (skillName: string, detailedPdaAnalysis: PDAAnalysis) => void;

  hasCached: (skillName: string) => boolean;
  clearCache: (skillName?: string) => void;

  // Analysis status operations (for LED indicator)
  setAnalysisRunning: (skillName: string) => void;
  setAnalysisCompleted: () => void;
  setAnalysisError: (error: string) => void;
  clearAnalysisStatus: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      cache: {},

      // =============================================================================
      // FR-009, FR-010, FR-011: Markdown Report State
      // =============================================================================
      currentAnalysisId: null,
      currentSkillName: null,
      analysisStatus: 'idle' as OverallStatus,
      analyzerProgress: null,
      analyzerReports: {
        spec: null,
        pda: null,
        permissions: null,
        triggers: null,
        links: null,
      },
      compositeReport: null,
      analysisError: null,

      // Start full analysis with all analyzers
      startFullAnalysis: async (skillName: string, skillPath: string, skillContent: string) => {
        try {
          // Reset state
          set({
            currentSkillName: skillName,
            analysisStatus: 'running',
            analyzerProgress: null,
            analyzerReports: {
              spec: null,
              pda: null,
              permissions: null,
              triggers: null,
              links: null,
            },
            compositeReport: null,
            analysisError: null,
          });

          // Start analysis on backend
          const analysisId = await invoke<string>('start_full_analysis', {
            skillName,
            skillPath,
            skillContent,
          });

          set({ currentAnalysisId: analysisId });
        } catch (error) {
          set({
            analysisStatus: 'error',
            analysisError: error instanceof Error ? error.message : String(error),
          });
        }
      },

      // Poll for analysis progress
      pollAnalysisProgress: async () => {
        const { currentAnalysisId } = get();
        if (!currentAnalysisId) return;

        try {
          const progress = await invoke<AnalysisProgressStatus>('get_analysis_progress', {
            analysisId: currentAnalysisId,
          });

          set({
            analyzerProgress: progress,
            analysisStatus: progress.overall_status as OverallStatus,
          });

          // Fetch completed reports
          const analyzers = ['spec', 'pda', 'permissions', 'triggers', 'links'] as const;
          for (const analyzer of analyzers) {
            const status = progress[analyzer];
            const currentReport = get().analyzerReports[analyzer];

            // Fetch report if complete and not already fetched
            if ((status === 'complete' || status === 'error') && !currentReport) {
              await get().fetchAnalyzerReport(analyzer);
            }
          }

          // Fetch composite if all complete
          if (progress.overall_status === 'complete' && !get().compositeReport) {
            await get().fetchCompositeReport();
          }
        } catch (error) {
          console.error('Failed to poll analysis progress:', error);
        }
      },

      // Fetch a specific analyzer's report
      fetchAnalyzerReport: async (
        analyzer: 'spec' | 'pda' | 'permissions' | 'triggers' | 'links'
      ) => {
        const { currentAnalysisId } = get();
        if (!currentAnalysisId) return;

        try {
          const report = await invoke<AnalyzerReport | null>('get_analyzer_report', {
            analysisId: currentAnalysisId,
            analyzer,
          });

          if (report) {
            set((state) => ({
              analyzerReports: {
                ...state.analyzerReports,
                [analyzer]: report,
              },
            }));
          }
        } catch (error) {
          console.error(`Failed to fetch ${analyzer} report:`, error);
        }
      },

      // Fetch composite report
      fetchCompositeReport: async () => {
        const { currentAnalysisId } = get();
        if (!currentAnalysisId) return;

        try {
          const composite = await invoke<string | null>('get_composite_report', {
            analysisId: currentAnalysisId,
          });

          if (composite) {
            set({ compositeReport: composite });
          }
        } catch (error) {
          console.error('Failed to fetch composite report:', error);
        }
      },

      // Reset analysis state
      resetAnalysis: () => {
        set({
          currentAnalysisId: null,
          currentSkillName: null,
          analysisStatus: 'idle',
          analyzerProgress: null,
          analyzerReports: {
            spec: null,
            pda: null,
            permissions: null,
            triggers: null,
            links: null,
          },
          compositeReport: null,
          analysisError: null,
        });
      },

      // =============================================================================
      // Cache Operations
      // =============================================================================
      getCachedAnalysis: (skillName: string, content?: string) => {
        const cached = get().cache[skillName];
        if (!cached) return null;

        // Check if content has changed (if content provided)
        if (content && cached.contentHash !== hashContent(content)) {
          // Content changed, invalidate cache
          return null;
        }

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
        quickPdaAnalysis: PDAAnalysis,
        content: string
      ) => {
        const newContentHash = hashContent(content);
        const existingCache = get().cache[skillName];

        // Only preserve detailed analysis if content hasn't changed
        const preserveDetailed = existingCache?.contentHash === newContentHash;

        set((state) => ({
          cache: {
            ...state.cache,
            [skillName]: {
              specCompliance,
              quickPdaAnalysis,
              contentHash: newContentHash,
              detailedPdaAnalysis: preserveDetailed ? state.cache[skillName]?.detailedPdaAnalysis : undefined,
              timestamp: Date.now(),
              detailedTimestamp: preserveDetailed ? state.cache[skillName]?.detailedTimestamp : undefined,
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
          analysisStatus: 'complete',
          analysisError: null,
        });
        // Auto-clear after 3 seconds
        setTimeout(() => {
          const state = get();
          if (state.analysisStatus === 'complete') {
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

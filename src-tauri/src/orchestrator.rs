// Feature 021: Async Analysis Orchestrator (Phase 4)
// Manages background LLM-based PDA analysis with concurrent execution limits

use crate::analyzers::pda_scorer;
use crate::models::analysis::PDAAnalysis;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::task::JoinHandle;
use uuid::Uuid;

/// Analysis job status
#[derive(Debug, Clone)]
pub enum JobStatus {
    /// Analysis is currently running
    Running { progress: u8 },
    /// Analysis completed successfully
    Completed { result: PDAAnalysis },
    /// Analysis failed with error
    Failed { error: String },
}

/// Active analysis job
struct AnalysisJob {
    skill_name: String,
    status: JobStatus,
    task_handle: Option<JoinHandle<()>>,
}

/// Global orchestrator instance
pub struct AnalysisOrchestrator {
    /// Active jobs keyed by analysis ID
    jobs: Arc<DashMap<String, AnalysisJob>>,
    /// Maximum concurrent analyses
    max_concurrent: usize,
}

impl AnalysisOrchestrator {
    /// Create new orchestrator with max 5 concurrent analyses
    pub fn new() -> Self {
        Self {
            jobs: Arc::new(DashMap::new()),
            max_concurrent: 5,
        }
    }

    /// Start a new detailed (LLM-based) analysis in the background
    /// Returns analysis ID for polling
    pub async fn start_detailed_analysis(
        &self,
        skill_name: String,
        skill_content: String,
        script_analysis: PDAAnalysis,
    ) -> Result<String, String> {
        // Check concurrent limit
        let running_count = self
            .jobs
            .iter()
            .filter(|entry| matches!(entry.value().status, JobStatus::Running { .. }))
            .count();

        if running_count >= self.max_concurrent {
            return Err(format!(
                "Maximum concurrent analyses reached ({}/{}). Please wait for an analysis to complete.",
                running_count, self.max_concurrent
            ));
        }

        // Generate unique analysis ID
        let analysis_id = Uuid::new_v4().to_string();

        // Create job entry
        let job = AnalysisJob {
            skill_name: skill_name.clone(),
            status: JobStatus::Running { progress: 0 },
            task_handle: None,
        };

        self.jobs.insert(analysis_id.clone(), job);

        // Spawn background task
        let jobs = self.jobs.clone();
        let id = analysis_id.clone();
        let handle = tokio::spawn(async move {
            // Update progress: Starting LLM analysis
            if let Some(mut entry) = jobs.get_mut(&id) {
                entry.status = JobStatus::Running { progress: 10 };
            }

            // Run LLM-based analysis
            match pda_scorer::analyze_pda_with_llm(&skill_content, &script_analysis).await {
                Ok(result) => {
                    // Success - store result
                    if let Some(mut entry) = jobs.get_mut(&id) {
                        entry.status = JobStatus::Completed { result };
                    }
                }
                Err(error) => {
                    // Failure - store error
                    if let Some(mut entry) = jobs.get_mut(&id) {
                        entry.status = JobStatus::Failed { error };
                    }
                }
            }
        });

        // Store task handle for potential cancellation
        if let Some(mut entry) = self.jobs.get_mut(&analysis_id) {
            entry.task_handle = Some(handle);
        }

        Ok(analysis_id)
    }

    /// Get status of an analysis job
    pub fn get_status(&self, analysis_id: &str) -> Option<JobStatus> {
        self.jobs.get(analysis_id).map(|entry| entry.status.clone())
    }

    /// Get all active job IDs for a specific skill
    pub fn get_jobs_for_skill(&self, skill_name: &str) -> Vec<String> {
        self.jobs
            .iter()
            .filter(|entry| entry.value().skill_name == skill_name)
            .map(|entry| entry.key().clone())
            .collect()
    }

    /// Remove completed or failed jobs (cleanup)
    pub fn cleanup_finished_jobs(&self) {
        self.jobs.retain(|_, job| {
            matches!(job.status, JobStatus::Running { .. })
        });
    }

    /// Get count of currently running analyses
    pub fn running_count(&self) -> usize {
        self.jobs
            .iter()
            .filter(|entry| matches!(entry.value().status, JobStatus::Running { .. }))
            .count()
    }
}

// Global singleton orchestrator
lazy_static::lazy_static! {
    pub static ref ORCHESTRATOR: AnalysisOrchestrator = AnalysisOrchestrator::new();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_orchestrator_creation() {
        let orchestrator = AnalysisOrchestrator::new();
        assert_eq!(orchestrator.max_concurrent, 5);
        assert_eq!(orchestrator.running_count(), 0);
    }

    #[test]
    fn test_job_status_variants() {
        let running = JobStatus::Running { progress: 50 };
        assert!(matches!(running, JobStatus::Running { .. }));

        let completed = JobStatus::Completed {
            result: PDAAnalysis {
                score: 85,
                token_estimate: 3000,
                tier_breakdown: crate::models::analysis::TierBreakdown {
                    metadata_tokens: 100,
                    orchestrator_tokens: 1500,
                    resource_tokens: 1400,
                },
                recommendations: vec![],
                suggested_structure: vec![],
                ai_insights: Some(vec!["Test insight".to_string()]),
            },
        };
        assert!(matches!(completed, JobStatus::Completed { .. }));

        let failed = JobStatus::Failed {
            error: "Test error".to_string(),
        };
        assert!(matches!(failed, JobStatus::Failed { .. }));
    }
}

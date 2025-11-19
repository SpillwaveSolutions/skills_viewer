// Feature 021: Analysis Data Models
// Defines all data structures for skill analysis results

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// Main analysis result container
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillAnalysisResult {
    pub analysis_id: String,
    pub skill_name: String,
    pub skill_path: String,
    pub timestamp: DateTime<Utc>,
    pub status: AnalysisStatus,
    pub progress: u8,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spec_compliance: Option<SpecCompliance>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pda_analysis: Option<PDAAnalysis>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub security_review: Option<SecurityReview>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trigger_suggestions: Option<Vec<TriggerSuggestion>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub link_validation: Option<LinkValidation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AnalysisStatus {
    Running,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpecCompliance {
    pub score: u8,
    pub violations: Vec<Violation>,
    pub warnings: Vec<Warning>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Violation {
    pub rule: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fix_suggestion: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line_number: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Warning {
    pub rule: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub recommendation: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PDAAnalysis {
    pub score: u8,
    pub token_estimate: usize,
    pub tier_breakdown: TierBreakdown,
    pub recommendations: Vec<String>,
    pub suggested_structure: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TierBreakdown {
    pub metadata_tokens: usize,
    pub orchestrator_tokens: usize,
    pub resource_tokens: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityReview {
    pub score: u8,
    pub unused_permissions: Vec<String>,
    pub high_risk_permissions: Vec<RiskFlag>,
    pub minimum_required: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFlag {
    pub permission: String,
    pub risk_level: RiskLevel,
    pub explanation: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mitigation: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RiskLevel {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriggerSuggestion {
    pub keyword: String,
    pub relevance_score: u8,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkValidation {
    pub total_links: usize,
    pub valid_links: usize,
    pub broken_links: Vec<BrokenLink>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrokenLink {
    pub url: String,
    pub line_number: usize,
    pub error: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CLIDetectionResult {
    pub claude_available: bool,
    pub opencode_available: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub claude_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub opencode_path: Option<String>,
}

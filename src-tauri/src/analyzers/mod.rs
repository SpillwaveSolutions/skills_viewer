// Feature 021: Skill Analysis Modules
// This module contains all skill analyzers for validation, PDA scoring, security review, etc.

pub mod spec_validator;
pub mod pda_scorer;
pub mod permissions_analyzer;
pub mod trigger_analyzer;
pub mod link_validator;
pub mod report_generator;

// Re-export the report generator trait and functions
pub use report_generator::{generate_composite_report, generate_triggers_report, MarkdownReportGenerator};

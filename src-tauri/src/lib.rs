mod commands;
mod models;
mod utils;
mod analyzers;
mod orchestrator;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    println!("Greeting user: {}", name);
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::scan_skills,
            commands::read_file_content,
            commands::render_mermaid_to_svg,
            commands::detect_cli,
            commands::validate_skill,
            commands::analyze_pda,
            commands::start_detailed_pda_analysis,
            commands::get_pda_analysis_status,
            commands::validate_skill_links,
            commands::analyze_permissions,
            commands::suggest_triggers,
            // FR-009, FR-010, FR-011: Markdown Report Commands
            commands::start_full_analysis,
            commands::get_analysis_progress,
            commands::get_analyzer_report,
            commands::get_composite_report
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    println!("✅ Tauri application started successfully");
}

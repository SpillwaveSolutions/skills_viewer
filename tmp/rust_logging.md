# Rust Logging Plan

## Current State

Currently, the `tauri-plugin-log` has been temporarily removed from the `src-tauri/src/lib.rs` configuration due to API changes in `v2` that caused compilation errors. All `log::info!`, `log::debug!`, `log::warn!`, and `log::error!` macros have been replaced with `println!` and `eprintln!` respectively, to allow the Rust backend to compile.

## Goal

The goal is to re-integrate a robust logging solution using `tauri-plugin-log` v2, ensuring that log messages are properly captured and displayed, both in the webview console and potentially to a log file.

## Steps

1.  **Research `tauri-plugin-log` v2 API:**
    - Consult the official documentation for `tauri-plugin-log` v2 to understand the correct API for initialization and configuration, specifically regarding `Target` enums and builder patterns.
    - Identify the correct way to configure targets such as `Stdout`, `Webview`, and `LogDir`.

2.  **Update `Cargo.toml` (if necessary):**
    - Verify that `tauri-plugin-log` is correctly listed in `src-tauri/Cargo.toml` with the appropriate `v2` version.

3.  **Configure `tauri-plugin-log` in `src-tauri/src/lib.rs`:**
    - Modify the `run` function in `src-tauri/src/lib.rs` to initialize `tauri-plugin-log` using the correct `v2` API.
    - Configure desired log targets (e.g., `Stdout`, `Webview`, `LogDir`) and the minimum log level (e.g., `Debug`).

4.  **Revert `println!`/`eprintln!` to `log` macros:**
    - Go through all Rust files in `src-tauri/src/` and replace `println!` with `log::info!` or `log::debug!`, and `eprintln!` with `log::error!` or `log::warn!`, as appropriate for the context of the message.
    - Add `use log::{info, debug, error, warn};` statements back to files where they are used.

5.  **Verify Logging Output:**
    - Run the application in development mode (`npm run tauri dev`).
    - Check the developer console in the webview for log messages.
    - Verify that log files are being created in the specified directory (if `LogDir` target is enabled).
    - Ensure that different log levels are correctly filtered and displayed.

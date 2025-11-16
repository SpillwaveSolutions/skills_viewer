use std::process::Command;
use tempfile::Builder;
use std::fs;

/// Renders Mermaid diagram code to SVG using mermaid-cli (mmdc)
///
/// # Architecture
/// 1. Write Mermaid code to temporary .mmd file
/// 2. Execute `npx -p @mermaid-js/mermaid-cli mmdc -i input.mmd -o output.svg`
/// 3. Read SVG output file
/// 4. Return SVG string to frontend
///
/// # Error Handling
/// - Returns Err() if mmdc command fails
/// - Returns Err() if file I/O fails
/// - Logs detailed error information for debugging
#[tauri::command]
pub fn render_mermaid_to_svg(mermaid_code: String) -> Result<String, String> {
    println!("🎨 render_mermaid_to_svg called, code length: {} chars", mermaid_code.len());

    // Validate input
    if mermaid_code.trim().is_empty() {
        eprintln!("❌ Empty mermaid code provided");
        return Err("Mermaid code cannot be empty".to_string());
    }

    println!("First 100 chars: {}", &mermaid_code[..mermaid_code.len().min(100)]);

    // Step 1: Create temporary input file
    let input_file = Builder::new()
        .prefix("mermaid-input-")
        .suffix(".mmd")
        .tempfile()
        .map_err(|e| {
            eprintln!("❌ Failed to create temp input file: {}", e);
            format!("Failed to create temporary file: {}", e)
        })?;

    let input_path = input_file.path().to_path_buf();
    println!("📝 Writing Mermaid code to: {}", input_path.display());

    fs::write(&input_path, &mermaid_code).map_err(|e| {
        eprintln!("❌ Failed to write mermaid code: {}", e);
        format!("Failed to write mermaid code to file: {}", e)
    })?;

    // Step 2: Create temporary output file path (mmdc creates the file)
    let output_path = input_path.with_extension("svg");
    println!("📤 Output SVG will be written to: {}", output_path.display());

    // Step 3: Execute mmdc command
    println!("🚀 Executing: npx -p @mermaid-js/mermaid-cli mmdc -i {} -o {}",
          input_path.display(), output_path.display());

    let output = Command::new("npx")
        .args([
            "-p", "@mermaid-js/mermaid-cli",
            "mmdc",
            "-i", input_path.to_str().unwrap(),
            "-o", output_path.to_str().unwrap(),
            "-b", "transparent",  // Transparent background
        ])
        .output()
        .map_err(|e| {
            eprintln!("❌ Failed to execute mmdc command: {}", e);
            format!("Failed to execute mmdc: {}. Ensure Node.js and npm are installed.", e)
        })?;

    // Step 4: Check command exit status
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        eprintln!("❌ mmdc command failed with status: {}", output.status);
        eprintln!("stderr: {}", stderr);
        eprintln!("stdout: {}", stdout);
        return Err(format!("Mermaid rendering failed: {}", stderr));
    }

    println!("✅ mmdc executed successfully");
    println!("stdout: {}", String::from_utf8_lossy(&output.stdout));

    // Step 5: Read generated SVG file
    let svg_content = fs::read_to_string(&output_path).map_err(|e| {
        eprintln!("❌ Failed to read generated SVG file: {}", e);
        format!("Failed to read SVG output: {}", e)
    })?;

    println!("✅ SVG generated successfully, length: {} chars", svg_content.len());

    // Cleanup happens automatically when temp files go out of scope
    Ok(svg_content)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_render_simple_mermaid() {
        let mermaid_code = "graph TD\n    A[Start] --> B[End]".to_string();
        let result = render_mermaid_to_svg(mermaid_code);

        assert!(result.is_ok(), "Should successfully render simple diagram");
        let svg = result.unwrap();
        assert!(svg.contains("<svg"), "Should contain SVG tag");
        assert!(svg.contains("</svg>"), "Should be complete SVG");
    }

    #[test]
    fn test_render_empty_code() {
        let result = render_mermaid_to_svg("".to_string());
        assert!(result.is_err(), "Should fail on empty input");
        assert!(result.unwrap_err().contains("cannot be empty"));
    }
}

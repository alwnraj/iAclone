use std::fs;
use std::path::PathBuf;

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
fn get_file_path() -> Result<Option<PathBuf>, String> {
    // This will be handled by the dialog plugin on the frontend
    Ok(None)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        read_file,
        write_file,
        get_file_path
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn test_read_file_success() {
        let mut temp_file = NamedTempFile::new().unwrap();
        let test_content = "Hello, World!";
        write!(temp_file, "{}", test_content).unwrap();
        
        let path = temp_file.path().to_str().unwrap().to_string();
        let result = read_file(path);
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), test_content);
    }

    #[test]
    fn test_read_file_not_found() {
        let result = read_file("/nonexistent/path/file.txt".to_string());
        
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Failed to read file"));
    }

    #[test]
    fn test_write_file_success() {
        let temp_file = NamedTempFile::new().unwrap();
        let path = temp_file.path().to_str().unwrap().to_string();
        let test_content = "Test content";
        
        let result = write_file(path.clone(), test_content.to_string());
        
        assert!(result.is_ok());
        
        // Verify content was written
        let content = fs::read_to_string(&path).unwrap();
        assert_eq!(content, test_content);
    }

    #[test]
    fn test_write_file_empty_content() {
        let temp_file = NamedTempFile::new().unwrap();
        let path = temp_file.path().to_str().unwrap().to_string();
        
        let result = write_file(path.clone(), String::new());
        
        assert!(result.is_ok());
        
        let content = fs::read_to_string(&path).unwrap();
        assert_eq!(content, "");
    }

    #[test]
    fn test_write_file_multiline() {
        let temp_file = NamedTempFile::new().unwrap();
        let path = temp_file.path().to_str().unwrap().to_string();
        let multiline = "Line 1\nLine 2\nLine 3";
        
        let result = write_file(path.clone(), multiline.to_string());
        
        assert!(result.is_ok());
        
        let content = fs::read_to_string(&path).unwrap();
        assert_eq!(content, multiline);
    }

    #[test]
    fn test_get_file_path() {
        let result = get_file_path();
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), None);
    }
}

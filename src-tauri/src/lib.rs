use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, Manager};

#[derive(Default)]
struct AppState {
    opened_file_paths: Arc<Mutex<Vec<String>>>,
}

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

#[tauri::command]
fn on_file_open_ready(app: AppHandle) {
    #[cfg(target_os = "macos")]
    {
        let state = app.state::<AppState>();
        let opened_file_paths = state.opened_file_paths.lock().unwrap();
        
        if !opened_file_paths.is_empty() {
            // Remove `file://` prefix from all URLs and convert to file paths
            let formatted_paths: Vec<String> = opened_file_paths
                .iter()
                .map(|url| {
                    url.replace("file://", "")
                })
                .collect();
            
            app.emit("file-opened", formatted_paths)
                .unwrap_or_else(|err| eprintln!("Emit error: {:?}", err));
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let app_state = AppState::default();
  
  tauri::Builder::default()
    .manage(app_state)
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
        get_file_path,
        on_file_open_ready
    ])
    .build(tauri::generate_context!())
    .expect("error while running tauri application")
    .run(|app, event| {
      #[cfg(target_os = "macos")]
      if let tauri::RunEvent::Opened { urls } = event {
        let state = app.state::<AppState>();
        let mut opened_file_paths = state.opened_file_paths.lock().unwrap();
        *opened_file_paths = urls.iter().map(|x| x.to_string()).collect();
        
        // If window already exists, emit immediately
        if let Some(window) = app.get_webview_window("main") {
          let formatted_paths: Vec<String> = opened_file_paths
            .iter()
            .map(|url| url.replace("file://", ""))
            .collect();
          
          if !formatted_paths.is_empty() {
            window.emit("file-opened", formatted_paths)
              .unwrap_or_else(|err| eprintln!("Emit error: {:?}", err));
          }
        }
      }
    });
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

    #[test]
    fn test_app_state_initialization() {
        let state = AppState::default();
        let paths = state.opened_file_paths.lock().unwrap();
        
        assert!(paths.is_empty());
    }

    #[test]
    fn test_app_state_storage() {
        let state = AppState::default();
        {
            let mut paths = state.opened_file_paths.lock().unwrap();
            paths.push("file:///path/to/test.md".to_string());
            paths.push("file:///path/to/another.md".to_string());
        }
        
        let paths = state.opened_file_paths.lock().unwrap();
        assert_eq!(paths.len(), 2);
        assert_eq!(paths[0], "file:///path/to/test.md");
    }
}

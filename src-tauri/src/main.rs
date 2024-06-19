// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Stdio};
use std::fs::File;
use std::io::Write;
use std::os::windows::process::CommandExt;
use std::sync::{Arc, Mutex};
use std::env;
use std::path::PathBuf;
use cfg_if::cfg_if;
use winapi::um::winuser::{ShowCursor};

struct AppState {
    cursor_visible: Mutex<bool>, // 用于存储光标是否可见的状态
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// set_cursor_visibility 函数用于设置光标的可见性
#[tauri::command]
fn set_cursor_visibility(state:tauri::State<AppState>,visible: bool) {
    let mut cursor_visible = state.cursor_visible.lock().unwrap();
    if *cursor_visible == visible {
        return;
    }
    unsafe {
        ShowCursor(visible as i32);
    }
    *cursor_visible = visible;
}


fn find_service_executable() -> PathBuf {
    let mut path = env::current_exe().unwrap();
    path.pop(); // 移除执行文件名称，留下目录路径

    // 根据不同的操作系统选择不同的可执行文件名称
    cfg_if! {
        if #[cfg(target_os = "windows")] {
            let service_name = "service.exe";
        } else if #[cfg(any(target_os = "macos", target_os = "linux"))] {
            let service_name = "service";
        } else {
            panic!("Unsupported operating system");
        }
    }

    // 尝试根目录下的 service
    if path.join(service_name).exists() {
        return path.join(service_name);
    }
    // 尝试 binaries 目录下的 service
    else if path.join("binaries").join(service_name).exists() {
        return path.join("binaries").join(service_name);
    }

    panic!("{} not found", service_name);
}

fn main() {
    let external_process = Arc::new(Mutex::new(None));

    tauri::Builder::default()
        .manage(AppState {
            cursor_visible: Mutex::new(true),
        })
        .setup({
            let external_process = external_process.clone();
            move |_app| {
                let mut file = File::create("log.txt").expect("failed to create log file");
                writeln!(file, "Starting external service...").expect("failed to write to log file");
                let service_path = find_service_executable();
                // println!("Found service at {:?}", service_path);
                writeln!(file, "Found service at {:?}", service_path).expect("failed to write to log file");

                // 使用 CREATE_NO_WINDOW 标志以静默方式启动外部进程
                let child = Command::new(service_path)
                    .creation_flags(0x08000000) // CREATE_NO_WINDOW
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .spawn();

                match child {
                    Ok(child) => {
                        writeln!(file, "Service started successfully").expect("failed to write to log file");
                        *external_process.lock().unwrap() = Some(child);
                    }
                    Err(e) => {
                        writeln!(file, "Failed to start service: {}", e).expect("failed to write to log file");
                    }
                }

                Ok(())
            }
        })
        .on_window_event({
            let external_process = external_process.clone();
            move |event| {
                if let tauri::WindowEvent::CloseRequested { .. } = event.event() {
                    if let Some(child) = external_process.lock().unwrap().as_mut() {
                        child.kill().expect("failed to kill external process");
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![greet,set_cursor_visibility])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
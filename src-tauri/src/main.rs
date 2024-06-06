// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Stdio};
use std::fs::File;
use std::io::Write;
use std::os::windows::process::CommandExt;
use std::sync::{Arc, Mutex};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let external_process = Arc::new(Mutex::new(None));

    tauri::Builder::default()
        .setup({
            let external_process = external_process.clone();
            move |_app| {
                let mut file = File::create("log.txt").expect("failed to create log file");
                writeln!(file, "Starting external service...").expect("failed to write to log file");

                // 使用 CREATE_NO_WINDOW 标志以静默方式启动外部进程
                let child = Command::new("binaries/service")
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
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
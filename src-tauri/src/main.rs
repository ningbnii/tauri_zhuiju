#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use hyper::{Body, Client, Uri};
use std::convert::Infallible;
use warp::Filter;
use warp::http::Response;
use std::str::FromStr;
use warp::http::Method;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

async fn fetch_and_forward(url: String) -> Result<impl warp::Reply, Infallible> {
    let client = Client::new();
    match client.get(Uri::from_str(&url).unwrap()).await {
        Ok(res) => {
            let body_bytes = hyper::body::to_bytes(res.into_body()).await.unwrap_or_default();
            // 明确指定Response的类型为Response<Body>
            Ok(Response::new(Body::from(body_bytes)))
        },
        Err(e) => {
            eprintln!("Error fetching URL: {}", e);
            // 同样，确保错误响应也使用Response<Body>
            Ok(Response::builder().status(500).body(Body::from("Failed to fetch URL")).unwrap())
        }
    }
}

fn setup_routes() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    let cors = warp::cors()
        .allow_any_origin()
        .allow_headers(vec!["Origin", "X-Requested-With", "Content-Type", "Accept"])
        .allow_methods(vec![Method::GET, Method::POST]); // 根据需要调整允许的方法

    warp::path("getHtmlFromUrl")
        .and(warp::query::<std::collections::HashMap<String, String>>())
        .and_then(|params: std::collections::HashMap<String, String>| {
            let url = params.get("url").cloned().unwrap_or_default();
            fetch_and_forward(url)
        })
        .with(cors) // 应用CORS设置
}

#[tokio::main]
async fn main() {
    let routes = setup_routes();

    tauri::Builder::default()
        .setup(move |_app| {
            let routes = routes.clone();
            tokio::spawn(async move {
                warp::serve(routes)
                    .run(([127, 0, 0, 1], 30000))
                    .await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
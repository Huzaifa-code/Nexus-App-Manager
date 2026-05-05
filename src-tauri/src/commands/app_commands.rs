use crate::services::apt_service;
use crate::services::snap_service;
use crate::services::flatpak_service;
use crate::services::uninstall_service;
use crate::services::cache_service::CacheService;
use serde::Serialize;

#[tauri::command]
pub async fn get_apt_apps() -> Result<Vec<crate::models::AppInfo>, String> {
    apt_service::get_apt_apps()
}

#[derive(Serialize)]
pub struct PaginatedApps {
    pub apps: Vec<crate::models::AppInfo>,
    pub total: usize,
}

#[tauri::command]
pub async fn get_apt_apps_page(offset: usize, limit: usize) -> Result<PaginatedApps, String> {
    let (apps, total) = apt_service::get_apt_apps_paginated(offset, limit)?;
    Ok(PaginatedApps { apps, total })
}

#[tauri::command]
pub async fn get_snap_apps() -> Result<Vec<crate::models::AppInfo>, String> {
    snap_service::get_snap_apps()
}

#[tauri::command]
pub async fn get_flatpak_apps() -> Result<Vec<crate::models::AppInfo>, String> {
    flatpak_service::get_flatpak_apps()
}

#[tauri::command]
pub async fn uninstall_app(name: String, manager: String) -> Result<String, String> {
    uninstall_service::uninstall_app(name, manager)
}

#[tauri::command]
pub async fn get_cached_apps(manager: String) -> Result<Option<Vec<crate::models::AppInfo>>, String> {
    CacheService::get_cached_apps(&manager)
}

#[tauri::command]
pub async fn save_apps_cache(manager: String, apps: Vec<crate::models::AppInfo>) -> Result<(), String> {
    CacheService::save_apps_cache(&manager, &apps)
}

#[tauri::command]
pub async fn clear_cache(manager: Option<String>) -> Result<(), String> {
    CacheService::clear_cache(manager.as_deref())
}

#[tauri::command]
pub async fn open_path(path: String) -> Result<(), String> {
    let path_obj = std::path::Path::new(&path);
    let dir = if path_obj.is_dir() {
        path_obj
    } else {
        path_obj.parent().unwrap_or(path_obj)
    };

    let dir_str = dir.to_str().ok_or("Invalid path")?;
    
    // On Linux, use xdg-open
    std::process::Command::new("xdg-open")
        .arg(dir_str)
        .spawn()
        .map_err(|e| format!("Failed to open directory: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn read_image_bytes(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| format!("Failed to read image: {}", e))
}

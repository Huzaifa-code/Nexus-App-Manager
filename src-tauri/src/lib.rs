mod commands;
mod models;
mod services;
mod utils;

use commands::app_commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            app_commands::get_apt_apps,
            app_commands::get_apt_apps_page,
            app_commands::get_snap_apps,
            app_commands::get_flatpak_apps,
            app_commands::uninstall_app,
            app_commands::get_cached_apps,
            app_commands::save_apps_cache,
            app_commands::clear_cache,
            app_commands::open_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

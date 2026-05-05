use crate::models::AppInfo;
use crate::utils::shell;

const SYSTEM_SNAPS: &[&str] = &["core", "snapd", "core18", "core20", "core22", "core24"];

fn is_system_snap(name: &str) -> bool {
    SYSTEM_SNAPS.contains(&name)
}

pub fn get_snap_apps() -> Result<Vec<AppInfo>, String> {
    let output = shell::run_command("snap", &["list", "--all"])?;
    
    let mut apps = Vec::new();
    let mut seen = std::collections::HashSet::new();
    
    for (i, line) in output.lines().enumerate() {
        // Skip header
        if i == 0 {
            continue;
        }
        
        let parts: Vec<&str> = line.split_whitespace().collect();
        
        // Need Name, Version, Rev, Tracking, Publisher, Notes
        if parts.len() < 6 {
            continue;
        }
        
        let name = parts[0];
        let rev = parts[2];
        
        // Skip system snaps
        if is_system_snap(name) {
            continue;
        }
        
        // Check if snap is active (not disabled or removed)
        let status = parts[5];
        if status == "disabled" || status == "removed" {
            continue;
        }
        
        // Deduplicate (snap list --all shows multiple versions)
        if !seen.contains(name) {
            seen.insert(name.to_string());
            
            // Try to get size from the .snap file
            let snap_file = format!("/var/lib/snapd/snaps/{}_{}.snap", name, rev);
            let size = if let Ok(metadata) = std::fs::metadata(&snap_file) {
                let bytes = metadata.len();
                if bytes > 1024 * 1024 {
                    format!("{} MB", bytes / (1024 * 1024))
                } else {
                    format!("{} KB", bytes / 1024)
                }
            } else {
                "Unknown".to_string()
            };
            
            let icon_path = format!("/snap/{}/current/meta/gui/icon.png", name);
            let icon = if std::path::Path::new(&icon_path).exists() {
                Some(icon_path)
            } else {
                None
            };

            apps.push(AppInfo {
                name: name.to_string(),
                version: parts[1].to_string(),
                size,
                path: format!("/snap/{}", name),
                description: format!("Snap package: {}", name),
                manager: "snap".to_string(),
                homepage: None,
                icon,
            });
        }
    }
    
    Ok(apps)
}
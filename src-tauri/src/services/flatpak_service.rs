use crate::models::AppInfo;
use crate::utils::shell;

pub fn get_flatpak_apps() -> Result<Vec<AppInfo>, String> {
    let output = shell::run_command(
        "flatpak",
        &["list", "--app", "--columns=application,version,size,description"],
    )?;

    let mut apps = Vec::new();

    for line in output.lines() {
        if line.is_empty() {
            continue;
        }
        
        let mut parts = line.split('\t');
        
        let full_id = match parts.next() {
            Some(id) if !id.is_empty() => id,
            _ => continue,
        };
        
        let version = parts.next()
            .unwrap_or("Unknown")
            .to_string();
        
        let size = parts.next()
            .unwrap_or("Unknown")
            .to_string();
        
        let description = parts.next()
            .map(|d| d.to_string())
            .unwrap_or_else(|| {
                let display_name = full_id.split('.').last().unwrap_or(full_id);
                format!("Flatpak application: {}", display_name)
            });
        
        apps.push(AppInfo {
            name: full_id.to_string(),
            version,
            size,
            path: format!("/var/lib/flatpak/app/{}", full_id),
            description,
            manager: "flatpak".to_string(),
            homepage: None,
        });
    }

    Ok(apps)
}
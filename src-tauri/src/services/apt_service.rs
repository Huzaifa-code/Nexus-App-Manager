use crate::models::AppInfo;
use crate::utils::shell;
use rayon::prelude::*;
use std::collections::HashSet;
use std::path::Path;

/// Build a set of desktop basenames from /usr/share/applications
fn desktop_basename_set() -> HashSet<String> {
    let mut set = HashSet::new();
    if let Ok(entries) = std::fs::read_dir("/usr/share/applications") {
        for e in entries.flatten() {
            if let Some(name) = e.file_name().to_str() {
                if name.ends_with(".desktop") {
                    if let Some(base) = name.strip_suffix(".desktop") {
                        set.insert(base.to_string());
                    }
                }
            }
        }
    }
    set
}

/// Return a paginated list of apt-managed apps with a total count
pub fn get_apt_apps_paginated(offset: usize, limit: usize) -> Result<(Vec<AppInfo>, usize), String> {
    // 1) get desktop basenames
    let desktop_set = desktop_basename_set();

    // 2) get dpkg-query output (single command)
    let output = shell::run_command(
        "bash",
        &[
            "-c",
            "dpkg-query -W -f='${Package}\t${Version}\t${Installed-Size}\t${Description}\n'",
        ],
    )?;

    // 3) parse and filter quickly
    let mut candidates: Vec<(String, String, u64, String)> = output
        .lines()
        .filter_map(|line| {
            let parts: Vec<&str> = line.split('\t').collect();
            if parts.len() >= 4 {
                Some((
                    parts[0].to_string(),
                    parts[1].to_string(),
                    parts[2].parse::<u64>().unwrap_or(0),
                    parts[3].to_string(),
                ))
            } else {
                None
            }
        })
        .filter(|(pkg, _, _, _)| {
            // quick match: desktop basename equals pkg or desktop file exists
            desktop_set.contains(pkg) || Path::new(&format!("/usr/share/applications/{}.desktop", pkg)).exists()
        })
        .collect();

    // total count before pagination
    let total = candidates.len();

    // sort by name for stable ordering
    candidates.par_sort_by(|a, b| a.0.cmp(&b.0));

    // apply pagination
    let page_items: Vec<AppInfo> = candidates
        .into_iter()
        .skip(offset)
        .take(limit)
        .map(|(name, version, size_kb, description)| {
            let size_mb = size_kb / 1024;
            let size = if size_mb > 0 {
                format!("{} MB", size_mb)
            } else {
                format!("{} KB", size_kb)
            };
            
            let path = find_apt_binary_path(&name);
            
            AppInfo {
                name: name.clone(),
                version,
                size,
                path,
                description,
                manager: "apt".to_string(),
                homepage: None,
            }
        })
        .collect();

    Ok((page_items, total))
}

fn find_apt_binary_path(pkg: &str) -> String {
    // 1. Try to find the binary from the desktop file if it exists
    let desktop_path = format!("/usr/share/applications/{}.desktop", pkg);
    if let Ok(content) = std::fs::read_to_string(&desktop_path) {
        for line in content.lines() {
            if line.starts_with("Exec=") {
                let exec = line.strip_prefix("Exec=").unwrap_or("").trim();
                // Take the first part of the command (ignoring arguments like %u, %f)
                let binary = exec.split_whitespace().next().unwrap_or("");
                // Remove quotes if present
                let binary = binary.trim_matches('"').trim_matches('\'');
                
                if binary.starts_with('/') {
                    if Path::new(binary).exists() {
                        return binary.to_string();
                    }
                } else if !binary.is_empty() {
                    // Search in common PATH locations
                    for dir in ["/usr/bin", "/bin", "/usr/local/bin", "/usr/sbin", "/sbin"] {
                        let full_path = format!("{}/{}", dir, binary);
                        if Path::new(&full_path).exists() {
                            return full_path;
                        }
                    }
                }
            }
        }
    }

    // 2. Fallback: check if /usr/bin/pkg or /bin/pkg exists
    for dir in ["/usr/bin", "/bin", "/usr/local/bin", "/usr/sbin", "/sbin"] {
        let full_path = format!("{}/{}", dir, pkg);
        if Path::new(&full_path).exists() {
            return full_path;
        }
    }

    // 3. Final default
    format!("/usr/bin/{}", pkg)
}

// keep old non-paginated function for compatibility
pub fn get_apt_apps() -> Result<Vec<AppInfo>, String> {
    // fetch all using paginated function
    let (items, _) = get_apt_apps_paginated(0, usize::MAX)?;
    Ok(items)
}


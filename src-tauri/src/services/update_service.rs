use crate::utils::shell;

pub fn check_update(name: String, manager: String) -> Result<Option<String>, String> {
    match manager.as_str() {
        "apt" => {
            // apt-cache policy <name>
            let output = shell::run_command("apt-cache", &["policy", &name])?;
            let mut installed = String::new();
            let mut candidate = String::new();

            for line in output.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with("Installed:") {
                    installed = trimmed.trim_start_matches("Installed:").trim().to_string();
                } else if trimmed.starts_with("Candidate:") {
                    candidate = trimmed.trim_start_matches("Candidate:").trim().to_string();
                }
            }

            if !candidate.is_empty() && candidate != "(none)" && candidate != installed {
                Ok(Some(candidate))
            } else {
                Ok(None)
            }
        }
        "snap" => {
            // snap refresh --list
            // We can just search for the specific snap name in the output
            let output = shell::run_command("snap", &["refresh", "--list"]).unwrap_or_default();
            for line in output.lines() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if !parts.is_empty() && parts[0] == name {
                    // Usually Name, Version, Rev, Size, Publisher, Notes
                    if parts.len() > 1 {
                        return Ok(Some(parts[1].to_string()));
                    }
                }
            }
            Ok(None)
        }
        "flatpak" => {
            // flatpak remote-ls --updates
            let output = shell::run_command("flatpak", &["remote-ls", "--updates", "--columns=application,version"]).unwrap_or_default();
            for line in output.lines() {
                let parts: Vec<&str> = line.split('\t').collect();
                if !parts.is_empty() && parts[0] == name {
                    if parts.len() > 1 {
                        let version = parts[1].trim();
                        if !version.is_empty() {
                            return Ok(Some(version.to_string()));
                        }
                    }
                    return Ok(Some("latest".to_string()));
                }
            }
            Ok(None)
        }
        _ => Err("Unknown package manager".to_string()),
    }
}

pub fn update_app(name: String, manager: String) -> Result<String, String> {
    match manager.as_str() {
        "apt" => {
            shell::run_privileged_command(
                "apt",
                &["install", "--only-upgrade", "-y", &name],
            )?;
            Ok(format!("Successfully updated {}", name))
        }
        "snap" => {
            shell::run_privileged_command("snap", &["refresh", &name])?;
            Ok(format!("Successfully updated {}", name))
        }
        "flatpak" => {
            // Flatpak usually doesn't require sudo
            shell::run_command("flatpak", &["update", "-y", &name])?;
            Ok(format!("Successfully updated {}", name))
        }
        _ => Err("Unknown package manager".to_string()),
    }
}

use crate::utils::shell;

pub fn uninstall_app(name: String, manager: String) -> Result<String, String> {
    match manager.as_str() {
        "apt" => {
            shell::run_privileged_command(
                "apt",
                &["remove", "--purge", "-y", &name],
            )?;
            Ok(format!("Successfully uninstalled {}", name))
        }
        "snap" => {
            shell::run_privileged_command("snap", &["remove", &name])?;
            Ok(format!("Successfully uninstalled {}", name))
        }
        "flatpak" => {
            // Flatpak usually doesn't require sudo
            shell::run_command("flatpak", &["uninstall", "-y", &name])?;
            Ok(format!("Successfully uninstalled {}", name))
        }
        _ => Err("Unknown package manager".to_string()),
    }
}


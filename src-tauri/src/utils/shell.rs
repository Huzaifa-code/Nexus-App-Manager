use std::process::Command;

/// Execute a shell command and return the output as a string
pub fn run_command(cmd: &str, args: &[&str]) -> Result<String, String> {
    let output = Command::new(cmd)
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute {}: {}", cmd, e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Command failed: {}", stderr))
    }
}

/// Execute a privileged command using pkexec (shows GUI password dialog)
pub fn run_privileged_command(cmd: &str, args: &[&str]) -> Result<String, String> {
    let output = Command::new("pkexec")
        .arg(cmd)
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute pkexec {}: {}", cmd, e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);

        // Provide more helpful error messages
        if stderr.contains("Authentication") || stderr.contains("password") {
            Err("Authentication failed. Please check your password.".to_string())
        } else if !stderr.is_empty() {
            Err(format!("Command failed: {}", stderr))
        } else if !stdout.is_empty() {
            Err(format!("Command failed: {}", stdout))
        } else {
            Err(format!(
                "Command failed with exit code: {}",
                output.status.code().unwrap_or(-1)
            ))
        }
    }
}

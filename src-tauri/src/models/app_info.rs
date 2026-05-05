use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub size: String,
    pub path: String,
    pub description: String,
    pub manager: String, // "apt", "snap", or "flatpak"
    pub homepage: Option<String>,
    pub icon: Option<String>,
}


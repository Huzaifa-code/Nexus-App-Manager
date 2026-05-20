use serde::Serialize;
use sysinfo::Disks;
use std::process::Command;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
pub struct StorageUsage {
    pub total: u64,
    pub free: u64,
    pub apt: u64,
    pub snap: u64,
    pub flatpak: u64,
    pub other: u64,
}

pub fn get_storage_usage() -> Result<StorageUsage, String> {
    let disks = Disks::new_with_refreshed_list();
    
    let mut total = 0;
    let mut free = 0;
    
    for disk in disks.list() {
        if disk.mount_point() == Path::new("/") {
            total = disk.total_space();
            free = disk.available_space();
            break;
        }
    }
    
    if total == 0 {
        if let Some(disk) = disks.list().first() {
            total = disk.total_space();
            free = disk.available_space();
        }
    }
    
    let apt = get_apt_size();
    let snap = get_dir_size("/var/lib/snapd/snaps");
    
    let mut flatpak = get_dir_size("/var/lib/flatpak");
    if let Some(user_dirs) = dirs::data_local_dir() {
        let user_flatpak = user_dirs.join("flatpak");
        flatpak += get_dir_size(user_flatpak.to_str().unwrap_or(""));
    }
    
    let used = total.saturating_sub(free);
    let managers_total = apt + snap + flatpak;
    let other = used.saturating_sub(managers_total);
    
    Ok(StorageUsage {
        total,
        free,
        apt,
        snap,
        flatpak,
        other,
    })
}

fn get_apt_size() -> u64 {
    let output = Command::new("sh")
        .arg("-c")
        .arg("dpkg-query -W -f='${Installed-Size}\\n' | awk '{s+=$1} END {print s}'")
        .output();
        
    if let Ok(output) = output {
        let stdout = String::from_utf8_lossy(&output.stdout);
        if let Ok(kb) = stdout.trim().parse::<u64>() {
            return kb * 1024;
        }
    }
    0
}

fn get_dir_size<P: AsRef<Path>>(path: P) -> u64 {
    let mut size = 0;
    if let Ok(entries) = fs::read_dir(&path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_dir() {
                    size += get_dir_size(entry.path());
                } else {
                    size += metadata.len();
                }
            }
        }
    }
    size
}

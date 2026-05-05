use crate::models::AppInfo;
use rusqlite::{Connection, params, Result as SqliteResult};
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

const CACHE_TTL_SECONDS: u64 = 3600; // 1 hour

/// Manager type enumeration for type-safe cache operations
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[allow(dead_code)]
pub enum ManagerType {
    Apt = 1,
    Snap = 2,
    Flatpak = 3,
}

impl ManagerType {
    /// Convert from string (as used in AppInfo.manager field)
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "apt" => Some(ManagerType::Apt),
            "snap" => Some(ManagerType::Snap),
            "flatpak" => Some(ManagerType::Flatpak),
            _ => None,
        }
    }

    /// Convert to string for AppInfo compatibility
    #[allow(dead_code)]
    pub fn as_str(&self) -> &'static str {
        match self {
            ManagerType::Apt => "apt",
            ManagerType::Snap => "snap",
            ManagerType::Flatpak => "flatpak",
        }
    }

    /// Get numeric ID for database storage
    pub fn id(&self) -> i32 {
        *self as i32
    }

    /// Convert from numeric ID
    #[allow(dead_code)]
    pub fn from_id(id: i32) -> Option<Self> {
        match id {
            1 => Some(ManagerType::Apt),
            2 => Some(ManagerType::Snap),
            3 => Some(ManagerType::Flatpak),
            _ => None,
        }
    }
}

pub struct CacheService;

impl CacheService {
    fn get_db_path() -> PathBuf {
        let data_dir = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("nexus-app-manager");
        
        std::fs::create_dir_all(&data_dir).ok();
        data_dir.join("cache.db")
    }

    fn init_db(conn: &mut Connection) -> SqliteResult<()> {
        conn.execute_batch(
            "BEGIN;
            CREATE TABLE IF NOT EXISTS cache_meta (
                manager_id INTEGER PRIMARY KEY,
                timestamp INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS cached_apps (
                id INTEGER PRIMARY KEY,
                manager_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                version TEXT,
                size TEXT,
                path TEXT,
                description TEXT,
                FOREIGN KEY(manager_id) REFERENCES cache_meta(manager_id)
            );

            CREATE INDEX IF NOT EXISTS idx_cached_apps_manager_id ON cached_apps(manager_id);
            COMMIT;"
        )?;

        // Check if homepage column exists, add it if not
        let has_homepage: bool = conn.query_row(
            "SELECT count(*) FROM pragma_table_info('cached_apps') WHERE name='homepage'",
            [],
            |row| {
                let count: i32 = row.get(0)?;
                Ok(count > 0)
            },
        ).unwrap_or(false);

        if !has_homepage {
            conn.execute("ALTER TABLE cached_apps ADD COLUMN homepage TEXT", [])?;
        }

        let has_icon: bool = conn.query_row(
            "SELECT count(*) FROM pragma_table_info('cached_apps') WHERE name='icon'",
            [],
            |row| {
                let count: i32 = row.get(0)?;
                Ok(count > 0)
            },
        ).unwrap_or(false);

        if !has_icon {
            conn.execute("ALTER TABLE cached_apps ADD COLUMN icon TEXT", [])?;
        }

        Ok(())
    }

    pub fn get_cached_apps(manager: &str) -> Result<Option<Vec<AppInfo>>, String> {
        let manager_type = ManagerType::from_str(manager)
            .ok_or_else(|| format!("Unknown manager: {}", manager))?;
        
        let db_path = Self::get_db_path();
        let mut conn = Connection::open(&db_path)
            .map_err(|e| format!("Failed to open cache database: {}", e))?;
        Self::init_db(&mut conn)
            .map_err(|e| format!("Failed to initialize cache database: {}", e))?;

        let current_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| format!("System time error: {}", e))?
            .as_secs();

        // Check meta timestamp
        let meta_result: SqliteResult<i64> = conn.query_row(
            "SELECT timestamp FROM cache_meta WHERE manager_id = ?1",
            params![manager_type.id()],
            |row| row.get(0),
        );

        match meta_result {
            Ok(timestamp) => {
                let time_diff = current_time - timestamp as u64;
                if time_diff > CACHE_TTL_SECONDS {
                    // expired
                    return Ok(None);
                }

                // load per-app rows
                let mut stmt = conn.prepare(
                    "SELECT name, version, size, path, description, homepage, icon FROM cached_apps WHERE manager_id = ?1 ORDER BY id",
                ).map_err(|e| format!("Failed to prepare statement: {}", e))?;

                let apps_iter = stmt
                    .query_map(params![manager_type.id()], |row| {
                        Ok(AppInfo {
                            name: row.get(0)?,
                            version: row.get(1)?,
                            size: row.get(2)?,
                            path: row.get(3)?,
                            description: row.get(4)?,
                            manager: manager.to_string(),
                            homepage: row.get(5)?,
                            icon: row.get(6)?,
                        })
                    })
                    .map_err(|e| format!("Failed to query cached apps: {}", e))?;

                let mut apps = Vec::new();
                for a in apps_iter {
                    match a {
                        Ok(app) => apps.push(app),
                        Err(e) => return Err(format!("Failed to read cached app: {}", e)),
                    }
                }

                Ok(Some(apps))
            }
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(format!("Failed to query cache meta: {}", e)),
        }
    }

    pub fn save_apps_cache(manager: &str, apps: &[AppInfo]) -> Result<(), String> {
        let manager_type = ManagerType::from_str(manager)
            .ok_or_else(|| format!("Unknown manager: {}", manager))?;
        
        let db_path = Self::get_db_path();
        let mut conn = Connection::open(&db_path)
            .map_err(|e| format!("Failed to open cache database: {}", e))?;
        Self::init_db(&mut conn)
            .map_err(|e| format!("Failed to initialize cache database: {}", e))?;

        let current_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| format!("System time error: {}", e))?
            .as_secs() as i64;

        let tx = conn.transaction().map_err(|e| format!("Failed to start transaction: {}", e))?;

        // replace meta timestamp
        tx.execute(
            "INSERT OR REPLACE INTO cache_meta (manager_id, timestamp) VALUES (?1, ?2)",
            params![manager_type.id(), current_time],
        )
        .map_err(|e| format!("Failed to save cache meta: {}", e))?;

        // remove old rows for manager
        tx.execute(
            "DELETE FROM cached_apps WHERE manager_id = ?1",
            params![manager_type.id()],
        )
        .map_err(|e| format!("Failed to clear old cached apps: {}", e))?;

        // insert new rows
        let mut insert_stmt = tx.prepare(
            "INSERT INTO cached_apps (manager_id, name, version, size, path, description, homepage, icon) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"
        ).map_err(|e| format!("Failed to prepare insert: {}", e))?;

        for app in apps {
            insert_stmt.execute(params![
                manager_type.id(), 
                app.name, 
                app.version, 
                app.size, 
                app.path, 
                app.description,
                app.homepage,
                app.icon
            ])
            .map_err(|e| format!("Failed to insert cached app: {}", e))?;
        }

        // drop statement before committing transaction to avoid borrow issues
        drop(insert_stmt);
        tx.commit().map_err(|e| format!("Failed to commit cache transaction: {}", e))?;

        Ok(())
    }

    pub fn clear_cache(manager: Option<&str>) -> Result<(), String> {
        let db_path = Self::get_db_path();
        let mut conn = Connection::open(&db_path)
            .map_err(|e| format!("Failed to open cache database: {}", e))?;

        if let Some(mgr) = manager {
            let manager_type = ManagerType::from_str(mgr)
                .ok_or_else(|| format!("Unknown manager: {}", mgr))?;
            
            let tx = conn.transaction().map_err(|e| format!("Failed to start transaction: {}", e))?;
            tx.execute("DELETE FROM cached_apps WHERE manager_id = ?1", params![manager_type.id()])
                .map_err(|e| format!("Failed to delete cached apps: {}", e))?;
            tx.execute("DELETE FROM cache_meta WHERE manager_id = ?1", params![manager_type.id()])
                .map_err(|e| format!("Failed to delete cache meta: {}", e))?;
            tx.commit().map_err(|e| format!("Failed to commit clear_cache tx: {}", e))?;
        } else {
            let tx = conn.transaction().map_err(|e| format!("Failed to start transaction: {}", e))?;
            tx.execute("DELETE FROM cached_apps", [])
                .map_err(|e| format!("Failed to delete cached apps: {}", e))?;
            tx.execute("DELETE FROM cache_meta", [])
                .map_err(|e| format!("Failed to delete cache meta: {}", e))?;
            tx.commit().map_err(|e| format!("Failed to commit clear_cache tx: {}", e))?;
        }

        Ok(())
    }
}

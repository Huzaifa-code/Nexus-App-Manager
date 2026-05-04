# Development & Debugging Notes

This file contains technical details and commands for developers working on Nexus App Manager.

## Cache Layer (SQLite3)

Nexus App Manager uses SQLite3 to cache application data for faster performance. The cache is stored in the local data directory.

### Check Cache Location
```bash
ls -lah ~/.local/share/nexus-app-manager/cache.db
```

### Verify Schema
```bash
sqlite3 ~/.local/share/nexus-app-manager/cache.db ".tables"
sqlite3 ~/.local/share/nexus-app-manager/cache.db ".schema cache_meta"
sqlite3 ~/.local/share/nexus-app-manager/cache.db ".schema cached_apps"
```

### View Cached Data
```bash
sqlite3 ~/.local/share/nexus-app-manager/cache.db "SELECT * FROM cache_meta;"
sqlite3 ~/.local/share/nexus-app-manager/cache.db "SELECT manager, COUNT(*) as app_count FROM cached_apps GROUP BY manager;"
```

### Example Interactive Session
```bash
sqlite3 ~/.local/share/nexus-app-manager/cache.db
# Inside sqlite prompt:
sqlite> .tables
cache_meta   cached_apps
sqlite> select * from cache_meta;
snap|1765476105
flatpak|1765476105
apt|1765476175
```

## Changing the Application Icon

To update the application icon, place a `icon.png` file (1024x1024 pixels) in `src-tauri/icons` and run the following command:

```bash
# From the project root:
npm exec -- tauri icon src-tauri/icons/icon.png
```

## Building for Release

### Bundle as Deb Package
```bash
npm run tauri build -- --bundles deb
```
The generated `.deb` file will be located in the `src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/deb` directory.


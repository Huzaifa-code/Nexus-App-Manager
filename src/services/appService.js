import { invoke } from "@tauri-apps/api/core";
import { PACKAGE_MANAGERS } from "../utils/appUtils";

class AppService {
  async getAptApps(signal) {
    try {
      if (signal?.aborted) throw new Error("Request aborted");
      return await invoke("get_apt_apps");
    } catch (error) {
      if (error.message !== "Request aborted") {
        console.error("Error loading APT apps:", error);
        throw new Error("Failed to load APT packages");
      }
      throw error;
    }
  }

  async getAptAppsPage(offset, limit, signal) {
    try {
      if (signal?.aborted) throw new Error("Request aborted");
      return await invoke("get_apt_apps_page", { offset, limit });
    } catch (error) {
      if (error.message !== "Request aborted") {
        console.error("Error loading APT apps (paged):", error);
        throw new Error("Failed to load APT packages (paged)");
      }
      throw error;
    }
  }

  async getSnapApps(signal) {
    try {
      if (signal?.aborted) throw new Error("Request aborted");
      return await invoke("get_snap_apps");
    } catch (error) {
      if (error.message !== "Request aborted") {
        console.error("Error loading Snap apps:", error);
        throw new Error("Failed to load Snap packages");
      }
      throw error;
    }
  }

  async getFlatpakApps(signal) {
    try {
      if (signal?.aborted) throw new Error("Request aborted");
      return await invoke("get_flatpak_apps");
    } catch (error) {
      if (error.message !== "Request aborted") {
        console.error("Error loading Flatpak apps:", error);
        throw new Error("Failed to load Flatpak applications");
      }
      throw error;
    }
  }

  async getAppsByManager(manager, signal) {
    switch (manager) {
      case PACKAGE_MANAGERS.APT:
        return await this.getAptApps(signal);
      case PACKAGE_MANAGERS.SNAP:
        return await this.getSnapApps(signal);
      case PACKAGE_MANAGERS.FLATPAK:
        return await this.getFlatpakApps(signal);
      default:
        throw new Error(`Unknown package manager: ${manager}`);
    }
  }

  async getAppsPageByManager(manager, offset, limit, signal) {
    switch (manager) {
      case PACKAGE_MANAGERS.APT:
        return await this.getAptAppsPage(offset, limit, signal);
      // For snap/flatpak we don't yet support server pagination; fall back to full list
      case PACKAGE_MANAGERS.SNAP: {
        const all = await this.getSnapApps(signal);
        const total = all.length;
        const apps = all.slice(offset, offset + limit);
        return { apps, total };
      }
      case PACKAGE_MANAGERS.FLATPAK: {
        const all = await this.getFlatpakApps(signal);
        const total = all.length;
        const apps = all.slice(offset, offset + limit);
        return { apps, total };
      }
      default:
        throw new Error(`Unknown package manager: ${manager}`);
    }
  }

  async uninstallApp(name, manager) {
    try {
      return await invoke("uninstall_app", { name, manager });
    } catch (error) {
      console.error("Error uninstalling app:", error);
      throw error;
    }
  }

  async getCachedApps(manager) {
    try {
      return await invoke("get_cached_apps", { manager });
    } catch (error) {
      console.error("Error loading cached apps:", error);
      return null;
    }
  }

  async saveCache(manager, apps) {
    try {
      return await invoke("save_apps_cache", { manager, apps });
    } catch (error) {
      console.error("Error saving cache:", error);
    }
  }

  async clearCache(manager = null) {
    try {
      return await invoke("clear_cache", { manager });
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }

  async openPath(path) {
    try {
      return await invoke("open_path", { path });
    } catch (error) {
      console.error("Error opening path:", error);
    }
  }
}

export default new AppService();

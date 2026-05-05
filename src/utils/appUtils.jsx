import React from "react";
import { FiPackage } from "react-icons/fi";
import { SiDebian, SiSnapcraft, SiFlatpak } from "react-icons/si";

export const PACKAGE_MANAGERS = {
  APT: "apt",
  SNAP: "snap",
  FLATPAK: "flatpak",
};

export const getManagerIcon = (manager, className = "w-5 h-5") => {
  const iconProps = { className };
  
  switch (manager) {
    case PACKAGE_MANAGERS.APT:
      return <SiDebian {...iconProps} className={`${className} text-orange-500`} />;
    case PACKAGE_MANAGERS.SNAP:
      return <SiSnapcraft {...iconProps} className={`${className} text-blue-500`} />;
    case PACKAGE_MANAGERS.FLATPAK:
      return <SiFlatpak {...iconProps} className={`${className} text-green-500`} />;
    default:
      return <FiPackage {...iconProps} />;
  }
};

export const getDisplayName = (app) => {
  if (app.manager === PACKAGE_MANAGERS.FLATPAK) {
    return app.name.split('.').slice(-2).join('.');
  }
  return app.name;
};

export const getTabTitle = (tab) => {
  const titles = {
    [PACKAGE_MANAGERS.APT]: "APT Packages",
    [PACKAGE_MANAGERS.SNAP]: "Snap Packages",
    [PACKAGE_MANAGERS.FLATPAK]: "Flatpak Applications",
  };
  return titles[tab] || "Applications";
};

export const requiresPassword = (manager) => {
  return manager === PACKAGE_MANAGERS.APT || manager === PACKAGE_MANAGERS.SNAP;
};

export const filterApps = (apps, searchQuery) => {
  if (!searchQuery.trim()) {
    return apps;
  }
  
  const query = searchQuery.toLowerCase();
  return apps.filter(
    (app) =>
      app.name.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query)
  );
};

export const filterAppsByManager = (apps, managers) => {
  if (!managers || managers.length === 0) {
    return apps;
  }
  return apps.filter((app) => managers.includes(app.manager));
};

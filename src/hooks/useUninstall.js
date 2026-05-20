import { useState } from "react";
import appService from "../services/appService";
import { getDisplayName, requiresPassword } from "../utils/appUtils";

export const useUninstall = (onSuccess, showToast) => {
  const [uninstalling, setUninstalling] = useState(null);
  const [confirmModalConfig, setConfirmModalConfig] = useState({ isOpen: false, app: null });

  const requestUninstall = (app) => {
    setConfirmModalConfig({ isOpen: true, app });
  };

  const handleConfirmUninstall = async () => {
    const { app } = confirmModalConfig;
    if (!app) return;
    
    setConfirmModalConfig({ isOpen: false, app: null });
    const displayName = getDisplayName(app);
    setUninstalling(app.name);
    
    try {
      await appService.uninstallApp(app.name, app.manager);
      showToast(`Successfully uninstalled ${displayName}`, 'success');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showToast(`Failed to uninstall ${displayName}: ${error}`, 'error');
    } finally {
      setUninstalling(null);
    }
  };

  const handleCancelUninstall = () => {
    setConfirmModalConfig({ isOpen: false, app: null });
  };

  return { 
    uninstalling, 
    requestUninstall, 
    handleConfirmUninstall, 
    handleCancelUninstall,
    confirmModalConfig
  };
};

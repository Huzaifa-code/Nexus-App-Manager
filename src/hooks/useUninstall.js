import { useState } from "react";
import appService from "../services/appService";
import { getDisplayName, requiresPassword } from "../utils/appUtils";

export const useUninstall = (onSuccess) => {
  const [uninstalling, setUninstalling] = useState(null);

  const handleUninstall = async (app) => {
    const displayName = getDisplayName(app);
    const needsPassword = requiresPassword(app.manager);
    
    const confirmMessage = `Are you sure you want to uninstall ${displayName}?${
      needsPassword ? "\n\nA password dialog will appear to confirm the uninstallation." : ""
    }`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setUninstalling(app.name);
    try {
      await appService.uninstallApp(app.name, app.manager);
      window.alert(`Successfully uninstalled ${displayName}`);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      window.alert(`Failed to uninstall ${displayName}: ${error}`);
    } finally {
      setUninstalling(null);
    }
  };

  return { uninstalling, handleUninstall };
};


import { useState, useEffect, useCallback, useRef } from "react";
import appService from "../services/appService";
import { PACKAGE_MANAGERS } from "../utils/appUtils";

export const useGlobalApps = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const loadAllApps = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setApps([]);
    setLoading(true);
    setError(null);

    try {
      const managers = [
        PACKAGE_MANAGERS.APT,
        PACKAGE_MANAGERS.SNAP,
        PACKAGE_MANAGERS.FLATPAK,
      ];

      const results = await Promise.all(
        managers.map(async (manager) => {
          try {
            const cachedApps = await appService.getCachedApps(manager);
            if (cachedApps) {
              return cachedApps;
            }

            const fetchedApps = await appService.getAppsByManager(manager, signal);
            await appService.saveCache(manager, fetchedApps || []);
            return fetchedApps || [];
          } catch (err) {
            console.error(`Error loading apps for ${manager}:`, err);
            return []; // Return empty array for this manager instead of failing the whole thing
          }
        })
      );

      if (!signal.aborted) {
        const allApps = results.flat();
        setApps(allApps);
      }
    } catch (err) {
      if (!signal.aborted) {
        console.error("Error loading apps:", err);
        setError(err.message);
        setApps([]);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadAllApps();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadAllApps]);

  const reloadApps = useCallback(() => {
    loadAllApps();
  }, [loadAllApps]);

  return { apps, loading, error, reloadApps };
};

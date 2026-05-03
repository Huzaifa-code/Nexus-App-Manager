import { useState, useEffect, useCallback, useRef } from "react";
import appService from "../services/appService";
import { PACKAGE_MANAGERS } from "../utils/appUtils";

const PAGE_SIZE = 40;

export const useApps = (activeTab) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const currentTabRef = useRef(activeTab);
  const abortControllerRef = useRef(null);

  const resetStateForTab = useCallback(() => {
    setApps([]);
    setPage(0);
    setTotal(0);
    setError(null);
  }, []);

  const loadPage = useCallback(
    async (pageToLoad = 0) => {
      if (!activeTab) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      currentTabRef.current = activeTab;

      if (pageToLoad === 0) {
        setLoading(true);
        resetStateForTab();
      } else {
        setLoadingMore(true);
      }

      try {
        const offset = pageToLoad * PAGE_SIZE;
        const result = await appService.getAppsPageByManager(activeTab, offset, PAGE_SIZE, signal);

        if (!signal.aborted && currentTabRef.current === activeTab) {
          const pageApps = result.apps || [];
          setApps((prev) => (pageToLoad === 0 ? pageApps : [...prev, ...pageApps]));
          setTotal(result.total || 0);
          setPage(pageToLoad);

          // Save to cache only when first page loaded
          if (pageToLoad === 0) {
            try {
              await appService.saveCache(activeTab, pageApps);
            } catch (_) {}
          }
        }
      } catch (err) {
        if (!signal.aborted && currentTabRef.current === activeTab) {
          console.error("Error loading apps:", err);
          setError(err.message);
        }
      } finally {
        if (!signal.aborted && currentTabRef.current === activeTab) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [activeTab, resetStateForTab]
  );

  useEffect(() => {
    loadPage(0);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (loadingMore) return;
    const nextPage = page + 1;
    const alreadyLoaded = apps.length;
    if (alreadyLoaded >= total && total !== 0) return; // no more
    loadPage(nextPage);
  }, [page, apps.length, total, loadingMore, loadPage]);

  const reloadApps = useCallback(() => {
    loadPage(0);
  }, [loadPage]);

  const hasMore = total === 0 ? apps.length >= PAGE_SIZE : apps.length < total;

  return { apps, loading, loadingMore, error, reloadApps, loadMore, hasMore };
};


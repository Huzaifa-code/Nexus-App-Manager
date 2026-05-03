import React, { useEffect, useRef } from "react";
import AppCard from "./AppCard";
import Loader from "./Loader";
import { filterApps } from "../utils/appUtils";

const AppList = ({ apps, searchQuery, loading, loadingMore, loadMore, hasMore, onUninstall, uninstalling, onAppClick }) => {
  const filteredApps = filterApps(apps, searchQuery);
  const observerTargetRef = useRef(null);

  useEffect(() => {
    // If loadMore is provided, attach an IntersectionObserver to trigger it
    if (!loadMore || !observerTargetRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTargetRef.current);

    return () => {
      if (observerTargetRef.current) observer.unobserve(observerTargetRef.current);
    };
  }, [loadMore, observerTargetRef]);

  if (loading) {
    return <Loader />;
  }

  if (filteredApps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">
          {searchQuery ? "No applications found matching your search." : "No applications found"}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 px-2 pb-8">
      {filteredApps.map((app, index) => (
        <AppCard
          key={`${app.manager}-${app.name}-${index}`}
          app={app}
          onUninstall={onUninstall}
          isUninstalling={uninstalling === app.name}
          onClick={() => onAppClick(app)}
        />
      ))}

      {(hasMore || loadingMore) && (
        <div ref={observerTargetRef} className="col-span-full py-8 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppList;


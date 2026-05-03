import React, { useState, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AppList from "./components/AppList";
import { useApps } from "./hooks/useApps";
import { useGlobalApps } from "./hooks/useGlobalApps";
import { useUninstall } from "./hooks/useUninstall";
import { PACKAGE_MANAGERS, filterAppsByManager } from "./utils/appUtils";
import { filterApps } from "./utils/appUtils";
import "./index.css";

import About from "./components/About";
import AppDetailsModal from "./components/AppDetailsModal";

function App() {
  const [activeTab, setActiveTab] = useState(PACKAGE_MANAGERS.APT);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [selectedAppForDetails, setSelectedAppForDetails] = useState(null);
  
  const { apps: tabApps, loading: tabLoading, loadingMore: tabLoadingMore, reloadApps: reloadTabApps, loadMore: loadMoreTab, hasMore: tabHasMore } = useApps(activeTab);
  const { apps: globalApps, loading: globalLoading, reloadApps: reloadGlobalApps } = useGlobalApps();
  const { uninstalling, handleUninstall } = useUninstall(() => {
    if (isGlobalSearch) {
      reloadGlobalApps();
    } else {
      reloadTabApps();
    }
  });

  const apps = isGlobalSearch ? globalApps : tabApps;
  const loading = isGlobalSearch ? globalLoading : tabLoading;
  const loadingMore = isGlobalSearch ? false : tabLoadingMore;
  const loadMore = isGlobalSearch ? null : loadMoreTab;
  const hasMore = isGlobalSearch ? false : tabHasMore;

  const filteredAppsCount = useMemo(() => filterApps(apps, searchQuery).length, [apps, searchQuery]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsGlobalSearch(false);
    setSelectedAppForDetails(null);
  };

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'about' ? (
          <About />
        ) : (
          <>
            <Header
              activeTab={activeTab}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              appCount={filteredAppsCount}
              onRefresh={isGlobalSearch ? reloadGlobalApps : reloadTabApps}
              isGlobalSearch={isGlobalSearch}
              onGlobalSearchChange={setIsGlobalSearch}
            />
            
            <div className="flex-1 overflow-y-auto p-6">
              <AppList
                apps={apps}
                searchQuery={searchQuery}
                loading={loading}
                loadingMore={loadingMore}
                loadMore={loadMore}
                hasMore={hasMore}
                onUninstall={handleUninstall}
                uninstalling={uninstalling}
                onAppClick={setSelectedAppForDetails}
              />
            </div>
          </>
        )}
      </div>

      <AppDetailsModal 
        app={selectedAppForDetails} 
        onClose={() => setSelectedAppForDetails(null)}
        onUninstall={handleUninstall}
        isUninstalling={uninstalling === selectedAppForDetails?.name}
      />
    </div>
  );
}

export default App;

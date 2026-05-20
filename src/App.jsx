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
import Usage from "./components/Usage";
import AppDetailsModal from "./components/AppDetailsModal";
import ConfirmModal from "./components/ConfirmModal";
import Toast from "./components/Toast";

function App() {
  const [activeTab, setActiveTab] = useState(PACKAGE_MANAGERS.APT);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [selectedAppForDetails, setSelectedAppForDetails] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);
  
  const showToast = (text, type = 'success') => setToastMessage({ text, type });
  const clearToast = () => setToastMessage(null);

  const { apps: tabApps, loading: tabLoading, loadingMore: tabLoadingMore, reloadApps: reloadTabApps, loadMore: loadMoreTab, hasMore: tabHasMore } = useApps(activeTab);
  const { apps: globalApps, loading: globalLoading, reloadApps: reloadGlobalApps } = useGlobalApps();
  const { 
    uninstalling, 
    requestUninstall, 
    handleConfirmUninstall, 
    handleCancelUninstall,
    confirmModalConfig
  } = useUninstall(() => {
    if (isGlobalSearch) {
      reloadGlobalApps();
    } else {
      reloadTabApps();
    }
  }, showToast);

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
        ) : activeTab === 'usage' ? (
          <Usage />
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
                onUninstall={requestUninstall}
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
        onUninstall={requestUninstall}
        isUninstalling={uninstalling === selectedAppForDetails?.name}
        showToast={showToast}
      />

      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={handleCancelUninstall}
        onConfirm={handleConfirmUninstall}
        title="Confirm Uninstall"
        message={`Are you sure you want to uninstall ${confirmModalConfig.app?.name}?\n\nA password dialog may appear depending on the package manager.`}
        isDestructive={true}
        confirmText="Uninstall"
      />

      <Toast 
        message={toastMessage?.text}
        type={toastMessage?.type}
        onClose={clearToast}
      />
    </div>
  );
}

export default App;

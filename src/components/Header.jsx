import React, { useState } from "react";
import SearchBar from "./SearchBar";
import { getTabTitle } from "../utils/appUtils";
import appService from "../services/appService";
import { FiRefreshCw, FiGlobe } from "react-icons/fi";

const Header = ({ activeTab, searchQuery, onSearchChange, appCount, onRefresh, isGlobalSearch, onGlobalSearchChange }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await appService.clearCache(activeTab);
      if (onRefresh) {
        onRefresh();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-transparent px-8 py-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isGlobalSearch ? "All Applications" : getTabTitle(activeTab)}
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {appCount} {appCount === 1 ? "app" : "apps"} found
          </p>
        </div>
        
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onGlobalSearchChange(!isGlobalSearch)}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              isGlobalSearch
                ? 'bg-red-100 text-red-600 shadow-sm'
                : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm border border-gray-100'
            }`}
            title="Search across all package managers"
          >
            <FiGlobe className="w-5 h-5" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white hover:bg-gray-50 rounded-full shadow-sm border border-gray-100 transition-all duration-200 disabled:opacity-50 text-gray-600"
            title="Refresh and clear cache"
          >
            <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="md:hidden mt-4">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
      </div>
    </div>
  );
};

export default Header;


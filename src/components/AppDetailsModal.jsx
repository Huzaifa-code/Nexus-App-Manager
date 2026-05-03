import React from "react";
import { FiX, FiPackage, FiInfo, FiFolder, FiCpu, FiUser, FiExternalLink, FiLayers, FiShield, FiTrash2 } from "react-icons/fi";
import { getManagerIcon, getDisplayName } from "../utils/appUtils";
import appService from "../services/appService";

const AppDetailsModal = ({ app, onClose, onUninstall, isUninstalling }) => {
  if (!app) return null;

  const displayName = getDisplayName(app);

  const handleOpenPath = () => {
    if (app.path) {
      appService.openPath(app.path);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gray-50 rounded-2xl text-gray-600">
              {getManagerIcon(app.manager)}
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{displayName}</h2>
              <p className="text-gray-500 font-semibold mt-1">Version {app.version}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-4">
          {/* Description Section */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Description</h3>
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
              <p className="text-gray-700 leading-relaxed">
                {app.description || "No detailed description available for this application."}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <DetailItem 
              icon={<FiInfo className="w-5 h-5" />} 
              label="Size on Disk" 
              value={app.size} 
            />
            <button 
              onClick={handleOpenPath}
              className="text-left group transition-all"
            >
              <DetailItem 
                icon={<FiFolder className="w-5 h-5 group-hover:text-red-500 transition-colors" />} 
                label="Install Path (Click to open)" 
                value={app.path}
                isFullWidth
              />
            </button>
            <DetailItem 
              icon={<FiLayers className="w-5 h-5" />} 
              label="Package Manager" 
              value={app.manager.toUpperCase()} 
            />
            <DetailItem 
              icon={<FiCpu className="w-5 h-5" />} 
              label="Architecture" 
              value="x86_64" 
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={() => onUninstall(app)}
              disabled={isUninstalling}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
                isUninstalling
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-sm"
              }`}
            >
              {isUninstalling ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              ) : (
                <>
                  <FiTrash2 className="w-5 h-5" />
                  <span>Uninstall Application</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
          <FiShield className="w-3.5 h-3.5" />
          <span>Verified Package from {app.manager} repositories</span>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value, isFullWidth }) => (
  <div className={`flex items-center gap-4 p-4 bg-white border border-gray-50 rounded-2xl shadow-sm h-full ${isFullWidth ? 'sm:col-span-2' : ''}`}>
    <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-bold text-gray-900 break-all ${isFullWidth ? '' : 'truncate'}`}>{value}</p>
    </div>
  </div>
);

export default AppDetailsModal;

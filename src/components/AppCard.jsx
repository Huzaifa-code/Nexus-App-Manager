import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FiTrash2, FiInfo, FiPackage } from "react-icons/fi";
import { getManagerIcon, getDisplayName } from "../utils/appUtils";

const AppCard = ({ app, onUninstall, isUninstalling, onClick }) => {
  const displayName = getDisplayName(app);
  const [iconSrc, setIconSrc] = useState(null);

  useEffect(() => {
    let url = null;
    if (app.icon) {
      invoke('read_image_bytes', { path: app.icon })
        .then(bytes => {
          const ext = app.icon.split('.').pop().toLowerCase();
          const mimeType = ext === 'svg' ? 'image/svg+xml' : (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
          const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
          url = URL.createObjectURL(blob);
          setIconSrc(url);
        })
        .catch(err => {
            console.error("Failed to load icon bytes:", err);
            setIconSrc(null);
        });
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [app.icon]);

  return (
    <div 
      onClick={onClick}
      className="bg-white/80 backdrop-blur-md rounded-[1.25rem] border border-white shadow-sm p-6 flex flex-col h-full hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-red-50 transition-colors flex-shrink-0 w-12 h-12 flex items-center justify-center overflow-hidden">
            {iconSrc ? (
              <img 
                src={iconSrc} 
                alt={displayName} 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <div 
              className="text-gray-500 group-hover:text-red-500"
              style={{ display: iconSrc ? 'none' : 'block' }}
            >
              {getManagerIcon(app.manager, "w-6 h-6")}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={displayName}>{displayName}</h3>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
              {app.version}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6 line-clamp-2 flex-grow">
        {app.description || "No description available for this package."}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <div className="flex flex-col gap-1.5 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <FiInfo className="w-3.5 h-3.5" />
            <span>{app.size}</span>
          </div>
          <div className="flex items-center gap-1.5 max-w-[140px]" title={app.path}>
            <FiPackage className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{app.path}</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onUninstall(app);
          }}
          disabled={isUninstalling}
          className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
            isUninstalling
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white"
          }`}
          title="Uninstall"
        >
          {isUninstalling ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
          ) : (
            <FiTrash2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AppCard;


import React from "react";

const Loader = ({ 
  text = "Loading applications...", 
  subtext, 
  type = "dots", 
  colorClass = "bg-blue-500", 
  spinnerColorClass = "border-red-500", 
  spinnerSizeClass = "h-12 w-12",
  fullHeight = true 
}) => {
  const containerClass = fullHeight ? "flex items-center justify-center h-full" : "flex items-center justify-center";
  
  if (type === "spinner") {
    return (
      <div className={`flex flex-col items-center justify-center ${fullHeight ? 'flex-1 h-full p-8' : ''}`}>
        <div className={`animate-spin rounded-full ${spinnerSizeClass} border-b-2 ${spinnerColorClass} ${text ? 'mb-4' : ''}`}></div>
        {text && <p className="text-gray-500">{text}</p>}
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1">
          <div className={`w-2 h-2 ${colorClass} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
          <div className={`w-2 h-2 ${colorClass} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
          <div className={`w-2 h-2 ${colorClass} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
        </div>
        {text && <div className="text-gray-600 font-medium">{text}</div>}
        {subtext && <div className="text-sm text-gray-400">{subtext}</div>}
      </div>
    </div>
  );
};

export default Loader;


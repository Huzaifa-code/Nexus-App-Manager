import React, { useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiX } from "react-icons/fi";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] transition-all duration-500 transform translate-y-0 opacity-100">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
        type === "success" 
          ? "bg-green-50 border-green-200 text-green-800" 
          : "bg-red-50 border-red-200 text-red-800"
      }`}>
        {type === "success" ? (
          <FiCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
        ) : (
          <FiXCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        )}
        <p className="font-semibold text-sm max-w-sm">{message}</p>
        <button 
          onClick={onClose}
          className="ml-2 p-1.5 rounded-full hover:bg-black/5 transition-colors"
        >
          <FiX className="w-4 h-4 opacity-70 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

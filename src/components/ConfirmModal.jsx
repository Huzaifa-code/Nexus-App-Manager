import React from "react";
import { FiAlertCircle, FiX } from "react-icons/fi";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-[2rem] border border-white shadow-2xl overflow-hidden flex flex-col transform transition-all">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full flex-shrink-0 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
              <FiAlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{title}</h3>
          </div>
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <p className="text-sm text-gray-600 whitespace-pre-line">{message}</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-white transition-colors shadow-sm ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                : 'bg-blue-500 hover:bg-blue-600 shadow-blue-200'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

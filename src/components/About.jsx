import React from "react";
import { FiGithub, FiInfo, FiHeart, FiCode, FiExternalLink } from "react-icons/fi";
import { openUrl } from "@tauri-apps/plugin-opener";

const About = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm p-10 flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            <FiInfo className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Nexus App Manager</h1>
          <p className="text-gray-500 font-medium mb-6">Version 0.1.0</p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => openUrl("https://github.com/Huzaifa-code/Nexus-App-Manager")}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
            >
              <FiGithub className="w-5 h-5" />
              <span>GitHub Repository</span>
            </button>
            <button 
              onClick={() => openUrl("https://github.com/Huzaifa-code/Nexus-App-Manager/releases")}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-900 rounded-full font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <FiExternalLink className="w-5 h-5" />
              <span>Release Notes</span>
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-white shadow-sm p-8 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-50 transition-colors">
              <FiCode className="w-6 h-6 text-gray-600 group-hover:text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Modern Stack</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Built with Tauri, React, and Tailwind CSS for a lightweight and lightning-fast experience on Linux.</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-white shadow-sm p-8 group hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-50 transition-colors">
              <FiHeart className="w-6 h-6 text-gray-600 group-hover:text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Open Source</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Dedicated to providing a beautiful and functional way to manage your APT, Snap, and Flatpak apps.</p>
          </div>
        </div>

        {/* Credits */}
        <div className="text-center text-gray-400 text-sm font-medium">
          <p>© 2026 Nexus App Manager Team. All rights reserved.</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            Made with <FiHeart className="text-red-500 fill-red-500" /> for the Linux Community
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;

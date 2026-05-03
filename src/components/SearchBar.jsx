import React from "react";
import { FiSearch } from "react-icons/fi";

const SearchBar = ({ value, onChange, placeholder = "Search applications..." }) => {
  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <FiSearch className="text-gray-400 group-focus-within:text-red-500 w-5 h-5 transition-colors" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-12 pr-4 py-3 bg-white border-none rounded-full text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:shadow-md transition-all duration-200"
      />
    </div>
  );
};

export default SearchBar;


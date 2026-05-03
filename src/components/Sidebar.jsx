import { FiPackage, FiInfo } from "react-icons/fi";
import { SiDebian, SiSnapcraft, SiFlatpak } from "react-icons/si";
import { PACKAGE_MANAGERS } from "../utils/appUtils";

const SIDEBAR_ITEMS = [
  {
    id: PACKAGE_MANAGERS.APT,
    label: "APT Packages",
    icon: SiDebian,
  },
  {
    id: PACKAGE_MANAGERS.SNAP,
    label: "Snap Packages",
    icon: SiSnapcraft,
  },
  {
    id: PACKAGE_MANAGERS.FLATPAK,
    label: "Flatpak Apps",
    icon: SiFlatpak,
  },
];

const GENERAL_ITEMS = [
  {
    id: "about",
    label: "About",
    icon: FiInfo,
  },
];

const Sidebar = ({ activeTab, onTabChange }) => {
  return (
    <div className="md:w-64 bg-[#f6f8fb] flex flex-col">
      <div className="p-8 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
          <FiPackage className="w-8 h-8 text-red-600" />
          <span className="hidden md:inline">Nexus</span>
        </h1>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col gap-8">
        <nav className="space-y-1">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Menu</p>
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                  isActive
                    ? "text-gray-900 font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-red-500 rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-red-500' : 'group-hover:scale-110'}`} />
                <span className="hidden md:block tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <nav className="space-y-1">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">General</p>
          {GENERAL_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                  isActive
                    ? "text-gray-900 font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-red-500 rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-red-500' : 'group-hover:scale-110'}`} />
                <span className="hidden md:block tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;


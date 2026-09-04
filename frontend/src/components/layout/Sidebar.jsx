import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  BarChart2, 
  List, 
  TrendingUp, 
  Newspaper, 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  Sun, 
  Moon,
  Coins
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate }) {
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', icon: BarChart2, label: 'Dashboard' },
    { id: 'watchlist', icon: List, label: 'Watchlist' },
    { id: 'market', icon: TrendingUp, label: 'Market (500+)' },
    { id: 'news', icon: Newspaper, label: 'News Feed' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between shrink-0 transition-colors duration-200 h-screen sticky top-0 z-30">
      
      {/* Top Section: Logo & Tagline */}
      <div>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0A5C3A] flex items-center justify-center shadow-md shadow-[#0A5C3A]/25 group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-[#1A1A2E] dark:text-white flex items-center gap-1">
                Vasooli <span className="text-[#0A5C3A]">Tracker</span>
              </h1>
              <p className="text-[11px] font-bold text-[#0A5C3A] tracking-wide mt-0.5 flex items-center gap-1">
                देखो क्या बदला. समझो क्यों.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0A5C3A] text-white dark:bg-[#0A4A2E] shadow-md shadow-[#0A5C3A]/25'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-[#E8F5EE] dark:hover:bg-gray-700/60 hover:text-[#0A5C3A] dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Logout, Theme Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1.5 bg-gray-50/50 dark:bg-gray-800/50">
        <button 
          onClick={() => alert("Session active: Ashmisikha Piri logged in.")}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-[#E8F5EE] dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-gray-400" />
          <span>Logout</span>
        </button>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-extrabold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-2xs hover:bg-[#E8F5EE] dark:hover:bg-gray-600 transition-all mt-2 cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0A5C3A]" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 uppercase">
            {theme}
          </span>
        </button>
      </div>

    </aside>
  );
}

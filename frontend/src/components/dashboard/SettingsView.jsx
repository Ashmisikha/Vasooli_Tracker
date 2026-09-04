import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Settings as SettingsIcon, Sun, Moon, Database, ShieldCheck, Zap } from 'lucide-react';

export default function SettingsView() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
        <h2 className="text-2xl font-extrabold text-[#1A1A2E] dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#0A5C3A]" /> SETTINGS & PREFERENCES
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Customize Vasooli Tracker theme, polling intervals, and API settings
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-6">
        
        {/* Appearance */}
        <div>
          <h3 className="font-extrabold text-sm text-[#1A1A2E] dark:text-white mb-3">Appearance</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div>
              <div className="font-bold text-xs text-[#1A1A2E] dark:text-white">Theme Mode</div>
              <div className="text-[11px] text-gray-400">Switch between light and dark visual mode</div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-[#00D09C] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

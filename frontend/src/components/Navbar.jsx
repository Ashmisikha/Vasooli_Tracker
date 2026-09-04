import React from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  Sliders, 
  LayoutDashboard,
  Zap
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenAddModal, 
  onRefreshAll, 
  isRefreshing 
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#080B11]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Hackathon Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SentimentRisk
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
                  CODE 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Smart Watchlist & Sentiment-Powered Risk Engine
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'watchlist'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Watchlist</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'simulator'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sentiment Shock Simulator</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            title="Scan & refresh live market data"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Refresh All</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#0ECB81] hover:bg-[#0A8C5A] text-white rounded-lg font-extrabold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Stock</span>
          </button>
        </div>

      </div>
    </header>
  );
}

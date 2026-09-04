import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  User,
  Sparkles,
  Coins
} from 'lucide-react';
import { searchStocksCatalog } from '../../services/api';
import { isIndianStock } from '../../utils/currency';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onOpenAddModal, 
  onSelectStock,
  onOpenGetStarted,
  onNavigate
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await searchStocksCatalog(searchQuery, 8);
        setSearchResults(res.results || []);
      } catch (err) {
        console.error('Catalog search failed:', err);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (stock) => {
    onSelectStock(stock.symbol);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleNavClick = (tab) => {
    if (setActiveTab) setActiveTab(tab);
    if (onNavigate) onNavigate(tab);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Header Row: Vasooli Wealth Logo + CODE 2026 + Nav Tabs + Search + Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-8">
            <div 
              onClick={() => handleNavClick('stocks')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D09C] to-[#FF9933] flex items-center justify-center shadow-md shadow-[#00D09C]/20 group-hover:scale-105 transition-transform">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight text-[#1A1A2E]">
                    Vasooli <span className="text-[#00D09C]">Wealth</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FF9933]/15 text-[#FF9933] border border-[#FF9933]/30 uppercase">
                    CODE 2026
                  </span>
                </div>
                <p className="text-[11px] text-[#00D09C] font-extrabold hidden md:block tracking-wide">
                  देखो क्या बदला. समझो क्यों.
                </p>
              </div>
            </div>

            {/* Navigation Tabs - WORKING CLICK HANDLERS */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold">
              <button 
                onClick={() => handleNavClick('stocks')}
                className={`transition-colors py-1 ${
                  activeTab === 'stocks' || activeTab === 'overview'
                    ? 'text-[#00D09C] font-bold border-b-2 border-[#00D09C]' 
                    : 'text-[#666D80] hover:text-[#1A1A2E]'
                }`}
              >
                Stocks
              </button>
              <button 
                onClick={() => handleNavClick('market')}
                className={`transition-colors py-1 ${
                  activeTab === 'market' 
                    ? 'text-[#00D09C] font-bold border-b-2 border-[#00D09C]' 
                    : 'text-[#666D80] hover:text-[#1A1A2E]'
                }`}
              >
                Market (200+)
              </button>
              <button 
                onClick={() => handleNavClick('watchlist')}
                className={`transition-colors py-1 ${
                  activeTab === 'watchlist' 
                    ? 'text-[#00D09C] font-bold border-b-2 border-[#00D09C]' 
                    : 'text-[#666D80] hover:text-[#1A1A2E]'
                }`}
              >
                Watchlist
              </button>
              <button 
                onClick={() => handleNavClick('analyze')}
                className={`flex items-center gap-1 transition-colors py-1 ${
                  activeTab === 'analyze' || activeTab === 'simulator'
                    ? 'text-[#00D09C] font-bold border-b-2 border-[#00D09C]' 
                    : 'text-[#666D80] hover:text-[#1A1A2E]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
                Analyze & Simulate
              </button>
            </nav>
          </div>

          {/* Search Input, Add Stock & Profile Icon */}
          <div className="flex items-center space-x-3">
            <div className="relative w-48 md:w-72">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search Stocks..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00D09C] focus:bg-white transition-all shadow-inner"
                />
              </div>

              {/* Instant Search & Recommendation Dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 w-80 -left-6 md:left-0 md:w-full">
                  <div className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-[11px] font-bold text-gray-500 border-b border-gray-100 flex items-center justify-between">
                    <span>{searchQuery ? `Matching "${searchQuery}"` : '🔥 Top Recommendations'}</span>
                    <span className="text-[10px] text-gray-400">500+ Equities</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((stock) => {
                      const isIndia = isIndianStock(stock);
                      const isUp = (stock.change_pct ?? stock.change ?? 0) >= 0;
                      return (
                        <button
                          key={stock.symbol}
                          onMouseDown={() => handleSelectResult(stock)}
                          className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center justify-between transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs">{isIndia ? '🇮🇳' : '🇺🇸'}</span>
                            <div className="truncate">
                              <div className="font-bold text-[#1A1A2E] text-xs flex items-center gap-1.5">
                                <span>{stock.symbol}</span>
                                <span className="text-[9px] font-normal px-1 py-0.2 rounded bg-gray-100 text-gray-500">{stock.sector}</span>
                              </div>
                              <div className="text-[11px] text-gray-500 truncate max-w-[150px]">{stock.name}</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-semibold text-xs text-gray-900">
                              {isIndia ? '₹' : '$'}{stock.price?.toLocaleString()}
                            </div>
                            <div className={`text-[10px] font-bold ${isUp ? 'text-[#0ECB81]' : 'text-[#EF4444]'}`}>
                              {isUp ? '+' : ''}{stock.change_pct ?? stock.change ?? 0}%
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Add Stock Button */}
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 text-sm bg-[#0ECB81] hover:bg-[#0A8C5A] text-white rounded-lg font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>

            {/* Profile Button */}
            <button 
              onClick={onOpenGetStarted}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors border border-gray-200 shadow-sm"
              title="User Profile & Settings"
            >
              <User className="w-4 h-4 text-gray-700" />
            </button>
          </div>

        </div>
      </div>

      {/* Ticker Row: Market Indices */}
      <div className="bg-[#1A1A2E] text-white py-1.5 px-4 text-xs font-mono border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto whitespace-nowrap gap-6">
          <div className="flex items-center space-x-6">
            <span>
              NIFTY 50: <strong className="text-white">19,456.25</strong> <span className="text-[#00D09C] font-bold">+0.42%</span>
            </span>
            <span className="text-gray-600">│</span>
            <span>
              SENSEX: <strong className="text-white">65,432.10</strong> <span className="text-[#00D09C] font-bold">+0.38%</span>
            </span>
            <span className="text-gray-600">│</span>
            <span>
              BANK NIFTY: <strong className="text-white">44,321.00</strong> <span className="text-[#00D09C] font-bold">+0.55%</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-sans text-gray-300">
            <span className="w-2 h-2 rounded-full bg-[#00D09C] animate-pulse"></span>
            <span className="text-[#00D09C] font-bold">Vasooli Wealth Real-Time Feed</span>
          </div>
        </div>
      </div>
    </header>
  );
}

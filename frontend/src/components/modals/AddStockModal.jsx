import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Search, AlertCircle, CheckCircle, RefreshCw, Sparkles, TrendingUp, TrendingDown, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchStocksCatalog } from '../../services/api';
import { isIndianStock, getCurrencySymbol } from '../../utils/currency';

const FEATURED_TABS = [
  { id: 'all', label: '✨ All' },
  { id: 'india', label: '🇮🇳 India (NSE)' },
  { id: 'us', label: '🇺🇸 US Equities' },
];

export default function AddStockModal({ isOpen, onClose, onAddStock, onAdd, onSuccess, defaultMarket = 'all' }) {
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState(defaultMarket);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingSymbol, setAddingSymbol] = useState(null);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setError(null);
      setSelectedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
      loadRecommendations('', selectedTab);
    }
  }, [isOpen, selectedTab]);

  // Debounced search / recommendation load
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      loadRecommendations(search, selectedTab);
    }, 150);
    return () => clearTimeout(timer);
  }, [search, selectedTab, isOpen]);

  const loadRecommendations = async (query, tab) => {
    try {
      setLoading(true);
      const marketParam = tab === 'all' ? null : tab;
      const res = await searchStocksCatalog(query, 12, marketParam);
      if (res && res.results) {
        setRecommendations(res.results);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Failed to fetch stock recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleAddAction = async (stockItem) => {
    let symbol = null;
    if (typeof stockItem === 'object' && stockItem && stockItem.symbol) {
      symbol = stockItem.symbol.toUpperCase().trim();
    } else if (typeof stockItem === 'string' && stockItem.trim()) {
      const trimmed = stockItem.trim().toUpperCase();
      const match = recommendations.find(
        (r) => r.symbol.toUpperCase() === trimmed
      );
      symbol = match ? match.symbol : trimmed;
    }

    if (!symbol) {
      setError('Please select or type a valid stock symbol.');
      return;
    }


    setAddingSymbol(symbol);
    setError(null);

    try {
      if (onAddStock) {
        await onAddStock(symbol);
      } else if (onAdd) {
        await onAdd(symbol);
      }
      
      if (onSuccess) onSuccess(symbol);
      onClose();
    } catch (err) {
      setError(err.message || `Failed to add ${symbol} to watchlist.`);
    } finally {
      setAddingSymbol(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < recommendations.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && recommendations[selectedIndex]) {
        handleAddAction(recommendations[selectedIndex]);
      } else if (recommendations.length > 0) {
        handleAddAction(recommendations[0]);
      } else {
        setError('No valid stock found. Random text cannot be added to your watchlist.');
      }
    }
  };


  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const q = query.trim();
    const index = text.toUpperCase().indexOf(q.toUpperCase());
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <span className="text-[#0ECB81] font-bold bg-[#0ECB81]/10 px-0.5 rounded">{text.slice(index, index + q.length)}</span>
        {text.slice(index + q.length)}
      </>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-gray-850 rounded-2xl w-full max-w-xl max-h-[88vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A2E] dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0ECB81]" /> Add Stock & Recommendations
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Type letters to get instant AI & catalog recommendations
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Search Input with Auto-Options */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type ticker or company (e.g. REL, AAPL, Tata, Infy)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(-1);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50/70 dark:bg-gray-900 text-[#1A1A2E] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ECB81] focus:border-transparent font-semibold shadow-inner text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); inputRef.current?.focus(); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Market Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              {FEATURED_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    selectedTab === tab.id
                      ? 'bg-[#0ECB81] text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              {loading && (
                <RefreshCw className="w-3.5 h-3.5 text-[#0ECB81] animate-spin ml-auto" />
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Recommendations & Live Options List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {search ? `Recommended Options for "${search}"` : '🔥 Popular & Trending Recommendations'}
                </span>
                <span className="text-[11px] text-gray-400">
                  {recommendations.length} options available
                </span>
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {recommendations.map((stock, index) => {
                    const isSelected = selectedIndex === index;
                    const isIndia = isIndianStock(stock);
                    const isUp = (stock.change_pct ?? stock.change ?? 0) >= 0;

                    return (
                      <div
                        key={stock.symbol}
                        onClick={() => handleAddAction(stock)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer group ${
                          isSelected
                            ? 'bg-[#0ECB81]/10 border-[#0ECB81] dark:bg-[#0ECB81]/15'
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isIndia 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          }`}>
                            {isIndia ? '🇮🇳' : '🇺🇸'}
                          </div>

                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1A1A2E] dark:text-white text-sm">
                                {highlightMatch(stock.symbol, search)}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                                {stock.sector || 'Equities'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
                              {highlightMatch(stock.name, search)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="font-bold text-sm text-[#1A1A2E] dark:text-white">
                              {isIndia ? '₹' : '$'}{stock.price?.toLocaleString()}
                            </div>
                            <div className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${
                              isUp ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {isUp ? '+' : ''}{stock.change_pct || stock.change || 0}%
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddAction(stock);
                            }}
                            disabled={addingSymbol === stock.symbol}
                            className="px-3 py-1.5 bg-[#0ECB81] hover:bg-[#0A8C5A] text-white rounded-lg text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            {addingSymbol === stock.symbol ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-dashed border-rose-200 dark:border-rose-800">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-500 flex items-center justify-center mx-auto mb-2.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-[#1A1A2E] dark:text-white mb-1">
                    No matching stock for "{search}"
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Arbitrary text and invalid symbols cannot be added. Please type a valid company name or stock ticker (e.g., <strong>RELIANCE</strong>, <strong>TCS</strong>, <strong>INFY</strong>, <strong>AAPL</strong>, <strong>NVDA</strong>).
                  </p>
                </div>
              )}
            </div>

            {/* Quick tips footer */}
            <div className="pt-2 text-[11px] text-gray-400 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
              <span>💡 Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 font-mono text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 font-mono text-[10px]">↓</kbd> to navigate, <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 font-mono text-[10px]">Enter</kbd> to select</span>
              <span>500+ Stock Recommendations</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


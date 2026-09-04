import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Activity, ArrowRight } from 'lucide-react';
import { fetchMarketOverview, searchStocksCatalog } from '../../services/api';
import { formatPrice } from '../../utils/currency';

export default function MarketOverview({ onSelectStock }) {
  const [overviewData, setOverviewData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadOverview() {
      try {
        const data = await fetchMarketOverview();
        setOverviewData(data);
      } catch (err) {
        console.error('Failed to fetch market overview:', err);
      }
    }
    loadOverview();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchStocksCatalog(searchQuery, 8);
        setSearchResults(res.results || []);
      } catch (err) {
        console.error('Search catalog error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const gainers = overviewData?.top_gainers || [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 189.40, change_pct: 5.2 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 124.50, change_pct: 4.8 },
    { symbol: 'AMD', name: 'Advanced Micro Devices', price: 98.20, change_pct: 3.9 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, change_pct: 2.7 }
  ];

  const losers = overviewData?.top_losers || [
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.30, change_pct: -8.2 },
    { symbol: 'META', name: 'Meta Platforms', price: 345.20, change_pct: -3.1 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.30, change_pct: -2.4 },
    { symbol: 'AMZN', name: 'Amazon.com', price: 178.90, change_pct: -1.8 }
  ];

  const active = overviewData?.most_active || [
    { symbol: 'TSLA', name: 'Tesla Inc.', volume: '45.2M shares', price: 245.30, change_pct: -8.2 },
    { symbol: 'AAPL', name: 'Apple Inc.', volume: '28.1M shares', price: 189.40, change_pct: 3.2 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', volume: '15.8M shares', price: 124.50, change_pct: 4.8 }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-[#1A1A2E] flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#00D09C]" /> MARKET OVERVIEW
        </h2>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
          500+ Stock Catalog Indexed
        </span>
      </div>

      {/* Main Search Interaction Box */}
      <div className="mb-10">
        <div className="relative max-w-3xl mx-auto">
          <div className="relative shadow-md rounded-2xl overflow-hidden border border-gray-200 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search className="w-5 h-5 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any stock to analyze (by symbol or company name)..."
              className="w-full pl-14 pr-6 py-4 text-base md:text-lg bg-transparent border-0 text-[#1A1A2E] placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* Autocomplete Results Box */}
          {searchQuery.trim() !== '' && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 divide-y divide-gray-100">
              <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 flex justify-between items-center">
                <span>SEARCH RESULTS ({searchResults.length})</span>
                {isSearching && <span className="text-xs text-blue-600 font-medium">Searching...</span>}
              </div>
              {searchResults.length === 0 && !isSearching ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No stocks matching &quot;<span className="font-semibold text-gray-800">{searchQuery}</span>&quot;
                </div>
              ) : (
                searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => {
                      onSelectStock(stock.symbol);
                      setSearchQuery('');
                    }}
                    className="p-4 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="font-bold text-[#1A1A2E] group-hover:text-blue-600 transition-colors flex items-center gap-2">
                        {stock.symbol}
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {stock.sector}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#1A1A2E]">{formatPrice(stock.price, stock)}</div>
                      <div className={`text-xs font-bold ${stock.change_pct >= 0 ? 'text-[#00D09C]' : 'text-red-500'}`}>
                        {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Gainers & Top Losers Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Top Gainers Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h3 className="text-[#00D09C] font-bold text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              TOP GAINERS (Today)
            </h3>
            <span className="text-xs font-medium text-gray-400">Market Hours</span>
          </div>

          <div className="space-y-3">
            {gainers.map((stock, idx) => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/50 cursor-pointer border border-transparent hover:border-emerald-200/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
                  <div>
                    <div className="font-bold text-[#1A1A2E] group-hover:text-[#00D09C] transition-colors">
                      {stock.symbol}
                    </div>
                    <div className="text-xs text-gray-500">{stock.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#1A1A2E] text-sm">{formatPrice(stock.price, stock)}</div>
                  <div className="text-xs font-bold text-[#00D09C] bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                    +{Math.abs(stock.change_pct)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h3 className="text-red-500 font-bold text-base flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              TOP LOSERS (Today)
            </h3>
            <span className="text-xs font-medium text-gray-400">Market Hours</span>
          </div>

          <div className="space-y-3">
            {losers.map((stock, idx) => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50/50 cursor-pointer border border-transparent hover:border-red-200/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
                  <div>
                    <div className="font-bold text-[#1A1A2E] group-hover:text-red-500 transition-colors">
                      {stock.symbol}
                    </div>
                    <div className="text-xs text-gray-500">{stock.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#1A1A2E] text-sm">{formatPrice(stock.price, stock)}</div>
                  <div className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md inline-block">
                    {stock.change_pct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Most Active Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <h3 className="text-[#1A1A2E] font-bold text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            MOST ACTIVE (By Volume)
          </h3>
          <span className="text-xs font-medium text-gray-500">Trading Activity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {active.map((stock, idx) => (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className="p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md bg-gray-50/50 hover:bg-white cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-gray-400 mb-1">{idx + 1}. MOST ACTIVE</div>
                <div className="font-bold text-[#1A1A2E] text-base group-hover:text-blue-600 transition-colors">
                  {stock.symbol}
                </div>
                <div className="text-xs text-gray-500">{stock.name}</div>
                <div className="text-xs font-medium text-blue-600 mt-1">
                  {stock.volume || `${(20 + idx * 8).toFixed(1)}M shares`}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-[#1A1A2E]">{formatPrice(stock.price, stock)}</div>
                <div className={`text-xs font-bold ${stock.change_pct >= 0 ? 'text-[#00D09C]' : 'text-red-500'}`}>
                  {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

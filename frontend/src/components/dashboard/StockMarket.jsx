import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Plus, BarChart2 } from 'lucide-react';
import { fetchPaginatedStocks, fetchSectorsList, triggerEtlRefresh } from '../../services/api';
import { isIndianStock, getCurrencySymbol } from '../../utils/currency';

export default function StockMarket({ selectedMarket = 'india', onAnalyzeStock, onAddStock }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sector, setSector] = useState('All Sectors');
  const [sectors, setSectors] = useState([]);
  const [sortBy, setSortBy] = useState('symbol');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSectors();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchStocks();
  }, [selectedMarket]); // reset to page 1 when market changes

  useEffect(() => {
    fetchStocks();
  }, [page, sector, sortBy, searchQuery]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const params = {
        page: page,
        per_page: 15,
        sector: sector,
        sort_by: sortBy,
        q: searchQuery,
        market: selectedMarket  // 'india' | 'us' — backend filters server-side
      };
      const data = await fetchPaginatedStocks(params);
      if (data && data.data) {
        setStocks(data.data);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectors = async () => {
    try {
      const data = await fetchSectorsList();
      if (data && data.sectors) {
        setSectors(['All Sectors', ...data.sectors]);
      }
    } catch (error) {
      console.error('Error fetching sectors:', error);
    }
  };

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      await triggerEtlRefresh();
      await fetchStocks();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatVolume = (vol) => {
    if (vol === null || vol === undefined || vol === '') return '—';
    if (typeof vol === 'string') {
      if (vol.includes('M') || vol.includes('K') || vol.includes('B') || vol.includes('Cr') || vol.includes('L')) return vol;
      const n = parseFloat(vol);
      if (isNaN(n)) return vol || '—';
      vol = n;
    }
    if (typeof vol === 'number') {
      if (isNaN(vol)) return '—';
      if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(1)}B`;
      if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
      if (vol >= 1_000) return `${(vol / 1_000).toFixed(0)}K`;
      return vol.toLocaleString();
    }
    return '—';
  };

  return (
    <div id="stock-market-section" className="container mx-auto px-4 py-8 max-w-7xl scroll-mt-20">
      {/* Header & Controls Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xs border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 text-[#0A5C3A] font-extrabold text-[10px] rounded-md tracking-wider border border-[#0A5C3A]/30 uppercase">
                ETL PIPELINE ACTIVE
              </span>
              <span className="text-xs text-gray-400 font-semibold">• 200+ Live Equities</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#1A1A2E] dark:text-white mt-1 flex items-center gap-2">
              STOCK MARKET UNIVERSE
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Extract → Transform → Load pipeline calculating real-time volatility, beta, and Vasooli risk scores
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-[#0A5C3A] rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-600 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing Pipeline...' : 'Trigger ETL Refresh'}
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search 200+ stocks by ticker, company, or sector (e.g. RELIANCE, NVDA, Financial)..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A5C3A]/30 focus:border-[#0A5C3A] transition-all"
            />
          </div>

          {/* Sector Selector */}
          <div className="md:col-span-3 relative">
            <select
              value={sector}
              onChange={(e) => { setSector(e.target.value); setPage(1); }}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A5C3A]/30 focus:border-[#0A5C3A] transition-all"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3 relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A5C3A]/30 focus:border-[#0A5C3A] transition-all"
            >
              <option value="symbol">Sort: Symbol (A-Z)</option>
              <option value="price">Sort: Highest Price</option>
              <option value="change">Sort: Highest Change %</option>
              <option value="risk_score">Sort: Highest Risk Score</option>
              <option value="volume">Sort: Highest Volume</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xs border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-[#0A5C3A] animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Extracting live stock pipeline data...</p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">No stocks matching query "{searchQuery}"</p>
            <p className="text-xs text-gray-400 mt-1">Try clearing your search query or selecting 'All Sectors'.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-100 dark:border-gray-700 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">#</th>
                  <th className="px-6 py-3.5">Symbol</th>
                  <th className="px-6 py-3.5">Company Name</th>
                  <th className="px-6 py-3.5 text-right">Price</th>
                  <th className="px-6 py-3.5 text-right">24h Change</th>
                  <th className="px-6 py-3.5 text-right">Volume</th>
                  <th className="px-6 py-3.5 text-center">Risk Score</th>
                  <th className="px-6 py-3.5 text-center">Trend</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {stocks.map((stock, index) => {
                  const itemIndex = (page - 1) * 15 + index + 1;
                  const changeVal = stock.change_pct !== undefined && stock.change_pct !== null ? stock.change_pct : (stock.change || 0);
                  const isUp = changeVal > 0;
                  const isDown = changeVal < 0;

                  let changeTextClass = 'text-gray-400 dark:text-gray-400 font-extrabold';
                  let changeIcon = <Minus className="w-3.5 h-3.5 text-gray-400" />;

                  if (isUp) {
                    changeTextClass = 'text-[#0A5C3A] dark:text-[#0A5C3A] font-extrabold';
                    changeIcon = <TrendingUp className="w-3.5 h-3.5 text-[#0A5C3A]" />;
                  } else if (isDown) {
                    changeTextClass = 'text-[#8B1A1A] dark:text-[#FF6B6B] font-extrabold';
                    changeIcon = <TrendingDown className="w-3.5 h-3.5 text-[#8B1A1A] dark:text-[#FF6B6B]" />;
                  }

                  const getRiskBadge = (score) => {
                    if (score >= 60) return { label: `${score} High`, bg: 'bg-[#F5E6E6] text-[#8B1A1A] border-[#8B1A1A]/30 dark:bg-[#5C1010]/40 dark:text-red-300' };
                    if (score >= 40) return { label: `${score} Med`, bg: 'bg-[#F5F5F5] text-[#8E8E93] border-[#8E8E93]/30 dark:bg-[#636366]/30 dark:text-gray-300' };
                    return { label: `${score} Low`, bg: 'bg-[#E8F5EE] text-[#0A5C3A] border-[#0A5C3A]/30 dark:bg-[#0A4A2E]/40 dark:text-[#0A5C3A]' };
                  };

                  const riskBadge = getRiskBadge(stock.risk_score || 45);

                  const trendLabel = isUp ? 'Bullish' : isDown ? 'Bearish' : 'Neutral';
                  const trendClass = isUp 
                    ? 'bg-[#E8F5EE] text-[#0A5C3A] dark:bg-[#0A4A2E]/40 dark:text-[#0A5C3A] font-extrabold border border-[#0A5C3A]/40' 
                    : isDown 
                    ? 'bg-[#F5E6E6] text-[#8B1A1A] dark:bg-[#5C1010]/40 dark:text-[#FF6B6B] font-extrabold border border-[#8B1A1A]/40' 
                    : 'bg-[#F5F5F5] dark:bg-[#636366]/30 text-[#8E8E93] dark:text-gray-300 font-bold border border-[#8E8E93]/40';

                  const isIndia = isIndianStock(stock, selectedMarket);
                  const currencySymbol = getCurrencySymbol(stock, selectedMarket);

                  return (
                    <tr 
                      key={stock.symbol}
                      className="hover:bg-[#E8F5EE]/40 dark:hover:bg-gray-700/50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-gray-400 font-semibold text-xs">{itemIndex}</td>
                      <td className="px-6 py-4">
                        <div 
                          onClick={() => onAnalyzeStock && onAnalyzeStock(stock.symbol)}
                          className="font-extrabold text-[#1A1A2E] dark:text-white group-hover:text-[#0A5C3A] cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          {stock.symbol}
                          <span className="text-[9px] px-1.5 py-0.2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 font-bold">
                            {stock.country || (isIndia ? 'India' : 'US')}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400">{stock.sector || 'Equities'}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                        {stock.name || stock.symbol}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-[#1A1A2E] dark:text-white">
                        {currencySymbol}{(stock.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold text-xs ${changeTextClass}`}>
                        <div className="flex items-center justify-end gap-0.5">
                          {changeIcon}
                          {isUp ? '+' : ''}{changeVal.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-500 dark:text-gray-400 font-semibold">
                        {formatVolume(stock.volume)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold border ${riskBadge.bg}`}>
                          {riskBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${trendClass}`}>
                          {trendLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onAnalyzeStock && onAnalyzeStock(stock.symbol)}
                            className="px-2.5 py-1 bg-white dark:bg-gray-700 hover:bg-[#E8F5EE] text-gray-700 dark:text-gray-200 hover:text-[#0A5C3A] border border-gray-200 dark:border-gray-600 hover:border-[#0A5C3A] rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <BarChart2 className="w-3 h-3" />
                            Analyze
                          </button>
                          {onAddStock && (
                            <button
                              onClick={() => onAddStock(stock.symbol)}
                              className="p-1 bg-[#0A5C3A]/10 text-[#0A5C3A] hover:bg-[#0A5C3A] hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Add to Watchlist"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Showing <span className="text-gray-900 dark:text-white font-bold">{total > 0 ? (page - 1) * 15 + 1 : 0}</span> to{' '}
            <span className="text-gray-900 dark:text-white font-bold">{Math.min(page * 15, total)}</span> of{' '}
            <span className="text-gray-900 dark:text-white font-bold">{total}</span> live stocks
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#0A5C3A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-[#0A5C3A] text-white text-xs font-extrabold rounded-xl shadow-xs">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#0A5C3A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

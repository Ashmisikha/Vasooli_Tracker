import React from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import Sparkline from '../common/Sparkline';

export default function WatchlistSection({ 
  watchlist = [], 
  onAnalyzeStock, 
  onRemoveStock, 
  onOpenAddModal, 
  onRefreshAll,
  isRefreshing 
}) {
  return (
    <div id="watchlist-section" className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Watchlist Header with + Add Button & Stock Count */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A2E] dark:text-white flex items-center gap-2">
            Your Watchlist
            <span className="ml-2 text-sm font-normal text-[#6B7280] dark:text-gray-400">
              ({watchlist.length} stocks)
            </span>
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-1">
            Tracks real-time prices, inline 30-day sparklines, and Vasooli risk scores
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0A5C3A] text-white rounded-lg font-semibold hover:bg-[#0A4A2E] transition shadow-sm shadow-[#0A5C3A]/25 cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            Add Stock
          </button>
          <button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="px-3 py-2 text-sm text-[#6B7280] dark:text-gray-400 hover:text-[#1A1A2E] dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Prices
          </button>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
                  24h
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
                  Chart
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {watchlist.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[#6B7280] dark:text-gray-400">
                    <p className="font-medium text-base text-[#1A1A2E] dark:text-white mb-1">Your watchlist is empty</p>
                    <p className="text-sm mb-4">Click the "+ Add Stock" button to start tracking</p>
                    <button
                      onClick={onOpenAddModal}
                      className="px-4 py-2 bg-[#0A5C3A] text-white text-xs font-bold rounded-lg hover:bg-[#0A4A2E] transition shadow-xs cursor-pointer"
                    >
                      + Add Stock
                    </button>
                  </td>
                </tr>
              ) : (
                watchlist.map((stock, index) => {
                  const changeVal = stock.change_pct || stock.change || 0;
                  const isUp = changeVal > 0;
                  const isDown = changeVal < 0;

                  const riskScore = stock.risk_score || 50;

                  return (
                    <tr key={stock.symbol || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4">
                        <div 
                          onClick={() => onAnalyzeStock(stock.symbol)}
                          className="font-semibold text-[#1A1A2E] dark:text-white hover:text-[#0A5C3A] cursor-pointer"
                        >
                          {stock.symbol}
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-gray-400">
                          {stock.sector || 'Equity'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {stock.name || stock.symbol}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-[#1A1A2E] dark:text-white">
                        ${(stock.price || 0).toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${
                        changeVal > 0 ? 'text-[#0A5C3A]' :
                        changeVal < 0 ? 'text-[#8B1A1A]' :
                        'text-[#6B7280]'
                      }`}>
                        {changeVal ? `${changeVal > 0 ? '+' : ''}${changeVal.toFixed(2)}%` : '0.00%'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          riskScore > 60 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          riskScore > 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-[#0A5C3A]'
                        }`}>
                          {riskScore}/100
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 w-20 mx-auto">
                          <Sparkline change={changeVal} isUp={isUp} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onAnalyzeStock(stock.symbol)}
                          className="text-[#0A5C3A] hover:text-[#0A4A2E] font-semibold text-sm cursor-pointer mr-3"
                        >
                          Analyze
                        </button>
                        <button
                          onClick={() => onRemoveStock(stock.symbol)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Remove stock"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

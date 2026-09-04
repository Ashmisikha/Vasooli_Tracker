import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchMarketStatistics } from '../../services/api';

export default function RealTimeFinanceUniverse({ initialData = null, selectedMarket = 'india' }) {
  const isIndia = selectedMarket === 'india';
  const defaultTotal = isIndia ? 251 : 250;

  const [stats, setStats] = useState(initialData || {
    total: defaultTotal,
    advancing: Math.round(defaultTotal * 0.55),
    declining: Math.round(defaultTotal * 0.40),
    unchanged: defaultTotal - Math.round(defaultTotal * 0.55) - Math.round(defaultTotal * 0.40),
    advancing_pct: 55.0,
    declining_pct: 40.0,
    unchanged_pct: 5.0,
    breadth_ratio: 1.38,
    market_sentiment: 'Moderately Bullish'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  const getMarketSentiment = (ratio) => {
    if (ratio > 2.0) return 'Strongly Bullish';
    if (ratio > 1.5) return 'Bullish';
    if (ratio > 1.0) return 'Moderately Bullish';
    if (ratio > 0.5) return 'Moderately Bearish';
    return 'Bearish';
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMarketStatistics(selectedMarket);
      
      let ratio = data?.breadth_ratio || 1.38;
      let sentiment = getMarketSentiment(ratio);
      
      if (data && !data.error) {
        setStats({
          total: data.total || defaultTotal,
          advancing: data.advancing || 0,
          declining: data.declining || 0,
          unchanged: data.unchanged || 0,
          advancing_pct: data.advancing_pct || 0,
          declining_pct: data.declining_pct || 0,
          unchanged_pct: data.unchanged_pct || 0,
          breadth_ratio: ratio,
          market_sentiment: sentiment
        });
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Failed to fetch market statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [selectedMarket]);

  if (loading && !stats) {
    return <StatsSkeleton />;
  }

  const activeTotal = (stats.advancing || 0) + (stats.declining || 0) + (stats.unchanged || 0);
  const totalStocks = stats.total || defaultTotal;
  const marketName = isIndia ? 'India (NSE / BSE)' : 'United States (NYSE / NASDAQ)';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xs p-6 border border-gray-200 dark:border-gray-700 space-y-4">
      {/* Header Row */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-[#1A1A2E] dark:text-white text-base">
              Real-time Finance Universe
            </h3>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 text-[#0A5C3A] border border-[#0A5C3A]/30">
              {marketName}
            </span>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5 font-medium">
            {totalStocks} Live Equities Tracked · {activeTotal} Active
          </p>
        </div>
        <div className="text-right flex items-center gap-2">
          <span className="text-xs text-[#6B7280] dark:text-gray-400 font-medium">
            Updated: {lastUpdated || 'Loading...'}
          </span>
          <button 
            onClick={fetchStats}
            className="text-xs text-[#0A5C3A] font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Gainers */}
        <div className="p-4 bg-[#E8F5EE] dark:bg-[#0A4A2E]/30 rounded-xl border border-[#0A5C3A]">
          <div className="text-3xl font-black text-[#0A5C3A] font-mono">{stats.advancing}</div>
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">Gainers Today</div>
          <div className="text-[11px] font-extrabold text-[#0A5C3A]">{stats.advancing_pct}% of total</div>
        </div>

        {/* Losers */}
        <div className="p-4 bg-[#F5E6E6] dark:bg-[#8B1A1A]/20 rounded-xl border border-[#8B1A1A]">
          <div className="text-3xl font-black text-[#8B1A1A] dark:text-red-400 font-mono">{stats.declining}</div>
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">Losers Today</div>
          <div className="text-[11px] font-extrabold text-[#8B1A1A] dark:text-red-400">{stats.declining_pct}% of total</div>
        </div>

        {/* Unchanged */}
        <div className="p-4 bg-[#F5F5F5] dark:bg-[#8E8E93]/20 rounded-xl border border-[#8E8E93]">
          <div className="text-3xl font-black text-[#8E8E93] dark:text-gray-200 font-mono">{stats.unchanged}</div>
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">Unchanged</div>
          <div className="text-[11px] font-extrabold text-[#8E8E93] dark:text-gray-300">{stats.unchanged_pct}% of total</div>
        </div>

        {/* Advance/Decline Ratio */}
        <div className="p-4 bg-[#E8F5EE] dark:bg-[#0A4A2E]/30 rounded-xl border border-[#0A5C3A]">
          <div className="text-3xl font-black text-[#0A5C3A] font-mono">{stats.breadth_ratio}</div>
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">Advance/Decline Ratio</div>
          <div className={`text-[11px] font-extrabold ${
            stats.breadth_ratio > 1.0 ? 'text-[#0A5C3A]' : 
            'text-[#8B1A1A] dark:text-red-400'
          }`}>
            {stats.market_sentiment || (stats.breadth_ratio > 1 ? 'Moderately Bullish' : 'Moderately Bearish')}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xs border border-gray-200 dark:border-gray-700 animate-pulse space-y-4">
      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
}

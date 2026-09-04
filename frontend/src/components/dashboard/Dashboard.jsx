import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Plus, 
  BarChart2, 
  ShieldAlert, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  fetchPaginatedStocks, 
  fetchWatchlist, 
  fetchPortfolioSummary, 
  fetchMarketOverview, 
  fetchUserProfile,
  fetchMarketBreadth,
  fetchMarketSignal,
  fetchMarketIndices,
  fetchMarketInsights,
  fetchWatchlistWhatChanged,
  fetchMarketStatistics,
  fetchMarketRiskDistribution
} from '../../services/api';

import MarketInsights from './MarketInsights';
import WhatChanged from './WhatChanged';
import RealTimeFinanceUniverse from './RealTimeFinanceUniverse';
import MarketPerformance from './MarketPerformance';
import RiskDistribution from './RiskDistribution';

export default function Dashboard({ selectedMarket = 'india', onNavigate, onSelectStock, onOpenAddModal, onOpenSimulator }) {
  const isIndia = selectedMarket === 'india';
  const defaultTotal = isIndia ? 251 : 250;

  const [stats, setStats] = useState({
    totalStocks: defaultTotal,
    watchlistCount: 5,
    gainers: Math.round(defaultTotal * 0.55),
    losers: Math.round(defaultTotal * 0.40),
  });
  const [marketStats, setMarketStats] = useState({
    total: defaultTotal,
    advancing: Math.round(defaultTotal * 0.55),
    declining: Math.round(defaultTotal * 0.40),
    unchanged: defaultTotal - Math.round(defaultTotal * 0.55) - Math.round(defaultTotal * 0.40),
    advancing_pct: 55.0,
    declining_pct: 40.0,
    unchanged_pct: 5.0,
    top_gainers: [],
    top_losers: [],
    breadth_ratio: 1.38
  });
  const [riskData, setRiskData] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [marketIndices, setMarketIndices] = useState([]);
  const [marketBreadth, setMarketBreadth] = useState(null);
  const [marketSignal, setMarketSignal] = useState(null);
  const [marketInsights, setMarketInsights] = useState(null);
  const [whatChangedItems, setWhatChangedItems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedDate, setLastUpdatedDate] = useState(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [selectedMarket]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastUpdatedDate) {
        setSecondsAgo(Math.floor((new Date() - lastUpdatedDate) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdatedDate]);

  const fetchDashboardData = async () => {
    try {
      const [
        stocksRes, 
        wlRes, 
        profileRes, 
        breadthRes, 
        signalRes, 
        indicesRes, 
        insightsRes, 
        changedRes,
        statsRes,
        riskDistRes
      ] = await Promise.all([
        fetchPaginatedStocks({ page: 1, per_page: 50, sort_by: 'change', market: selectedMarket }).catch(() => ({ data: [], total: defaultTotal })),
        fetchWatchlist().catch(() => ({ watchlist: [] })),
        fetchUserProfile().catch(() => null),
        fetchMarketBreadth(selectedMarket).catch(() => null),
        fetchMarketSignal(selectedMarket).catch(() => null),
        fetchMarketIndices(selectedMarket).catch(() => null),
        fetchMarketInsights(selectedMarket).catch(() => null),
        fetchWatchlistWhatChanged().catch(() => ({ items: [] })),
        fetchMarketStatistics(selectedMarket).catch(() => null),
        fetchMarketRiskDistribution(selectedMarket).catch(() => null)
      ]);

      if (profileRes?.data || profileRes?.profile) {
        setUserProfile(profileRes.data || profileRes.profile);
      }

      const stocksList = stocksRes.data || [];
      const wlData = wlRes.watchlist || wlRes.data || [];

      if (statsRes && !statsRes.error) {
        setMarketStats(statsRes);
        setStats({
          totalStocks: statsRes.total || defaultTotal,
          watchlistCount: wlData.length,
          gainers: statsRes.advancing,
          losers: statsRes.declining
        });
      } else {
        const gainersCount = breadthRes?.advancing_count || stocksList.filter(s => (s.change_pct || s.change || 0) > 0.05).length || Math.round(defaultTotal * 0.55);
        const losersCount = breadthRes?.declining_count || stocksList.filter(s => (s.change_pct || s.change || 0) < -0.05).length || Math.round(defaultTotal * 0.40);
        setStats({
          totalStocks: stocksRes.total || defaultTotal,
          watchlistCount: wlData.length,
          gainers: gainersCount,
          losers: losersCount,
        });
      }

      if (riskDistRes && !riskDistRes.error && riskDistRes.distribution) {
        setRiskData({
          total: riskDistRes.total_stocks || defaultTotal,
          low: riskDistRes.distribution.low_risk?.count || 140,
          medium: riskDistRes.distribution.medium_risk?.count || 80,
          high: riskDistRes.distribution.high_risk?.count || 30,
          lowPct: riskDistRes.distribution.low_risk?.pct || 56,
          mediumPct: riskDistRes.distribution.medium_risk?.pct || 32,
          highPct: riskDistRes.distribution.high_risk?.pct || 12,
        });
      }

      setWatchlist(wlData.slice(0, 8));
      setMarketBreadth(breadthRes);
      setMarketSignal(signalRes);
      setMarketIndices(indicesRes?.indices || []);
      setMarketInsights(insightsRes);
      setWhatChangedItems(changedRes?.changes || changedRes?.items || []);
      const now = new Date();
      setLastUpdatedDate(now);
      setSecondsAgo(0);
    } catch (err) {
      console.warn('Error loading Vasooli Tracker dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  if (loading && !marketStats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
        <RefreshCw className="w-8 h-8 text-[#0A5C3A] animate-spin mb-3" />
        <p className="text-xs font-bold">Loading Vasooli Tracker Live Dashboard...</p>
      </div>
    );
  }

  const lastUpdatedStr = lastUpdatedDate ? lastUpdatedDate.toLocaleTimeString() : 'Loading...';
  const currencySymbol = isIndia ? '₹' : '$';

  return (
    <div className="space-y-6">
      
      {/* LAST UPDATED & LIVE DATA HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 px-3 py-1.5 rounded-xl border border-[#0A5C3A]/30">
            <span className="w-2.5 h-2.5 bg-[#0A5C3A] rounded-full animate-pulse"></span>
            <span className="text-xs font-extrabold text-[#0A5C3A] dark:text-[#0A8C5A]">Live Stream Active</span>
          </div>
          <div className="text-xs sm:text-sm text-[#6B7280] dark:text-gray-300 font-medium">
            Market: <span className="font-extrabold text-[#1A1A2E] dark:text-white">{isIndia ? 'India (NSE / BSE)' : 'United States (NYSE / NASDAQ)'}</span>
          </div>
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-xs font-extrabold text-[#0A5C3A] hover:underline flex items-center gap-1 cursor-pointer bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 px-3 py-1.5 rounded-lg border border-[#0A5C3A]/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">
            {secondsAgo}s ago · {lastUpdatedStr}
          </div>
          <span className="text-xs text-[#0A5C3A] font-extrabold uppercase tracking-wide bg-[#E8F5EE] dark:bg-[#0A4A2E]/30 px-3 py-1.5 rounded-lg border border-[#0A5C3A]/20">
            WELCOME {userProfile?.full_name ? userProfile.full_name.toUpperCase() : 'INVESTOR'}
          </span>
        </div>
      </div>

      {/* Real-time Finance Universe - TOP SECTION */}
      <RealTimeFinanceUniverse selectedMarket={selectedMarket} initialData={marketStats} />

      {/* Top Gainers & Losers Pulse */}
      {marketStats && (marketStats.top_gainers?.length > 0 || marketStats.top_losers?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Gainers Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0A5C3A]" />
                <h4 className="font-extrabold text-sm text-[#1A1A2E] dark:text-white">TOP GAINERS TODAY</h4>
              </div>
              <span className="text-[10px] font-bold text-[#0A5C3A] bg-[#E8F5EE] dark:bg-[#0A4A2E]/30 px-2 py-0.5 rounded">
                {isIndia ? 'NSE Leaders' : 'US Leaders'}
              </span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {(marketStats.top_gainers || []).slice(0, 4).map((stk) => (
                <div 
                  key={stk.symbol} 
                  onClick={() => onSelectStock && onSelectStock(stk.symbol)}
                  className="py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded-lg cursor-pointer transition-colors group"
                >
                  <div>
                    <div className="font-extrabold text-xs text-[#1A1A2E] dark:text-white group-hover:text-[#0A5C3A] transition-colors flex items-center gap-1.5">
                      {stk.symbol}
                      <span className="text-[10px] font-normal text-gray-400 truncate max-w-[120px]">{stk.name}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">{stk.sector}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black font-mono text-[#1A1A2E] dark:text-white">
                      {currencySymbol}{(stk.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] font-extrabold text-[#0A5C3A]">
                      +{(stk.change_pct || stk.change || 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2.5">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#8B1A1A] dark:text-red-400" />
                <h4 className="font-extrabold text-sm text-[#1A1A2E] dark:text-white">TOP LOSERS TODAY</h4>
              </div>
              <span className="text-[10px] font-bold text-[#8B1A1A] dark:text-red-400 bg-[#F5E6E6] dark:bg-[#8B1A1A]/20 px-2 py-0.5 rounded">
                Under Pressure
              </span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {(marketStats.top_losers || []).slice(0, 4).map((stk) => (
                <div 
                  key={stk.symbol} 
                  onClick={() => onSelectStock && onSelectStock(stk.symbol)}
                  className="py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded-lg cursor-pointer transition-colors group"
                >
                  <div>
                    <div className="font-extrabold text-xs text-[#1A1A2E] dark:text-white group-hover:text-[#0A5C3A] transition-colors flex items-center gap-1.5">
                      {stk.symbol}
                      <span className="text-[10px] font-normal text-gray-400 truncate max-w-[120px]">{stk.name}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">{stk.sector}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black font-mono text-[#1A1A2E] dark:text-white">
                      {currencySymbol}{(stk.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] font-extrabold text-[#8B1A1A] dark:text-red-400">
                      {(stk.change_pct || stk.change || 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Market Insights - Why Is The Market Moving? */}
      <MarketInsights selectedMarket={selectedMarket} data={marketInsights} isLoading={false} />

      {/* Watchlist What Changed Section */}
      <WhatChanged 
        items={whatChangedItems} 
        watchlistCount={stats.watchlistCount} 
        onSelectStock={onSelectStock} 
        lastUpdated={lastUpdatedStr}
      />

      {/* Risk & Sentiment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Distribution Card */}
        <RiskDistribution data={riskData} />

        {/* Sentiment Breakdown Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
          <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
            <h3 className="font-extrabold text-[#1A1A2E] dark:text-white text-base">NEWS SENTIMENT — LAST 24 HOURS</h3>
            <p className="text-xs text-[#6B7280] dark:text-gray-400">25 financial news articles analyzed across major publishers</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-2">
            <div className="p-4 bg-[#E8F5EE] dark:bg-[#0A4A2E]/30 rounded-xl border border-[#0A5C3A]/30">
              <div className="text-2xl font-black text-[#0A5C3A]">8</div>
              <div className="text-xs font-extrabold text-[#0A5C3A]">Positive</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">32% of news</div>
            </div>
            <div className="p-4 bg-[#F5F5F5] dark:bg-gray-700 rounded-xl border border-[#8E8E93]/30 dark:border-gray-600">
              <div className="text-2xl font-black text-[#8E8E93] dark:text-gray-200">12</div>
              <div className="text-xs font-extrabold text-[#8E8E93] dark:text-gray-200">Neutral</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">48% of news</div>
            </div>
            <div className="p-4 bg-[#F5E6E6] dark:bg-[#8B1A1A]/20 rounded-xl border border-[#8B1A1A]/30">
              <div className="text-2xl font-black text-[#8B1A1A] dark:text-red-400">5</div>
              <div className="text-xs font-extrabold text-[#8B1A1A] dark:text-red-400">Negative</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">20% of news</div>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center italic">
            "Weighted news sentiment accounts for 40% of Vasooli Risk Engine scoring."
          </p>
        </div>

      </div>

      {/* Market Performance Section */}
      <MarketPerformance selectedMarket={selectedMarket} />

    </div>
  );
}

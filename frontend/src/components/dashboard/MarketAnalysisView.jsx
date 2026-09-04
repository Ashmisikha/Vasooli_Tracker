import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  ShieldAlert, 
  Smile, 
  PieChart, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  Layers, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter
} from 'lucide-react';
import SentimentSimulator from '../SentimentSimulator';
import { 
  fetchMarketAnalysisOverview, 
  fetchMarketRiskDistribution, 
  fetchMarketSentimentAnalysis, 
  fetchMarketSectorsAnalysis, 
  fetchMarketInsights 
} from '../../services/api';

export default function MarketAnalysisView({ onSelectStock, watchlist = [] }) {
  const [timeframe, setTimeframe] = useState('1D');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [overview, setOverview] = useState(null);
  const [riskDist, setRiskDist] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [insights, setInsights] = useState([]);

  const loadAnalysisData = async (selectedTimeframe = timeframe) => {
    setIsLoading(true);
    setError(null);
    try {
      const [ovRes, riskRes, sentRes, secRes, insRes] = await Promise.all([
        fetchMarketAnalysisOverview(selectedTimeframe),
        fetchMarketRiskDistribution(),
        fetchMarketSentimentAnalysis(),
        fetchMarketSectorsAnalysis(),
        fetchMarketInsights()
      ]);
      setOverview(ovRes);
      setRiskDist(riskRes);
      setSentiment(sentRes);
      setSectors(secRes.sectors || []);
      setInsights(insRes.insights || []);
    } catch (err) {
      console.error('Failed to load market analysis:', err);
      setError(err.message || 'Unable to fetch real-time market analysis data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysisData(timeframe);
  }, [timeframe]);

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-8 rounded-3xl text-center space-y-4 max-w-2xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-300">Failed to Load Market Analysis</h3>
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => loadAnalysisData(timeframe)}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header Card with Timeframe Pills */}
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 text-[#0A5C3A] text-xs font-extrabold mb-2 border border-[#0A5C3A]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>REAL-TIME MARKET INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E] dark:text-white flex items-center gap-2">
            Market Analysis & Risk Engine
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Aggregated metrics across 200+ live equities, risk scores, sector dynamics, and sentiment testing
          </p>
        </div>

        {/* Timeframe Filter Selector */}
        <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-700/60 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-600">
          {['1D', '1W', '1M', '1Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#0A5C3A] text-white shadow-md shadow-[#0A5C3A]/25'
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#0A5C3A] dark:hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
          <button
            onClick={() => loadAnalysisData(timeframe)}
            className="p-1.5 text-gray-400 hover:text-[#0A5C3A] transition-colors cursor-pointer ml-1"
            title="Refresh Analysis"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Major Indices Row */}
      {overview && (
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold tracking-wider text-gray-400 dark:text-gray-400 uppercase flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#0A5C3A]" />
            Major Market Indices ({overview.timeframe})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {overview.indices.map((idx) => (
              <div 
                key={idx.symbol}
                className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs hover:border-[#0A5C3A]/40 transition-all"
              >
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 truncate">{idx.name}</p>
                <p className="text-sm font-extrabold text-[#1A1A2E] dark:text-white mt-0.5">{idx.price}</p>
                <div className={`flex items-center text-[11px] font-extrabold mt-1 ${idx.is_up ? 'text-[#0A5C3A]' : 'text-red-500'}`}>
                  {idx.is_up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{idx.change > 0 ? `+${idx.change}` : idx.change} ({idx.change_pct > 0 ? `+${idx.change_pct}` : idx.change_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Universe Risk Breakdown */}
      {riskDist?.distribution && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 text-[#0A5C3A] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-white">Universe Risk Breakdown</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">0-100 Dynamic Risk Spectrum across 200+ equities</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#0A5C3A]">
              {riskDist.total_stocks} Stocks Scanned
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Low Risk (&lt;40)</p>
              <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">{riskDist.distribution.low_risk.count}</p>
              <p className="text-[10px] text-emerald-600/80 font-bold">{riskDist.distribution.low_risk.pct}%</p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Medium (40-60)</p>
              <p className="text-xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">{riskDist.distribution.medium_risk.count}</p>
              <p className="text-[10px] text-amber-600/80 font-bold">{riskDist.distribution.medium_risk.pct}%</p>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">High Risk (&gt;60)</p>
              <p className="text-xl font-extrabold text-red-700 dark:text-red-300 mt-1">{riskDist.distribution.high_risk.count}</p>
              <p className="text-[10px] text-red-600/80 font-bold">{riskDist.distribution.high_risk.pct}%</p>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between pt-1">
            <span>Top High Risk: <strong className="text-gray-700 dark:text-gray-200">{riskDist.sample_high_risk?.join(', ')}</strong></span>
            <span>Top Low Risk: <strong className="text-gray-700 dark:text-gray-200">{riskDist.sample_low_risk?.join(', ')}</strong></span>
          </div>
        </div>
      )}

      {/* Sector Performance Table */}
      {sectors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 text-[#0A5C3A] flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A2E] dark:text-white">Sector Performance Breakdown</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Average gain/loss & ticker distribution by sector</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-[11px] font-extrabold text-gray-400 uppercase">
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Total Equities</th>
                  <th className="py-3 px-4">Avg Return (% change)</th>
                  <th className="py-3 px-4">Gainers vs Losers</th>
                  <th className="py-3 px-4">Top Sector Mover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs">
                {sectors.map((sec) => (
                  <tr key={sec.sector} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1A1A2E] dark:text-white">{sec.sector}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">{sec.stock_count} stocks</td>
                    <td className="py-3.5 px-4 font-extrabold">
                      <span className={`px-2 py-0.5 rounded-md ${
                        sec.avg_change_pct > 0 
                          ? 'bg-[#E8F5EE] text-[#0A5C3A] dark:bg-[#0A4A2E]/40 dark:text-[#0A5C3A]' 
                          : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300'
                      }`}>
                        {sec.avg_change_pct > 0 ? `+${sec.avg_change_pct}%` : `${sec.avg_change_pct}%`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">
                      <span className="text-[#0A5C3A] font-bold">{sec.gainers} Gainers</span> / <span className="text-red-500 font-bold">{sec.losers} Losers</span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#0A5C3A]">{sec.top_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Market Insights Cards */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-extrabold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#0A5C3A]" />
            AI Market Key Insights & Downside Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((ins) => (
              <div 
                key={ins.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 text-[#0A5C3A] font-extrabold text-[10px] rounded-md uppercase">
                    {ins.category}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">Confidence: {ins.confidence}</span>
                </div>
                <h3 className="text-sm font-extrabold text-[#1A1A2E] dark:text-white">{ins.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{ins.description}</p>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Impact Rating:</span>
                  <span className="text-[#0A5C3A]">{ins.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Sentiment Shock Simulator */}
      <div className="space-y-4">
        <h2 className="text-xs font-extrabold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#0A5C3A]" />
          Scenario Stress Testing & Sentiment Simulation
        </h2>
        <SentimentSimulator watchlist={watchlist} defaultSymbol="TSLA" />
      </div>

    </div>
  );
}

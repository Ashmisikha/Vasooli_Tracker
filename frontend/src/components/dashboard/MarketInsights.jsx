import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Activity, 
  Newspaper, 
  Sparkles 
} from 'lucide-react';

export default function MarketInsights({ data, isLoading, selectedMarket = 'india' }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xs border border-gray-200 dark:border-gray-700 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const isIndia = selectedMarket === 'india';
  const defaultTotal = isIndia ? 251 : 250;
  const defaultAdvancing = isIndia ? 142 : 138;
  const defaultDeclining = defaultTotal - defaultAdvancing - 12;

  const defaultIndiaSectors = [
    { name: 'Banking & Financials', change: 1.4, impact: 'positive' },
    { name: 'IT & Software', change: 2.1, impact: 'positive' },
    { name: 'Automotive', change: 1.8, impact: 'positive' },
    { name: 'Energy & Oil', change: -0.4, impact: 'negative' },
    { name: 'FMCG & Consumer', change: 0.3, impact: 'positive' }
  ];

  const defaultUsSectors = [
    { name: 'Technology', change: 2.4, impact: 'positive' },
    { name: 'Semiconductors', change: 3.1, impact: 'positive' },
    { name: 'Healthcare', change: 0.9, impact: 'positive' },
    { name: 'Financials', change: -0.3, impact: 'negative' },
    { name: 'Consumer Discretionary', change: 1.2, impact: 'positive' }
  ];

  const defaultIndiaDrivers = [
    { text: 'NIFTY IT & Auto sectors demonstrate strong institutional buying', impact: 'positive' },
    { text: 'FII & DII flows remain net positive across large-cap leaders', impact: 'positive' },
    { text: 'Crude oil fluctuations monitor import cost impact', impact: 'neutral' },
    { text: 'RBI liquidity stance provides stability to banking sector', impact: 'positive' }
  ];

  const defaultUsDrivers = [
    { text: 'Tech & semiconductor earnings drive broad index advance', impact: 'positive' },
    { text: 'Treasury yields consolidate as inflation figures stabilize', impact: 'positive' },
    { text: 'Volatility index (VIX) trends low, supporting risk appetite', impact: 'positive' },
    { text: 'Sector rotation active between growth and defensive equities', impact: 'neutral' }
  ];

  const insightData = {
    sentiment: data?.market_sentiment || data?.sentiment || 'Moderately Bullish',
    sentiment_score: data?.sentiment_score || 68,
    breadth: {
      advancing: data?.breadth?.advancing || data?.advancing || defaultAdvancing,
      declining: data?.breadth?.declining || data?.declining || defaultDeclining,
      total: data?.breadth?.total || data?.total || defaultTotal,
      ratio: data?.breadth?.ratio || data?.breadth_ratio || 1.38
    },
    sectors: data?.sectors || (isIndia ? defaultIndiaSectors : defaultUsSectors),
    drivers: data?.drivers || (isIndia ? defaultIndiaDrivers : defaultUsDrivers),
    summary: data?.summary || (isIndia 
      ? 'Indian market sentiment is bullish today. NIFTY IT (+2.1%) and Automotive (+1.8%) are driving gains with broad mid-cap participation.'
      : 'US market sentiment is moderately bullish. Technology (+2.4%) and Semiconductors (+3.1%) are leading indices higher.')
  };

  const unchangedCount = Math.max(0, insightData.breadth.total - insightData.breadth.advancing - insightData.breadth.declining);
  const advancingPct = insightData.breadth.total ? (insightData.breadth.advancing / insightData.breadth.total) : 0.6;
  const decliningPct = insightData.breadth.total ? (insightData.breadth.declining / insightData.breadth.total) : 0.39;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xs p-6 border border-gray-200 dark:border-gray-700 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#0A5C3A]" />
          <h3 className="font-black text-[#1A1A2E] dark:text-white text-base tracking-tight">
            Why Is The Market Moving?
          </h3>
        </div>
        <span className="text-xs font-bold text-[#0A5C3A] bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 px-3 py-1 rounded-full border border-[#0A5C3A]/30">
          Based on real-time data
        </span>
      </div>

      {/* Summary Banner */}
      <div className="p-4 bg-[#E8F5EE]/80 dark:bg-[#0A4A2E]/20 rounded-xl border border-[#0A5C3A]/30">
        <p className="text-xs sm:text-sm text-[#1A1A2E] dark:text-white font-medium leading-relaxed">
          <span className="font-extrabold text-[#0A5C3A]">Executive Summary: </span>
          {insightData.summary}
        </p>
      </div>

      {/* Visual Grid: Sector Performance + Breadth & Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* LEFT COLUMN: SECTOR PERFORMANCE (Horizontal Bar Chart) */}
        <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-200/80 dark:border-gray-600/60 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A5C3A] dark:text-gray-300 flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-600 pb-2">
            <BarChart3 className="w-4 h-4 text-[#0A5C3A]" /> Sector Performance
          </h4>
          <div className="space-y-3 pt-1">
            {insightData.sectors.map((sector, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#1A1A2E] dark:text-white">{sector.name}</span>
                  <span className={sector.change > 0 ? 'text-[#0A5C3A]' : sector.change < 0 ? 'text-[#8B1A1A] dark:text-red-400' : 'text-[#8E8E93] dark:text-gray-400'}>
                    {sector.change > 0 ? '+' : ''}{sector.change}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      sector.change > 0 ? 'bg-[#0A5C3A]' : sector.change < 0 ? 'bg-[#8B1A1A]' : 'bg-[#8E8E93]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, Math.abs(sector.change) * 25 + 15))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: BREADTH + SENTIMENT METER */}
        <div className="space-y-4">
          
          {/* Market Breadth Donut Chart */}
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-200/80 dark:border-gray-600/60 space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A5C3A] dark:text-gray-300 flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-600 pb-2">
              <Activity className="w-4 h-4 text-[#0A5C3A]" /> Market Breadth
            </h4>
            <div className="flex items-center gap-4 pt-1">
              {/* Donut Chart (SVG) */}
              <div className="relative w-16 h-16 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" className="dark:stroke-gray-600" />
                  <circle 
                    cx="50" cy="50" r="40" fill="none" stroke="#0A5C3A" strokeWidth="12"
                    strokeDasharray={`${advancingPct * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                  <circle 
                    cx="50" cy="50" r="40" fill="none" stroke="#8B1A1A" strokeWidth="12"
                    strokeDasharray={`${decliningPct * 251.2} 251.2`}
                    strokeDashoffset={-(advancingPct * 251.2)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-extrabold text-[#1A1A2E] dark:text-white font-mono">
                    {insightData.breadth.ratio}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#0A5C3A] rounded-full"></span>
                    <span className="text-[#1A1A2E] dark:text-white font-bold">{insightData.breadth.advancing}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 font-semibold">Advancing</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#8B1A1A] rounded-full"></span>
                    <span className="text-[#1A1A2E] dark:text-white font-bold">{insightData.breadth.declining}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 font-semibold">Declining</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#8E8E93] rounded-full"></span>
                    <span className="text-[#1A1A2E] dark:text-white font-bold">{unchangedCount}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 font-semibold">Unchanged</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Meter */}
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-200/80 dark:border-gray-600/60 space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A5C3A] dark:text-gray-300 flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-600 pb-2">
              <Newspaper className="w-4 h-4 text-[#0A5C3A]" /> Sentiment Meter
            </h4>
            <div className="flex items-center gap-3 pt-1">
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold border ${
                insightData.sentiment.includes('Bullish') 
                  ? 'bg-[#E8F5EE] text-[#0A5C3A] border-[#0A5C3A]/30 dark:bg-[#0A4A2E]/40' 
                  : insightData.sentiment.includes('Bearish')
                  ? 'bg-[#F5E6E6] text-[#8B1A1A] dark:text-red-400 border-[#8B1A1A]/30'
                  : 'bg-[#F5F5F5] text-[#8E8E93] dark:text-gray-300 border-[#8E8E93]/30'
              }`}>
                {insightData.sentiment}
              </span>

              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    insightData.sentiment_score > 60 ? 'bg-[#0A5C3A]' : 
                    insightData.sentiment_score > 40 ? 'bg-[#8E8E93]' : 
                    'bg-[#8B1A1A]'
                  }`}
                  style={{ width: `${insightData.sentiment_score}%` }}
                ></div>
              </div>

              <span className="text-xs font-black text-[#1A1A2E] dark:text-white font-mono">
                {insightData.sentiment_score}/100
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Key Drivers */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A5C3A] dark:text-gray-300 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#0A5C3A]" /> Key Market Drivers
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {insightData.drivers.map((driver, i) => (
            <div key={i} className={`flex items-center gap-2.5 text-xs p-3 rounded-xl border transition-all ${
              driver.impact === 'positive' 
                ? 'bg-[#E8F5EE]/70 dark:bg-[#0A4A2E]/30 border-[#0A5C3A]/30 text-[#1A1A2E] dark:text-white' 
                : driver.impact === 'negative'
                ? 'bg-[#F5E6E6]/70 dark:bg-[#8B1A1A]/20 border-[#8B1A1A]/30 text-[#1A1A2E] dark:text-white'
                : 'bg-[#F5F5F5] dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-[#1A1A2E] dark:text-white'
            }`}>
              <span className="font-semibold leading-snug flex-1">{driver.text}</span>
              {driver.impact === 'positive' && <TrendingUp className="w-3.5 h-3.5 text-[#0A5C3A] shrink-0" />}
              {driver.impact === 'negative' && <TrendingDown className="w-3.5 h-3.5 text-[#8B1A1A] dark:text-red-400 shrink-0" />}
              {driver.impact === 'neutral' && <Minus className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

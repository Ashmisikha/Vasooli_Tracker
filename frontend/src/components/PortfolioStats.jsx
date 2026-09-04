import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Newspaper, 
  TrendingUp, 
  Activity,
  Layers,
  Info
} from 'lucide-react';

export default function PortfolioStats({ summary }) {
  if (!summary) return null;

  const avgRisk = summary.avg_risk_score || 0;
  
  // Risk color mapping
  let riskColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  let riskBadge = 'text-emerald-400';
  if (avgRisk > 60) {
    riskColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    riskBadge = 'text-rose-400';
  } else if (avgRisk >= 40) {
    riskColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    riskBadge = 'text-amber-400';
  }

  const positiveSent = summary.sentiment_distribution?.positive || 0;
  const neutralSent = summary.sentiment_distribution?.neutral || 0;
  const negativeSent = summary.sentiment_distribution?.negative || 0;

  const buyCount = summary.recommendations?.BUY || 0;
  const cautionCount = summary.recommendations?.CAUTION || 0;
  const avoidCount = summary.recommendations?.AVOID || 0;

  return (
    <div className="space-y-4 mb-8">
      {/* Formula Explanation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-cyan-950/30 border border-indigo-500/20 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0 border border-indigo-500/30">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Dynamic 4-Factor Risk Engine
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Core Differentiator
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Risk Score = <span className="text-cyan-300 font-semibold">(40% News Sentiment)</span> + 
              <span className="text-indigo-300 font-semibold"> (30% Volatility)</span> + 
              <span className="text-amber-300 font-semibold"> (20% Beta)</span> + 
              <span className="text-emerald-300 font-semibold"> (10% Technical Position)</span>. 
              Real-time shifts in media tone immediately spike vulnerability.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 self-end md:self-center shrink-0">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> BUY &lt; 40
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> CAUTION 40-60
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> AVOID &gt; 60
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tracked */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>TRACKED ASSETS</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {summary.total_tracked}
            <span className="text-xs font-medium text-slate-400 ml-1.5">Equities</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
            <span className="text-emerald-400 font-semibold">{buyCount} BUY</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{cautionCount} CAUTION</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">{avoidCount} AVOID</span>
          </div>
        </div>

        {/* Average Risk Score */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>AVG RISK SCORE</span>
            <Activity className={`w-4 h-4 ${riskBadge}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              {avgRisk}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-1.5">
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${riskColor}`}>
              {summary.risk_category}
            </span>
          </div>
        </div>

        {/* Sentiment Sentiment Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>NEWS SENTIMENT (40%)</span>
            <Newspaper className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold mt-1">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {positiveSent} Bullish
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-700/30 text-slate-300 border border-slate-700/50">
              {neutralSent} Neutral
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20">
              {negativeSent} Bearish
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Real-time NLP sentiment analysis
          </p>
        </div>

        {/* High Risk Watch */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>HIGHEST RISK ALERT</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          {summary.highest_risk_stock ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-white">
                  {summary.highest_risk_stock.symbol}
                </span>
                <span className="text-xs font-bold text-rose-400">
                  Risk: {summary.highest_risk_stock.risk_score}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                Check deep-dive for adverse sentiment drivers
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-400 mt-2">No active warnings</div>
          )}
        </div>
      </div>
    </div>
  );
}

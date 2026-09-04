import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Newspaper, 
  RefreshCw, 
  ExternalLink,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { getCurrencySymbol, formatPrice, formatDeltaPrice } from '../utils/currency';

export default function StockDetailModal({ 
  stock, 
  diff, 
  onClose, 
  onRefresh, 
  isRefreshing,
  onOpenSimulator
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sentiment' | 'forecast' | 'diff'

  if (!stock) return null;

  const sym = stock.symbol;
  const price = stock.price || 0;
  const changePct = stock.change_pct || 0;
  const risk = stock.risk_score || 50;
  const breakdown = stock.breakdown || {};
  const sentiment = stock.sentiment || {};
  const recommendation = stock.recommendation || {};
  const prediction = stock.prediction || {};
  const technical = stock.technical || {};
  const riskFactors = stock.risk_factors || [];
  const headlines = sentiment.headlines || [];
  const forecast = prediction.forecast || [];
  const currencySymbol = getCurrencySymbol(stock);

  // Risk styling
  let riskColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let riskBarColor = 'bg-emerald-500';
  if (risk > 60) {
    riskColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    riskBarColor = 'bg-rose-500';
  } else if (risk >= 40) {
    riskColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    riskBarColor = 'bg-amber-500';
  }

  // Rec styling
  let recBg = 'from-amber-900/40 via-slate-900/60 to-slate-900/80 border-amber-500/30 text-amber-300';
  let recBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (recommendation.action === 'BUY') {
    recBg = 'from-emerald-950/40 via-slate-900/60 to-slate-900/80 border-emerald-500/30 text-emerald-300';
    recBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  } else if (recommendation.action === 'AVOID') {
    recBg = 'from-rose-950/40 via-slate-900/60 to-slate-900/80 border-rose-500/30 text-rose-300';
    recBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center font-black text-lg text-white shadow-lg">
              {sym}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-white tracking-tight">{sym}</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {stock.sector || 'Equities'}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• {stock.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-white font-mono">{formatPrice(price, stock)}</span>
                <span className={`text-xs font-bold flex items-center gap-0.5 ${
                  changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {changePct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {changePct >= 0 ? `+${changePct}%` : `${changePct}%`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onRefresh(sym)}
              disabled={isRefreshing}
              title="Run fresh check & update diff"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Refresh Scan</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Sub-tabs */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/20 flex gap-2">
          {[
            { id: 'overview', label: 'Risk Breakdown & Factors' },
            { id: 'sentiment', label: 'News Sentiment (40%)', badge: headlines.length },
            { id: 'forecast', label: '7-Day Price Outlook' },
            { id: 'diff', label: 'Last Check Comparison', highlight: diff?.has_previous }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                  {tab.badge}
                </span>
              )}
              {tab.highlight && (
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              )}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">

          {/* Recommendation Banner */}
          <div className={`p-5 rounded-2xl bg-gradient-to-r ${recBg} border backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Investment Recommendation
                </span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider border ${recBadge}`}>
                  {recommendation.action}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium leading-relaxed max-w-2xl">
                {recommendation.reason}
              </p>
            </div>
            
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Suggested Position Sizing
              </span>
              <span className="text-sm font-extrabold text-white">
                {recommendation.position_size}
              </span>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & 4-FACTOR BREAKDOWN */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Risk Score Spotlight & 4 Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Composite Risk Gauge Card */}
                <div className="md:col-span-4 p-6 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Composite Risk Score
                  </span>
                  <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-inner my-2 ${riskColor}`}>
                    <span className="text-4xl font-black tracking-tight">{risk}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">/ 100</span>
                  </div>
                  <span className="text-xs font-bold mt-2 text-slate-200">
                    {risk < 40 ? 'Low Risk Profile' : risk <= 60 ? 'Moderate Risk Profile' : 'High Risk Alert'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                    40% sentiment, 30% volatility, 20% beta, 10% technical
                  </p>
                </div>

                {/* The 4 Weighted Pillars */}
                <div className="md:col-span-8 p-6 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                    <span>Formula Factor Breakdown</span>
                    <span className="text-[11px] text-cyan-400 lowercase font-medium">
                      normalized (0-100 scale)
                    </span>
                  </h3>

                  {/* 1. News Sentiment (40%) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-cyan-300">
                        <Newspaper className="w-3.5 h-3.5" /> News Sentiment (40% Weight)
                      </span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {breakdown.sentiment || 50} / 100
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, breakdown.sentiment || 50)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Polarity: {sentiment.score >= 0 ? `+${sentiment.score}` : sentiment.score} ({sentiment.level})</span>
                      <span>Contributes {((breakdown.sentiment || 50) * 0.4).toFixed(1)} pts to score</span>
                    </div>
                  </div>

                  {/* 2. Volatility (30%) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-indigo-300">
                        <Activity className="w-3.5 h-3.5" /> Volatility (30% Weight)
                      </span>
                      <span className="font-mono text-indigo-300 font-bold">
                        {breakdown.volatility || 30} / 100
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, breakdown.volatility || 30)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Annualized Variance: {((stock.volatility || 0.25) * 100).toFixed(1)}%</span>
                      <span>Contributes {((breakdown.volatility || 30) * 0.3).toFixed(1)} pts to score</span>
                    </div>
                  </div>

                  {/* 3. Beta (20%) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-amber-300">
                        <TrendingUp className="w-3.5 h-3.5" /> Market Beta (20% Weight)
                      </span>
                      <span className="font-mono text-amber-300 font-bold">
                        {breakdown.beta || 50} / 100
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, breakdown.beta || 50)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Beta to S&P 500: {stock.beta || 1.0}</span>
                      <span>Contributes {((breakdown.beta || 50) * 0.2).toFixed(1)} pts to score</span>
                    </div>
                  </div>

                  {/* 4. Technical (10%) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-emerald-300">
                        <Compass className="w-3.5 h-3.5" /> Technical Position (10% Weight)
                      </span>
                      <span className="font-mono text-emerald-300 font-bold">
                        {breakdown.technical || 40} / 100
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, breakdown.technical || 40)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>RSI(14): {technical.rsi || 50} • SMA50: ${technical.sma50 || 0}</span>
                      <span>Contributes {((breakdown.technical || 40) * 0.1).toFixed(1)} pts to score</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Dynamic Risk Factor Explanations: WHY IS THIS STOCK RISKY */}
              <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Why is this stock risky? (Transparent Factor Analysis)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {riskFactors.map((factor, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="shrink-0 text-base">{factor.slice(0, 2)}</span>
                      <span>{factor.slice(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEWS SENTIMENT DETAIL */}
          {activeTab === 'sentiment' && (
            <div className="space-y-6">
              {/* Sentiment Summary Card */}
              <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Aggregated Sentiment Score
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {sentiment.score >= 0 ? `+${sentiment.score.toFixed(2)}` : sentiment.score.toFixed(2)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      sentiment.level === 'Positive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      sentiment.level === 'Negative' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-slate-700/30 text-slate-300 border border-slate-700'
                    }`}>
                      {sentiment.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 max-w-xl">
                    {sentiment.summary}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenSimulator(sym);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 transition-all shadow-lg shadow-rose-500/20 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Test Sentiment Shock on {sym}</span>
                </button>
              </div>

              {/* Analyzed Headlines Feed */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Recent News Headlines Analyzed with TextBlob</span>
                  <span className="text-[11px] text-slate-500">Live Yahoo Finance News Feed</span>
                </h3>

                {headlines.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4">No recent headlines found.</p>
                ) : (
                  headlines.map((item, i) => (
                    <div 
                      key={i}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-sm font-semibold text-slate-200 hover:text-cyan-300 transition-colors flex items-center gap-1.5 group"
                        >
                          <span>{item.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 transition-colors shrink-0" />
                        </a>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="text-slate-300 font-medium">{item.publisher}</span>
                          {item.published_at && (
                            <>
                              <span>•</span>
                              <span>{new Date(item.published_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${
                          item.level === 'Positive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          item.level === 'Negative' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {item.polarity >= 0 ? `+${item.polarity.toFixed(2)}` : item.polarity.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
                          {item.level}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: 7-DAY PRICE PREDICTION CHART */}
          {activeTab === 'forecast' && (
            <div className="space-y-6">
              {/* Forecast Header Banner */}
              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    7-Day Price Forecast (Technical + Sentiment Momentum)
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {formatPrice(prediction.target_price_7d ? prediction.target_price_7d : price, stock)}
                    </span>
                    <span className={`text-sm font-bold flex items-center gap-0.5 ${
                      (prediction.change_pct || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {(prediction.change_pct || 0) >= 0 ? '+' : ''}{prediction.change_pct || 0}% Expected
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold uppercase ${
                      prediction.trend === 'Bullish' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      prediction.trend === 'Bearish' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {prediction.trend || 'Neutral'} Trend
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 max-w-xs text-left md:text-right">
                  Shaded envelope displays a 90% confidence interval band based on {((stock.volatility || 0.25)*100).toFixed(1)}% volatility.
                </div>
              </div>

              {/* Chart Visualization */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={11} 
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => `${currencySymbol}${val}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(val, name) => [`${currencySymbol}${val}`, name === 'predicted_price' ? 'Predicted Price' : name === 'upper_bound' ? 'Upper 90% Band' : 'Lower 90% Band']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="upper_bound" 
                        stroke="#0ea5e9" 
                        strokeDasharray="4 4"
                        fill="none" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="lower_bound" 
                        stroke="#0ea5e9" 
                        strokeDasharray="4 4"
                        fill="none" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="predicted_price" 
                        stroke="#38bdf8" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#confidenceGrad)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Day-by-day table */}
                <div className="grid grid-cols-7 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center">
                  {forecast.map((f, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold">{f.date}</div>
                      <div className="text-xs font-bold text-cyan-300 font-mono mt-1">{currencySymbol}{f.predicted_price}</div>
                      <div className="text-[9px] text-slate-500 font-mono">{currencySymbol}{f.lower_bound} - {currencySymbol}{f.upper_bound}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WHAT CHANGED SINCE LAST CHECK */}
          {activeTab === 'diff' && (
            <div className="space-y-6">
              {diff && diff.has_previous ? (
                <div className="space-y-6">
                  {/* Delta Callout Banner */}
                  <div className={`p-5 rounded-2xl border backdrop-blur-md flex items-center justify-between gap-4 ${
                    diff.risk_score.spiked 
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' 
                      : diff.risk_score.eased
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 shrink-0">
                        {diff.risk_score.spiked ? (
                          <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                        ) : diff.risk_score.eased ? (
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {diff.risk_score.spiked 
                            ? `Risk Score Spiked by +${diff.risk_score.delta} Points!` 
                            : diff.risk_score.eased
                            ? `Risk Score Eased by ${diff.risk_score.delta} Points`
                            : `Stable Risk Score (Δ ${diff.risk_score.delta >= 0 ? `+${diff.risk_score.delta}` : diff.risk_score.delta} pts)`}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Compared against snapshot recorded on {new Date(diff.last_checked_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onRefresh(sym)}
                      disabled={isRefreshing}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors shrink-0"
                    >
                      Scan Again Now
                    </button>
                  </div>

                  {/* Side-by-Side Comparison Table */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Metric</th>
                          <th className="py-3 px-4">Previous Check</th>
                          <th className="py-3 px-4">Current Value</th>
                          <th className="py-3 px-4">Net Change</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {/* Risk Score */}
                        <tr className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 font-bold text-white">Risk Score (0-100)</td>
                          <td className="py-3 px-4 font-mono">{diff.risk_score.previous}</td>
                          <td className="py-3 px-4 font-mono font-bold text-white">{diff.risk_score.current}</td>
                          <td className="py-3 px-4 font-bold">
                            <span className={diff.risk_score.delta > 0 ? 'text-rose-400' : diff.risk_score.delta < 0 ? 'text-emerald-400' : 'text-slate-400'}>
                              {diff.risk_score.delta >= 0 ? `+${diff.risk_score.delta}` : diff.risk_score.delta}
                              {diff.risk_score.spiked ? ' (SPIKE!)' : ''}
                            </span>
                          </td>
                        </tr>

                        {/* Sentiment Level */}
                        <tr className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 font-bold text-white">News Sentiment Level</td>
                          <td className="py-3 px-4">{diff.sentiment.previous_level}</td>
                          <td className="py-3 px-4 font-bold text-white">{diff.sentiment.current_level}</td>
                          <td className="py-3 px-4">
                            {diff.sentiment.shifted ? (
                              <span className="text-amber-400 font-bold">Shifted ({diff.sentiment.delta >= 0 ? `+${diff.sentiment.delta}` : diff.sentiment.delta})</span>
                            ) : (
                              <span className="text-slate-500">Unchanged</span>
                            )}
                          </td>
                        </tr>

                        {/* Price */}
                        <tr className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 font-bold text-white">Share Price</td>
                          <td className="py-3 px-4 font-mono">{formatPrice(diff.price.previous, stock)}</td>
                          <td className="py-3 px-4 font-mono font-bold text-white">{formatPrice(diff.price.current, stock)}</td>
                          <td className="py-3 px-4 font-mono">
                            <span className={diff.price.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {formatDeltaPrice(diff.price.delta, stock)} ({diff.price.delta_pct}%)
                            </span>
                          </td>
                        </tr>

                        {/* Recommendation */}
                        <tr className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 font-bold text-white">Recommendation Signal</td>
                          <td className="py-3 px-4">{diff.recommendation.previous}</td>
                          <td className="py-3 px-4 font-bold text-white">{diff.recommendation.current}</td>
                          <td className="py-3 px-4">
                            {diff.recommendation.changed ? (
                              <span className="text-rose-400 font-bold">Flipped to {diff.recommendation.current}</span>
                            ) : (
                              <span className="text-slate-500">Same</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* New Risk Factors introduced */}
                  {diff.new_risk_factors && diff.new_risk_factors.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Newly Emerged Risk Factors Since Last Check
                      </h4>
                      <ul className="space-y-1.5">
                        {diff.new_risk_factors.map((f, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800">
                  <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-slate-300">Initial Baseline Check</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    This stock was just analyzed for the first time. Click &quot;Refresh Scan&quot; anytime to capture a new snapshot and compare what changed!
                  </p>
                  <button
                    onClick={() => onRefresh(sym)}
                    disabled={isRefreshing}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-cyan-600 hover:bg-cyan-500 transition-colors inline-flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Capture Second Snapshot Now
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

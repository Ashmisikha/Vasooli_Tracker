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
  Clock,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrencySymbol, formatPrice, formatDeltaPrice } from '../../utils/currency';

export default function StockDetailModal({ 
  stock, 
  diff, 
  onClose, 
  onRefresh, 
  isRefreshing,
  onOpenSimulator,
  onDeleteStock
}) {
  const [activeTab, setActiveTab] = useState('overview');

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
  const distribution = sentiment.distribution || { positive: 2, neutral: 8, negative: 5 };
  const currencySymbol = getCurrencySymbol(stock);

  let riskColor = 'text-[#00D09C] border-[#00D09C]/30 bg-[#E6F9F4]';
  let riskBadge = 'HIGH RISK';
  if (risk >= 60) {
    riskColor = 'text-[#EF4444] border-[#EF4444]/30 bg-[#FEF2F2]';
    riskBadge = 'HIGH RISK';
  } else if (risk >= 40) {
    riskColor = 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#FFFBEB]';
    riskBadge = 'MODERATE RISK';
  } else {
    riskBadge = 'LOW RISK';
  }

  let recBadge = 'bg-[#FFFBEB] text-[#F59E0B] border-[#F59E0B]/40';
  if (recommendation.action === 'BUY') {
    recBadge = 'bg-[#E6F9F4] text-[#00D09C] border-[#00D09C]/40';
  } else if (recommendation.action === 'AVOID') {
    recBadge = 'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/40';
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl rounded-3xl bg-white border border-[#E8EBEF] shadow-groww-lg overflow-hidden my-6"
        >
          
          {/* Groww Top Header */}
          <div className="px-6 py-5 border-b border-[#E8EBEF] bg-[#F5F7FA] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00D09C] flex items-center justify-center font-black text-lg text-white shadow-md shadow-[#00D09C]/20">
                {sym}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-[#1A1A2E] tracking-tight">{sym} - {stock.name}</h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-[#666D80] border border-[#E8EBEF]">
                    {stock.sector || 'Equities'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 font-mono">
                  <span className="text-xl font-bold text-[#1A1A2E]">{formatPrice(price, stock)}</span>
                  <span className={`text-xs font-bold flex items-center ${
                    changePct >= 0 ? 'text-[#00D09C]' : 'text-[#EF4444]'
                  }`}>
                    {changePct >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {changePct >= 0 ? `+${changePct}%` : `${changePct}%`} Today
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onRefresh(sym)}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#1A1A2E] bg-white border border-[#E8EBEF] hover:bg-[#F5F7FA] transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00D09C]' : ''}`} />
                <span>Refresh Scan</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[#666D80] hover:text-[#1A1A2E] hover:bg-[#F5F7FA] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Groww Sub-navigation Tabs */}
          <div className="px-6 border-b border-[#E8EBEF] bg-[#F5F7FA]/60 flex gap-2">
            {[
              { id: 'overview', label: 'Groww Risk & Factor Analysis' },
              { id: 'sentiment', label: 'News & Social Buzz (40%)' },
              { id: 'forecast', label: '7-Day Price Outlook Chart' },
              { id: 'diff', label: 'Since Last Check Comparison' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 text-xs font-extrabold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-[#00D09C] text-[#00D09C]'
                    : 'border-transparent text-[#666D80] hover:text-[#1A1A2E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Modal Content Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">

            {/* TWO-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Box: Price Metrics */}
              <div className="md:col-span-4 p-5 rounded-2xl bg-[#F5F7FA] border border-[#E8EBEF] space-y-3">
                <span className="text-xs font-bold text-[#666D80] uppercase tracking-wider block">
                  Market Price & Volatility
                </span>
                <div className="text-3xl font-black text-[#1A1A2E] font-mono">{formatPrice(price, stock)}</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#666D80] pt-2 border-t border-[#E8EBEF]">
                  <div>Annual Vol: <span className="text-[#1A1A2E] font-bold">{((stock.volatility || 0.25)*100).toFixed(1)}%</span></div>
                  <div>Beta: <span className="text-[#1A1A2E] font-bold">{stock.beta || 1.0}</span></div>
                  <div>RSI (14): <span className="text-[#1A1A2E] font-bold">{technical.rsi || 50}</span></div>
                  <div>SMA 50: <span className="text-[#1A1A2E] font-bold">{currencySymbol}{technical.sma50 || 0}</span></div>
                </div>
              </div>

              {/* Right Box: Groww Risk Score */}
              <div className="md:col-span-8 p-5 rounded-2xl bg-[#F5F7FA] border border-[#E8EBEF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#666D80] uppercase tracking-wider">
                      Composite Risk Score
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase border ${riskColor}`}>
                      {riskBadge}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-4xl font-black text-[#1A1A2E]">{risk}</span>
                    <span className="text-xs text-[#666D80]">/ 100</span>
                  </div>
                  <p className="text-xs text-[#666D80]">
                    40% Sentiment + 30% Volatility + 20% Beta + 10% Technical
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E8EBEF] text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#666D80] block">
                    Signal Recommendation
                  </span>
                  <span className={`text-base font-black uppercase px-2.5 py-0.5 rounded border inline-block mt-1 ${recBadge}`}>
                    {recommendation.action || 'CAUTION'}
                  </span>
                  <span className="text-[11px] text-[#666D80] block mt-1">
                    {recommendation.position_size || '3-6% allocation'}
                  </span>
                </div>
              </div>

            </div>

            {/* TAB 1: GROWW RISK & FACTOR ANALYSIS */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 4 Pillars Progress Bars */}
                <div className="p-5 rounded-2xl bg-[#F5F7FA] border border-[#E8EBEF] space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#666D80]">
                    4 Formula Component Pillars
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 40% News Sentiment */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#00D09C] font-bold">1. News Sentiment (40% Weight)</span>
                        <span className="font-mono">{breakdown.sentiment || 50}/100</span>
                      </div>
                      <div className="w-full h-2 bg-[#E8EBEF] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00D09C] rounded-full" style={{ width: `${Math.min(100, breakdown.sentiment || 50)}%` }} />
                      </div>
                      <div className="text-[10px] text-[#666D80]">
                        Tone: {sentiment.level} ({sentiment.score >= 0 ? `+${sentiment.score}` : sentiment.score})
                      </div>
                    </div>

                    {/* 30% Volatility */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#4A6CF7] font-bold">2. Volatility (30% Weight)</span>
                        <span className="font-mono">{breakdown.volatility || 30}/100</span>
                      </div>
                      <div className="w-full h-2 bg-[#E8EBEF] rounded-full overflow-hidden">
                        <div className="h-full bg-[#4A6CF7] rounded-full" style={{ width: `${Math.min(100, breakdown.volatility || 30)}%` }} />
                      </div>
                      <div className="text-[10px] text-[#666D80]">
                        Annual variance: {((stock.volatility || 0.25)*100).toFixed(1)}%
                      </div>
                    </div>

                    {/* 20% Beta */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#F97316] font-bold">3. Beta Sensitivity (20% Weight)</span>
                        <span className="font-mono">{breakdown.beta || 50}/100</span>
                      </div>
                      <div className="w-full h-2 bg-[#E8EBEF] rounded-full overflow-hidden">
                        <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${Math.min(100, breakdown.beta || 50)}%` }} />
                      </div>
                      <div className="text-[10px] text-[#666D80]">
                        Beta to market: {stock.beta || 1.0}
                      </div>
                    </div>

                    {/* 10% Technical */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#059669] font-bold">4. Technical Position (10% Weight)</span>
                        <span className="font-mono">{breakdown.technical || 40}/100</span>
                      </div>
                      <div className="w-full h-2 bg-[#E8EBEF] rounded-full overflow-hidden">
                        <div className="h-full bg-[#059669] rounded-full" style={{ width: `${Math.min(100, breakdown.technical || 40)}%` }} />
                      </div>
                      <div className="text-[10px] text-[#666D80]">
                        RSI: {technical.rsi || 50} • SMA50: ${technical.sma50 || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="p-5 rounded-2xl bg-[#F5F7FA] border border-[#E8EBEF] space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#666D80]">
                    Key Metrics & Valuations
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8EBEF]">
                      <div className="text-[10px] text-[#666D80] font-sans">Volatility</div>
                      <div className="font-bold text-[#1A1A2E] mt-0.5">{((stock.volatility || 0.25)*100).toFixed(1)}%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8EBEF]">
                      <div className="text-[10px] text-[#666D80] font-sans">Beta</div>
                      <div className="font-bold text-[#1A1A2E] mt-0.5">{stock.beta || 1.0}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8EBEF]">
                      <div className="text-[10px] text-[#666D80] font-sans">RSI (14)</div>
                      <div className="font-bold text-[#1A1A2E] mt-0.5">{technical.rsi || 50} ({technical.rsi < 35 ? 'Oversold' : technical.rsi > 70 ? 'Overbought' : 'Neutral'})</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8EBEF]">
                      <div className="text-[10px] text-[#666D80] font-sans">Market Cap</div>
                      <div className="font-bold text-[#1A1A2E] mt-0.5">{currencySymbol}780B</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8EBEF]">
                      <div className="text-[10px] text-[#666D80] font-sans">MA (50)</div>
                      <div className="font-bold text-[#1A1A2E] mt-0.5">{formatPrice(technical.sma50 || price, stock)}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8EBEF]">
                      <div className="text-[10px] text-[#666D80] font-sans">MA (200)</div>
                      <div className="font-bold text-[#1A1A2E] mt-0.5">{formatPrice(price * 0.94, stock)}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8EBEF]">
                      <div className="text-[10px] text-[#666D80] font-sans">52W High</div>
                      <div className="font-bold text-[#1A1A2E] mt-0.5">{formatPrice(price * 1.22, stock)}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8EBEF]">
                      <div className="text-[10px] text-[#666D80] font-sans">52W Low</div>
                      <div className="font-bold text-[#1A1A2E] mt-0.5">{formatPrice(price * 0.68, stock)}</div>
                    </div>
                  </div>
                </div>

                {/* Primary Risk Factors */}
                <div className="p-5 rounded-2xl bg-[#F5F7FA] border border-[#E8EBEF] space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#666D80]">
                    Primary Risk Factors (Why is this stock risky?)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {riskFactors.map((f, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-[#E8EBEF] text-xs text-[#1A1A2E] flex items-start gap-2">
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: NEWS & SOCIAL BUZZ */}
            {activeTab === 'sentiment' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* News Sentiment Feed */}
                <div className="md:col-span-7 p-5 rounded-2xl bg-[#F5F7FA] border border-[#E8EBEF] space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1A1A2E]">
                    <span>NEWS & SENTIMENT BREAKDOWN</span>
                    <span className="font-mono text-[#00D09C]">Score: {sentiment.score >= 0 ? `+${sentiment.score}` : sentiment.score}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="text-[#00D09C]">Positive ({distribution.positive || 2})</span>
                    <span className="text-[#666D80]">Neutral ({distribution.neutral || 8})</span>
                    <span className="text-[#EF4444]">Negative ({distribution.negative || 5})</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#E8EBEF]">
                    {headlines.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-[#E8EBEF] flex items-start justify-between gap-4 text-xs">
                        <div className="space-y-0.5">
                          <a href={item.link} target="_blank" rel="noreferrer" className="font-semibold text-[#1A1A2E] hover:text-[#00D09C] flex items-center gap-1">
                            <span>{item.title}</span>
                            <ExternalLink className="w-3 h-3 text-[#666D80]" />
                          </a>
                          <div className="text-[10px] text-[#666D80]">{item.publisher}</div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          item.level === 'Positive' ? 'bg-[#E6F9F4] text-[#00D09C]' :
                          item.level === 'Negative' ? 'bg-[#FEF2F2] text-[#EF4444]' :
                          'bg-[#F5F7FA] text-[#666D80]'
                        }`}>
                          {item.polarity >= 0 ? `+${item.polarity.toFixed(2)}` : item.polarity.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Buzz */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-[#F5F7FA] border border-[#E8EBEF] space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A2E]">
                    <MessageSquare className="w-4 h-4 text-[#4A6CF7]" />
                    <span>SOCIAL BUZZ</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-white border border-[#E8EBEF] flex justify-between">
                      <span className="text-[#666D80]">Reddit Mentions:</span>
                      <span className="font-bold text-[#1A1A2E]">2,347 Trending</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#E8EBEF] flex justify-between">
                      <span className="text-[#666D80]">Twitter Mentions:</span>
                      <span className="font-bold text-[#1A1A2E]">1,245 Mixed</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#E8EBEF] flex justify-between">
                      <span className="text-[#666D80]">Social Tone:</span>
                      <span className="font-bold text-[#EF4444]">Negative</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#E8EBEF] text-xs">
                    <div className="font-bold text-[#666D80]">Top Community Posts:</div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E8EBEF] text-[#1A1A2E]">
                      "TSLA to $500 by EOY or buy the dip?"
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E8EBEF] text-[#1A1A2E]">
                      "Production issues impacting margin guidance"
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: GROWW 7-DAY FORECAST CHART */}
            {activeTab === 'forecast' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-[#F5F7FA] border border-[#E8EBEF] space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1A1A2E]">
                    <span>INTERACTIVE PRICE FORECAST (GROWW SIGNATURE GREEN #00D09C)</span>
                    <span className="text-[#00D09C] font-mono">Target: {formatPrice(prediction.target_price_7d, stock)} ({prediction.change_pct}%)</span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="growwChartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00D09C" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00D09C" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8EBEF" />
                        <XAxis dataKey="date" stroke="#666D80" fontSize={11} />
                        <YAxis stroke="#666D80" fontSize={11} domain={['auto', 'auto']} tickFormatter={(v) => `${currencySymbol}${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E8EBEF', borderRadius: '8px', fontSize: '12px' }} formatter={(v) => `${currencySymbol}${v}`} />
                        <Area type="monotone" dataKey="upper_bound" stroke="#00D09C" strokeDasharray="3 3" fill="none" />
                        <Area type="monotone" dataKey="lower_bound" stroke="#00D09C" strokeDasharray="3 3" fill="none" />
                        <Area type="monotone" dataKey="predicted_price" stroke="#00D09C" strokeWidth={3} fill="url(#growwChartGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SINCE LAST CHECK COMPARISON */}
            {activeTab === 'diff' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-[#F5F7FA] border border-[#E8EBEF] space-y-4">
                  <h3 className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">
                    SINCE YOUR LAST CHECK COMPARISON
                  </h3>

                  {diff && diff.has_previous ? (
                    <div className="rounded-xl border border-[#E8EBEF] overflow-hidden text-xs bg-white">
                      <table className="w-full text-left">
                        <thead className="bg-[#F5F7FA] text-[#666D80] border-b border-[#E8EBEF]">
                          <tr>
                            <th className="py-2.5 px-3">Metric</th>
                            <th className="py-2.5 px-3">Before</th>
                            <th className="py-2.5 px-3">Now</th>
                            <th className="py-2.5 px-3">Change</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8EBEF] font-mono">
                          <tr>
                            <td className="py-2.5 px-3 font-sans font-bold text-[#1A1A2E]">Risk Score</td>
                            <td className="py-2.5 px-3">{diff.risk_score.previous}</td>
                            <td className="py-2.5 px-3 font-bold text-[#1A1A2E]">{diff.risk_score.current}</td>
                            <td className={`py-2.5 px-3 font-bold ${diff.risk_score.delta > 0 ? 'text-[#EF4444]' : 'text-[#00D09C]'}`}>
                              {diff.risk_score.delta >= 0 ? `+${diff.risk_score.delta}` : diff.risk_score.delta}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-sans font-bold text-[#1A1A2E]">Sentiment</td>
                            <td className="py-2.5 px-3 font-sans">{diff.sentiment.previous_level}</td>
                            <td className="py-2.5 px-3 font-sans font-bold text-[#1A1A2E]">{diff.sentiment.current_level}</td>
                            <td className="py-2.5 px-3 font-sans text-[#F59E0B]">
                              {diff.sentiment.shifted ? 'Shifted' : 'Same'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-sans font-bold text-[#1A1A2E]">Share Price</td>
                            <td className="py-2.5 px-3">{formatPrice(diff.price.previous, stock)}</td>
                            <td className="py-2.5 px-3 font-bold text-[#1A1A2E]">{formatPrice(diff.price.current, stock)}</td>
                            <td className={`py-2.5 px-3 font-bold ${diff.price.delta >= 0 ? 'text-[#00D09C]' : 'text-[#EF4444]'}`}>
                              {formatDeltaPrice(diff.price.delta, stock)} ({diff.price.delta_pct}%)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-[#666D80] italic">
                      Initial baseline recorded. Click "Refresh Scan" anytime to compare snapshot deltas!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#E8EBEF] flex items-center justify-between">
              <button
                onClick={() => onDeleteStock(sym)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#EF4444] bg-[#FEF2F2] border border-[#EF4444]/20 hover:bg-[#FEE2E2] transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove from Watchlist</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-extrabold text-[#1A1A2E] bg-[#F5F7FA] border border-[#E8EBEF] hover:bg-[#E8EBEF] transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

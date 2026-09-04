import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';
import { formatPrice, formatDeltaPrice } from '../utils/currency';

export default function WatchlistTable({ 
  stocks, 
  onSelectStock, 
  onRefreshStock, 
  onDeleteStock,
  refreshingSymbols = {}
}) {
  if (!stocks || stocks.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
          <Zap className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">Your Watchlist is Empty</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          Add stocks like NVDA, AAPL, or TSLA to monitor real-time sentiment-powered risk scores and predictions.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
      <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Watchlist Assets
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {stocks.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any stock to inspect full risk breakdown, 7-day forecast, and news sentiment articles
          </p>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Sentiment Engine Active
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/40 border-b border-slate-800/60">
            <tr>
              <th scope="col" className="py-3.5 px-5 font-bold">Asset</th>
              <th scope="col" className="py-3.5 px-4 font-bold text-right">Price</th>
              <th scope="col" className="py-3.5 px-4 font-bold text-center">Risk Score (0-100)</th>
              <th scope="col" className="py-3.5 px-4 font-bold text-center">Attention</th>
              <th scope="col" className="py-3.5 px-4 font-bold">What Changed Since Last Check</th>
              <th scope="col" className="py-3.5 px-4 font-bold text-center">Signal</th>
              <th scope="col" className="py-3.5 px-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-normal">
            {stocks.map((item) => {
              const sym = item.symbol;
              const isRefreshing = !!refreshingSymbols[sym];
              const risk = item.risk_score || 50;
              const sentLevel = item.sentiment?.level || 'Neutral';
              const sentScore = item.sentiment?.score || 0.0;
              const action = item.recommendation?.action || 'CAUTION';
              const diff = item.diff || {};

              // Risk styling
              let riskBadgeClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
              let riskBarColor = 'bg-emerald-500';
              if (risk > 60) {
                riskBadgeClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                riskBarColor = 'bg-rose-500';
              } else if (risk >= 40) {
                riskBadgeClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                riskBarColor = 'bg-amber-500';
              }

              // Sentiment styling
              let sentClass = 'text-slate-300 bg-slate-800/60 border-slate-700';
              if (sentLevel === 'Positive') {
                sentClass = 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30';
              } else if (sentLevel === 'Negative') {
                sentClass = 'text-rose-300 bg-rose-950/40 border-rose-500/30';
              }

              // Action badge
              let actionClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
              if (action === 'BUY') {
                actionClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
              } else if (action === 'AVOID') {
                actionClass = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
              }

              return (
                <tr 
                  key={sym} 
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectStock(sym)}
                >
                  {/* Asset */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-black text-xs text-white group-hover:border-cyan-500/50 transition-colors">
                        {sym.slice(0, 4)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          {sym}
                          <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                            {item.sector || 'Equities'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-[140px] sm:max-w-[180px]">
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 text-right">
                    <div className="font-semibold text-white text-sm">
                      {formatPrice(item.price, item)}
                    </div>
                    <div className={`text-xs font-medium flex items-center justify-end gap-0.5 ${
                      (item.change_pct || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {(item.change_pct || 0) >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {item.change_pct !== undefined ? `${item.change_pct >= 0 ? '+' : ''}${item.change_pct}%` : '0.00%'}
                    </div>
                  </td>

                  {/* Risk Score */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg border ${riskBadgeClass}`}>
                          {risk}
                        </span>
                      </div>
                      {/* Mini Bar Gauge */}
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${riskBarColor}`}
                          style={{ width: `${Math.min(100, risk)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* News Sentiment (40%) */}
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${sentClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        sentLevel === 'Positive' ? 'bg-emerald-400' :
                        sentLevel === 'Negative' ? 'bg-rose-400' : 'bg-slate-400'
                      }`}></span>
                      {sentLevel}
                      <span className="text-[10px] opacity-75 font-mono">
                        ({sentScore >= 0 ? '+' : ''}{sentScore.toFixed(2)})
                      </span>
                    </span>
                  </td>
                  {/* Attention Score Badge */}
                  <td className="py-4 px-4 text-center">
                    {(() => {
                      const attScore = item.attention_score?.score !== undefined ? item.attention_score.score : (diff.risk_score?.spiked ? 85 : (diff.price?.changed ? 45 : 12));
                      const attLevel = item.attention_score?.level || (attScore > 60 ? 'HIGH' : (attScore > 30 ? 'MEDIUM' : 'LOW'));
                      const badgeStyle = attLevel === 'HIGH' 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                        : attLevel === 'MEDIUM' 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                      const label = attLevel === 'HIGH' ? 'HIGH' : attLevel === 'MEDIUM' ? 'MEDIUM' : 'LOW';
                      return (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border ${badgeStyle}`}>
                          {label}
                        </span>
                      );
                    })()}
                  </td>

                  {/* What Changed Since Last Check (Diff) */}
                  <td className="py-4 px-4">
                    {diff.has_previous ? (
                      <div className="space-y-1 text-xs">
                        {/* Risk delta */}
                        <div className="flex items-center gap-1.5">
                          {diff.risk_score.spiked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              Risk +{Math.abs(diff.risk_score.delta)} (SPIKE!)
                            </span>
                          ) : diff.risk_score.eased ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300">
                              Risk {diff.risk_score.delta}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Risk: {diff.risk_score.delta >= 0 ? `+${diff.risk_score.delta}` : diff.risk_score.delta}
                            </span>
                          )}
                        </div>

                        {/* Sentiment shift or price delta */}
                        <div className="text-[11px] text-slate-400">
                          {diff.sentiment.shifted ? (
                            <span className="text-amber-300 font-medium">
                              Sentiment: {diff.sentiment.previous_level} → <span className="font-bold text-white">{diff.sentiment.current_level}</span>
                            </span>
                          ) : (
                            <span>Δ Price: {formatDeltaPrice(diff.price.delta, item)} ({diff.price.delta_pct}%)</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 italic">
                        <Clock className="w-3 h-3" />
                        Initial Baseline
                      </div>
                    )}
                  </td>

                  {/* Signal Recommendation */}
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide border shadow-sm ${actionClass}`}>
                      {action}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onRefreshStock(sym)}
                        disabled={isRefreshing}
                        title="Run check now & compute delta"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                      </button>

                      <button
                        onClick={() => onSelectStock(sym)}
                        title="View deep-dive risk analysis"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteStock(sym)}
                        title="Remove from watchlist"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

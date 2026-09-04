import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Zap,
  SlidersHorizontal,
  Play
} from 'lucide-react';
import Sparkline from '../common/Sparkline';
import { formatPrice, formatDeltaPrice } from '../../utils/currency';

export default function WatchlistTable({ 
  stocks = [], 
  onSelectStock, 
  onRefreshStock, 
  onDeleteStock,
  refreshingSymbols = {}
}) {
  const [sortField, setSortField] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterSentiment, setFilterSentiment] = useState('ALL');

  if (!stocks || stocks.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-[#E8EBEF] shadow-groww">
        <Zap className="w-10 h-10 mx-auto mb-3 text-[#00D09C]" />
        <h3 className="text-base font-extrabold text-[#1A1A2E]">Your Watchlist is Empty</h3>
        <p className="text-xs text-[#666D80] mt-1 max-w-sm mx-auto">
          Add stocks to monitor real-time sentiment-powered risk scores and predictions.
        </p>
      </div>
    );
  }

  // Filter stocks by sentiment
  const filtered = stocks.filter(item => {
    if (filterSentiment === 'ALL') return true;
    return (item.sentiment?.level || 'Neutral').toUpperCase() === filterSentiment;
  });

  // Sort stocks
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'risk_score') {
      valA = a.risk_score || 0;
      valB = b.risk_score || 0;
    } else if (sortField === 'price') {
      valA = a.price || 0;
      valB = b.price || 0;
    } else if (sortField === 'change_pct') {
      valA = a.change_pct || 0;
      valB = b.change_pct || 0;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="rounded-2xl border border-[#E8EBEF] bg-white overflow-hidden shadow-groww space-y-0">
      
      {/* Header Controls */}
      <div className="px-6 py-4 border-b border-[#E8EBEF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F5F7FA]">
        <div>
          <h2 className="text-base font-extrabold text-[#1A1A2E] tracking-tight flex items-center gap-2">
            YOUR WATCHLIST
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/20">
              {stocks.length} assets
            </span>
          </h2>
          <p className="text-xs text-[#666D80] mt-0.5 font-medium">
            40% News Sentiment • 30% Volatility • 20% Beta • 10% Technical Position
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-[#666D80] flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Sentiment:
          </span>
          {['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilterSentiment(lvl)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                filterSentiment === lvl
                  ? 'bg-[#00D09C] text-white shadow-sm'
                  : 'bg-white text-[#666D80] hover:text-[#1A1A2E] border border-[#E8EBEF]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Groww Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#1A1A2E]">
          <thead className="text-[11px] uppercase tracking-wider text-[#666D80] bg-[#F5F7FA] border-b border-[#E8EBEF]">
            <tr>
              <th scope="col" className="py-3.5 px-4 text-center w-10 font-extrabold">#</th>
              <th 
                scope="col" 
                onClick={() => handleSort('symbol')}
                className="py-3.5 px-4 font-extrabold cursor-pointer hover:text-[#00D09C]"
              >
                Symbol {sortField === 'symbol' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                onClick={() => handleSort('price')}
                className="py-3.5 px-4 font-extrabold text-right cursor-pointer hover:text-[#00D09C]"
              >
                Price {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                onClick={() => handleSort('change_pct')}
                className="py-3.5 px-4 font-extrabold text-right cursor-pointer hover:text-[#00D09C]"
              >
                24h Change {sortField === 'change_pct' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th scope="col" className="py-3.5 px-4 font-extrabold text-center">7d Chart</th>
              <th scope="col" className="py-3.5 px-4 font-extrabold text-center">News Sentiment (40%)</th>
              <th 
                scope="col" 
                onClick={() => handleSort('risk_score')}
                className="py-3.5 px-4 font-extrabold text-center cursor-pointer hover:text-[#00D09C]"
              >
                Risk Score (0-100) {sortField === 'risk_score' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th scope="col" className="py-3.5 px-4 font-extrabold text-center">Attention</th>
              <th scope="col" className="py-3.5 px-4 font-extrabold">What Changed Since Last Check</th>
              <th scope="col" className="py-3.5 px-4 font-extrabold text-center">Signal</th>
              <th scope="col" className="py-3.5 px-4 font-extrabold text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E8EBEF] font-medium">
            {sorted.map((item, index) => {
              const sym = item.symbol;
              const isRefreshing = !!refreshingSymbols[sym];
              const risk = item.risk_score || 50;
              const sentLevel = item.sentiment?.level || 'Neutral';
              const sentScore = item.sentiment?.score || 0.0;
              const action = item.recommendation?.action || 'CAUTION';
              const diff = item.diff || {};
              const isPos = (item.change_pct || 0) >= 0;
              const histPrices = item.historical_prices || [];

              // Risk styling
              let riskBadgeClass = 'text-[#00D09C] bg-[#E6F9F4] border-[#00D09C]/30';
              let riskBarColor = 'bg-[#00D09C]';
              if (risk >= 60) {
                riskBadgeClass = 'text-[#EF4444] bg-[#FEF2F2] border-[#EF4444]/30';
                riskBarColor = 'bg-[#EF4444]';
              } else if (risk >= 40) {
                riskBadgeClass = 'text-[#F59E0B] bg-[#FFFBEB] border-[#F59E0B]/30';
                riskBarColor = 'bg-[#F59E0B]';
              }

              // Sentiment styling
              let sentClass = 'text-[#666D80] bg-[#F5F7FA] border-[#E8EBEF]';
              if (sentLevel === 'Positive') {
                sentClass = 'text-[#00D09C] bg-[#E6F9F4] border-[#00D09C]/30';
              } else if (sentLevel === 'Negative') {
                sentClass = 'text-[#EF4444] bg-[#FEF2F2] border-[#EF4444]/30';
              }

              // Action Badge
              let actionClass = 'bg-[#FFFBEB] text-[#F59E0B] border-[#F59E0B]/30';
              if (action === 'BUY') {
                actionClass = 'bg-[#E6F9F4] text-[#00D09C] border-[#00D09C]/30';
              } else if (action === 'AVOID') {
                actionClass = 'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/30';
              }

              return (
                <tr 
                  key={sym} 
                  onClick={() => onSelectStock(sym)}
                  className="hover:bg-[#F5F7FA] transition-colors cursor-pointer group"
                >
                  {/* # */}
                  <td className="py-4 px-4 text-center text-[#9BA3B5] font-mono">{index + 1}</td>

                  {/* Symbol */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F7FA] border border-[#E8EBEF] flex items-center justify-center font-black text-xs text-[#1A1A2E] group-hover:border-[#00D09C] transition-colors">
                        {sym.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-extrabold text-[#1A1A2E] text-xs flex items-center gap-1.5">
                          {sym}
                          <span className="text-[10px] text-[#666D80] font-normal px-1 rounded bg-[#F5F7FA]">
                            {item.sector || 'Equities'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#666D80] truncate max-w-[130px]">
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 text-right font-mono font-bold text-[#1A1A2E]">
                    {formatPrice(item.price, item)}
                  </td>

                  {/* 24h Change */}
                  <td className="py-4 px-4 text-right font-mono">
                    <span className={`inline-flex items-center font-bold text-xs ${
                      isPos ? 'text-[#00D09C]' : 'text-[#EF4444]'
                    }`}>
                      {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {isPos ? `+${item.change_pct}%` : `${item.change_pct}%`}
                    </span>
                  </td>

                  {/* 7d Sparkline Chart */}
                  <td className="py-4 px-4 text-center">
                    <Sparkline points={histPrices} isPositive={isPos} width={75} height={24} />
                  </td>

                  {/* Sentiment Badge */}
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${sentClass}`}>
                      <span>{sentLevel}</span>
                      <span className="text-[10px] font-mono opacity-80">
                        ({sentScore >= 0 ? `+${sentScore.toFixed(2)}` : sentScore.toFixed(2)})
                      </span>
                    </span>
                  </td>

                  {/* Risk Score Progress Bar */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-xs font-black font-mono px-2 py-0.5 rounded border ${riskBadgeClass}`}>
                        {risk}
                      </span>
                      <div className="w-20 h-1 bg-[#E8EBEF] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${riskBarColor}`}
                          style={{ width: `${Math.min(100, risk)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Attention Score Badge */}
                  <td className="py-4 px-4 text-center">
                    {(() => {
                      const attScore = item.attention_score?.score !== undefined ? item.attention_score.score : (diff.risk_score?.spiked ? 85 : (diff.price?.changed ? 45 : 12));
                      const attLevel = item.attention_score?.level || (attScore > 60 ? 'HIGH' : (attScore > 30 ? 'MEDIUM' : 'LOW'));
                      const badgeStyle = attLevel === 'HIGH' 
                        ? 'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/30' 
                        : attLevel === 'MEDIUM' 
                        ? 'bg-[#FFFBEB] text-[#F59E0B] border-[#F59E0B]/30' 
                        : 'bg-[#E6F9F4] text-[#00D09C] border-[#00D09C]/30';
                      const label = attLevel === 'HIGH' ? 'HIGH' : attLevel === 'MEDIUM' ? 'MEDIUM' : 'LOW';
                      return (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border ${badgeStyle}`}>
                          {label}
                        </span>
                      );
                    })()}
                  </td>

                  {/* What Changed Since Last Check */}
                  <td className="py-4 px-4">
                    {diff.has_previous ? (
                      <div className="space-y-0.5 text-[11px]">
                        {diff.risk_score.spiked ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/30 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            Risk +{Math.abs(diff.risk_score.delta)} (SPIKE!)
                          </span>
                        ) : (
                          <span className="text-[#666D80]">
                            Risk Δ: {diff.risk_score.delta >= 0 ? `+${diff.risk_score.delta}` : diff.risk_score.delta} pts
                          </span>
                        )}

                        <div className="text-[#666D80]">
                          {diff.sentiment.shifted ? (
                            <span className="text-[#F59E0B] font-bold">
                              Shift: {diff.sentiment.previous_level} → <span className="text-[#1A1A2E]">{diff.sentiment.current_level}</span>
                            </span>
                          ) : (
                            <span>Δ Price: {formatDeltaPrice(diff.price.delta, item)}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#9BA3B5] italic flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Baseline Snapshot
                      </span>
                    )}
                  </td>

                  {/* Signal Recommendation */}
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${actionClass}`}>
                      {action}
                    </span>
                  </td>

                  {/* Groww Actions */}
                  <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectStock(sym)}
                        title="View stock details"
                        className="px-2.5 py-1 rounded-lg text-xs font-extrabold text-[#00D09C] bg-[#00D09C]/10 hover:bg-[#00D09C]/20 transition-colors flex items-center gap-1"
                      >
                        <span>View</span>
                        <Play className="w-3 h-3 fill-current" />
                      </button>

                      <button
                        onClick={() => onRefreshStock(sym)}
                        disabled={isRefreshing}
                        title="Run check now & compute delta"
                        className="p-1.5 rounded-lg text-[#666D80] hover:text-[#00D09C] hover:bg-[#F5F7FA] transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00D09C]' : ''}`} />
                      </button>

                      <button
                        onClick={() => onDeleteStock(sym)}
                        title="Remove from watchlist"
                        className="p-1.5 rounded-lg text-[#666D80] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Status */}
      <div className="px-6 py-3 bg-[#F5F7FA] border-t border-[#E8EBEF] flex items-center justify-between text-xs text-[#666D80]">
        <div>
          Showing {sorted.length} of {stocks.length} assets
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="text-[#00D09C] font-bold">● Groww Signature (#00D09C)</span>
          <span>•</span>
          <span className="text-[#4A6CF7]">TextBlob NLP Active</span>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { 
  ShieldAlert, 
  Newspaper, 
  Eye, 
  Sparkles, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Sparkline from '../common/Sparkline';
import { formatPrice } from '../../utils/currency';

export default function PriorityAlerts({ 
  watchlist = [], 
  onSelectStock, 
  onOpenSimulator 
}) {
  const alerts = watchlist.filter(s => (s.risk_score || 0) >= 45);

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1A1A2E] flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EF4444]"></span>
          </span>
          {alerts.length} STOCKS NEED YOUR ATTENTION (PRIORITY ALERTS)
        </h2>
        <span className="text-xs text-[#666D80] font-medium flex items-center gap-1 cursor-pointer hover:text-[#00D09C]">
          View All Alerts <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>

      <div className="space-y-4">
        {alerts.map((stock) => {
          const sym = stock.symbol;
          const risk = stock.risk_score || 50;
          const isHigh = risk >= 60;
          const price = stock.price || 0;
          const changePct = stock.change_pct || 0;
          const isPos = changePct >= 0;
          const sentLevel = stock.sentiment?.level || 'Neutral';
          const sentScore = stock.sentiment?.score || 0.0;

          const riskFactors = stock.risk_factors || [];
          const headlineExcerpt = riskFactors[0] || (
            isHigh 
              ? `${sym} news sentiment shifted to negative due to market events. Risk score spiked.`
              : `${sym} trading under key moving average support level.`
          );

          const histPrices = stock.historical_prices || [];

          return (
            <motion.div
              key={sym}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-5 rounded-2xl border bg-white shadow-groww transition-all ${
                isHigh
                  ? 'border-l-4 border-l-[#EF4444] border-[#E8EBEF] groww-alert-pulse'
                  : 'border-l-4 border-l-[#F59E0B] border-[#E8EBEF]'
              }`}
            >
              <div className="space-y-3">
                {/* Header Badge & Risk Score */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                    isHigh
                      ? 'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/20'
                      : 'bg-[#FFFBEB] text-[#F59E0B] border-[#F59E0B]/20'
                  }`}>
                    {isHigh ? 'HIGH PRIORITY ALERT' : 'MEDIUM PRIORITY ALERT'}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#666D80] font-medium">Risk Score:</span>
                    <span className={`font-mono font-black text-sm ${isHigh ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                      {risk}/100
                    </span>
                  </div>
                </div>

                {/* Stock Details & Mini Sparkline Graph */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F7FA] border border-[#E8EBEF] flex items-center justify-center font-black text-sm text-[#1A1A2E]">
                      {sym}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-[#1A1A2E]">{sym}</span>
                        <span className="text-sm font-mono font-bold text-[#1A1A2E]">{formatPrice(price, sym)}</span>
                        <span className={`text-xs font-bold font-mono ${isPos ? 'text-[#00D09C]' : 'text-[#EF4444]'}`}>
                          {isPos ? '+' : ''}{changePct}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          sentLevel === 'Negative' ? 'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/20' :
                          sentLevel === 'Positive' ? 'bg-[#E6F9F4] text-[#00D09C] border-[#00D09C]/20' :
                          'bg-[#F5F7FA] text-[#666D80] border-[#E8EBEF]'
                        }`}>
                          {sentLevel.toUpperCase()} ({sentScore >= 0 ? `+${sentScore.toFixed(2)}` : sentScore.toFixed(2)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 30-Day Sparkline Graph */}
                  <div className="flex flex-col items-end">
                    <div className="text-[10px] text-[#666D80] font-bold mb-0.5">30-Day Price Trend</div>
                    <Sparkline points={histPrices} isPositive={isPos} width={120} height={32} />
                  </div>

                </div>

                {/* AI Insight Summary */}
                <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E8EBEF] text-xs text-[#1A1A2E] font-medium leading-relaxed">
                  "{headlineExcerpt}"
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onSelectStock(sym)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold btn-groww shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Full Analysis</span>
                  </button>

                  <button
                    onClick={() => onOpenSimulator(sym)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-[#4A6CF7] bg-[#4A6CF7]/10 hover:bg-[#4A6CF7]/20 border border-[#4A6CF7]/30 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#4A6CF7]" />
                    <span>Simulate Shock</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { ShieldAlert, Activity, Newspaper, TrendingUp, Compass } from 'lucide-react';

export default function RiskCard({ stock }) {
  if (!stock) return null;

  const sym = stock.symbol;
  const risk = stock.risk_score || 50;
  const breakdown = stock.breakdown || {};
  const sentiment = stock.sentiment || {};
  const recommendation = stock.recommendation || {};
  const riskFactors = stock.risk_factors || [];

  let riskColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let riskBarColor = 'bg-emerald-500';
  if (risk > 60) {
    riskColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    riskBarColor = 'bg-rose-500';
  } else if (risk >= 40) {
    riskColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    riskBarColor = 'bg-amber-500';
  }

  let recBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (recommendation.action === 'BUY') {
    recBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  } else if (recommendation.action === 'AVOID') {
    recBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  }

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">{sym} Risk Score Profile</h3>
          <p className="text-xs text-slate-400">4-Factor Weighted Calculation</p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider border ${recBadge}`}>
          {recommendation.action || 'CAUTION'}
        </span>
      </div>

      {/* Main Score Gauge */}
      <div className="flex items-center gap-4 py-2 border-y border-slate-800/80">
        <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-black ${riskColor}`}>
          <span className="text-2xl">{risk}</span>
          <span className="text-[9px] font-bold text-slate-400">/ 100</span>
        </div>

        <div className="flex-1 space-y-2 text-xs">
          <div className="flex justify-between font-medium">
            <span className="text-cyan-300 flex items-center gap-1">
              <Newspaper className="w-3 h-3" /> Sentiment (40%)
            </span>
            <span className="font-mono">{breakdown.sentiment || 50}</span>
          </div>

          <div className="flex justify-between font-medium">
            <span className="text-indigo-300 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Volatility (30%)
            </span>
            <span className="font-mono">{breakdown.volatility || 30}</span>
          </div>

          <div className="flex justify-between font-medium">
            <span className="text-amber-300 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Beta (20%)
            </span>
            <span className="font-mono">{breakdown.beta || 50}</span>
          </div>

          <div className="flex justify-between font-medium">
            <span className="text-emerald-300 flex items-center gap-1">
              <Compass className="w-3 h-3" /> Technical (10%)
            </span>
            <span className="font-mono">{breakdown.technical || 40}</span>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Risk Factors</h4>
          <div className="space-y-1 text-xs text-slate-300">
            {riskFactors.slice(0, 2).map((factor, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-400">•</span>
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

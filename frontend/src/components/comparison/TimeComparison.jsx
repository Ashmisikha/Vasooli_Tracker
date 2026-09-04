import React from 'react';
import { Clock, AlertTriangle, TrendingDown, ArrowRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice, formatDeltaPrice } from '../../utils/currency';

export default function TimeComparison({ stock, diff, onRefresh }) {
  if (!stock) return null;

  const sym = stock.symbol;

  return (
    <div className="p-6 rounded-2xl bg-[#1E2329] border border-[#2B3139] space-y-5">
      <div className="flex items-center justify-between border-b border-[#2B3139] pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#1E80FF]" />
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            WHAT CHANGED SINCE YOUR LAST CHECK
          </h3>
        </div>
        <span className="text-xs text-[#8B98A5] font-mono">{sym} Delta Overview</span>
      </div>

      {diff && diff.has_previous ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#2B3139] overflow-hidden text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-[#14181D] text-[#8B98A5] border-b border-[#2B3139] font-sans">
                <tr>
                  <th className="py-3 px-4">Metric</th>
                  <th className="py-3 px-4">Before (Last Check)</th>
                  <th className="py-3 px-4">Now (Current Scan)</th>
                  <th className="py-3 px-4">Net Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3139] text-[#F0F4F8]">
                <tr>
                  <td className="py-3 px-4 font-sans font-bold text-white">Risk Score</td>
                  <td className="py-3 px-4">{diff.risk_score.previous}</td>
                  <td className="py-3 px-4 font-bold text-white">{diff.risk_score.current}</td>
                  <td className={`py-3 px-4 font-bold ${diff.risk_score.delta > 0 ? 'text-[#F6465D]' : 'text-[#0ECB81]'}`}>
                    {diff.risk_score.delta >= 0 ? `+${diff.risk_score.delta}` : diff.risk_score.delta}
                    {diff.risk_score.spiked ? ' (SPIKE!)' : ''}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-bold text-white">News Sentiment</td>
                  <td className="py-3 px-4 font-sans">{diff.sentiment.previous_level}</td>
                  <td className="py-3 px-4 font-sans font-bold text-white">{diff.sentiment.current_level}</td>
                  <td className="py-3 px-4 font-sans text-[#F0B90B]">
                    {diff.sentiment.shifted ? 'Shifted' : 'Unchanged'}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-bold text-white">Share Price</td>
                  <td className="py-3 px-4">{formatPrice(diff.price.previous, stock)}</td>
                  <td className="py-3 px-4 font-bold text-white">{formatPrice(diff.price.current, stock)}</td>
                  <td className={`py-3 px-4 font-bold ${diff.price.delta >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                    {formatDeltaPrice(diff.price.delta, stock)} ({diff.price.delta_pct}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Key Insight Summary */}
          <div className="p-4 rounded-xl bg-[#0B0E11] border border-[#2B3139] space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#1E80FF] font-bold">
              <span>KEY INSIGHT:</span>
            </div>
            <p className="text-[#F0F4F8] leading-relaxed">
              "News sentiment shifted from {diff.sentiment.previous_level} to {diff.sentiment.current_level}. Risk score moved by {diff.risk_score.delta >= 0 ? `+${diff.risk_score.delta}` : diff.risk_score.delta} points."
            </p>

            <div className="flex items-center gap-1.5 text-[#F0B90B] font-bold pt-2 border-t border-[#2B3139]">
              <Lightbulb className="w-4 h-4" />
              <span>RECOMMENDATION:</span>
            </div>
            <p className="text-[#8B98A5]">
              "{stock.recommendation?.reason || 'Adjust position allocation and re-evaluate stop loss triggers.'}"
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-[#8B98A5] italic">
          No prior baseline found for comparison. Click "Refresh Scan" to record a snapshot.
        </div>
      )}
    </div>
  );
}

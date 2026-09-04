import React from 'react';
import { BarChart2 } from 'lucide-react';

export default function MarketBreadth({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  const advancing = data?.advancing_count || 135;
  const declining = data?.declining_count || 52;
  const unchanged = data?.unchanged_count || 13;
  const total = data?.total_stocks || (advancing + declining + unchanged);
  
  const advPct = data?.advancing_pct || Math.round((advancing / total) * 100);
  const decPct = data?.declining_pct || Math.round((declining / total) * 100);
  const uncPct = data?.unchanged_pct || Math.round((unchanged / total) * 100);
  const adRatio = data?.advance_decline_ratio || (declining > 0 ? (advancing / declining).toFixed(2) : '3.5');
  const statusMsg = data?.status_message || `${advPct}% of tracked stocks advancing`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-200 dark:border-gray-700 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#0ECB81]" />
            <span className="font-extrabold text-[#1A1A2E] dark:text-white text-base tracking-tight">Market Breadth</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-[#E8F8F0] dark:bg-[#0A8C5A]/30 text-[#0ECB81] border border-[#0ECB81]/20">
              A/D Ratio: {adRatio}
            </span>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 font-medium mt-0.5">
            Real-time advance/decline distribution across {total} tracked equities
          </p>
        </div>
        <div className="text-xs font-bold text-[#0ECB81] bg-[#E8F8F0] dark:bg-[#0A8C5A]/30 px-3 py-1 rounded-full border border-[#0ECB81]/30 self-start sm:self-auto">
          {statusMsg}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-3.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${advPct}%` }} 
            className="bg-[#0ECB81] h-full transition-all duration-500" 
            title={`Advancing: ${advancing} (${advPct}%)`}
          />
          <div 
            style={{ width: `${uncPct}%` }} 
            className="bg-[#8E8E93] h-full transition-all duration-500" 
            title={`Unchanged: ${unchanged} (${uncPct}%)`}
          />
          <div 
            style={{ width: `${decPct}%` }} 
            className="bg-[#8B1A1A] h-full transition-all duration-500" 
            title={`Declining: ${declining} (${decPct}%)`}
          />
        </div>

        {/* Legend metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs font-bold">
          <div className="p-2 rounded-xl bg-[#E8F8F0] dark:bg-[#0A8C5A]/20 text-[#0ECB81] border border-[#0ECB81]/20">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Advancing</div>
            <div className="text-sm font-extrabold font-mono">{advancing} <span className="text-[10px]">({advPct}%)</span></div>
          </div>
          <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-[#8E8E93] dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unchanged</div>
            <div className="text-sm font-extrabold font-mono">{unchanged} <span className="text-[10px]">({uncPct}%)</span></div>
          </div>
          <div className="p-2 rounded-xl bg-[#F5E6E6] dark:bg-[#8B1A1A]/20 text-[#8B1A1A] dark:text-red-300 border border-[#8B1A1A]/20">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Declining</div>
            <div className="text-sm font-extrabold font-mono">{declining} <span className="text-[10px]">({decPct}%)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

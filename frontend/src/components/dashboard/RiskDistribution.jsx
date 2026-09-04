import React from 'react';

export default function RiskDistribution({ data }) {
  const riskData = data || {
    total: 200,
    low: 130,
    medium: 50,
    high: 20,
    lowPct: 65,
    mediumPct: 25,
    highPct: 10
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
      <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
        <h3 className="font-extrabold text-[#1A1A2E] dark:text-white text-base">Risk Distribution</h3>
        <p className="text-xs text-[#6B7280] dark:text-gray-400">Risk distribution across {riskData.total} tracked stocks</p>
      </div>

      {/* Tracked Stock Counts */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 text-xs font-bold text-[#1A1A2E] dark:text-white flex justify-between items-center">
        <span>Tracked Stock Counts:</span>
        <span className="text-[#0ECB81]">{riskData.low} Low Risk</span>
        <span className="text-[#8E8E93] dark:text-gray-300">{riskData.medium} Medium Risk</span>
        <span className="text-[#8B1A1A] dark:text-red-400">{riskData.high} High Risk</span>
      </div>

      {/* Static Risk Bars */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-gray-700 dark:text-gray-300">Low Risk (&lt;40 score) — {riskData.low} stocks</span>
            <span className="text-[#0ECB81] font-extrabold">{riskData.lowPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-[#0ECB81] rounded-full" style={{ width: `${riskData.lowPct}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-gray-700 dark:text-gray-300">Medium Risk (40-60 score) — {riskData.medium} stocks</span>
            <span className="text-[#8E8E93] dark:text-gray-300 font-extrabold">{riskData.mediumPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-[#8E8E93] rounded-full" style={{ width: `${riskData.mediumPct}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-gray-700 dark:text-gray-300">High Risk (&gt;60 score) — {riskData.high} stocks</span>
            <span className="text-[#8B1A1A] dark:text-red-400 font-extrabold">{riskData.highPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-[#8B1A1A] rounded-full" style={{ width: `${riskData.highPct}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

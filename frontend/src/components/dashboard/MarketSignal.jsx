import React from 'react';
import { Radio } from 'lucide-react';

export default function MarketSignal({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  const score = data?.score ?? 68;
  const signal = data?.signal || "MODERATELY BULLISH";
  const factors = data?.factors || [
    { name: "Price Momentum", score: 72, status: "Positive" },
    { name: "Market Breadth", score: 68, status: "72% Advancing" },
    { name: "Sector Performance", score: 70, status: "Tech Leading" },
    { name: "News Sentiment", score: 65, status: "Moderately Positive" },
    { name: "Volatility Index", score: 78, status: "Low Volatility" }
  ];
  const explanation = data?.explanation || "Market momentum is positive with advancing breadth supporting upside continuation.";

  const isGreen = score >= 60;
  const isRed = score <= 35;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xs border border-gray-200 dark:border-gray-700 space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#0A5C3A]" />
            <span className="font-extrabold text-[#1A1A2E] dark:text-white text-base tracking-tight">Market Signal</span>
          </div>
          <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold border flex items-center gap-1.5 ${
            isGreen ? 'bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 text-[#0A5C3A] border-[#0A5C3A]/30' : 
            isRed ? 'bg-[#F5E6E6] dark:bg-[#8B1A1A]/30 text-[#8B1A1A] dark:text-red-300 border-[#8B1A1A]/30' : 
            'bg-gray-100 dark:bg-gray-700 text-[#8E8E93] dark:text-gray-300 border-gray-300 dark:border-gray-600'
          }`}>
            <span className={`w-2 h-2 rounded-full inline-block ${
              isGreen ? 'bg-[#0A5C3A]' : isRed ? 'bg-[#8B1A1A]' : 'bg-gray-400'
            }`}></span>
            {signal}
          </span>
        </div>

        {/* Big Score Header */}
        <div className="flex items-center gap-4 my-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
          <div className="text-center px-3 border-r border-gray-200 dark:border-gray-600">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">Signal Score</div>
            <div className="text-2xl font-black font-mono text-[#1A1A2E] dark:text-white">
              {score}<span className="text-xs text-gray-400 font-normal">/100</span>
            </div>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-gray-300 font-medium leading-relaxed">
            {explanation}
          </p>
        </div>

        {/* Factors Breakdown */}
        <div className="space-y-2">
          <div className="text-[11px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-wider">Composite Factors</div>
          <div className="space-y-1.5">
            {factors.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700 dark:text-gray-200">{f.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">{f.status}</span>
                  <div className="w-14 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${f.score >= 60 ? 'bg-[#0A5C3A]' : f.score <= 40 ? 'bg-[#8B1A1A]' : 'bg-[#8E8E93]'}`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

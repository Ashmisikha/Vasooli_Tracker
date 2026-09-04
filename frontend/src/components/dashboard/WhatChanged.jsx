import React from 'react';
import { formatPrice } from '../../utils/currency';

export default function WhatChanged({ items, watchlistCount = 10, onSelectStock, lastUpdated }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xs border border-gray-200 dark:border-gray-700 text-center py-8 space-y-2">
        <h3 className="text-base font-extrabold text-[#1A1A2E] dark:text-white">All your stocks are stable. No significant changes detected.</h3>
        <p className="text-xs text-[#6B7280] dark:text-gray-400 font-medium">All your tracked equities are performing within normal parameters since your last check.</p>
        {lastUpdated && (
          <span className="inline-block text-xs font-bold text-[#0A5C3A] bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 px-3 py-1 rounded-full border border-[#0A5C3A]/30 mt-2">
            Last checked: {lastUpdated}
          </span>
        )}
      </div>
    );
  }

  const highPriority = items.filter(item => (item.attention_score?.level === 'HIGH' || item.attention_score?.score > 60));
  const mediumPriority = items.filter(item => (item.attention_score?.level === 'MEDIUM' || (item.attention_score?.score <= 60 && item.attention_score?.score > 30)));
  const lowPriority = items.filter(item => (item.attention_score?.level === 'LOW' || item.attention_score?.score <= 30));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xs border border-gray-200 dark:border-gray-700 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#1A1A2E] dark:text-white tracking-tight flex items-center gap-2">
            WHAT CHANGED TODAY IN YOUR WATCHLIST?
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-1 font-medium">
            You have {watchlistCount || items.length} stocks in your watchlist.
            <span className="ml-2 font-bold">
              <span className="text-[#8B1A1A] dark:text-red-400">{highPriority.length} high priority</span> · 
              <span className="text-[#8E8E93] dark:text-gray-300 ml-1.5">{mediumPriority.length} worth monitoring</span> · 
              <span className="text-[#0A5C3A] ml-1.5">{lowPriority.length} no change</span>
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {lastUpdated && (
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 bg-gray-100 dark:bg-gray-700/60 px-2.5 py-1 rounded-lg">
              <span className="font-extrabold text-[#0A5C3A]">{lastUpdated}</span>
            </span>
          )}
          <span className="text-xs font-bold text-[#0A5C3A] bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 px-3 py-1 rounded-full border border-[#0A5C3A]/30">
            Hero Attention Filter
          </span>
        </div>
      </div>

      {/* Changes List */}
      <div className="space-y-4">
        
        {/* High Priority Changes */}
        {highPriority.map((item, idx) => (
          <ChangeCard key={item.symbol || idx} item={item} priority="high" onSelectStock={onSelectStock} />
        ))}

        {/* Medium Priority Changes */}
        {mediumPriority.map((item, idx) => (
          <ChangeCard key={item.symbol || idx} item={item} priority="medium" onSelectStock={onSelectStock} />
        ))}

        {/* Low Priority Changes */}
        {lowPriority.map((item, idx) => (
          <ChangeCard key={item.symbol || idx} item={item} priority="low" onSelectStock={onSelectStock} />
        ))}

      </div>
    </div>
  );
}

function ChangeCard({ item, priority, onSelectStock }) {
  const isHigh = priority === 'high';
  const isMed = priority === 'medium';
  
  const score = item.attention_score?.score || (isHigh ? 82 : (isMed ? 45 : 12));
  const factors = item.attention_score?.factors || [];
  const curr = item.current || item;
  const prev = item.previous || {};
  const isUp = (curr.change !== undefined ? curr.change : item.change_pct) >= 0;
  const currPrice = curr.price || item.price || 100.0;
  const currChange = curr.change !== undefined ? curr.change : item.change_pct || 0.0;

  if (priority === 'low' && score <= 30) {
    return (
      <div 
        onClick={() => onSelectStock && onSelectStock(item.symbol)}
        className="p-4 rounded-xl border border-[#0A5C3A]/30 bg-[#E8F5EE]/60 dark:bg-[#0A4A2E]/20 hover:bg-[#E8F5EE] dark:hover:bg-[#0A4A2E]/30 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 group"
      >
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0A5C3A]"></span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#1A1A2E] dark:text-white group-hover:text-[#0A5C3A] transition-colors">
                {item.symbol}
              </span>
              <span className="text-xs text-gray-400 font-medium">{item.name}</span>
            </div>
            <p className="text-xs text-[#0A5C3A] font-extrabold mt-0.5">
              No material change since your last check.
            </p>
          </div>
        </div>
        <div className="text-right text-xs font-mono font-bold text-[#1A1A2E] dark:text-white">
          {formatPrice(currPrice, item)} <span className={isUp ? 'text-[#0A5C3A]' : 'text-[#8B1A1A] dark:text-red-400'}>{isUp ? '+' : '-'}{Math.abs(currChange).toFixed(2)}%</span>
        </div>
      </div>
    );
  }

  const borderClass = isHigh 
    ? 'border-[#8B1A1A] bg-[#F5E6E6]/60 dark:bg-[#8B1A1A]/20' 
    : 'border-[#8E8E93] bg-gray-50 dark:bg-[#8E8E93]/10';
    
  const badgeClass = isHigh 
    ? 'bg-[#8B1A1A] text-white' 
    : 'bg-[#8E8E93] text-white';

  return (
    <div className={`p-5 rounded-2xl border-2 ${borderClass} transition-all space-y-3`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${isHigh ? 'bg-[#8B1A1A]' : 'bg-amber-500'} inline-block`}></span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-[#1A1A2E] dark:text-white">{item.symbol}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.name}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${badgeClass}`}>
                {isHigh ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold mt-1">
              <span className="font-mono text-[#1A1A2E] dark:text-white">{formatPrice(currPrice, item)}</span>
              <span className={isUp ? 'text-[#0A5C3A]' : 'text-[#8B1A1A] dark:text-red-400'}>
                {isUp ? '+' : '-'}{Math.abs(currChange).toFixed(2)}%
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                Risk: {prev.risk_score || curr.risk_score || item.risk_score || 45} → <strong className="text-[#8B1A1A] dark:text-red-400">{curr.risk_score || item.risk_score || 50}</strong>
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                Sentiment: <strong className={isUp ? 'text-[#0A5C3A]' : 'text-[#8B1A1A] dark:text-red-400'}>{curr.sentiment || item.sentiment_level || 'Neutral'}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-extrabold text-[#1A1A2E] dark:text-white font-mono">
            Attention Score: <span className={isHigh ? 'text-[#8B1A1A] dark:text-red-400' : 'text-[#8E8E93] dark:text-gray-300'}>{score}/100</span>
          </div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            Weighted Change Analysis
          </div>
        </div>
      </div>

      {/* Why this matters */}
      <div className="p-3.5 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/60 dark:border-gray-700 space-y-2">
        <div className="text-xs font-extrabold text-[#1A1A2E] dark:text-white flex items-center gap-1.5">
          Why this matters:
        </div>
        <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 font-medium pl-2">
          {factors.length > 0 ? (
            factors.map((factor, fIdx) => (
              <li key={fIdx} className="flex items-center gap-1.5">
                <span>•</span>
                <span>{factor}</span>
              </li>
            ))
          ) : (
            <li className="flex items-center gap-1.5">
              <span>•</span>
              <span>{item.explanation || item.event_summary || 'Price & volatility shifted significantly.'}</span>
            </li>
          )}
        </ul>
        {item.guidance && (
          <div className="text-xs font-semibold text-[#0A5C3A] pt-1.5 border-t border-gray-100 dark:border-gray-700 italic">
            {item.guidance}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => onSelectStock && onSelectStock(item.symbol)}
          className="text-xs font-extrabold text-[#0A5C3A] hover:underline cursor-pointer flex items-center gap-1"
        >
          View Full Analysis
        </button>
      </div>
    </div>
  );
}

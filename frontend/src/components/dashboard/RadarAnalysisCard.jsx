import React, { useState } from 'react';
import { Sliders, ShieldAlert, Newspaper, Sparkles, RefreshCw } from 'lucide-react';

export default function RadarAnalysisCard() {
  const [metrics, setMetrics] = useState({
    VALUE: 70,
    NATURE: 50,
    PAY: 80,
    HEALTH: 40
  });

  const axes = [
    { key: 'VALUE', label: 'VALUE', description: 'Valuation & Intrinsic PE' },
    { key: 'NATURE', label: 'NATURE', description: 'Volatility & Price Stability' },
    { key: 'PAY', label: 'PAY', description: 'Payout Strength & Dividend Yield' },
    { key: 'HEALTH', label: 'HEALTH', description: 'Financial Health & Debt Ratio' }
  ];

  const handleSliderChange = (key, val) => {
    setMetrics(prev => ({ ...prev, [key]: Number(val) }));
  };

  const handleReset = () => {
    setMetrics({ VALUE: 70, NATURE: 50, PAY: 80, HEALTH: 40 });
  };

  // SVG Radar Geometry Calculations for 4 Axes
  const cx = 150;
  const cy = 150;
  const radius = 100;
  const numAxes = 4;

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const r = radius * (value / 100);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  const getLabelCoordinates = (index) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const r = radius + 25;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  // Radar Polygon Points
  const polygonPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, metrics[axis.key]);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-[#1a1a24] text-white p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-8 font-sans">
      
      {/* Top Section: Radar Chart */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center justify-between w-full border-b border-gray-800 pb-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-[#0ECB81]/15 text-[#0ECB81] text-xs font-black rounded-lg uppercase tracking-wider border border-[#0ECB81]/30">
              RADAR PROFILER
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">ANALYSIS DASHBOARD</h2>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {/* Radar SVG Canvas */}
        <div className="relative w-[340px] h-[340px] flex items-center justify-center p-2 bg-[#14141d] rounded-3xl border border-gray-800/80 shadow-inner">
          <svg width="340" height="340" viewBox="0 0 300 300" className="w-full h-full overflow-visible">
            
            {/* Grid Rings */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, ringIdx) => {
              const ringRadius = radius * level;
              const ringPoints = axes
                .map((_, i) => {
                  const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
                  return `${cx + ringRadius * Math.cos(angle)},${cy + ringRadius * Math.sin(angle)}`;
                })
                .join(' ');
              return (
                <polygon
                  key={ringIdx}
                  points={ringPoints}
                  fill="none"
                  stroke="#4a4a5a"
                  strokeOpacity={ringIdx === 4 ? 0.7 : 0.3}
                  strokeWidth={ringIdx === 4 ? '1.5' : '1'}
                  strokeDasharray={ringIdx < 4 ? '3 3' : undefined}
                />
              );
            })}

            {/* Axis Spokes */}
            {axes.map((_, i) => {
              const { x, y } = getCoordinates(i, 100);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="#4a4a5a"
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Semi-transparent Gold/Yellow Filled Polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(255, 205, 86, 0.45)"
              stroke="#FFA726"
              strokeWidth="2.5"
              className="transition-all duration-200 ease-out"
            />

            {/* Polygon Corner Nodes */}
            {axes.map((axis, i) => {
              const { x, y } = getCoordinates(i, metrics[axis.key]);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#FFA726"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-200 ease-out"
                />
              );
            })}

            {/* Axis Labels */}
            {axes.map((axis, i) => {
              const { x, y } = getLabelCoordinates(i);
              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-black tracking-widest fill-white font-mono"
                >
                  {axis.label}
                </text>
              );
            })}

          </svg>
        </div>
      </div>

      {/* Bottom Grid: Settings Info (Left) + Risk Analysis & Sentiment (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
        
        {/* Bottom Left Section: SETTINGS INFO */}
        <div className="bg-[#14141d] p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
            <Sliders className="w-4 h-4 text-[#FFA726]" />
            <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">SETTINGS INFO</h3>
          </div>

          <div className="space-y-4 pt-1">
            {axes.map((axis) => (
              <div key={axis.key} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-300 font-mono">{axis.label}:</span>
                  <span className="text-[#FFA726] font-mono font-black">{metrics[axis.key]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={metrics[axis.key]}
                  onChange={(e) => handleSliderChange(axis.key, e.target.value)}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FFA726]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Right Section: RISK ANALYSIS & SENTIMENT */}
        <div className="bg-[#14141d] p-6 rounded-2xl border border-gray-800 space-y-6">
          
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
            <ShieldAlert className="w-4 h-4 text-[#0ECB81]" />
            <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">RISK ANALYSIS & SENTIMENT</h3>
          </div>

          {/* 3 Progress Bars */}
          <div className="space-y-3">
            {/* Low Risk (<40) - 65% Green */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#0ECB81]">Low Risk (&lt;40)</span>
                <span className="text-gray-300">65%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#0ECB81] rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            {/* Medium Risk (40-60) - 25% Silver Gray */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#8E8E93]">Medium Risk (40-60)</span>
                <span className="text-gray-300">25%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#8E8E93] rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            {/* High Risk (>60) - 10% Burgundy */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#8B1A1A]">High Risk (&gt;60)</span>
                <span className="text-gray-300">10%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#8B1A1A] rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-4 space-y-3">
            <h4 className="text-xs font-extrabold text-gray-300 tracking-wider uppercase flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-gray-400" />
              NEWS SENTIMENT BREAKDOWN TODAY
            </h4>

            {/* 3 Bordered Boxes */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              
              {/* Positive Box */}
              <div className="p-3 bg-[#1a1a24] border-2 border-[#0ECB81] rounded-xl text-center">
                <p className="text-[10px] font-bold text-[#0ECB81] uppercase">Positive</p>
                <p className="text-xl font-extrabold text-white mt-0.5">8</p>
              </div>

              {/* Neutral Box */}
              <div className="p-3 bg-[#1a1a24] border-2 border-[#8E8E93] rounded-xl text-center">
                <p className="text-[10px] font-bold text-[#8E8E93] uppercase">Neutral</p>
                <p className="text-xl font-extrabold text-white mt-0.5">12</p>
              </div>

              {/* Negative Box */}
              <div className="p-3 bg-[#1a1a24] border-2 border-[#8B1A1A] rounded-xl text-center">
                <p className="text-[10px] font-bold text-[#8B1A1A] uppercase">Negative</p>
                <p className="text-xl font-extrabold text-white mt-0.5">5</p>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

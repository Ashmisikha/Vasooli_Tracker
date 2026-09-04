import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Flame, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  Info
} from 'lucide-react';
import { simulateSentimentShock } from '../services/api';

const PRESET_SCENARIOS = [
  {
    id: 'sec_probe',
    title: 'SEC Probe & Accounting Fraud Investigation',
    score: -0.85,
    type: 'negative',
    desc: 'Severe regulatory enforcement action, forensic accounting audit, and potential stock delisting fears.'
  },
  {
    id: 'ceo_recall',
    title: 'CEO Abruptly Resigns Amidst Product Recall',
    score: -0.70,
    type: 'negative',
    desc: 'Sudden leadership void accompanied by catastrophic hardware reliability failures and customer churn.'
  },
  {
    id: 'earnings_miss',
    title: 'Severe Earnings Miss & Guidance Slashed 30%',
    score: -0.55,
    type: 'negative',
    desc: 'Macroeconomic headwinds squeeze margins; management downgrades next year revenue outlook.'
  },
  {
    id: 'neutral_hold',
    title: 'Earnings In-Line with Wall St Consensus',
    score: 0.00,
    type: 'neutral',
    desc: 'Revenue and margins meet analyst estimates exactly with no new strategic surprises or catalysts.'
  },
  {
    id: 'ai_breakthrough',
    title: 'AI Chip Architecture Breakthrough & $10B Hyperscaler Deal',
    score: +0.80,
    type: 'positive',
    desc: 'Technological superiority leap captures multi-year enterprise contracts and massive margin expansion.'
  },
  {
    id: 'fda_approval',
    title: 'Regulatory Clearance & Blockbuster Government Contract',
    score: +0.90,
    type: 'positive',
    desc: 'Total market authorization achieved ahead of schedule with sovereign defense backing.'
  }
];

export default function SentimentSimulator({ watchlist = [], defaultSymbol = 'TSLA' }) {
  const assetList = watchlist && watchlist.length > 0
    ? watchlist
    : [
        { symbol: 'TSLA' },
        { symbol: 'AAPL' },
        { symbol: 'NVDA' },
        { symbol: 'AMD' },
        { symbol: 'MSFT' },
        { symbol: 'AMZN' }
      ];

  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol || assetList[0].symbol);
  const [customHeadline, setCustomHeadline] = useState('');
  const [sliderScore, setSliderScore] = useState(-0.60);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [error, setError] = useState('');

  const handleRunSimulation = async (headline = null, score = null) => {
    setIsLoading(true);
    setError('');
    try {
      const activeHeadline = headline !== null ? headline : customHeadline;
      const activeScore = score !== null ? score : sliderScore;
      const res = await simulateSentimentShock(selectedSymbol, activeHeadline, activeScore);
      setSimulationResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message || 'Failed to simulate sentiment shock');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRunSimulation();
  }, [selectedSymbol]);

  const handleApplyPreset = (preset) => {
    setCustomHeadline(preset.title);
    setSliderScore(preset.score);
    handleRunSimulation(preset.title, preset.score);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#E8F5EE] via-white to-white border border-[#0A5C3A]/20 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5EE] text-[#0A5C3A] border border-[#0A5C3A]/30 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#0A5C3A]" />
            Hackathon Feature Highlight (CODE 2026)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A2E] tracking-tight">
            Sentiment Shock Simulator
          </h1>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed font-medium">
            Demonstrate our core differentiator: <strong className="text-[#0A5C3A]">40% of each stock's risk score is derived from news sentiment</strong>. 
            Inject simulated breaking headlines or slide sentiment polarity to observe real-time risk score spikes and signal flips!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls & Presets */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Asset Selector */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
              1. Select Asset to Stress Test
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {assetList.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => {
                    setSelectedSymbol(item.symbol);
                    setSimulationResult(null);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-extrabold border transition-all text-center cursor-pointer ${
                    selectedSymbol === item.symbol
                      ? 'bg-[#0A5C3A] text-white border-[#0A5C3A] shadow-xs'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#0A5C3A] hover:bg-white'
                  }`}
                >
                  {item.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
              2. One-Click Shock Presets
            </label>

            <div className="space-y-2">
              {PRESET_SCENARIOS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  disabled={isLoading}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                    preset.type === 'negative'
                      ? 'bg-[#F5E6E6] hover:bg-[#F5E6E6]/80 border-[#8B1A1A]/20 text-[#1A1A2E]'
                      : preset.type === 'positive'
                      ? 'bg-[#E8F5EE] hover:bg-[#E8F5EE]/80 border-[#0A5C3A]/20 text-[#1A1A2E]'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-[#1A1A2E]'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{preset.title}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      preset.score < 0 ? 'text-[#8B1A1A] bg-[#8B1A1A]/10' :
                      preset.score > 0 ? 'text-[#0A5C3A] bg-[#0A5C3A]/10' :
                      'text-[#8E8E93] bg-[#8E8E93]/10'
                    }`}>
                      {preset.score > 0 ? `+${preset.score}` : preset.score}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 leading-snug">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Slider */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
              3. Custom Headline & Polarity Slider
            </label>

            <div>
              <input
                type="text"
                placeholder="e.g. Federal regulators launch investigation..."
                value={customHeadline}
                onChange={(e) => setCustomHeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1A1A2E] placeholder-gray-400 focus:outline-none focus:border-[#0A5C3A]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1">
                <span>Sentiment Polarity</span>
                <span className="font-mono text-[#0A5C3A] font-bold">
                  {sliderScore >= 0 ? `+${sliderScore.toFixed(2)}` : sliderScore.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={sliderScore}
                onChange={(e) => setSliderScore(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0A5C3A]"
              />
              <div className="flex justify-between text-[10px] font-extrabold mt-1">
                <span className="text-[#8B1A1A]">-1.0 (Bearish)</span>
                <span className="text-[#8E8E93]">0.0 (Neutral)</span>
                <span className="text-[#0A5C3A]">+1.0 (Bullish)</span>
              </div>
            </div>

            <button
              onClick={() => handleRunSimulation(customHeadline, sliderScore)}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold text-white bg-[#0A5C3A] hover:bg-[#0A4A2E] shadow-sm shadow-[#0A5C3A]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Computing Shock Delta...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-white" />
                  <span>Inject Sentiment Shock on {selectedSymbol}</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Live Reaction Card */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-[#F5E6E6] border border-[#8B1A1A]/30 text-[#8B1A1A] text-xs font-semibold">
              {error}
            </div>
          )}

          {simulationResult ? (
            <div className="space-y-6">
              
              {/* SPIKE BANNER */}
              <div className={`p-6 rounded-3xl border shadow-xs ${
                simulationResult.impact.is_spike
                  ? 'bg-gradient-to-r from-[#F5E6E6] via-white to-white border-[#8B1A1A]/40'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-extrabold text-gray-500">
                        Simulation Shock Delta
                      </span>
                      {simulationResult.impact.is_spike && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#8B1A1A]/10 text-[#8B1A1A] border border-[#8B1A1A]/20 animate-pulse">
                          RISK SPIKE DETECTED
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-baseline gap-3 pt-1 font-mono">
                      <span className="text-3xl font-black text-[#1A1A2E]">
                        {simulationResult.impact.risk_score_delta >= 0 ? `+${simulationResult.impact.risk_score_delta}` : simulationResult.impact.risk_score_delta} pts
                      </span>
                      <span className="text-xs text-gray-500 font-sans">
                        Risk Score Swing
                      </span>
                    </div>

                    <p className="text-xs text-[#1A1A2E] pt-2 leading-relaxed font-medium">
                      {simulationResult.impact.explanation}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-center shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-0.5">
                      Target Symbol
                    </span>
                    <span className="text-xl font-black text-[#0A5C3A] font-mono">{selectedSymbol}</span>
                  </div>
                </div>
              </div>

              {/* BEFORE vs AFTER TABLE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BEFORE */}
                <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
                    Baseline (Pre-Shock)
                  </div>

                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-gray-500 font-sans">Risk Score:</span>
                    <span className="text-lg font-bold text-[#1A1A2E]">
                      {simulationResult.baseline.risk_score}/100
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Sentiment:</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-gray-100 text-[#1A1A2E]">
                      {simulationResult.baseline.sentiment_level} ({simulationResult.baseline.sentiment_score >= 0 ? `+${simulationResult.baseline.sentiment_score}` : simulationResult.baseline.sentiment_score})
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Signal:</span>
                    <span className="font-extrabold uppercase px-2 py-0.5 rounded bg-[#E8F5EE] text-[#0A5C3A]">
                      {simulationResult.baseline.recommendation}
                    </span>
                  </div>
                </div>

                {/* AFTER */}
                <div className="p-5 rounded-2xl bg-[#F5E6E6]/60 border border-[#8B1A1A]/30 shadow-xs space-y-3">
                  <div className="text-xs font-bold text-[#8B1A1A] uppercase tracking-wider border-b border-[#8B1A1A]/20 pb-2">
                    Post-Shock Reaction
                  </div>

                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-gray-500 font-sans">New Risk Score:</span>
                    <span className="text-lg font-black text-[#8B1A1A]">
                      {simulationResult.simulated.risk_score}/100
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">New Sentiment:</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-[#F5E6E6] text-[#8B1A1A] border border-[#8B1A1A]/20">
                      {simulationResult.simulated.sentiment_level} ({simulationResult.simulated.sentiment_score >= 0 ? `+${simulationResult.simulated.sentiment_score}` : simulationResult.simulated.sentiment_score})
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">New Signal:</span>
                    <span className="font-black uppercase px-2 py-0.5 rounded bg-[#F5E6E6] text-[#8B1A1A] border border-[#8B1A1A]/30">
                      {simulationResult.simulated.recommendation}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white border border-gray-200 shadow-xs flex flex-col items-center justify-center space-y-3">
              <Flame className="w-8 h-8 text-[#0A5C3A]" />
              <h3 className="text-sm font-bold text-[#1A1A2E]">No Active Simulation</h3>
              <p className="text-xs text-gray-500 max-w-md">
                Click any preset shock on the left or slide sentiment polarity to observe real-time risk score spikes!
              </p>
              <button
                onClick={() => handleApplyPreset(PRESET_SCENARIOS[0])}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-[#0A5C3A] bg-[#E8F5EE] border border-[#0A5C3A]/20 hover:bg-[#E8F5EE]/80 transition-colors cursor-pointer"
              >
                Simulate Regulatory Investigation Shock
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

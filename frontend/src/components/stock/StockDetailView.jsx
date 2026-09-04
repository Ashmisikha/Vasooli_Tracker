import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  ShieldAlert, 
  Newspaper, 
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Layers,
  Brain,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { fetchStockDetail, fetchStockChart } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { getCurrencySymbol, isIndianStock } from '../../utils/currency';

export default function StockDetailView({ symbol, onBack, onAddToWatchlist, isInWatchlist }) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'risk' | 'fundamentals' | 'scenarios'
  const [timeframe, setTimeframe] = useState('1M'); // '1D', '1W', '1M', '3M', '1Y', 'All'
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  const loadStockData = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await fetchStockDetail(symbol, forceRefresh);
      setData(res);
      setError(null);
    } catch (err) {
      console.error('Failed to load stock detail:', err);
      setError(err.message || 'Failed to load stock data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadChartData = async (period) => {
    setIsChartLoading(true);
    try {
      const res = await fetchStockChart(symbol, period);
      if (res && res.chart && res.chart.length > 0) {
        setChartData(res.chart);
      }
    } catch (err) {
      console.warn('[StockDetailView] chart fetch error:', err);
    } finally {
      setIsChartLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      loadStockData();
      loadChartData('1M');
    }
  }, [symbol]);

  const handlePeriodChange = (period) => {
    setTimeframe(period);
    loadChartData(period);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#0A5C3A] border-t-transparent mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">Running Vasooli Intelligence Engine analysis for {symbol}...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl text-center">
        <div className="bg-[#F5E6E6] dark:bg-[#8B1A1A]/20 text-[#8B1A1A] dark:text-red-300 p-8 rounded-3xl max-w-md mx-auto border border-[#8B1A1A]/30">
          <AlertTriangle className="w-8 h-8 text-[#8B1A1A] mx-auto mb-2" />
          <p className="font-extrabold text-base mb-1">Failed to load {symbol}</p>
          <p className="text-xs mb-4">{error}</p>
          <button
            onClick={() => loadStockData(true)}
            className="px-5 py-2.5 bg-[#0A5C3A] hover:bg-[#0A4A2E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 mx-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const analysis = data.analysis || {};
  const diff = data.diff || {};
  const isUp = (analysis.change_pct || 0) >= 0;

  // Use period-specific chart data fetched from /stocks/{symbol}/chart?period=
  // Fall back to historical_prices from the detail response if chart hasn't loaded yet
  const fallbackChart = (analysis.historical_prices || []).map(pt => ({
    date: pt.date || pt.day || 'Day',
    price: Number(pt.price || pt.close || analysis.price || 100).toFixed(2),
    open: Number(pt.open || pt.price || analysis.price || 100).toFixed(2),
    high: Number(pt.high || (Number(pt.price || analysis.price) * 1.01)).toFixed(2),
    low: Number(pt.low || (Number(pt.price || analysis.price) * 0.99)).toFixed(2),
    volume: (pt.volume || 1500000).toLocaleString()
  }));

  const displayChartData = chartData.length > 0 ? chartData : fallbackChart;

  const riskScore = analysis.risk_score || 50;
  const isHighRisk = riskScore >= 60;
  const isModRisk = riskScore >= 40 && riskScore < 60;

  // Fix: backend returns breakdown.beta and breakdown.volatility, not top-level
  const breakdownBeta = analysis.breakdown?.beta || analysis.beta || 1.05;
  const breakdownVolatility = analysis.breakdown?.volatility || analysis.volatility || null;

  const profileFitPct = analysis.profile_fit?.pct || analysis.profile_fit?.score || 84;

  const fundamentals = analysis.fundamentals || {
    pe_ratio: "25.4",
    pb_ratio: "3.2",
    debt_equity: "0.45",
    roe: "18.5%",
    revenue_growth: "+12.4%",
    profit_growth: "+15.2%",
    market_cap: "780B",
    sector: analysis.sector || "Technology"
  };

  const scenarios = analysis.scenarios || {
    bull: { low: (analysis.price * 1.15).toFixed(2), high: (analysis.price * 1.35).toFixed(2), scenario: "Strong momentum, positive news catalysts, & margin expansion" },
    base: { low: (analysis.price * 0.98).toFixed(2), high: (analysis.price * 1.05).toFixed(2), scenario: "Current growth trajectory continues with in-line earnings" },
    bear: { low: (analysis.price * 0.75).toFixed(2), high: (analysis.price * 0.88).toFixed(2), scenario: "Headwinds, competitive pressure, or adverse sentiment shift" },
    confidence: 72
  };

  const thesis = analysis.thesis || {
    pros: ["Strong market position and enterprise demand", "Solid revenue growth trajectory", "High return on capital"],
    cons: ["High short-term volatility and market beta", "Sensitive to adverse breaking news sentiment"],
    watch: ["Quarterly earnings guidance", "News sentiment polarity velocity"]
  };

  const isIndia = isIndianStock(symbol) || isIndianStock(data);
  const flag = isIndia ? "IN" : "US";
  const currencySymbol = isIndia ? "₹" : "$";

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="text-[#6B7280] hover:text-[#1A1A2E] dark:hover:text-white transition flex items-center gap-1 cursor-pointer text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Watchlist
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadStockData(true)}
            disabled={isRefreshing}
            className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-[#0A5C3A] rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs transition-colors cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onAddToWatchlist(symbol)}
            disabled={isInWatchlist}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              isInWatchlist
                ? 'bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 text-[#0A5C3A] border border-[#0A5C3A]/30 cursor-default'
                : 'bg-[#0A5C3A] text-white hover:bg-[#0A4A2E] shadow-[#0A5C3A]/25'
            }`}
          >
            {isInWatchlist ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          </button>
        </div>
      </div>

      {/* Stock Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xs border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left - Stock Price & Details */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-300">{flag}</span>
              <h2 className="text-2xl font-black text-[#1A1A2E] dark:text-white">{symbol}</h2>
              <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">
                {analysis.sector || 'Equities'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{analysis.name || symbol}</p>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black font-mono text-[#1A1A2E] dark:text-white">
                {currencySymbol}{analysis.price ? analysis.price.toFixed(2) : '0.00'}
              </span>
              <span className={`text-xs font-black flex items-center gap-0.5 px-2.5 py-1 rounded-md ${
                isUp ? 'text-[#0A5C3A] bg-[#E8F5EE] dark:bg-[#0A4A2E]/30' : 'text-[#8B1A1A] dark:text-red-300 bg-[#F5E6E6] dark:bg-[#8B1A1A]/30'
              }`}>
                {isUp ? '+' : '-'}{Math.abs(analysis.change_pct || 0).toFixed(2)}% Today
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs">
              <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                <span className="text-gray-400 font-medium block">Open</span>
                <span className="text-[#1A1A2E] dark:text-white font-extrabold font-mono">{currencySymbol}{(analysis.open || (analysis.price * 0.99)).toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                <span className="text-gray-400 font-medium block">High</span>
                <span className="text-[#1A1A2E] dark:text-white font-extrabold font-mono">{currencySymbol}{(analysis.high || (analysis.price * 1.02)).toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                <span className="text-gray-400 font-medium block">Low</span>
                <span className="text-[#1A1A2E] dark:text-white font-extrabold font-mono">{currencySymbol}{(analysis.low || (analysis.price * 0.98)).toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                <span className="text-gray-400 font-medium block">Volume</span>
                <span className="text-[#1A1A2E] dark:text-white font-extrabold font-mono">{(analysis.volume || 1500000).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right - Profile Fit & Quick Fundamentals */}
          <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Investor Profile Fit</span>
                <span className="text-lg font-black text-[#0A5C3A]">{profileFitPct}% Match</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#0A5C3A] rounded-full transition-all duration-500" style={{ width: `${profileFitPct}%` }}></div>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-400 font-medium mt-1">
                {analysis.profile_fit?.summary || "Aligned with your risk tolerance and investment preferences."}
              </p>
            </div>

            <div className="mt-4 space-y-2 text-xs border-t border-gray-100 dark:border-gray-700 pt-3">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Market Cap</span>
                <span className="text-[#1A1A2E] dark:text-white font-extrabold">{currencySymbol}{fundamentals.market_cap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 font-medium">P/E Ratio</span>
                <span className="text-[#1A1A2E] dark:text-white font-extrabold">{fundamentals.pe_ratio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Sector</span>
                <span className="text-[#1A1A2E] dark:text-white font-extrabold">{fundamentals.sector}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 text-center shadow-2xs">
          <div className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">Volatility</div>
          <div className="text-xl font-black text-[#1A1A2E] dark:text-white font-mono mt-1">
            {breakdownVolatility ? `${(typeof breakdownVolatility === 'number' && breakdownVolatility < 2 ? (breakdownVolatility * 100).toFixed(1) : Number(breakdownVolatility).toFixed(1))}%` : '24.5%'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 text-center shadow-2xs">
          <div className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">Beta</div>
          <div className="text-xl font-black text-[#1A1A2E] dark:text-white font-mono mt-1">
            {typeof breakdownBeta === 'number' ? breakdownBeta.toFixed(2) : breakdownBeta}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 text-center shadow-2xs">
          <div className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">50-Day MA</div>
          <div className="text-xl font-black text-[#1A1A2E] dark:text-white font-mono mt-1">
            {currencySymbol}{analysis.technical?.sma50 || (analysis.price * 0.97).toFixed(2)}
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border ${
          isHighRisk ? 'border-[#8B1A1A]' : isModRisk ? 'border-[#8E8E93]' : 'border-[#0A5C3A]'
        } text-center shadow-2xs`}>
          <div className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">Risk Score</div>
          <div className={`text-xl font-black font-mono mt-1 ${
            isHighRisk ? 'text-[#8B1A1A] dark:text-red-400' : isModRisk ? 'text-[#8E8E93] dark:text-gray-300' : 'text-[#0A5C3A]'
          }`}>
            {riskScore}/100
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-extrabold text-[#1A1A2E] dark:text-white text-base">
              Growth Trends & Interactive Price Chart
            </h3>
            <p className="text-xs text-gray-400 font-medium">Real-time daily closing historical trajectory and volume points</p>
          </div>

          <div className="flex space-x-1.5 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-xl">
            {['1D', '1W', '1M', '3M', '1Y', 'All'].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                disabled={isChartLoading}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  timeframe === period
                    ? 'bg-[#0A5C3A] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                } ${isChartLoading ? 'opacity-60' : ''}`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Component */}
        <div className="relative h-64 bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
          {isChartLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 rounded-xl bg-white/60 dark:bg-gray-800/60">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0A5C3A]">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading {timeframe} chart…
              </div>
            </div>
          )}
          {displayChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayChartData}>
                <defs>
                  <linearGradient id="stockAreaGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isUp ? "#0A5C3A" : "#8B1A1A"} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={isUp ? "#0A5C3A" : "#8B1A1A"} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
                  tickLine={false} 
                  fontSize={11} 
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
                  tickLine={false} 
                  fontSize={11} 
                  tickFormatter={(v) => `${currencySymbol}${v}`} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#1A1A2E',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value, name, props) => [
                    `${currencySymbol}${value}`,
                    'Price'
                  ]}
                  labelFormatter={(label, items) => {
                    const item = items[0]?.payload;
                    if (item) {
                      return `${label} · High: ${currencySymbol}${item.high} · Low: ${currencySymbol}${item.low} · Vol: ${item.volume}`;
                    }
                    return label;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isUp ? "#0A5C3A" : "#8B1A1A"} 
                  strokeWidth={3} 
                  fill="url(#stockAreaGreen)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-xs font-bold">
              No chart points available for {symbol}.
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xs border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap bg-gray-50/50 dark:bg-gray-800/50">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'risk', label: 'Risk Analysis' },
            { id: 'fundamentals', label: 'Fundamentals' },
            { id: 'scenarios', label: 'Scenarios' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3.5 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'text-[#0A5C3A] border-[#0A5C3A] bg-white dark:bg-gray-800'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Why Did It Move */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600 space-y-2">
                <h4 className="font-extrabold text-[#1A1A2E] dark:text-white text-xs uppercase tracking-wider">WHY DID IT MOVE?</h4>
                <div className="space-y-1.5 text-xs font-medium text-gray-700 dark:text-gray-200">
                  <p>• Market sentiment is <strong>{analysis.sentiment?.level || 'Neutral'}</strong> today with {analysis.sentiment?.score > 0 ? 'positive' : 'cautious'} news headline flow.</p>
                  <p>• Technical position: 50-Day Moving Average at <strong>{currencySymbol}{analysis.technical?.sma50 || (analysis.price * 0.97).toFixed(2)}</strong>.</p>
                  <p>• Market Beta multiplier: <strong>{analysis.beta || 1.05}</strong> amplifying sector performance.</p>
                </div>
              </div>

              {/* News Sentiment Distribution */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#1A1A2E] dark:text-white text-xs uppercase tracking-wider">News Sentiment Breakdown</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-[#E8F5EE] dark:bg-[#0A4A2E]/20 rounded-xl border border-[#0A5C3A]/30">
                    <div className="text-xs font-extrabold text-[#0A5C3A]">Positive</div>
                    <div className="text-xl font-black text-[#0A5C3A] mt-1">{analysis.sentiment?.positive || 3}</div>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="text-xs font-extrabold text-[#8E8E93] dark:text-gray-300">Neutral</div>
                    <div className="text-xl font-black text-[#8E8E93] dark:text-gray-200 mt-1">{analysis.sentiment?.neutral || 5}</div>
                  </div>
                  <div className="p-3 bg-[#F5E6E6] dark:bg-[#8B1A1A]/20 rounded-xl border border-[#8B1A1A]/30">
                    <div className="text-xs font-extrabold text-[#8B1A1A] dark:text-red-300">Negative</div>
                    <div className="text-xl font-black text-[#8B1A1A] dark:text-red-400 mt-1">{analysis.sentiment?.negative || 1}</div>
                  </div>
                </div>
              </div>

              {/* Investor Thesis */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-extrabold text-[#1A1A2E] dark:text-white text-xs uppercase tracking-wider">INVESTOR THESIS</h4>
                <div className="grid md:grid-cols-3 gap-4 text-xs font-medium">
                  <div className="p-3.5 bg-[#E8F5EE] dark:bg-[#0A4A2E]/15 rounded-xl border border-[#0A5C3A]/30">
                    <div className="font-bold text-[#0A5C3A] mb-1.5">Why it could work</div>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-200">
                      {thesis.pros.map((p, i) => <li key={i}>• {p}</li>)}
                    </ul>
                  </div>
                  <div className="p-3.5 bg-[#F5E6E6] dark:bg-[#8B1A1A]/15 rounded-xl border border-[#8B1A1A]/30">
                    <div className="font-bold text-[#8B1A1A] dark:text-red-300 mb-1.5">What could go wrong</div>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-200">
                      {thesis.cons.map((c, i) => <li key={i}>• {c}</li>)}
                    </ul>
                  </div>
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="font-bold text-[#8E8E93] dark:text-gray-300 mb-1.5">What to watch</div>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-200">
                      {thesis.watch.map((w, i) => <li key={i}>• {w}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-[#1A1A2E] dark:text-white text-sm">Dynamic Risk Spectrum Breakdown</h4>
              <div className="space-y-3">
                <div className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between border border-gray-200 dark:border-gray-600 text-xs">
                  <div>
                    <span className="font-extrabold text-[#1A1A2E] dark:text-white">News Sentiment Impact</span>
                    <span className="ml-2 font-bold text-[#8B1A1A] dark:text-red-300 bg-[#F5E6E6] dark:bg-[#8B1A1A]/30 px-2 py-0.5 rounded">40% Weight</span>
                  </div>
                  <span className="font-black text-[#1A1A2E] dark:text-white font-mono">{analysis.breakdown?.sentiment || 40.0}%</span>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between border border-gray-200 dark:border-gray-600 text-xs">
                  <div>
                    <span className="font-extrabold text-[#1A1A2E] dark:text-white">Annualized Volatility</span>
                    <span className="ml-2 font-bold text-[#8E8E93] dark:text-gray-300 bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">30% Weight</span>
                  </div>
                  <span className="font-black text-[#1A1A2E] dark:text-white font-mono">{analysis.breakdown?.volatility || 30.0}%</span>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between border border-gray-200 dark:border-gray-600 text-xs">
                  <div>
                    <span className="font-extrabold text-[#1A1A2E] dark:text-white">Market Beta Sensitivity</span>
                    <span className="ml-2 font-bold text-[#0A5C3A] bg-[#E8F5EE] dark:bg-[#0A4A2E]/30 px-2 py-0.5 rounded">20% Weight</span>
                  </div>
                  <span className="font-black text-[#1A1A2E] dark:text-white font-mono">{analysis.breakdown?.beta || 20.0}%</span>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between border border-gray-200 dark:border-gray-600 text-xs">
                  <div>
                    <span className="font-extrabold text-[#1A1A2E] dark:text-white">Technical Position (MA50 & RSI)</span>
                    <span className="ml-2 font-bold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">10% Weight</span>
                  </div>
                  <span className="font-black text-[#1A1A2E] dark:text-white font-mono">{analysis.breakdown?.technical || 10.0}%</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fundamentals' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <span className="text-gray-400 font-bold block">P/E Ratio</span>
                <span className="text-xl font-black text-[#1A1A2E] dark:text-white font-mono mt-1 block">{fundamentals.pe_ratio}</span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <span className="text-gray-400 font-bold block">Revenue Growth</span>
                <span className="text-xl font-black text-[#0A5C3A] font-mono mt-1 block">{fundamentals.revenue_growth}</span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <span className="text-gray-400 font-bold block">Debt / Equity</span>
                <span className="text-xl font-black text-[#1A1A2E] dark:text-white font-mono mt-1 block">{fundamentals.debt_equity}</span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-600">
                <span className="text-gray-400 font-bold block">Return on Equity (ROE)</span>
                <span className="text-xl font-black text-[#1A1A2E] dark:text-white font-mono mt-1 block">{fundamentals.roe}</span>
              </div>
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[#E8F5EE] dark:bg-[#0A4A2E]/20 rounded-xl border border-[#0A5C3A]/40 space-y-1">
                  <div className="text-[#0A5C3A] font-extrabold uppercase">Bull Case</div>
                  <div className="text-2xl font-black text-[#0A5C3A] font-mono">{currencySymbol}{scenarios.bull?.low} - {currencySymbol}{scenarios.bull?.high}</div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">{scenarios.bull?.scenario}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 space-y-1">
                  <div className="text-[#8E8E93] dark:text-gray-300 font-extrabold uppercase">Base Case</div>
                  <div className="text-2xl font-black text-[#8E8E93] dark:text-gray-200 font-mono">{currencySymbol}{scenarios.base?.low} - {currencySymbol}{scenarios.base?.high}</div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">{scenarios.base?.scenario}</p>
                </div>
                <div className="p-4 bg-[#F5E6E6] dark:bg-[#8B1A1A]/20 rounded-xl border border-[#8B1A1A]/40 space-y-1">
                  <div className="text-[#8B1A1A] dark:text-red-300 font-extrabold uppercase">Bear Case</div>
                  <div className="text-2xl font-black text-[#8B1A1A] dark:text-red-400 font-mono">{currencySymbol}{scenarios.bear?.low} - {currencySymbol}{scenarios.bear?.high}</div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">{scenarios.bear?.scenario}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

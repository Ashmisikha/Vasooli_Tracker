import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, RefreshCw, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { fetchMarketIndices } from '../services/api';
import { fetchWithFallback } from '../services/api';

const INDIA_INDICES = ['NIFTY 50', 'SENSEX', 'BANK NIFTY', 'NIFTY IT', 'S&P 500', 'NASDAQ'];
const US_INDICES = ['S&P 500', 'NASDAQ', 'DOW JONES', 'NIFTY 50', 'SENSEX'];
const PERIODS = ['1D', '1W', '1M', '3M', '1Y', 'All'];

const CURRENCY = {
  'NIFTY 50': '₹', 'SENSEX': '₹', 'BANK NIFTY': '₹', 'NIFTY IT': '₹',
  'S&P 500': '$', 'NASDAQ': '$', 'DOW JONES': '$',
};

async function fetchIndexChart(index, period) {
  const res = await fetchWithFallback(
    `/market/indices/chart?index=${encodeURIComponent(index)}&period=${period}`
  );
  if (!res.ok) throw new Error('Chart fetch failed');
  return res.json();
}

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value;
  const formatted = typeof val === 'number' ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : val;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-500 dark:text-gray-400 font-semibold mb-1">{label}</p>
      <p className="text-[#0A5C3A] font-black text-sm">
        {currency}{formatted}
      </p>
    </div>
  );
};

const MarketPerformance = ({ selectedMarket = 'india' }) => {
  const isIndia = selectedMarket === 'india';
  const indexNames = isIndia ? INDIA_INDICES : US_INDICES;
  
  const [indicesMap, setIndicesMap]       = useState({});
  const [chartData, setChartData]         = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(isIndia ? 'NIFTY 50' : 'S&P 500');
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [loading, setLoading]             = useState(true);
  const [chartLoading, setChartLoading]   = useState(false);
  const [lastUpdated, setLastUpdated]     = useState(null);
  const [secondsAgo, setSecondsAgo]       = useState(0);
  const [dataSource, setDataSource]       = useState('');

  // Switch default index when market context changes
  useEffect(() => {
    const defaultIdx = selectedMarket === 'india' ? 'NIFTY 50' : 'S&P 500';
    setSelectedIndex(defaultIdx);
    loadIndices();
    loadChart(defaultIdx, selectedPeriod);
  }, [selectedMarket]);

  // Seconds-ago ticker
  useEffect(() => {
    if (!lastUpdated) return;
    const t = setInterval(() => setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000)), 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  // Fetch index quotes
  const loadIndices = useCallback(async () => {
    try {
      const data = await fetchMarketIndices(selectedMarket);
      if (data && data.indices && Array.isArray(data.indices)) {
        const map = {};
        data.indices.forEach(idx => { map[idx.name] = idx; });
        setIndicesMap(map);
      }
      setLastUpdated(Date.now());
      setSecondsAgo(0);
    } catch (e) {
      console.warn('[MarketPerformance] indices fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedMarket]);

  // Fetch chart data
  const loadChart = useCallback(async (index, period) => {
    setChartLoading(true);
    try {
      const data = await fetchIndexChart(index, period);
      if (data && data.chart && data.chart.length > 0) {
        setChartData(data.chart);
        setDataSource(data.source || '');
      }
    } catch (e) {
      console.warn('[MarketPerformance] chart fetch error:', e);
    } finally {
      setChartLoading(false);
    }
  }, []);

  // Periodic refresh
  useEffect(() => {
    const iv = setInterval(() => { loadIndices(); loadChart(selectedIndex, selectedPeriod); }, 60000);
    return () => clearInterval(iv);
  }, [selectedIndex, selectedPeriod, loadIndices, loadChart]);

  // When user changes index or period
  const handleIndexChange = (name) => {
    setSelectedIndex(name);
    loadChart(name, selectedPeriod);
  };
  const handlePeriodChange = (p) => {
    setSelectedPeriod(p);
    loadChart(selectedIndex, p);
  };
  const handleRefresh = () => {
    loadIndices();
    loadChart(selectedIndex, selectedPeriod);
  };

  const currentIdx = indicesMap[selectedIndex] || null;
  const currency = CURRENCY[selectedIndex] || (isIndia ? '₹' : '$');
  const isUp = currentIdx ? (currentIdx.is_up !== undefined ? currentIdx.is_up : currentIdx.change_pct >= 0) : true;

  const formatPriceDisplay = (val) => {
    if (!val || val === '—' || val === 'N/A') return '—';
    if (typeof val === 'number') return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const cleanStr = String(val).replace(/,/g, '');
    const num = parseFloat(cleanStr);
    if (!isNaN(num)) return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return String(val);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div>
          <h3 className="font-extrabold text-[#1A1A2E] dark:text-white text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0A5C3A]" /> Market Performance
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time live index streaming · {isIndia ? 'Indian Indices' : 'US Indices'}
            {dataSource === 'finnhub_live' && (
              <span className="ml-2 text-[#0A5C3A] font-bold">● LIVE</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Index tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {indexNames.map(name => (
              <button
                key={name}
                onClick={() => handleIndexChange(name)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  selectedIndex === name
                    ? 'bg-[#0A5C3A] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            className="text-xs text-[#0A5C3A] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Current Price', value: currentIdx ? `${currency}${formatPriceDisplay(currentIdx.price)}` : '—',
            sub: currentIdx ? `${isUp ? '+' : ''}${currentIdx.change_pct}%` : '', subColor: isUp ? 'text-[#0A5C3A]' : 'text-red-500' },
          { label: '24h Change', value: currentIdx ? `${isUp ? '+' : ''}${formatPriceDisplay(currentIdx.change)}` : '—',
            sub: isUp ? '▲ Advancing' : '▼ Declining', subColor: isUp ? 'text-[#0A5C3A]' : 'text-red-500' },
          { label: '52W High', value: currentIdx?.fifty_two_week_high ? `${currency}${currentIdx.fifty_two_week_high}` : '—', sub: '', subColor: '' },
          { label: '52W Low',  value: currentIdx?.fifty_two_week_low  ? `${currency}${currentIdx.fifty_two_week_low}`  : '—', sub: '', subColor: '' },
        ].map(({ label, value, sub, subColor }) => (
          <div key={label} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600/60">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</div>
            <div className="text-base font-extrabold text-[#1A1A2E] dark:text-white font-mono">{value}</div>
            {sub && <div className={`text-xs font-bold ${subColor}`}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative w-full rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-2" style={{ height: '260px' }}>
        {chartLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 rounded-xl bg-white/60 dark:bg-gray-800/60">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0A5C3A]">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading chart…
            </div>
          </div>
        )}
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={248}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={isUp ? '#0A5C3A' : '#EF4444'} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={isUp ? '#0A5C3A' : '#EF4444'} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={9}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={9}
                domain={['auto', 'auto']}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${currency}${typeof v === 'number' ? v.toLocaleString() : v}`}
                width={60}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isUp ? '#0A5C3A' : '#EF4444'}
                strokeWidth={2.5}
                fill="url(#chartGrad)"
                isAnimationActive={true}
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          !chartLoading && (
            <div className="h-full flex items-center justify-center text-xs text-gray-400 font-semibold">
              No chart data available
            </div>
          )
        )}
      </div>

      {/* Period Selector */}
      <div className="flex justify-center gap-1 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedPeriod === p
                ? 'bg-[#0A5C3A] text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Footer */}
      {lastUpdated && (
        <div className="mt-2 text-center text-[10px] text-gray-400">
          Updated: {new Date(lastUpdated).toLocaleTimeString()}
          <span className="ml-2 text-[#0A5C3A] font-bold">{secondsAgo}s ago</span>
        </div>
      )}
    </div>
  );
};

export default MarketPerformance;

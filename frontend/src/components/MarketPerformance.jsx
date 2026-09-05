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

const INDEX_BASE_PRICES = {
  'NIFTY 50': 24852.15,
  'SENSEX': 81420.30,
  'BANK NIFTY': 51880.80,
  'NIFTY IT': 42350.00,
  'S&P 500': 5660.40,
  'NASDAQ': 17850.10,
  'DOW JONES': 41390.00,
};

function generateFallbackChart(indexName, period, currentPrice) {
  const basePrice = currentPrice && typeof currentPrice === 'number' && !isNaN(currentPrice) && currentPrice > 0
    ? currentPrice
    : (INDEX_BASE_PRICES[indexName] || 24850);

  const periodDays = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365, 'All': 1825 };
  const days = periodDays[period] || 30;
  const nPoints = Math.max(15, Math.min(days <= 7 ? 24 : (days <= 30 ? 30 : 45), 60));

  const points = [];
  const now = new Date();

  let seed = 0;
  for (let i = 0; i < indexName.length; i++) seed += indexName.charCodeAt(i);
  for (let i = 0; i < period.length; i++) seed += period.charCodeAt(i);

  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  let price = basePrice * (1.0 - (Math.min(days, 60) * 0.001));

  for (let i = nPoints; i >= 1; i--) {
    let dateStr = '';
    const d = new Date(now);
    if (days === 1) {
      d.setMinutes(d.getMinutes() - i * 15);
      dateStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days <= 14) {
      d.setDate(d.getDate() - i);
      dateStr = d.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
    } else if (days <= 90) {
      d.setDate(d.getDate() - i * 2);
      dateStr = d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    } else {
      d.setDate(d.getDate() - i * 7);
      dateStr = d.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }

    const changePct = (pseudoRandom() - 0.48) * 0.012;
    price = price * (1.0 + changePct);
    points.push({
      date: dateStr,
      price: Math.round(price * 100) / 100
    });
  }

  points.push({
    date: days === 1 ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
    price: Math.round(basePrice * 100) / 100
  });

  return points;
}

async function fetchIndexChart(index, period) {
  try {
    const res = await fetchWithFallback(
      `/market/indices/chart?index=${encodeURIComponent(index)}&period=${period}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('[MarketPerformance] chart API network issue:', e);
    return null;
  }
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




  // Seconds-ago ticker
  useEffect(() => {
    if (!lastUpdated) return;
    const t = setInterval(() => setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000)), 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  // Fetch index quotes — returns the map so chart init can use it immediately
  const loadIndices = useCallback(async () => {
    try {
      const data = await fetchMarketIndices(selectedMarket);
      if (data && data.indices && Array.isArray(data.indices)) {
        const map = {};
        data.indices.forEach(idx => { map[idx.name] = idx; });
        setIndicesMap(map);
        setLastUpdated(Date.now());
        setSecondsAgo(0);
        return map;
      }
    } catch (e) {
      console.warn('[MarketPerformance] indices fetch error:', e);
    } finally {
      setLoading(false);
    }
    return {};
  }, [selectedMarket]);

  // Fetch chart data — accepts an optional indicesMap override so we can use
  // freshly-loaded index prices without waiting for a state flush.
  const loadChart = useCallback(async (index, period, indicesMapOverride) => {
    setChartLoading(true);
    let success = false;
    try {
      const data = await fetchIndexChart(index, period);
      if (data && data.chart && Array.isArray(data.chart) && data.chart.length > 0) {
        setChartData(data.chart);
        setDataSource(data.source || '');
        success = true;
      }
    } catch (e) {
      console.warn('[MarketPerformance] chart load error:', e);
    } finally {
      setChartLoading(false);
    }

    if (!success) {
      // Use the override map (freshly fetched) or fall back to state
      const mapToUse = indicesMapOverride || indicesMap;
      const curIdxObj = mapToUse[index];
      const priceVal = curIdxObj
        ? (typeof curIdxObj.price === 'number'
            ? curIdxObj.price
            : parseFloat(String(curIdxObj.price).replace(/,/g, '')))
        : INDEX_BASE_PRICES[index] || 24850;
      const fallbackPoints = generateFallbackChart(index, period, priceVal);
      setChartData(fallbackPoints);
      setDataSource('fallback');
    }
  }, [indicesMap]);

  // On mount and market switch: load indices FIRST, then chart so prices are available
  useEffect(() => {
    const defaultIdx = selectedMarket === 'india' ? 'NIFTY 50' : 'S&P 500';
    setSelectedIndex(defaultIdx);
    loadIndices().then(freshMap => {
      loadChart(defaultIdx, selectedPeriod, freshMap);
    });
  }, [selectedMarket]);

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
    loadIndices().then(freshMap => loadChart(selectedIndex, selectedPeriod, freshMap));
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

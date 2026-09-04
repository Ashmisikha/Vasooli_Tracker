import React, { useState } from 'react';
import { Columns, Check, Zap, Info } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

const STOCK_COLORS = ['#DC2626', '#2563EB', '#059669', '#7C3AED', '#D97706'];

export default function StockComparison({ watchlist = [] }) {
  const [selectedSymbols, setSelectedSymbols] = useState(
    watchlist.slice(0, 3).map(s => s.symbol)
  );

  const toggleSymbol = (sym) => {
    if (selectedSymbols.includes(sym)) {
      if (selectedSymbols.length > 1) {
        setSelectedSymbols(selectedSymbols.filter(s => s !== sym));
      }
    } else {
      if (selectedSymbols.length < 5) {
        setSelectedSymbols([...selectedSymbols, sym]);
      }
    }
  };

  const selectedStocks = watchlist.filter(s => selectedSymbols.includes(s.symbol));

  // Synthesize multi-stock historical line data for Recharts
  const chartData = [];
  if (selectedStocks.length > 0) {
    const days = 14;
    const now = new Date();
    for (let i = days; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const row = { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
      
      selectedStocks.forEach(st => {
        const base = st.price || 100;
        const changePct = st.change_pct || 0;
        const drift = (days - i) * (changePct / (days || 1));
        row[st.symbol] = Number((base * (1 + drift / 100)).toFixed(2));
      });
      chartData.push(row);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Selector Header */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-card-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#1A2332] flex items-center gap-2">
              <Columns className="w-5 h-5 text-[#2563EB]" />
              MULTI-STOCK COMPARISON MATRIX
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 font-medium">
              Select up to 5 stocks to compare price trends, 4-factor risk scores, and sentiment profiles
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
            {selectedSymbols.length} Selected
          </span>
        </div>

        {/* Ticker Selector Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {watchlist.map((item) => {
            const isSelected = selectedSymbols.includes(item.symbol);
            return (
              <button
                key={item.symbol}
                onClick={() => toggleSymbol(item.symbol)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#1A2332] hover:bg-[#EFF6FF]'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{item.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Stock Line Chart */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-card-soft space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          14-Day Comparative Price Trajectory
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {selectedStocks.map((st, idx) => (
                <Line
                  key={st.symbol}
                  type="monotone"
                  dataKey={st.symbol}
                  stroke={STOCK_COLORS[idx % STOCK_COLORS.length]}
                  strokeWidth={2.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedStocks.map((st, idx) => {
          const risk = st.risk_score || 50;
          const sentLevel = st.sentiment?.level || 'Neutral';
          const action = st.recommendation?.action || 'CAUTION';

          let riskBadgeClass = 'text-[#059669] bg-[#ECFDF5] border-[#059669]/30';
          if (risk >= 60) riskBadgeClass = 'text-[#DC2626] bg-[#FEF2F2] border-[#DC2626]/30';
          else if (risk >= 40) riskBadgeClass = 'text-[#D97706] bg-[#FFFBEB] border-[#D97706]/30';

          return (
            <div 
              key={st.symbol} 
              className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-card-soft space-y-3 relative overflow-hidden"
              style={{ borderTop: `4px solid ${STOCK_COLORS[idx % STOCK_COLORS.length]}` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-[#1A2332]">{st.symbol}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${riskBadgeClass}`}>
                  Risk {risk}/100
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-[#F1F5F9]">
                <div className="flex justify-between">
                  <span className="text-[#64748B] font-sans">Price:</span>
                  <span className="font-bold text-[#1A2332]">${(st.price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B] font-sans">24h Change:</span>
                  <span className={(st.change_pct || 0) >= 0 ? 'text-[#059669] font-bold' : 'text-[#DC2626] font-bold'}>
                    {(st.change_pct || 0) >= 0 ? `+${st.change_pct}%` : `${st.change_pct}%`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B] font-sans">Sentiment:</span>
                  <span className="font-sans font-bold text-[#1A2332]">{sentLevel}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#F1F5F9]">
                  <span className="text-[#64748B] font-sans">Signal:</span>
                  <span className="font-sans font-black text-[#2563EB] uppercase">{action}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

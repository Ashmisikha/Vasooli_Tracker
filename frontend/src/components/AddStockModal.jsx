import React, { useState } from 'react';
import { X, Plus, Search, Sparkles, AlertCircle } from 'lucide-react';

const POPULAR_SUGGESTIONS = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors' },
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Consumer Electronics' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Clean Energy & Auto' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Software & Cloud' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', sector: 'E-Commerce & Cloud' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Internet & AI' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', sector: 'Social Media & VR' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Semiconductors' },
  { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Data & Defense' },
  { symbol: 'COIN', name: 'Coinbase Global', sector: 'Crypto Exchange' }
];

export default function AddStockModal({ isOpen, onClose, onAddStock }) {
  const [symbol, setSymbol] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const cleanSym = symbol.trim().toUpperCase();
    if (!cleanSym) {
      setError('Please enter a valid stock ticker.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onAddStock(cleanSym, notes, tags);
      setSymbol('');
      setNotes('');
      setTags('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add stock to watchlist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestedSym) => {
    setSymbol(suggestedSym);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Add Stock to Watchlist</h3>
              <p className="text-xs text-slate-400">Real-time risk scoring and sentiment scan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Symbol Input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Stock Symbol (Ticker)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. AMD, META, PLTR..."
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase transition-colors"
              />
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-2">
              Quick Add Popular Equities
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SUGGESTIONS.map((item) => (
                <button
                  type="button"
                  key={item.symbol}
                  onClick={() => handleSelectSuggestion(item.symbol)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    symbol === item.symbol
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  {item.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Tags (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Growth, AI, LongTerm (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Investment Notes (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Thesis or target rationale..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !symbol.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Scanning & Scoring...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>Add & Analyze</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

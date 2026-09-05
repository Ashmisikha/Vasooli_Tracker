import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Watchlist from './pages/Watchlist';
import Market from './pages/Market';
import NewsFeed from './pages/NewsFeed';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import RiskAnalysis from './pages/RiskAnalysis';
import StockDetail from './pages/StockDetail';
import AddStockModal from './components/modals/AddStockModal';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';

import { 
  fetchWatchlist, 
  fetchPortfolioSummary, 
  addStockToWatchlist, 
  removeStockFromWatchlist 
} from './services/api';

const DEFAULT_WATCHLIST_ITEMS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', company: 'Reliance Industries', price: 2450.0, change: 0.8, change_pct: 0.8, risk_score: 35, sector: 'Energy' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', company: 'Tata Consultancy Services', price: 3520.0, change: -0.4, change_pct: -0.4, risk_score: 42, sector: 'Technology' },
  { symbol: 'INFY.NS', name: 'Infosys Limited', company: 'Infosys Limited', price: 1480.0, change: 1.2, change_pct: 1.2, risk_score: 40, sector: 'Technology' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', company: 'HDFC Bank', price: 712.10, change: 5.2, change_pct: 0.74, risk_score: 38, sector: 'Financial' },
  { symbol: 'AAPL', name: 'Apple Inc.', company: 'Apple Inc.', price: 185.5, change: 0.5, change_pct: 0.5, risk_score: 30, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', company: 'NVIDIA Corp', price: 460.2, change: 2.4, change_pct: 2.4, risk_score: 65, sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', company: 'Tesla Inc.', price: 248.5, change: -1.1, change_pct: -1.1, risk_score: 55, sector: 'EV/Auto' }
];

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem('vasooli_watchlist_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_WATCHLIST_ITEMS;
  });
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState('india');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const getPageIdFromPath = (path) => {
    if (path.startsWith('/watchlist')) return 'watchlist';
    if (path.startsWith('/risk-analysis') || path.startsWith('/analysis') || path.startsWith('/analyze') || path.startsWith('/market-analysis')) return 'risk-analysis';
    if (path.startsWith('/market')) return 'market';
    if (path.startsWith('/news')) return 'news';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/stock')) return '';
    return 'dashboard';
  };

  const currentPage = getPageIdFromPath(location.pathname);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [wlData, sumData] = await Promise.all([
        fetchWatchlist(),
        fetchPortfolioSummary()
      ]);
      const fetchedWl = wlData.watchlist || wlData.data || [];
      if (Array.isArray(fetchedWl) && fetchedWl.length > 0) {
        setWatchlist(fetchedWl);
        try { localStorage.setItem('vasooli_watchlist_state', JSON.stringify(fetchedWl)); } catch (e) {}
      }
      setPortfolioSummary(sumData);
    } catch (err) {
      console.error('Failed to load Vasooli Tracker data:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    try {
      await loadData(true);
      showNotification('Refreshed Vasooli Tracker live data & risk scores!', 'success');
    } catch (err) {
      showNotification('Failed to refresh data', 'error');
    } finally {
      setIsRefreshingAll(false);
    }
  };

  const handleAddStock = async (symbol) => {
    const cleanSym = symbol.trim().toUpperCase();
    
    // Optimistically update React state immediately
    setWatchlist((prev) => {
      const exists = prev.some((s) => s.symbol.toUpperCase() === cleanSym);
      if (exists) return prev;
      const newStock = {
        symbol: cleanSym,
        name: cleanSym,
        company: cleanSym,
        price: 150.0,
        change: 0.5,
        change_pct: 0.5,
        risk_score: 42,
        sector: 'Equities'
      };
      const updated = [newStock, ...prev];
      try { localStorage.setItem('vasooli_watchlist_state', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    try {
      showNotification(`Added ${cleanSym} to Vasooli Tracker!`, 'success');
      setIsAddModalOpen(false);
      await addStockToWatchlist(cleanSym);
      await loadData(true);
    } catch (err) {
      console.warn('Background sync warning for add stock:', err);
    }
  };

  const handleRemoveStock = async (symbol) => {
    const cleanSym = symbol.trim().toUpperCase();
    
    setWatchlist((prev) => {
      const updated = prev.filter((s) => s.symbol.toUpperCase() !== cleanSym);
      try { localStorage.setItem('vasooli_watchlist_state', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    try {
      showNotification(`Removed ${cleanSym} from watchlist`, 'success');
      await removeStockFromWatchlist(cleanSym);
      await loadData(true);
    } catch (err) {
      console.warn('Background sync warning for remove stock:', err);
    }
  };

  const handleSelectStock = (symbol) => {
    navigate(`/stock/${symbol}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page) => {
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'watchlist') navigate('/watchlist');
    else if (page === 'market') navigate('/market');
    else if (page === 'news') navigate('/news');
    else if (page === 'settings') navigate('/settings');
    else if (page === 'profile') navigate('/profile');
    else if (page === 'risk-analysis' || page === 'analysis' || page === 'analyze' || page === 'market-analysis') navigate('/risk-analysis');
    else navigate('/dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-[#1A1A2E] dark:text-gray-100 transition-colors duration-200 w-full">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-extrabold flex items-center gap-2 animate-bounce ${
          notification.type === 'error' ? 'bg-[#F5E6E6] text-[#8B1A1A] border-[#8B1A1A]/30' : 'bg-[#E8F5EE] text-[#0A5C3A] border-[#0A5C3A]/30'
        }`}>
          <span>{notification.type === 'error' ? <AlertCircle className="w-4 h-4 text-[#8B1A1A]" /> : <CheckCircle className="w-4 h-4 text-[#0A5C3A]" />}</span>
          {notification.message}
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 text-[#0A5C3A] border border-[#0A5C3A]/30 uppercase tracking-wider">
              Vasooli Tracker
            </span>

            {/* Data Freshness Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0A5C3A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0A5C3A]"></span>
              </span>
              <span className="text-[#1A1A2E] dark:text-gray-200 font-mono">Market Open · Live Data</span>
            </div>

            {/* Market Context Dropdown */}
            <div className="hidden sm:flex items-center">
              <select 
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 text-[#1A1A2E] dark:text-gray-200 text-xs font-extrabold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0A5C3A] cursor-pointer"
              >
                <option value="india">India (NSE / BSE)</option>
                <option value="us">United States (NYSE / NASDAQ)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 text-sm bg-[#0A5C3A] hover:bg-[#0A4A2E] text-white rounded-lg font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#0A5C3A]/25"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>
          </div>
        </header>

        {/* Main Content Router */}
        <main className="p-6 flex-1">
          <Routes>
            <Route 
              path="/dashboard" 
              element={
                <Dashboard 
                  selectedMarket={selectedMarket}
                  onNavigate={handleNavigate}
                  onSelectStock={handleSelectStock}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              } 
            />
            <Route 
              path="/watchlist" 
              element={
                <Watchlist 
                  watchlist={watchlist}
                  onAnalyzeStock={handleSelectStock}
                  onRemoveStock={handleRemoveStock}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onRefreshAll={handleRefreshAll}
                  isRefreshing={isRefreshingAll}
                />
              } 
            />
            <Route 
              path="/market" 
              element={
                <Market 
                  selectedMarket={selectedMarket}
                  onAnalyzeStock={handleSelectStock} 
                  onAddStock={handleAddStock} 
                />
              } 
            />
            <Route 
              path="/news" 
              element={<NewsFeed onSelectStock={handleSelectStock} />} 
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/risk-analysis" element={<RiskAnalysis onSelectStock={handleSelectStock} watchlist={watchlist} />} />
            <Route path="/analysis" element={<RiskAnalysis onSelectStock={handleSelectStock} watchlist={watchlist} />} />
            <Route path="/analyze" element={<RiskAnalysis onSelectStock={handleSelectStock} watchlist={watchlist} />} />
            <Route path="/market-analysis" element={<RiskAnalysis onSelectStock={handleSelectStock} watchlist={watchlist} />} />
            <Route 
              path="/stock/:symbol" 
              element={
                <StockDetail 
                  onAddToWatchlist={handleAddStock}
                  isInWatchlist={watchlist.some(s => s.symbol === location.pathname.split('/')[2])}
                  onBack={() => navigate('/watchlist')}
                />
              } 
            />
          </Routes>
        </main>
      </div>

      {/* Add Stock Modal with Auto-Recommendations */}
      {isAddModalOpen && (
        <AddStockModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddStock}
          onAddStock={handleAddStock}
          defaultMarket={selectedMarket}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

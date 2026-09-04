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

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [watchlist, setWatchlist] = useState([]);
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
      setWatchlist(wlData.watchlist || wlData.data || []);
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
    try {
      await addStockToWatchlist(symbol);
      showNotification(`Added ${symbol} to Vasooli Tracker!`, 'success');
      setIsAddModalOpen(false);
      await loadData(true);
    } catch (err) {
      showNotification(err.message || `Failed to add ${symbol}`, 'error');
    }
  };

  const handleRemoveStock = async (symbol) => {
    try {
      await removeStockFromWatchlist(symbol);
      showNotification(`Removed ${symbol} from watchlist`, 'success');
      await loadData(true);
    } catch (err) {
      showNotification(err.message || `Failed to remove ${symbol}`, 'error');
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

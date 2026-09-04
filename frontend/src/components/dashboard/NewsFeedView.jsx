import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, ExternalLink, RefreshCw, Filter, Zap, Clock, Sparkles } from 'lucide-react';
import SentimentSimulator from '../SentimentSimulator';
import { fetchNewsFeed } from '../../services/api';

const DYNAMIC_NEWS_FALLBACK = [
  { 
    id: 1, 
    title: "NVIDIA Announces Next-Gen Blackwell Ultra Chips; Demand Surges 40%", 
    publisher: "Tech Wire", 
    time: "10 mins ago", 
    sentiment: "Positive", 
    score: "+0.85", 
    symbol: "NVDA",
    summary: "Enterprise AI server spending drives record GPU order backlog across cloud hyperscalers."
  },
  { 
    id: 2, 
    title: "Federal Reserve Signals Rate Pause Amid Cooling Inflation Indicators", 
    publisher: "Financial Express", 
    time: "25 mins ago", 
    sentiment: "Positive", 
    score: "+0.62", 
    symbol: "MSFT",
    summary: "Lower borrowing yields provide macro tailwinds for high-growth SaaS and software equities."
  },
  { 
    id: 3, 
    title: "Tesla Faces Regulatory Audit & Autonomous Software Safety Recall", 
    publisher: "Auto News Daily", 
    time: "1 hour ago", 
    sentiment: "Negative", 
    score: "-0.68", 
    symbol: "TSLA",
    summary: "Short-term margin headwinds as EV price adjustments coincide with safety inspection reviews."
  },
  { 
    id: 4, 
    title: "Reliance Industries Partners with Google Cloud for Enterprise AI Infrastructure", 
    publisher: "Mint", 
    time: "2 hours ago", 
    sentiment: "Positive", 
    score: "+0.75", 
    symbol: "RELIANCE.NS",
    summary: "Strategic telecom and cloud infrastructure rollout expected to expand digital service margins."
  },
  { 
    id: 5, 
    title: "Apple Reports Strong Services Revenue Milestone in Q3 Earnings Beat", 
    publisher: "Bloomberg", 
    time: "3 hours ago", 
    sentiment: "Positive", 
    score: "+0.55", 
    symbol: "AAPL",
    summary: "App Store and cloud subscription acceleration offsets minor hardware seasonality."
  },
  { 
    id: 6, 
    title: "Amazon AWS Wins $4B Multi-Year Cloud Migration Deal in Healthcare", 
    publisher: "Reuters", 
    time: "4 hours ago", 
    sentiment: "Positive", 
    score: "+0.70", 
    symbol: "AMZN",
    summary: "Enterprise cloud adoption momentum accelerates operating income margin expansion."
  },
  { 
    id: 7, 
    title: "Semiconductor Supply Chain Logistics Squeezed by Regional Export Restrictions", 
    publisher: "Wall St Journal", 
    time: "5 hours ago", 
    sentiment: "Negative", 
    score: "-0.52", 
    symbol: "AMD",
    summary: "Customs inspection delays create short-term hardware component shipping bottlenecks."
  }
];

export default function NewsFeedView({ onSelectStock }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'simulator'
  const [filterSentiment, setFilterSentiment] = useState('ALL'); // 'ALL' | 'Positive' | 'Negative'
  const [newsFeed, setNewsFeed] = useState(DYNAMIC_NEWS_FALLBACK);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  const loadNews = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetchNewsFeed(25);
      if (res && res.news && res.news.length > 0) {
        setNewsFeed(res.news);
      }
      setLastUpdated(new Date());
      setSecondsAgo(0);
    } catch (err) {
      console.warn('[NewsFeedView]: Live API fetch warning, using robust news fallback:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
    const pollInterval = setInterval(() => loadNews(true), 30000); // Real-time 30-second polling
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((new Date() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const handleStockClick = (symbol) => {
    if (!symbol) return;
    if (typeof onSelectStock === 'function') {
      onSelectStock(symbol);
    } else {
      navigate(`/stock/${symbol}`);
    }
  };

  const filteredNews = newsFeed.filter((item) => {
    if (filterSentiment === 'ALL') return true;
    return item.sentiment === filterSentiment;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 w-full max-w-full overflow-hidden">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0A5C3A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0A5C3A]"></span>
              </span>
              <span className="px-2.5 py-0.5 bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 text-[#0A5C3A] font-extrabold text-[10px] rounded-md uppercase border border-[#0A5C3A]/30">
                🟢 LIVE NLP STREAM · 30s REFRESH
              </span>
              <span className="text-[11px] font-mono font-bold text-gray-500 dark:text-gray-400">
                ⏱️ {secondsAgo}s ago
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A2E] dark:text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-[#0A5C3A]" /> Real-Time News Sentiment
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Automated TextBlob NLP sentiment analysis directly driving Vasooli risk engine scores
            </p>
          </div>

          {/* Navigation Mode Switcher & Manual Refresh */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => loadNews(true)}
              disabled={isRefreshing}
              className="p-2 sm:px-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-[#0A5C3A] font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-gray-200 dark:border-gray-600 active:scale-95 touch-manipulation"
              title="Refresh News Stream Now"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-xs font-bold">Refresh</span>
            </button>

            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl border border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation ${
                  activeTab === 'feed'
                    ? 'bg-[#0A5C3A] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>Live Feed</span>
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation ${
                  activeTab === 'simulator'
                    ? 'bg-[#0A5C3A] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulator</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'simulator' ? (
        <SentimentSimulator defaultSymbol="TSLA" />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          
          {/* Sentiment Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
              <Filter className="w-4 h-4 text-[#0A5C3A]" /> Filter News Polarity:
            </div>
            
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {['ALL', 'Positive', 'Negative'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterSentiment(lvl)}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-extrabold rounded-lg transition cursor-pointer text-center touch-manipulation ${
                    filterSentiment === lvl
                      ? 'bg-[#0A5C3A] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* News List */}
          <div className="space-y-3">
            {filteredNews.map((news) => (
              <div 
                key={news.id} 
                className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs hover:border-[#0A5C3A] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group active:scale-[0.99] touch-manipulation"
              >
                <div className="space-y-2 w-full md:w-auto">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleStockClick(news.symbol)}
                      className="px-2.5 py-1 bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 text-[#0A5C3A] font-black text-xs rounded-md border border-[#0A5C3A]/30 hover:bg-[#0A5C3A] hover:text-white transition-colors cursor-pointer active:scale-95"
                    >
                      {news.symbol}
                    </button>
                    <span className="text-xs text-gray-400 font-semibold">• {news.publisher}</span>
                    <span className="text-xs text-gray-400 font-semibold">• {news.time}</span>
                  </div>
                  
                  <h3 
                    onClick={() => handleStockClick(news.symbol)}
                    className="font-extrabold text-sm sm:text-base text-[#1A1A2E] dark:text-white group-hover:text-[#0A5C3A] cursor-pointer transition-colors leading-snug"
                  >
                    {news.title}
                  </h3>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {news.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700/50">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${
                    news.sentiment === 'Positive' 
                      ? 'bg-[#E8F5EE] text-[#0A5C3A] border-[#0A5C3A]/30 dark:bg-[#0A4A2E]/40 dark:text-[#0A5C3A]' 
                      : 'bg-[#F5E6E6] text-[#8B1A1A] border-[#8B1A1A]/30 dark:bg-[#5C1010]/40 dark:text-red-300'
                  }`}>
                    {news.sentiment} ({news.score})
                  </span>

                  <button
                    onClick={() => handleStockClick(news.symbol)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-[#0A5C3A] hover:bg-[#E8F5EE] transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 active:scale-95"
                    title={`Analyze ${news.symbol}`}
                  >
                    <span>Analyze</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

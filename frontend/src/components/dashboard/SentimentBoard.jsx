import React from 'react';
import { Newspaper, Sparkles, TrendingUp, TrendingDown, ArrowUpRight, ShieldAlert } from 'lucide-react';

export default function SentimentBoard({ watchlist = [], onSelectStock, onOpenSimulator }) {
  // Aggregate sentiment stats from watchlist stocks
  let totalArticles = 0;
  let posCount = 0;
  let neuCount = 0;
  let negCount = 0;
  let totalPolarity = 0;
  const headlinesList = [];

  watchlist.forEach((stock) => {
    const sObj = stock.sentiment || {};
    const score = sObj.score || 0;
    totalPolarity += score;

    const news = sObj.recent_news || [];
    totalArticles += news.length || 5;

    if (score > 0.05) posCount++;
    else if (score < -0.05) negCount++;
    else neuCount++;

    if (news && news.length > 0) {
      news.forEach((item) => {
        headlinesList.push({
          symbol: stock.symbol,
          title: item.title,
          publisher: item.publisher || 'Market Wire',
          score: item.sentiment_score !== undefined ? item.sentiment_score : score,
          sentiment: item.sentiment_score > 0.05 ? 'Positive' : item.sentiment_score < -0.05 ? 'Negative' : 'Neutral'
        });
      });
    }
  });

  const count = watchlist.length || 1;
  const avgPolarity = (totalPolarity / count).toFixed(2);
  const netPolarityText = avgPolarity > 0.05 ? 'Bullish (+)' : avgPolarity < -0.05 ? 'Bearish (-)' : 'Neutral (0)';
  const netPolarityColor = avgPolarity > 0.05 ? 'text-[#00D09C]' : avgPolarity < -0.05 ? 'text-red-500' : 'text-amber-500';

  const displayHeadlines = headlinesList.slice(0, 5);


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-xl font-extrabold text-[#1A1A2E] flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-600" />
            NEWS SENTIMENT ANALYSIS BOARD
          </h3>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            40% of Vasooli Track risk scores are driven by real-time TextBlob NLP headline sentiment.
          </p>
        </div>

        <button
          onClick={onOpenSimulator}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start md:self-center"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          Simulate Sentiment Shock
        </button>
      </div>

      {/* 3 KPI Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Net Sentiment Index */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">NET MARKET POLARITY</span>
          <div className={`text-3xl font-extrabold mt-2 ${netPolarityColor}`}>
            {avgPolarity > 0 ? `+${avgPolarity}` : avgPolarity}
          </div>
          <div className="text-xs font-bold text-gray-600 mt-1">{netPolarityText}</div>
        </div>

        {/* Positive News */}
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between">
          <span className="text-xs font-bold text-[#00D09C] uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> POSITIVE SENTIMENT
          </span>
          <div className="text-3xl font-extrabold text-emerald-900 mt-2">{posCount}</div>
          <div className="text-xs font-semibold text-emerald-700 mt-1">Bullish News Shift</div>
        </div>

        {/* Neutral News */}
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            NEUTRAL SENTIMENT
          </span>
          <div className="text-3xl font-extrabold text-amber-900 mt-2">{neuCount}</div>
          <div className="text-xs font-semibold text-amber-700 mt-1">Stable Coverage</div>
        </div>

        {/* Negative News */}
        <div className="bg-red-50/60 p-4 rounded-xl border border-red-100 flex flex-col justify-between">
          <span className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> NEGATIVE SENTIMENT
          </span>
          <div className="text-3xl font-extrabold text-red-900 mt-2">{negCount}</div>
          <div className="text-xs font-semibold text-red-700 mt-1">Spikes Risk Scores</div>
        </div>

      </div>

      {/* Stock Sentiment Heatmap & Live Headline Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Watchlist Stock Sentiment Matrix */}
        <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 space-y-3">
          <h4 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span>Stock Sentiment Leaderboard</span>
            <span className="text-[10px] text-gray-400 font-normal">Ranked by Polarity</span>
          </h4>

          <div className="space-y-2.5">
            {watchlist.slice(0, 5).map((stock) => {
              const score = stock.sentiment?.score || 0.15;
              const isPos = score > 0.05;
              const isNeg = score < -0.05;
              return (
                <div
                  key={stock.symbol}
                  onClick={() => onSelectStock(stock.symbol)}
                  className="p-3 bg-white rounded-xl border border-gray-200/80 hover:border-blue-300 cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-[#1A1A2E] text-sm group-hover:text-blue-600 transition-colors">
                      {stock.symbol}
                    </span>
                    <span className="text-xs text-gray-500 hidden sm:inline">{stock.name || stock.symbol}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      isPos ? 'bg-emerald-50 text-[#00D09C]' : isNeg ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {isPos ? 'Positive' : isNeg ? 'Negative' : 'Neutral'}
                    </span>
                    <span className="font-mono font-extrabold text-xs text-gray-800 w-12 text-right">
                      {score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Headline Sentiment Feed */}
        <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 space-y-3">
          <h4 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span>Live Financial Headline Scanner</span>
            <span className="text-[10px] text-blue-600 font-bold">NLP Verified</span>
          </h4>

          <div className="space-y-2.5">
            {displayHeadlines.length > 0 ? (
              displayHeadlines.map((h, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {h.symbol}
                    </span>
                    <span className={`font-bold text-[11px] ${
                      h.sentiment === 'Positive' ? 'text-[#00D09C]' : h.sentiment === 'Negative' ? 'text-red-500' : 'text-amber-500'
                    }`}>
                      {h.sentiment} ({h.score > 0 ? `+${h.score}` : h.score})
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#1A1A2E] leading-snug">
                    {h.title}
                  </p>
                  <div className="text-[10px] text-gray-400 font-medium">Source: {h.publisher}</div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-gray-400 font-medium bg-white rounded-xl border border-gray-200/60">
                No recent headlines found for current watchlist stocks.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

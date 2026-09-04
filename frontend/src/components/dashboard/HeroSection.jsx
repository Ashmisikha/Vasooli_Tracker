import React from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  ShieldCheck, 
  Newspaper, 
  Sparkles, 
  Info,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection({ summary }) {
  if (!summary) return null;

  const currentHour = new Date().getHours();
  let greeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good Afternoon';
  } else if (currentHour >= 17) {
    greeting = 'Good Evening';
  }

  const total = summary.total_tracked || 0;
  const avgRisk = summary.avg_risk_score || 0;
  const highRiskCount = summary.recommendations?.AVOID || 0;
  const lowRiskCount = summary.recommendations?.BUY || 0;
  const positiveNews = summary.sentiment_distribution?.positive || 0;
  const negativeNews = summary.sentiment_distribution?.negative || 0;
  const neutralNews = summary.sentiment_distribution?.neutral || 0;
  const totalNews = positiveNews + negativeNews + neutralNews;

  return (
    <div className="space-y-6 mb-8">
      {/* Vasooli Track Greeting Banner */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8EBEF] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-[#1A1A2E]">{greeting}, Investor!</span>
          </div>
          <p className="text-xs text-[#666D80] mt-1 font-medium">
            Welcome to <strong className="text-[#00D09C]">Vasooli Track</strong> — Sentiment-Powered Risk Engine (40% News Sentiment Weighting)
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#00D09C]/10 border border-[#00D09C]/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D09C] animate-pulse"></span>
            <span className="text-xs font-bold text-[#00D09C]">Vasooli NLP Engine Active</span>
          </div>
        </div>
      </div>

      {/* 4 Groww Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stocks */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-5 rounded-2xl card-groww space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#666D80]">
            <span>TOTAL STOCKS</span>
            <div className="w-8 h-8 rounded-lg bg-[#00D09C]/10 text-[#00D09C] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1A1A2E] font-mono tracking-tight">
            {total}
            <span className="text-xs font-normal text-[#666D80] ml-2">Equities</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#00D09C] font-bold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +2.4%
            </span>
            <span className="text-[#666D80]">Avg: <strong className="text-[#1A1A2E] font-mono">{avgRisk}/100</strong></span>
          </div>
        </motion.div>

        {/* High Risk Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="p-5 rounded-2xl card-groww bg-gradient-to-b from-[#FEF2F2]/60 to-white border-[#EF4444]/30 space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#666D80]">
            <span>HIGH RISK STOCKS</span>
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#EF4444] font-mono tracking-tight flex items-baseline gap-2">
            {highRiskCount}
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 uppercase">
              AVOID
            </span>
          </div>
          <p className="text-[11px] text-[#EF4444] font-medium">
            Need Action (&gt;60)
          </p>
        </motion.div>

        {/* Low Risk Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="p-5 rounded-2xl card-groww bg-gradient-to-b from-[#E6F9F4]/60 to-white border-[#00D09C]/30 space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#666D80]">
            <span>LOW RISK STOCKS</span>
            <div className="w-8 h-8 rounded-lg bg-[#00D09C]/10 text-[#00D09C] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#00D09C] font-mono tracking-tight flex items-baseline gap-2">
            {lowRiskCount}
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/20 uppercase">
              BUY
            </span>
          </div>
          <p className="text-[11px] text-[#00D09C] font-medium">
            Safe Profile (&lt;40)
          </p>
        </motion.div>

        {/* News Analyzed Today */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="p-5 rounded-2xl card-groww space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#666D80]">
            <span>NEWS ARTICLES TODAY</span>
            <div className="w-8 h-8 rounded-lg bg-[#4A6CF7]/10 text-[#4A6CF7] flex items-center justify-center">
              <Newspaper className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1A1A2E] font-mono tracking-tight">
            {totalNews > 0 ? totalNews : 45}
            <span className="text-xs font-normal text-[#666D80] ml-2">Headlines</span>
          </div>
          <p className="text-[11px] text-[#4A6CF7] font-medium">
            Trending News Feed
          </p>
        </motion.div>

      </div>

      {/* Groww Formula Callout Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#E6F9F4] via-[#F5F7FA] to-[#E6F9F4] border border-[#00D09C]/30 flex items-start gap-3 text-xs text-[#1A1A2E]">
        <div className="p-1.5 rounded-lg bg-[#00D09C]/20 text-[#00D09C] shrink-0 font-bold">
          <Zap className="w-4 h-4" />
        </div>
        <div className="leading-relaxed font-medium">
          <strong className="text-[#00D09C]">Groww 4-Factor Risk Model:</strong> Risk Score = 
          <span className="text-[#00D09C] font-bold"> (40% News Sentiment)</span> + 
          <span className="text-[#4A6CF7] font-bold"> (30% Volatility)</span> + 
          <span className="text-[#F97316] font-bold"> (20% Beta)</span> + 
          <span className="text-[#059669] font-bold"> (10% Technical Position)</span>. 
          Real-time news shifts immediately spike vulnerability scores.
        </div>
      </div>
    </div>
  );
}

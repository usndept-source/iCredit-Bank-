
import React, { useState, useEffect } from 'react';
import { getFinancialNews, getCountryBankingTip, BankingTipResult } from '../services/geminiService.ts';
import { NewsArticle, Country } from '../types.ts';
import { ALL_COUNTRIES } from '../constants.ts';
import { SpinnerIcon, InfoIcon, StarIcon, LightBulbIcon, GlobeAmericasIcon, TrendingUpIcon, SparklesIcon, ArrowRightIcon } from './Icons.tsx';

// Simulated Ticker Data
const TICKER_DATA = [
  { symbol: 'S&P 500', price: '5,234.18', change: '+0.45%', up: true },
  { symbol: 'NASDAQ', price: '16,389.22', change: '+0.82%', up: true },
  { symbol: 'EUR/USD', price: '1.0845', change: '-0.12%', up: false },
  { symbol: 'GBP/USD', price: '1.2635', change: '+0.05%', up: true },
  { symbol: 'BTC/USD', price: '68,420.00', change: '+2.15%', up: true },
  { symbol: 'ETH/USD', price: '3,550.12', change: '+1.05%', up: true },
  { symbol: 'Gold', price: '2,345.80', change: '+0.30%', up: true },
  { symbol: 'Oil (WTI)', price: '81.25', change: '-0.45%', up: false },
  { symbol: 'US 10Y', price: '4.25%', change: '+0.02%', up: true },
];

const MarketTickerItem: React.FC<{ symbol: string; price: string; change: string; up: boolean }> = ({ symbol, price, change, up }) => (
  <div className="flex items-center space-x-2 px-4 border-r border-white/10 last:border-0 whitespace-nowrap">
    <span className="font-bold text-slate-300">{symbol}</span>
    <span className="text-slate-100">{price}</span>
    <span className={`text-xs font-medium ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? '▲' : '▼'} {change}
    </span>
  </div>
);

const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <div className="group relative bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 hover:border-white/20 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer overflow-hidden">
    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowRightIcon className="w-5 h-5 text-primary-400" />
    </div>
    <div className="mb-3">
      <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 rounded-full">
        {article.category}
      </span>
    </div>
    <h4 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2 group-hover:text-primary-300 transition-colors">
      {article.title}
    </h4>
    <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
      {article.summary}
    </p>
  </div>
);

const BankingInsightPanel: React.FC = () => {
  const [country, setCountry] = useState<Country>(ALL_COUNTRIES.find(c => c.code === 'US') || ALL_COUNTRIES[0]);
  const [tipResult, setTipResult] = useState<BankingTipResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTip = async () => {
      setIsLoading(true);
      const result = await getCountryBankingTip(country.name);
      setTipResult(result);
      setIsLoading(false);
    };
    fetchTip();
  }, [country]);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-xl p-6 relative overflow-hidden h-full">
       {/* Abstract Background Shape */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white flex items-center mb-4">
          <SparklesIcon className="w-5 h-5 text-yellow-400 mr-2" />
          AI Banking Insight
        </h3>
        
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Select Region</label>
          <select
            className="w-full bg-black/30 border border-white/10 text-slate-200 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5"
            value={country.code}
            onChange={(e) => {
              const c = ALL_COUNTRIES.find(c => c.code === e.target.value);
              if (c) setCountry(c);
            }}
          >
            {ALL_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-h-[100px] flex items-center">
           {isLoading ? (
            <div className="flex items-center space-x-3 text-slate-400 w-full justify-center">
              <SpinnerIcon className="w-5 h-5 animate-spin text-primary-400" />
              <span className="text-sm">Analyzing local regulations...</span>
            </div>
          ) : tipResult ? (
            <div className={`p-4 rounded-lg border ${tipResult.isError ? 'bg-red-900/20 border-red-500/30' : 'bg-primary-900/20 border-primary-500/30'}`}>
               <div className="flex items-start space-x-3">
                  <LightBulbIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tipResult.isError ? 'text-red-400' : 'text-yellow-400'}`} />
                  <p className="text-sm text-slate-200 leading-relaxed">{tipResult.tip}</p>
               </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export const FinancialNews: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      const { articles, isError } = await getFinancialNews();
      if (isError) {
        setIsError(true);
      } else {
        setNews(articles);
      }
      setIsLoading(false);
    };
    fetchNews();
  }, []);

  return (
    <div className="mt-12 w-full">
       {/* Market Ticker Bar */}
      <div className="w-full bg-slate-900 border-y border-white/10 py-2 overflow-hidden relative mb-8">
         <div className="flex items-center animate-marquee whitespace-nowrap">
            <div className="flex items-center">
               {TICKER_DATA.map((item, index) => (
                 <MarketTickerItem key={index} {...item} />
               ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex items-center">
               {TICKER_DATA.map((item, index) => (
                 <MarketTickerItem key={`dup-${index}`} {...item} />
               ))}
            </div>
         </div>
         {/* Gradient masks for ticker edges */}
         <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
         <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>
      </div>

      <div className="flex items-center justify-between mb-6 px-1">
        <div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
              <GlobeAmericasIcon className="w-6 h-6 text-primary-500 mr-3" />
              Global Market Intelligence
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live updates and AI-curated financial insights for informed decision making.</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-slate-500">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           <span>LIVE FEED ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: AI Insights */}
        <div className="lg:col-span-1">
            <BankingInsightPanel />
        </div>

        {/* Right Column: News Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-800/30 rounded-xl p-5 animate-pulse h-48 flex flex-col">
                     <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-4"></div>
                     <div className="h-6 bg-slate-700/50 rounded w-3/4 mb-3"></div>
                     <div className="h-4 bg-slate-700/50 rounded w-full mb-2"></div>
                     <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
                  </div>
                ))}
             </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-full bg-slate-800/30 rounded-xl p-8 text-center border border-red-500/20">
               <div>
                  <InfoIcon className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <p className="text-slate-300">Unable to load market news securely at this time.</p>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((article, index) => (
                <NewsCard key={index} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
        }
        .animate-marquee {
            animation: marquee 40s linear infinite;
        }
        /* Pause on hover */
        .animate-marquee:hover {
            animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

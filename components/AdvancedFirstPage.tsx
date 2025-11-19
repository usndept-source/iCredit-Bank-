import React from 'react';
import { ArrowRightIcon, GlobeAmericasIcon, ShieldCheckIcon, TrendingUpIcon } from './Icons';

interface AdvancedFirstPageProps {
    onComplete: () => void;
}

const MarketTicker = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-white/10 py-3 overflow-hidden z-20">
        <div className="flex items-center animate-marquee whitespace-nowrap">
            <div className="flex space-x-12 px-4">
                {[
                    { label: "S&P 500", val: "5,245.12", change: "+0.45%", up: true },
                    { label: "NASDAQ", val: "16,428.82", change: "+0.82%", up: true },
                    { label: "EUR/USD", val: "1.0842", change: "-0.12%", up: false },
                    { label: "GBP/USD", val: "1.2635", change: "+0.05%", up: true },
                    { label: "BTC/USD", val: "68,420.00", change: "+1.24%", up: true },
                    { label: "Gold", val: "2,345.50", change: "+0.30%", up: true },
                    { label: "Oil (WTI)", val: "82.15", change: "-0.45%", up: false },
                ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm font-mono">
                        <span className="text-slate-400 font-semibold">{item.label}</span>
                        <span className="text-slate-200">{item.val}</span>
                        <span className={item.up ? "text-green-400" : "text-red-400"}>{item.change}</span>
                    </div>
                ))}
                 {/* Repeat for seamless loop */}
                 {[
                    { label: "S&P 500", val: "5,245.12", change: "+0.45%", up: true },
                    { label: "NASDAQ", val: "16,428.82", change: "+0.82%", up: true },
                    { label: "EUR/USD", val: "1.0842", change: "-0.12%", up: false },
                    { label: "GBP/USD", val: "1.2635", change: "+0.05%", up: true },
                    { label: "BTC/USD", val: "68,420.00", change: "+1.24%", up: true },
                ].map((item, i) => (
                    <div key={`dup-${i}`} className="flex items-center space-x-2 text-sm font-mono">
                        <span className="text-slate-400 font-semibold">{item.label}</span>
                        <span className="text-slate-200">{item.val}</span>
                        <span className={item.up ? "text-green-400" : "text-red-400"}>{item.change}</span>
                    </div>
                ))}
            </div>
        </div>
         <style>{`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-marquee {
                animation: marquee 30s linear infinite;
            }
        `}</style>
    </div>
);

export const AdvancedFirstPage: React.FC<AdvancedFirstPageProps> = ({ onComplete }) => {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
            {/* Preserved Background Image */}
            <img
                src="https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=2940&auto=format&fit=crop"
                alt="London street at night with light trails, representing global finance"
                className="absolute inset-0 w-full h-full object-cover z-0 animate-ken-burns"
            />

            {/* Sophisticated Overlay */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90"></div>
            
            {/* Subtle animated mesh gradient for modern feel */}
            <div className="absolute inset-0 z-[1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            {/* Main Content - Card Style */}
            <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center">
                
                {/* Brand / Logo Area */}
                <div className="mb-8 animate-fade-in-up">
                     <div className="inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl ring-1 ring-white/20">
                        <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                             <defs>
                                <linearGradient id="ic-grad-modern" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#fff" />
                                    <stop offset="100%" stopColor="#cbd5e1" />
                                </linearGradient>
                            </defs>
                            <path d="M 85,50 A 35,35 0 1 1 50,15" fill="none" stroke="url(#ic-grad-modern)" strokeWidth="12" strokeLinecap="round" />
                            <rect x="45" y="45" width="10" height="30" rx="5" fill="url(#ic-grad-modern)" />
                            <path d="M50 22 L52.5 28.5 L59.5 29.5 L54 34 L55.5 41 L50 37.5 L44.5 41 L46 34 L40.5 29.5 L47.5 28.5 Z" fill="#fff" />
                        </svg>
                     </div>
                     <h2 className="mt-6 text-sm font-bold tracking-[0.3em] text-slate-300 uppercase">iCredit Union®</h2>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    Wealth Beyond <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200">Borders.</span>
                </h1>

                {/* Subtext */}
                <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    Experience the pinnacle of global private banking. Secure, seamless, and tailored for the modern investor.
                </p>

                {/* Action Area */}
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                    <button 
                        onClick={onComplete}
                        className="group relative px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-3 overflow-hidden"
                    >
                        <span className="relative z-10">Access Secure Portal</span>
                        <ArrowRightIcon className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    
                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-semibold text-lg backdrop-blur-sm transition-all duration-300 flex items-center gap-2 group">
                        <span>Open Account</span>
                        <GlobeAmericasIcon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-16 grid grid-cols-3 gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                    <div className="flex flex-col items-center gap-2">
                        <ShieldCheckIcon className="w-8 h-8 text-white" />
                        <span className="text-xs font-medium tracking-wider uppercase text-slate-300">Bank-Grade Security</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <GlobeAmericasIcon className="w-8 h-8 text-white" />
                        <span className="text-xs font-medium tracking-wider uppercase text-slate-300">190+ Countries</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <TrendingUpIcon className="w-8 h-8 text-white" />
                        <span className="text-xs font-medium tracking-wider uppercase text-slate-300">Wealth Management</span>
                    </div>
                </div>

            </div>

            {/* Market Ticker */}
            <MarketTicker />
        </div>
    );
};

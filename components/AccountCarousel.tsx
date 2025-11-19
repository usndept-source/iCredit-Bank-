
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Account, AccountType, View } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, VerifiedBadgeIcon, SpinnerIcon, ClockIcon } from './Icons';

const AccountCarouselCard: React.FC<{ account: Account; isBalanceVisible: boolean; onViewDetails: () => void }> = ({ account, isBalanceVisible, onViewDetails }) => {
    if (account.status === 'Provisioning') {
        return (
            <div className="relative w-full rounded-2xl shadow-digital-inset overflow-hidden text-slate-300 bg-slate-700/50 flex flex-col items-center justify-center text-center p-6 h-full">
                <SpinnerIcon className="w-10 h-10 text-primary" />
                <h4 className="font-bold text-lg mt-3 text-slate-200">Account Provisioning</h4>
                <p className="text-sm mt-1">This may take 4-5 business hours. We'll notify you when it's ready.</p>
            </div>
        );
    }
    if (account.status === 'Under Review') {
        return (
            <div className="relative w-full rounded-2xl shadow-digital-inset overflow-hidden text-slate-300 bg-slate-700/50 flex flex-col items-center justify-center text-center p-6 h-full">
                <ClockIcon className="w-10 h-10 text-yellow-400" />
                <h4 className="font-bold text-lg mt-3 text-slate-200">Account Under Review</h4>
                <p className="text-sm mt-1">Your account is pending approval by our customer service team. This typically takes 5-10 minutes. We'll notify you once it's complete.</p>
            </div>
        );
    }
    
    const cardContent = (
      <>
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"></div>
        
        <div className="relative z-10 p-6 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-xl drop-shadow-md text-white">{account.nickname || account.type}</h4>
                    <p className="text-xs font-mono opacity-80 drop-shadow-sm text-slate-200 uppercase tracking-widest">{account.type === 'Global Checking' ? 'Private Banking' : 'Savings Plus'}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-lg">
                     <img src="https://flagsapi.com/US/shiny/32.png" className="w-6 h-6 opacity-80" alt="Currency" />
                </div>
            </div>
            
            <div className="flex-grow flex flex-col justify-center mt-2">
                <p className="text-xs text-slate-300 uppercase tracking-wider font-medium mb-1">Available Balance</p>
                <p className={`text-3xl md:text-4xl font-bold text-white tracking-tight transition-all duration-300 ${!isBalanceVisible ? 'blur-md' : ''}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    {isBalanceVisible ? account.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$ ••••••••'}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-1">{account.fullAccountNumber ? `•••• ${account.fullAccountNumber.slice(-4)}` : account.accountNumber}</p>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                {account.features[0] && (
                    <div className="flex items-center space-x-2 text-xs font-bold text-emerald-300">
                       <VerifiedBadgeIcon className="w-4 h-4" />
                       <span>{account.features[0]}</span>
                    </div>
                )}
                <button onClick={onViewDetails} className="text-xs font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full transition-colors shadow-lg">
                    View Details
                </button>
            </div>
        </div>
      </>
    );

    const accountBackgrounds: { [key in AccountType]?: { type: 'video' | 'image'; url: string; } } = {
        [AccountType.CHECKING]: { 
            type: 'image', 
            url: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2940&auto=format&fit=crop'
        },
        [AccountType.SAVINGS]: { 
            type: 'image', 
            url: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=2938&auto=format&fit=crop'
        },
        [AccountType.BUSINESS]: { 
            type: 'video', 
            url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-city-at-night-42411-large.mp4'
        },
    };
    
    const background = accountBackgrounds[account.type];

    return (
        <div className="group relative w-full h-full rounded-3xl shadow-2xl overflow-hidden text-white border border-white/10 transition-transform duration-300 hover:scale-[1.01]">
            {background?.type === 'image' ? (
                 <img
                    src={background.url}
                    alt={`${account.nickname || account.type} background`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            ) : (
                <video
                    key={account.id}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    src={background?.url || 'https://assets.mixkit.co/videos/preview/mixkit-times-square-in-the-rain-at-night-4379-large.mp4'}
                />
            )}
            {cardContent}
        </div>
    );
};


interface AccountCarouselProps {
    accounts: Account[];
    isBalanceVisible: boolean;
    setActiveView: (view: View) => void;
}

export const AccountCarousel: React.FC<AccountCarouselProps> = ({ accounts, isBalanceVisible, setActiveView }) => {
    const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    
    // Calculate visible cards based on screen size could be implemented here, 
    // but for now we stick to single card view or flex row for simplicity in the new layout
  
    const handlePrev = useCallback(() => {
        setCurrentAccountIndex((prevIndex) => (prevIndex === 0 ? accounts.length - 1 : prevIndex - 1));
    }, [accounts.length]);

    const handleNext = useCallback(() => {
        setCurrentAccountIndex((prevIndex) => (prevIndex === accounts.length - 1 ? 0 : prevIndex + 1));
    }, [accounts.length]);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement === carousel) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    handlePrev();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    handleNext();
                }
            }
        };

        carousel.addEventListener('keydown', handleKeyDown);
        return () => {
            if (carousel) {
                carousel.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [handlePrev, handleNext]);

    // If multiple accounts, show grid on large screens, carousel on small
    // For premium look, we can show 2 cards side by side on desktop if available
    
    return (
        <div
            className="relative group/carousel"
            ref={carouselRef}
            tabIndex={0}
            aria-label="Accounts Carousel"
        >
             <div className="flex gap-6 overflow-x-auto pb-4 snap-x scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
                {accounts.map((account, index) => (
                    <div 
                        key={account.id} 
                        className="flex-shrink-0 w-full md:w-[400px] lg:w-[450px] h-[260px] snap-center first:pl-0"
                        onClick={() => setCurrentAccountIndex(index)}
                    >
                         <AccountCarouselCard account={account} isBalanceVisible={isBalanceVisible} onViewDetails={() => setActiveView('accounts')} />
                    </div>
                ))}
                 {/* Add New Account Placeholder */}
                 <div className="flex-shrink-0 w-full md:w-[150px] h-[260px] snap-center">
                     <button className="w-full h-full rounded-3xl border-2 border-dashed border-slate-600 hover:border-primary/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-primary group">
                         <div className="p-3 rounded-full bg-slate-700/50 group-hover:bg-primary/10 mb-3 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                             </svg>
                         </div>
                         <span className="text-xs font-bold uppercase tracking-wider">Add New</span>
                     </button>
                 </div>
             </div>
        </div>
    );
};


import React from 'react';
import { View } from '../types';
import { 
    ArrowsRightLeftIcon, 
    CurrencyDollarIcon, 
    DevicePhoneMobileIcon, 
    QrCodeIcon, 
    CameraIcon, 
    MapPinIcon, 
    GlobeAmericasIcon, 
    CreditCardIcon,
    ChartBarIcon,
    QuestionMarkCircleIcon
} from './Icons';

interface QuicktellerHubProps {
    setActiveView: (view: View) => void;
    onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
    onOpenWireTransfer: () => void;
}

const ActionCard: React.FC<{
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    bgImage?: string;
    gradient: string;
    onClick: () => void;
    large?: boolean;
}> = ({ title, subtitle, icon, bgImage, gradient, onClick, large }) => {
    return (
        <button
            onClick={onClick}
            className={`group relative rounded-2xl text-white overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${large ? 'col-span-2 md:col-span-1 h-48' : 'col-span-1 h-40'}`}
        >
            {/* Background Layer */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 transition-opacity group-hover:opacity-100`}></div>
            
            {/* Image Overlay (Optional) */}
            {bgImage && (
                 <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />
            )}
            
            {/* Content Layer */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner transition-transform duration-300 group-hover:rotate-3 ${large ? 'w-14 h-14' : 'w-10 h-10'} flex items-center justify-center`}>
                        {React.cloneElement(icon as React.ReactElement<any>, { className: large ? 'w-7 h-7 text-white' : 'w-5 h-5 text-white' })}
                    </div>
                    {large && <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>}
                </div>
                
                <div className="text-left">
                    <h4 className={`font-bold leading-tight ${large ? 'text-xl' : 'text-sm'}`}>{title}</h4>
                    {subtitle && <p className="text-xs text-white/70 mt-1 font-medium">{subtitle}</p>}
                </div>
            </div>

            {/* Hover Effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
    );
};

export const QuicktellerHub: React.FC<QuicktellerHubProps> = ({ setActiveView, onOpenSendMoneyFlow, onOpenWireTransfer }) => {

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h3 className="text-2xl font-bold text-slate-100">Quickteller Hub</h3>
                    <p className="text-sm text-slate-400">Your command center for global finance.</p>
                </div>
            </div>

            {/* Main Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                
                {/* Primary Money Movement - Larger Cards */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <ActionCard 
                        title="Send Money"
                        subtitle="Instant Transfer"
                        icon={<ArrowsRightLeftIcon />}
                        gradient="from-blue-600 to-indigo-700"
                        bgImage="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop"
                        onClick={() => onOpenSendMoneyFlow('send')}
                        large
                    />
                    <ActionCard 
                        title="Wire Transfer"
                        subtitle="Domestic & Int'l"
                        icon={<GlobeAmericasIcon />}
                        gradient="from-slate-700 to-slate-900"
                        bgImage="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2940&auto=format&fit=crop"
                        onClick={onOpenWireTransfer}
                        large
                    />
                </div>

                {/* Secondary Actions - Standard Cards */}
                <ActionCard 
                    title="Pay Bills"
                    icon={<CurrencyDollarIcon />}
                    gradient="from-emerald-600 to-teal-600"
                    onClick={() => setActiveView('utilities')}
                />
                <ActionCard 
                    title="Mobile Top-up"
                    icon={<DevicePhoneMobileIcon />}
                    gradient="from-violet-600 to-purple-600"
                    onClick={() => setActiveView('quickteller')}
                />
                <ActionCard 
                    title="Deposit Check"
                    icon={<CameraIcon />}
                    gradient="from-orange-500 to-red-500"
                    onClick={() => onOpenSendMoneyFlow('deposit')}
                />
                <ActionCard 
                    title="Scan to Pay"
                    icon={<QrCodeIcon />}
                    gradient="from-pink-600 to-rose-600"
                    onClick={() => setActiveView('qrScanner')}
                />
                
                {/* Expansion Row - Financial Services */}
                <ActionCard 
                    title="Investments"
                    icon={<ChartBarIcon />}
                    gradient="from-cyan-600 to-blue-600"
                    onClick={() => setActiveView('invest')}
                />
                <ActionCard 
                    title="Manage Cards"
                    icon={<CreditCardIcon />}
                    gradient="from-fuchsia-600 to-pink-600"
                    onClick={() => setActiveView('cards')}
                />
                <ActionCard 
                    title="ATM Locator"
                    icon={<MapPinIcon />}
                    gradient="from-amber-500 to-orange-600"
                    onClick={() => setActiveView('atmLocator')}
                />
                <ActionCard 
                    title="Support"
                    icon={<QuestionMarkCircleIcon />}
                    gradient="from-slate-600 to-slate-800"
                    onClick={() => setActiveView('support')}
                />

            </div>
        </div>
    );
};

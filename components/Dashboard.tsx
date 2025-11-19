
import React, { useState, useMemo } from 'react';
import { Transaction, Recipient, Account, TravelPlan, TravelPlanStatus, View, UserProfile, TransactionStatus, CardTransaction, SpendingLimit, SPENDING_CATEGORIES } from '../types.ts';
import { 
    EyeIcon, 
    EyeSlashIcon, 
    MapPinIcon, 
    TrendingUpIcon, 
    ShieldCheckIcon,
    SparklesIcon,
    ChartBarIcon,
    PencilIcon,
    WalletIcon,
    GlobeAmericasIcon,
    ArrowPathIcon,
    LockClosedIcon,
    DocumentCheckIcon,
    BankIcon
} from './Icons.tsx';
import { AccountCarousel } from './AccountCarousel.tsx';
import { QuickTransfer } from './QuickTransfer.tsx';
import { FinancialNews } from './FinancialNews.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { ManageSpendingLimitsModal } from './ManageSpendingLimitsModal.tsx';
import { QuicktellerHub } from './QuicktellerHub.tsx';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  recipients: Recipient[];
  createTransaction: (transaction: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>) => Promise<Transaction | null>;
  setActiveView: (view: View) => void;
  travelPlans: TravelPlan[];
  totalNetWorth: number;
  portfolioChange24h: number;
  userProfile: UserProfile;
  cardTransactions?: CardTransaction[];
  budgetLimits?: SpendingLimit[];
  onUpdateBudgetLimits?: (limits: SpendingLimit[]) => void;
  onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
  onOpenWireTransfer: () => void;
}

// Mini Transaction Row Component
const DashboardTransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const isCredit = tx.type === 'credit';
    const date = tx.statusTimestamps[TransactionStatus.SUBMITTED] || new Date();
    
    return (
        <div className="flex items-center justify-between py-4 border-b border-slate-700/50 last:border-0 hover:bg-white/5 transition-colors px-3 rounded-lg group cursor-default">
            <div className="flex items-center gap-4">
                 <div className={`p-2.5 rounded-full flex-shrink-0 ${isCredit ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-slate-700/50 text-slate-300 ring-1 ring-slate-600/50'}`}>
                    {isCredit ? <TrendingUpIcon className="w-5 h-5" /> : <TrendingUpIcon className="w-5 h-5 transform rotate-180" />}
                 </div>
                 <div>
                     <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{isCredit ? 'Deposit' : tx.recipient.fullName}</p>
                     <p className="text-xs text-slate-500 font-medium">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {tx.status}</p>
                 </div>
            </div>
            <span className={`font-mono text-sm font-semibold ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                {isCredit ? '+' : '-'}{tx.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </span>
        </div>
    );
};

const AdvancedAnalyticsWidget: React.FC = () => {
    const [period, setPeriod] = useState('Month');

    return (
        <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 text-primary-400" />
                        Cash Flow Analytics
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Comprehensive view of your financial movements</p>
                </div>
                <div className="flex bg-slate-800/50 rounded-lg p-1 border border-white/10">
                    {['Week', 'Month', 'Year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                period === p 
                                ? 'bg-white/10 text-white shadow-sm' 
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Column */}
                <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Total Income</p>
                            <p className="text-xl font-bold text-white mt-1">$14,250.00</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                             <TrendingUpIcon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">Total Expenses</p>
                            <p className="text-xl font-bold text-white mt-1">$4,120.50</p>
                        </div>
                         <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                            <TrendingUpIcon className="w-5 h-5 transform rotate-180" />
                        </div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Net Savings</p>
                            <p className="text-xl font-bold text-white mt-1">$10,129.50</p>
                        </div>
                         <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <BankIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Chart Column */}
                <div className="lg:col-span-2 bg-slate-800/40 rounded-xl border border-white/5 p-5 relative overflow-hidden group/chart">
                     {/* Grid Background */}
                     <div className="absolute inset-0 opacity-20 pointer-events-none">
                         <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                     </div>

                     <div className="h-52 flex items-end justify-between gap-3 px-2 relative z-10">
                        {/* Bars representing daily/weekly flow */}
                        {[60, 45, 75, 50, 80, 65, 90, 55, 70, 40, 85, 60, 95, 70, 50].map((h, i) => (
                            <div key={i} className="w-full flex flex-col justify-end gap-1 h-full group/bar relative">
                                {/* Tooltip Simulation */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-xs text-white px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none z-20">
                                    In: ${h * 100} | Out: ${h * 50}
                                </div>
                                
                                {/* Income Bar Segment */}
                                <div 
                                    className="w-full bg-emerald-500/40 hover:bg-emerald-400/60 transition-all rounded-sm" 
                                    style={{ height: `${h}%` }}
                                ></div>
                                {/* Expense Bar Segment (Simulated as lower part) */}
                                <div 
                                    className="w-full bg-red-500/40 hover:bg-red-400/60 transition-all rounded-sm" 
                                    style={{ height: `${h * 0.4}%` }}
                                ></div>
                            </div>
                        ))}
                     </div>
                     
                     <div className="flex justify-between text-[10px] text-slate-500 mt-2 uppercase tracking-widest px-2">
                         <span>Start of Period</span>
                         <span>Mid Period</span>
                         <span>Today</span>
                     </div>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
    accounts, 
    transactions, 
    recipients, 
    createTransaction, 
    setActiveView, 
    travelPlans, 
    totalNetWorth, 
    portfolioChange24h, 
    userProfile,
    cardTransactions,
    budgetLimits,
    onUpdateBudgetLimits,
    onOpenSendMoneyFlow,
    onOpenWireTransfer
}) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const { t } = useLanguage();

  const recentTransactions = useMemo(() => {
      return transactions.slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      
      {/* --- 1. Unified Wealth & Accounts Section --- */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-white/5 shadow-2xl">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-b from-slate-800/80 via-slate-900/90 to-slate-950 z-10"></div>
             <img 
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop" 
                className="w-full h-full object-cover opacity-30 animate-ken-burns"
                alt="Background"
             />
        </div>

        <div className="relative z-20 p-6 md:p-10">
             {/* Header Row */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mb-1">{t('dashboard_total_net_worth')}</p>
                    <div className="flex items-center gap-4">
                        <h2 className={`text-4xl md:text-6xl font-bold text-white tracking-tight ${!isBalanceVisible ? 'blur-md select-none' : ''}`}>
                             {isBalanceVisible ? totalNetWorth.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$ •••••••••'}
                        </h2>
                        <button onClick={() => setIsBalanceVisible(!isBalanceVisible)} className="text-slate-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                            {isBalanceVisible ? <EyeIcon className="w-6 h-6" /> : <EyeSlashIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Health & Status Metrics */}
                <div className="flex gap-4">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 min-w-[140px]">
                         <div className="flex items-center gap-2 mb-2">
                             <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                             <span className="text-xs font-bold text-emerald-400 uppercase">Protected</span>
                         </div>
                         <p className="text-xs text-slate-400">Identity Monitoring</p>
                         <p className="text-lg font-bold text-white">Active</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 min-w-[140px]">
                         <div className="flex items-center gap-2 mb-2">
                             <TrendingUpIcon className="w-4 h-4 text-blue-400" />
                             <span className="text-xs font-bold text-blue-400 uppercase">Credit Score</span>
                         </div>
                         <p className="text-xs text-slate-400">Excellent</p>
                         <p className="text-lg font-bold text-white">805</p>
                    </div>
                </div>
             </div>

             {/* Divider */}
             <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8"></div>

             {/* Accounts Carousel */}
             <div className="space-y-4">
                 <div className="flex justify-between items-center px-1">
                     <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                         <WalletIcon className="w-5 h-5 text-primary-400" />
                         {t('header_title_accounts')}
                     </h3>
                     <div className="flex gap-3">
                         <button onClick={() => setActiveView('accounts')} className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">Manage All</button>
                         <button onClick={() => onOpenSendMoneyFlow('deposit')} className="text-xs font-bold text-primary-400 hover:text-primary-300 uppercase tracking-wider transition-colors">+ Add Funds</button>
                     </div>
                 </div>
                 <AccountCarousel accounts={accounts} isBalanceVisible={isBalanceVisible} setActiveView={setActiveView} />
             </div>
             
             {/* Advanced Analytics Widget (New) */}
             <AdvancedAnalyticsWidget />
        </div>
      </section>

      {/* --- 2. Quickteller Hub (Below Balance) --- */}
      <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
           <QuicktellerHub 
                setActiveView={setActiveView} 
                onOpenSendMoneyFlow={onOpenSendMoneyFlow} 
                onOpenWireTransfer={onOpenWireTransfer}
           />
      </section>

      {/* --- 3. Main Content Grid: Recent Activity & Quick Transfer --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Activity (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
             <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/80 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white">{t('dashboard_recent_activity')}</h3>
                    <button 
                        onClick={() => setActiveView('history')} 
                        className="flex items-center space-x-1 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                    >
                        <span>{t('dashboard_view_all')}</span>
                        <ArrowPathIcon className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-2">
                    {recentTransactions.length > 0 ? (
                        <div className="space-y-1">
                            {recentTransactions.map(tx => (
                                <DashboardTransactionRow key={tx.id} tx={tx} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            <DocumentCheckIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No recent transactions found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Quick Transfer */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-lg p-1">
                <QuickTransfer accounts={accounts} recipients={recipients} createTransaction={createTransaction} />
            </div>

            {/* Travel Plan Snippet */}
            {travelPlans.filter(p => p.status === TravelPlanStatus.ACTIVE).length > 0 && (
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <GlobeAmericasIcon className="w-5 h-5" />
                            <h4 className="font-bold">Travel Mode Active</h4>
                        </div>
                        <p className="text-sm text-blue-100 mb-4">
                            You are currently in <strong>{travelPlans.find(p => p.status === TravelPlanStatus.ACTIVE)?.country.name}</strong>.
                        </p>
                        <button onClick={() => setActiveView('checkin')} className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold backdrop-blur-sm transition-colors">
                            Manage Trip
                        </button>
                     </div>
                </div>
            )}
        </div>
      </div>
      
      {/* --- 4. Financial News (Full Width Bottom) --- */}
      <FinancialNews />

    </div>
  );
};

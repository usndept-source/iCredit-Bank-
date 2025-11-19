
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
    ArrowPathIcon
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
    return (
        <div className="bg-slate-800/60 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 text-primary-400" />
                        Cash Flow Analytics
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Income vs. Expense (Last 30 Days)</p>
                </div>
                <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-medium text-slate-300 border border-white/5">
                    +12.5% Net
                </div>
            </div>

            {/* Mock Chart Visualization */}
            <div className="relative h-40 w-full flex items-end justify-between gap-2 px-1">
                {[45, 70, 35, 60, 85, 55, 90, 40, 65, 30, 75, 50].map((h, i) => (
                    <div key={i} className="w-full bg-slate-700/30 rounded-t-sm relative group-hover:bg-slate-700/50 transition-colors">
                        <div 
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-600 to-primary-400 opacity-80 rounded-t-sm transition-all duration-1000" 
                            style={{ height: `${h}%` }}
                        ></div>
                    </div>
                ))}
                {/* Trend Line Overlay */}
                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none opacity-50" preserveAspectRatio="none">
                    <path d="M0 100 Q 30 80, 60 120 T 120 60 T 180 100 T 240 40 T 300 80" fill="none" stroke="#34d399" strokeWidth="2" className="drop-shadow-md" />
                </svg>
            </div>
            
            <div className="flex justify-between mt-4 text-xs text-slate-400 font-mono relative z-10">
                <span>01 Nov</span>
                <span>15 Nov</span>
                <span>30 Nov</span>
            </div>
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary-600/20 blur-[50px] rounded-full pointer-events-none"></div>
        </div>
    );
};

const BudgetSection: React.FC<{ transactions: CardTransaction[], limits: SpendingLimit[], onManage: () => void }> = ({ transactions, limits, onManage }) => {
    const spendingData = useMemo(() => {
        const today = new Date();
        const currentMonthTxs = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
        });

        return SPENDING_CATEGORIES.map(category => {
            const spent = currentMonthTxs.filter(tx => tx.category === category).reduce((sum, tx) => sum + tx.amount, 0);
            const limit = limits.find(l => l.category === category)?.limit || 0;
            return { category, spent, limit };
        }).filter(item => item.limit > 0 || item.spent > 0); // Show items with limits or spending
    }, [transactions, limits]);

    // Sort by percentage used, descending
    const sortedData = spendingData.sort((a, b) => {
        const percentA = a.limit > 0 ? a.spent / a.limit : 0;
        const percentB = b.limit > 0 ? b.spent / b.limit : 0;
        return percentB - percentA;
    });

    return (
        <section className="bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-white/5 p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <WalletIcon className="w-5 h-5 text-primary-400" />
                    Monthly Budget
                </h3>
                <button onClick={onManage} className="text-xs font-bold text-primary-400 hover:text-primary-300 tracking-wide uppercase transition-colors flex items-center gap-1">
                    <PencilIcon className="w-3 h-3" /> Edit Limits
                </button>
            </div>
            <div className="space-y-5">
                {sortedData.length > 0 ? sortedData.slice(0, 5).map((item) => {
                     const percentage = item.limit > 0 ? (item.spent / item.limit) * 100 : 0;
                     const isOverBudget = item.spent > item.limit && item.limit > 0;
                     const barColor = isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-emerald-500';
                     
                     return (
                        <div key={item.category}>
                            <div className="flex justify-between text-xs mb-1.5 font-medium">
                                <span className="text-slate-300">{item.category}</span>
                                <span className={isOverBudget ? 'text-red-400' : 'text-slate-400'}>
                                    <span className="text-white font-mono">${item.spent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                    {item.limit > 0 ? ` / $${item.limit.toLocaleString()}` : ''}
                                </span>
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                                {item.limit > 0 ? (
                                    <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                                ) : (
                                    <div className="h-full bg-slate-600 w-full opacity-30"></div> // Visual placeholder for no limit
                                )}
                            </div>
                        </div>
                     )
                }) : (
                    <div className="text-center py-6">
                        <p className="text-sm text-slate-500">No spending activity this month.</p>
                        <button onClick={onManage} className="mt-2 text-xs text-primary-400 font-medium hover:underline">Set up a budget</button>
                    </div>
                )}
            </div>
        </section>
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
  cardTransactions = [],
  budgetLimits = [],
  onUpdateBudgetLimits = (_: SpendingLimit[]) => {},
  onOpenSendMoneyFlow,
  onOpenWireTransfer
}) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isManageBudgetOpen, setIsManageBudgetOpen] = useState(false);
  const { t } = useLanguage();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const time = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
    return `Good ${time}, ${userProfile.name.split(' ')[0]}`;
  }, [userProfile.name]);

  const activeTravelPlans = travelPlans.filter(plan => plan.status === TravelPlanStatus.ACTIVE);

  return (
    <div className="space-y-8 animate-fade-in-up font-sans">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-sm">{greeting}</h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm font-medium">
             <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Secure Session Active
          </p>
        </div>
         <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
            <MapPinIcon className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">New York, USA</span>
        </div>
      </header>

      {activeTravelPlans.length > 0 && (
        <div className="bg-blue-900/30 border border-blue-500/30 backdrop-blur-md text-blue-200 p-4 rounded-xl flex items-center space-x-4 shadow-lg">
          <div className="p-2 bg-blue-500/20 rounded-full">
            <TrendingUpIcon className="w-6 h-6 text-blue-400" />
          </div>
          <div>
             <p className="text-sm font-bold text-blue-100">Travel Mode Active</p>
             <p className="text-xs text-blue-300/80">Cards authorized for use in: {activeTravelPlans.map(p => p.country.name).join(', ')}.</p>
          </div>
        </div>
      )}

      {/* Hero Grid: Net Worth & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Net Worth Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 shadow-2xl group">
             {/* Abstract Background Elements */}
             <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
             <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl opacity-30"></div>
             
             <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Total Net Worth</h2>
                        <div className="flex items-baseline gap-3">
                            <span className={`text-5xl sm:text-6xl font-bold text-white tracking-tight transition-all duration-500 ${isBalanceVisible ? '' : 'blur-lg select-none'}`}>
                                {isBalanceVisible ? totalNetWorth.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$ 2,450,120.00'}
                            </span>
                             <button 
                                onClick={() => setIsBalanceVisible(!isBalanceVisible)} 
                                className="text-slate-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
                                aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
                            >
                                {isBalanceVisible ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold">
                            <TrendingUpIcon className="w-3 h-3" />
                            <span>+{portfolioChange24h}% (24h)</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                     <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Liquidity</p>
                        <p className="text-lg font-bold text-slate-200 font-mono mt-1">
                            {isBalanceVisible ? accounts.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : '••••••'}
                        </p>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Digital Assets</p>
                        <p className="text-lg font-bold text-slate-200 font-mono mt-1">
                             {isBalanceVisible ? (totalNetWorth - accounts.reduce((acc, curr) => acc + curr.balance, 0)).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : '••••••'}
                        </p>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Available Credit</p>
                        <p className="text-lg font-bold text-slate-200 font-mono mt-1">$45,000</p>
                     </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Reward Points</p>
                        <p className="text-lg font-bold text-primary-300 font-mono mt-1">84,250</p>
                     </div>
                </div>
             </div>
        </div>

        {/* Credit Score & Health Card */}
        <div className="lg:col-span-1 bg-slate-800/60 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-xl flex flex-col justify-between relative overflow-hidden">
             <div className="relative z-10">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Financial Health</h3>
                    <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                 </div>
                 <div className="flex items-end gap-3">
                    <span className="text-6xl font-black text-white">812</span>
                    <span className="text-lg font-bold text-emerald-400 mb-2">Excellent</span>
                 </div>
                 <p className="text-xs text-slate-500 mt-2">Last updated: Today via Equifax</p>
             </div>

             <div className="relative z-10 mt-6">
                 <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                    <span>Utilization</span>
                    <span>12%</span>
                 </div>
                 <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                     <div className="bg-gradient-to-r from-emerald-400 to-primary-500 h-full w-[12%] rounded-full"></div>
                 </div>
                 <div className="mt-6 p-3 bg-white/5 rounded-xl flex items-center gap-3 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <SparklesIcon className="w-5 h-5 text-yellow-400" />
                    <div>
                        <p className="text-xs font-bold text-slate-200">AI Insight</p>
                        <p className="text-[10px] text-slate-400">Your spending is 5% lower than last month.</p>
                    </div>
                 </div>
             </div>
             
             {/* Decorative background blur */}
             <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* My Accounts Section - Moved Top */}
      <section aria-label="Your Accounts" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <GlobeAmericasIcon className="w-6 h-6 text-primary-400" />
                  My Accounts
                  <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">{accounts.length}</span>
              </h3>
               <div className="flex gap-3">
                  <button onClick={() => setActiveView('accounts')} className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-full border border-white/5">Manage All</button>
                  <button onClick={() => onOpenSendMoneyFlow('deposit')} className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">+ Add Funds</button>
              </div>
          </div>
          <AccountCarousel accounts={accounts} isBalanceVisible={isBalanceVisible} setActiveView={setActiveView} />
      </section>

      {/* Quickteller Hub (Primary Quick Actions) */}
      <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <QuicktellerHub 
            setActiveView={setActiveView} 
            onOpenSendMoneyFlow={onOpenSendMoneyFlow} 
            onOpenWireTransfer={onOpenWireTransfer}
          />
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: History & Analytics */}
        <div className="xl:col-span-2 space-y-8">
            {/* Recent Activity */}
            <section className="bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-white/5 p-6 shadow-lg">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ArrowPathIcon className="w-5 h-5 text-primary-400" />
                        Recent Activity
                    </h3>
                    <button onClick={() => setActiveView('history')} className="text-xs font-bold text-primary-400 hover:text-primary-300 tracking-wide uppercase transition-colors">View All History</button>
                </div>
                <div className="space-y-1">
                     {transactions.slice(0, 5).map(tx => <DashboardTransactionRow key={tx.id} tx={tx} />)}
                </div>
            </section>

            {/* Budget Section */}
            <BudgetSection 
                transactions={cardTransactions} 
                limits={budgetLimits} 
                onManage={() => setIsManageBudgetOpen(true)} 
            />
            
             {/* Financial News Compact */}
             <section>
                <div className="mb-4 px-1">
                     <h3 className="text-xl font-bold text-white">Market Insights</h3>
                </div>
                <FinancialNews />
             </section>
        </div>

        {/* Right Column: Actions & Widgets */}
        <div className="xl:col-span-1 space-y-8">
            {/* Advanced Analytics */}
            <section>
                <AdvancedAnalyticsWidget />
            </section>

             {/* Quick Transfer */}
            <section>
                 <h3 className="text-xl font-bold text-white mb-4 px-1">Quick Transfer</h3>
                 <QuickTransfer
                    accounts={accounts}
                    recipients={recipients}
                    createTransaction={createTransaction}
                />
            </section>
        </div>
      </div>
      
      {isManageBudgetOpen && (
        <ManageSpendingLimitsModal
            currentLimits={budgetLimits}
            onClose={() => setIsManageBudgetOpen(false)}
            onSave={(newLimits) => {
                onUpdateBudgetLimits(newLimits);
                setIsManageBudgetOpen(false);
            }}
        />
      )}
    </div>
  );
};

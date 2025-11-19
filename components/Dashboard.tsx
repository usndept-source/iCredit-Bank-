
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
                                
                                <div className="w-full bg-emerald-500/80 rounded-sm transition-all duration-500 group-hover/bar:bg-emerald-400" style={{ height: `${h * 0.6}%` }}></div>
                                <div className="w-full bg-red-500/80 rounded-sm transition-all duration-500 group-hover/bar:bg-red-400" style={{ height: `${h * 0.25}%` }}></div>
                            </div>
                        ))}
                     </div>
                     
                     <div className="flex justify-between mt-4 text-xs text-slate-500 font-mono px-2 border-t border-white/5 pt-2">
                        <span>01 {period}</span>
                        <span>15 {period}</span>
                        <span>30 {period}</span>
                     </div>
                </div>
            </div>
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

      {/* Unified My Accounts & Wealth Section - REFACTORED */}
      <section aria-label="Financial Overview" className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
              
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

              {/* Top Grid: Net Worth & Health */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 relative z-10">
                  
                  {/* Net Worth Panel */}
                  <div className="lg:col-span-2 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                          <div>
                              <h2 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                  <ChartBarIcon className="w-4 h-4" /> Total Net Worth
                              </h2>
                              <div className="flex items-baseline gap-4">
                                  <span className={`text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight transition-all duration-500 ${isBalanceVisible ? '' : 'blur-xl select-none'}`}>
                                      {isBalanceVisible ? totalNetWorth.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$ 2,450,120.00'}
                                  </span>
                                   <button 
                                      onClick={() => setIsBalanceVisible(!isBalanceVisible)} 
                                      className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5"
                                      aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
                                  >
                                      {isBalanceVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                  </button>
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400 text-xs font-bold">
                                      <TrendingUpIcon className="w-3 h-3" />
                                      <span>+{portfolioChange24h}%</span>
                                  </div>
                                  <span className="text-xs text-slate-500 font-medium">vs. last 24h</span>
                              </div>
                          </div>
                      </div>

                      <div className="mt-8 grid grid-cols-3 gap-4">
                           <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Assets</p>
                              <p className="text-lg font-mono font-bold text-slate-200 mt-1">
                                  {isBalanceVisible ? (totalNetWorth * 1.05).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : '••••••'}
                              </p>
                              <div className="w-full bg-slate-700/50 h-1 mt-2 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full w-[90%]"></div>
                              </div>
                           </div>
                           <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Liabilities</p>
                              <p className="text-lg font-mono font-bold text-slate-200 mt-1">
                                  {isBalanceVisible ? (totalNetWorth * 0.05).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : '••••••'}
                              </p>
                               <div className="w-full bg-slate-700/50 h-1 mt-2 rounded-full overflow-hidden">
                                  <div className="bg-amber-500 h-full w-[15%]"></div>
                              </div>
                           </div>
                           <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Monthly Flow</p>
                              <p className="text-lg font-mono font-bold text-green-400 mt-1">+$12,450</p>
                               <div className="w-full bg-slate-700/50 h-1 mt-2 rounded-full overflow-hidden">
                                  <div className="bg-primary h-full w-[65%]"></div>
                              </div>
                           </div>
                      </div>
                  </div>

                  {/* Financial Health Panel */}
                  <div className="lg:col-span-1 bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col justify-center relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                       
                       <div className="flex items-center justify-between mb-4 relative z-10">
                          <h3 className="text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" /> Financial Health
                          </h3>
                          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">A+</span>
                       </div>
                       
                       <div className="flex items-end gap-3 mb-4 relative z-10">
                          <span className="text-5xl font-black text-white">812</span>
                          <div className="mb-1">
                              <p className="text-sm font-bold text-emerald-400">Excellent</p>
                              <p className="text-[10px] text-slate-500">Updated Today</p>
                          </div>
                       </div>

                       <div className="space-y-3 relative z-10">
                           <div className="flex justify-between text-xs items-center">
                               <span className="text-slate-400 flex items-center gap-1"><LockClosedIcon className="w-3 h-3"/> Identity Protection</span>
                               <span className="text-emerald-400 font-bold">Active</span>
                           </div>
                           <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                               <div className="bg-emerald-500 h-full w-full animate-pulse"></div>
                           </div>
                           <div className="flex justify-between text-xs items-center pt-1">
                               <span className="text-slate-400 flex items-center gap-1"><DocumentCheckIcon className="w-3 h-3"/> Credit Usage</span>
                               <span className="text-slate-200 font-mono">12%</span>
                           </div>
                           <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                               <div className="bg-blue-500 h-full w-[12%]"></div>
                           </div>
                       </div>
                  </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6 opacity-60">
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-grow"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <GlobeAmericasIcon className="w-4 h-4" /> My Accounts
                  </span>
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-grow"></div>
                  <div className="flex gap-2">
                       <button onClick={() => setActiveView('accounts')} className="text-[10px] font-bold text-slate-400 hover:text-white uppercase border border-white/10 px-2 py-1 rounded bg-white/5">Manage</button>
                       <button onClick={() => onOpenSendMoneyFlow('deposit')} className="text-[10px] font-bold text-primary-400 hover:text-primary-300 uppercase border border-primary/20 px-2 py-1 rounded bg-primary/10">+ Funds</button>
                  </div>
              </div>

              {/* Accounts Carousel Integrated */}
              <div className="relative">
                  <AccountCarousel accounts={accounts} isBalanceVisible={isBalanceVisible} setActiveView={setActiveView} />
              </div>

              {/* Advanced Analytics Widget (MOVED HERE) */}
              <AdvancedAnalyticsWidget />
          </div>
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


import React, { useState, useMemo } from 'react';
import { Card, CardTransaction, SPENDING_CATEGORIES, VirtualCard } from '../types.ts';
// FIX: Add missing icons.
import { ICreditUnionLogo, EyeIcon, LockClosedIcon, PlusCircleIcon, AppleWalletIcon, VisaIcon, MastercardIcon, ChevronLeftIcon, ChevronRightIcon, ShoppingBagIcon, TransportIcon, FoodDrinkIcon, EntertainmentIcon, GlobeAmericasIcon, Cog8ToothIcon, PlusIcon, PencilIcon } from './Icons.tsx';
import { AddFundsModal } from './AddFundsModal.tsx';
import { AddCardModal } from './AddCardModal.tsx';
import { AdvancedCardControlsModal } from './AdvancedCardControlsModal.tsx';
import { CreateVirtualCardModal } from './CreateVirtualCardModal.tsx';

interface CardManagementProps {
    cards: Card[];
    virtualCards: VirtualCard[];
    onUpdateVirtualCard: (cardId: string, updates: Partial<VirtualCard>) => void;
    cardTransactions: CardTransaction[];
    onUpdateCardControls: (cardId: string, updatedControls: Partial<Card['controls']>) => void;
    onAddCard: (cardData: Omit<Card, 'id' | 'controls'>) => void;
    onAddVirtualCard: (data: { nickname: string; linkedCardId: string; spendingLimit: number | null }) => void;
    accountBalance: number;
    onAddFunds: (amount: number, cardLastFour: string, cardNetwork: 'Visa' | 'Mastercard') => Promise<void>;
}

// FIX: Changed return type from JSX.Element to React.ReactElement to resolve namespace error.
const getCategoryIcon = (category: string, className: string): React.ReactElement => {
    const props = { className };
    switch (category) {
        case 'Shopping': return <ShoppingBagIcon {...props} />;
        case 'Food & Drink': return <FoodDrinkIcon {...props} />;
        case 'Entertainment': return <EntertainmentIcon {...props} />;
        case 'Transport': return <TransportIcon {...props} />;
        default: return <ShoppingBagIcon {...props} />;
    }
};

const CardTransactionRow: React.FC<{ transaction: CardTransaction }> = ({ transaction }) => {
    return (
        <li className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center shadow-digital-inset text-slate-600">
                    {getCategoryIcon(transaction.category, "w-5 h-5")}
                </div>
                <div>
                    <p className="font-semibold text-slate-800">{transaction.description}</p>
                    <p className="text-sm text-slate-500">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
            </div>
            <p className="font-semibold text-slate-800 font-mono">
                -{transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
        </li>
    );
};

const CardVisual: React.FC<{ card: Card }> = ({ card }) => {
    const cardImage = card.cardType === 'CREDIT' 
        ? 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=2942&auto=format&fit=crop' // Sleek dark card
        : 'https://images.unsplash.com/photo-1620714223023-254293f94a46?q=80&w=2942&auto=format&fit=crop'; // Sleek light card

    return (
        <div 
            className={`relative w-full max-w-md mx-auto rounded-2xl text-white shadow-lg transition-all duration-500 bg-cover bg-center ${card.controls.isFrozen ? 'grayscale' : ''}`}
            style={{ 
                backgroundImage: `url(${cardImage})`,
                height: '212px' 
            }}
        >
            <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
            <div className="relative z-10 p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <ICreditUnionLogo />
                    {card.network === 'Visa' ? <VisaIcon className="w-16 h-auto" /> : <MastercardIcon className="w-12 h-auto" />}
                </div>
                <div className="font-mono text-2xl tracking-widest my-4" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                    {card.cardType === 'CREDIT' ? `•••• •••• •••• ${card.lastFour}` : card.fullNumber?.replace(/(\d{4})/g, '$1 ').trim() || `•••• •••• •••• ${card.lastFour}`}
                </div>
                <div className="flex justify-between items-end text-sm mt-auto" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                    <div>
                        <span className="block text-xs opacity-70">Card Holder</span>
                        <span className="font-semibold">{card.cardholderName}</span>
                    </div>
                    <div>
                        <span className="block text-xs opacity-70">Expires</span>
                        <span className="font-semibold">{card.expiryDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddCardPlaceholder: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="relative w-full max-w-md mx-auto p-6 rounded-2xl bg-slate-200 shadow-digital-inset border-2 border-dashed border-slate-400 text-slate-500 flex flex-col items-center justify-center hover:bg-slate-300/50 hover:border-primary transition-colors" style={{ height: '212px' }}>
        <PlusCircleIcon className="w-12 h-12" />
        <span className="mt-2 font-semibold">Add New Card</span>
    </button>
);

const ViewCardDetailsModal: React.FC<{ card: Card | VirtualCard; onClose: () => void; isVirtual: boolean }> = ({ card, onClose, isVirtual }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-slate-100 rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{isVirtual ? (card as VirtualCard).nickname : 'Card'} Details</h3>
            <div className="space-y-3 p-4 bg-slate-200 rounded-lg shadow-digital-inset font-mono text-lg">
                <p><span className="text-sm font-sans text-slate-600">Number:</span> {card.fullNumber}</p>
                <p><span className="text-sm font-sans text-slate-600">Expires:</span> {card.expiryDate}</p>
                <p><span className="text-sm font-sans text-slate-600">CVC:</span> {card.cvc}</p>
            </div>
            <button onClick={onClose} className="mt-4 w-full py-2 bg-primary text-white font-semibold rounded-lg shadow-md">Close</button>
        </div>
    </div>
);

const CardControls: React.FC<{ card: Card; onUpdate: (id: string, controls: Partial<Card['controls']>) => void; onOpenAdvanced: () => void; }> = ({ card, onUpdate, onOpenAdvanced }) => {
    const ControlToggle: React.FC<{ label: string; icon: React.ReactNode; enabled: boolean; onChange: (val: boolean) => void }> = ({ label, icon, enabled, onChange }) => (
        <div className="flex justify-between items-center p-3 rounded-lg shadow-digital-inset">
            <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${enabled ? 'bg-primary/20 text-primary' : 'bg-slate-300 text-slate-500'}`}>
                    {icon}
                </div>
                <span className="font-semibold text-slate-700">{label}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer shadow-inner peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-primary"></div>
            </label>
        </div>
    );

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital p-4 space-y-3">
            <div className="flex justify-between items-center px-2">
                 <h4 className="font-bold text-slate-800">Card Controls</h4>
                 <button onClick={onOpenAdvanced} className="flex items-center space-x-1.5 text-xs font-semibold text-primary">
                    <Cog8ToothIcon className="w-4 h-4" />
                    <span>Advanced</span>
                 </button>
            </div>
            <ControlToggle label="Lock Card" icon={<LockClosedIcon className="w-5 h-5" />} enabled={card.controls.isFrozen} onChange={val => onUpdate(card.id, { isFrozen: val })} />
            <ControlToggle label="Online Purchases" icon={<ShoppingBagIcon className="w-5 h-5" />} enabled={card.controls.onlinePurchases} onChange={val => onUpdate(card.id, { onlinePurchases: val })} />
            <ControlToggle label="International" icon={<GlobeAmericasIcon className="w-5 h-5" />} enabled={card.controls.internationalTransactions} onChange={val => onUpdate(card.id, { internationalTransactions: val })} />
        </div>
    );
};

const SpendingSummary: React.FC<{ transactions: CardTransaction[] }> = ({ transactions }) => {
    const { totalSpent, byCategory } = useMemo(() => {
        const today = new Date();
        const currentMonthTxs = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
        });

        const total = currentMonthTxs.reduce((sum, tx) => sum + tx.amount, 0);

        const byCat = SPENDING_CATEGORIES.reduce((acc, cat) => {
            acc[cat] = currentMonthTxs.filter(tx => tx.category === cat).reduce((sum, tx) => sum + tx.amount, 0);
            return acc;
        }, {} as Record<string, number>);

        return { totalSpent: total, byCategory: byCat };
    }, [transactions]);
    
    // FIX: Explicitly cast the result of Object.values to number[] to fix type error with Math.max.
    const maxSpending = Math.max(0, ...Object.values(byCategory) as number[]);

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
            <h3 className="text-xl font-bold text-slate-800">This Month's Spending</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2 font-mono">{totalSpent.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            <div className="mt-4 space-y-3">
                {SPENDING_CATEGORIES.map(cat => {
                    const spent = byCategory[cat];
                    if (spent === 0) return null;
                    const percentage = maxSpending > 0 ? (spent / maxSpending) * 100 : 0;

                    return (
                        <div key={cat} className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-200 shadow-digital text-slate-600 flex-shrink-0">{getCategoryIcon(cat, 'w-5 h-5')}</div>
                            <div className="flex-grow">
                                <div className="flex justify-between font-semibold">
                                    <span className="text-slate-700">{cat}</span>
                                    <span className="text-slate-800 font-mono">${spent.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 shadow-digital-inset mt-1">
                                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const EditVirtualCardLimitModal: React.FC<{ card: VirtualCard; onClose: () => void; onSave: (limit: number | null) => void }> = ({ card, onClose, onSave }) => {
    const [limit, setLimit] = useState(card.spendingLimit ? card.spendingLimit.toString() : '');
    const [noLimit, setNoLimit] = useState(card.spendingLimit === null);

    const handleSave = () => {
        if (noLimit) {
            onSave(null);
        } else {
            const parsed = parseFloat(limit);
            if (!isNaN(parsed) && parsed > 0) {
                onSave(parsed);
            }
        }
    };
    
    const isValid = noLimit || (parseFloat(limit) > 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-6 w-full max-w-sm m-4 animate-fade-in-up">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Spending Limit</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Monthly Limit (USD)</label>
                        <input 
                            type="number" 
                            value={limit} 
                            onChange={e => { setLimit(e.target.value); if(e.target.value) setNoLimit(false); }}
                            disabled={noLimit}
                            className="mt-1 w-full p-2 bg-slate-100 rounded-md shadow-digital-inset disabled:opacity-50"
                            placeholder="e.g. 100.00"
                        />
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={noLimit} 
                            onChange={e => { setNoLimit(e.target.checked); if(e.target.checked) setLimit(''); }}
                            className="h-4 w-4 rounded text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-slate-700">No Limit</span>
                    </label>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                        <button onClick={handleSave} disabled={!isValid} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CardManagement: React.FC<CardManagementProps> = ({ cards, virtualCards, onUpdateVirtualCard, cardTransactions, onUpdateCardControls, onAddCard, onAddVirtualCard, onAddFunds }) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [viewingCard, setViewingCard] = useState<Card | VirtualCard | null>(null);
    const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
    const [isCreateVirtualCardModalOpen, setIsCreateVirtualCardModalOpen] = useState(false);
    const [advancedControlsCard, setAdvancedControlsCard] = useState<Card | null>(null);
    const [editingLimitCardId, setEditingLimitCardId] = useState<string | null>(null);

    const allCards = [...cards, null]; // Add a null for the "Add Card" placeholder
    const currentCard = allCards[currentCardIndex];
    
    const handleNext = () => setCurrentCardIndex(prev => (prev + 1) % allCards.length);
    const handlePrev = () => setCurrentCardIndex(prev => (prev - 1 + allCards.length) % allCards.length);
    
    const currentCardTransactions = useMemo(() => {
        // In a real app, you'd filter transactions by card ID
        return cardTransactions;
    }, [cardTransactions]);

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Cards & Apple Pay</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your physical and virtual cards, add funds, and view transactions.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card Carousel */}
                        <div className="relative">
                            <div className="overflow-hidden">
                                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentCardIndex * 100}%)`}}>
                                    {allCards.map((card, _index) => (
                                        <div key={card ? card.id : 'add-card'} className="w-full flex-shrink-0">
                                            {card ? <CardVisual card={card} /> : <AddCardPlaceholder onClick={() => setIsAddCardModalOpen(true)} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {allCards.length > 1 && (
                                <>
                                    <button onClick={handlePrev} className="absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full bg-slate-200 shadow-digital active:shadow-digital-inset"><ChevronLeftIcon className="w-6 h-6"/></button>
                                    <button onClick={handleNext} className="absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full bg-slate-200 shadow-digital active:shadow-digital-inset"><ChevronRightIcon className="w-6 h-6"/></button>
                                </>
                            )}
                        </div>
                        
                        {currentCard && (
                            <>
                                <CardControls card={currentCard} onUpdate={onUpdateCardControls} onOpenAdvanced={() => setAdvancedControlsCard(currentCard)} />
                                <div className="bg-slate-200 rounded-2xl shadow-digital grid grid-cols-3 gap-2 text-center p-2">
                                    <button onClick={() => setViewingCard(currentCard)} className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-300/50">
                                        <EyeIcon className="w-6 h-6 text-primary"/>
                                        <span className="text-xs font-semibold mt-1">View Details</span>
                                    </button>
                                    <button onClick={() => setIsAddFundsModalOpen(true)} className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-300/50">
                                        <PlusCircleIcon className="w-6 h-6 text-primary"/>
                                        <span className="text-xs font-semibold mt-1">Add Funds</span>
                                    </button>
                                    <button onClick={() => alert('This would open the native wallet on your device to add this card to Apple Wallet or Google Pay.')} className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-300/50">
                                        <AppleWalletIcon className="w-6 h-6 text-primary"/>
                                        <span className="text-xs font-semibold mt-1">Add to Wallet</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    
                    <div className="lg:col-span-3 space-y-6">
                         <SpendingSummary transactions={currentCardTransactions} />
                         {/* Recent Transactions */}
                        <div className="bg-slate-200 rounded-2xl shadow-digital">
                            <h3 className="text-xl font-bold text-slate-800 p-6 border-b border-slate-300">Recent Transactions</h3>
                            {currentCardTransactions.length > 0 ? (
                                <ul className="divide-y divide-slate-300 px-6">
                                    {currentCardTransactions.slice(0, 5).map(tx => <CardTransactionRow key={tx.id} transaction={tx} />)}
                                </ul>
                            ) : (
                                <p className="text-sm text-center text-slate-500 p-6">No transactions for this card yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Virtual Cards Section */}
                <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-800">Virtual Cards</h3>
                        <button onClick={() => setIsCreateVirtualCardModalOpen(true)} className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-primary bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">
                            <PlusIcon className="w-4 h-4" />
                            <span>Create Virtual Card</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {virtualCards.map(vc => (
                            <div key={vc.id} className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800">{vc.nickname}</p>
                                        <p className="text-sm text-slate-500 font-mono">•••• {vc.lastFour}</p>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <button onClick={() => setViewingCard(vc)} className="p-1 text-slate-500 hover:text-primary"><EyeIcon className="w-5 h-5"/></button>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={vc.isFrozen} onChange={(e) => onUpdateVirtualCard(vc.id, { isFrozen: e.target.checked })} />
                                            <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1">
                                        <span>Monthly Limit</span>
                                        <button 
                                            onClick={() => setEditingLimitCardId(vc.id)}
                                            className="flex items-center space-x-1 text-primary hover:text-primary-600 transition-colors"
                                        >
                                            <span>{vc.spendingLimit ? `$${vc.spendingLimit.toFixed(2)}` : 'No Limit'}</span>
                                            <PencilIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                    {vc.spendingLimit ? (
                                        <>
                                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                <span>Spent: ${vc.spentThisMonth.toFixed(2)}</span>
                                            </div>
                                            <div className="w-full bg-slate-300 rounded-full h-1.5 shadow-inner">
                                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min((vc.spentThisMonth / vc.spendingLimit) * 100, 100)}%`}}></div>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-xs text-slate-500">Spent this month: ${vc.spentThisMonth.toFixed(2)}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {isAddFundsModalOpen && (
                <AddFundsModal 
                    onClose={() => setIsAddFundsModalOpen(false)}
                    onAddFunds={async (amount, lastFour, network) => {
                        await onAddFunds(amount, lastFour, network);
                        setIsAddFundsModalOpen(false);
                    }}
                />
            )}
            {isAddCardModalOpen && (
                <AddCardModal 
                    onClose={() => setIsAddCardModalOpen(false)}
                    onAddCard={(cardData) => {
                        onAddCard(cardData);
                        setIsAddCardModalOpen(false);
                    }}
                />
            )}
            {isCreateVirtualCardModalOpen && (
                <CreateVirtualCardModal
                    physicalCards={cards}
                    onClose={() => setIsCreateVirtualCardModalOpen(false)}
                    onAddVirtualCard={onAddVirtualCard}
                />
            )}
            {viewingCard && <ViewCardDetailsModal card={viewingCard} onClose={() => setViewingCard(null)} isVirtual={'nickname' in viewingCard} />}
            {advancedControlsCard && (
                <AdvancedCardControlsModal
                    card={advancedControlsCard}
                    onClose={() => setAdvancedControlsCard(null)}
                    onSave={(updatedControls) => {
                        onUpdateCardControls(advancedControlsCard.id, updatedControls);
                        setAdvancedControlsCard(null);
                    }}
                />
            )}
            {editingLimitCardId && (
                <EditVirtualCardLimitModal 
                    card={virtualCards.find(c => c.id === editingLimitCardId)!}
                    onClose={() => setEditingLimitCardId(null)}
                    onSave={(limit) => {
                        onUpdateVirtualCard(editingLimitCardId, { spendingLimit: limit });
                        setEditingLimitCardId(null);
                    }}
                />
            )}
        </>
    );
};

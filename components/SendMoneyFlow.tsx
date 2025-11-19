
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Recipient, Transaction, Account, SecuritySettings, View, TransactionStatus, AccountType, UserProfile } from '../types.ts';
import { STANDARD_FEE, EXPRESS_FEE, EXCHANGE_RATES, TRANSFER_PURPOSES, USER_PIN, NETWORK_AUTH_CODE } from '../constants.ts';
// FIX: Add missing icons
import { SpinnerIcon, CheckCircleIcon, ExclamationTriangleIcon, KeypadIcon, FaceIdIcon, ShieldCheckIcon, CameraIcon, ClipboardDocumentIcon, XIcon, XCircleIcon, NetworkIcon, GlobeAltIcon, UsersIcon, getBankIcon, ArrowRightIcon, ScaleIcon, SendIcon, DevicePhoneMobileIcon, FingerprintIcon, CalendarDaysIcon, ArrowPathIcon } from './Icons.tsx';
import { triggerHaptic } from '../utils/haptics.ts';
import { PaymentReceipt } from './PaymentReceipt.tsx';
import { CheckDepositFlow } from './CheckDepositFlow.tsx';
import { TransferConfirmationModal } from './TransferConfirmationModal.tsx';
import { RecipientSelector } from './RecipientSelector.tsx';
import { sendSmsNotification, generateOtpSms } from '../services/notificationService.ts';


interface SendMoneyFlowProps {
  recipients: Recipient[];
  accounts: Account[];
  createTransaction: (transaction: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>) => Promise<Transaction | null>;
  transactions: Transaction[];
  securitySettings: SecuritySettings;
  hapticsEnabled: boolean;
  onAuthorizeTransaction: (transactionId: string, method: 'code' | 'fee') => void;
  setActiveView: (view: View) => void;
  onClose: () => void;
  onLinkAccount: () => void;
  onDepositCheck: (details: { amount: number, accountId: string, images: { front: string, back: string } }) => void;
  onSplitTransaction: (details: { sourceAccountId: string; splits: { recipient: Recipient; amount: number }[]; totalAmount: number; purpose: string; }) => boolean;
  initialTab?: 'send' | 'split' | 'deposit';
  transactionToRepeat?: Transaction | null;
  userProfile: UserProfile;
  onContactSupport: () => void;
}

const TABS = [
    { id: 'send', label: 'Send', icon: <SendIcon className="w-5 h-5 mr-2" /> },
    { id: 'split', label: 'Split', icon: <UsersIcon className="w-5 h-5 mr-2" /> },
    { id: 'deposit', label: 'Deposit', icon: <CameraIcon className="w-5 h-5 mr-2" /> },
];

const FREQUENCIES = [
    { id: 'one-time', label: 'One-time' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'bi-weekly', label: 'Bi-Weekly' },
    { id: 'monthly', label: 'Monthly' },
];


// Main Component
export const SendMoneyFlow: React.FC<SendMoneyFlowProps> = ({ recipients, accounts, createTransaction, transactions, securitySettings, hapticsEnabled, onAuthorizeTransaction, setActiveView, onClose, onLinkAccount, onDepositCheck, onSplitTransaction, initialTab, transactionToRepeat, userProfile, onContactSupport }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'split' | 'deposit'>(initialTab || 'send');
  const [step, setStep] = useState(0); // 0: Details, 1: Review, 2: Authorize, 3: SecurityCheck, 4: Complete
  const [isRecipientSelectorOpen, setIsRecipientSelectorOpen] = useState(false);

  // Calculate internal and external accounts before they are used in state initializers.
  const { internalAccounts, externalAccounts } = useMemo(() => {
    const internal = accounts.filter(acc => acc.type !== AccountType.EXTERNAL_LINKED);
    const external = accounts.filter(acc => acc.type === AccountType.EXTERNAL_LINKED);
    return { internalAccounts: internal, externalAccounts: external };
  }, [accounts]);
  
  // Form State (Single Send)
  const [sourceAccountId, setSourceAccountId] = useState<string>(() => (internalAccounts.length > 0 ? internalAccounts[0].id : ''));
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(recipients.length > 0 ? recipients[0] : null);
  const [sendAmount, setSendAmount] = useState('');
  const [purpose, setPurpose] = useState(TRANSFER_PURPOSES[0]);
  const [deliverySpeed, setDeliverySpeed] = useState<'Standard' | 'Express'>('Standard');
  const [receiveCurrency, setReceiveCurrency] = useState<string>(selectedRecipient?.country.currency || 'GBP');
  const [rateLockCountdown, setRateLockCountdown] = useState(60);
  
  // Recurring / Schedule State
  const [frequency, setFrequency] = useState('one-time');
  const [scheduledDate, setScheduledDate] = useState('');

  // Security State
  const [pin, setPin] = useState('');
  const [networkAuthCode, setNetworkAuthCode] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);


  // Transaction State
  const [createdTransaction, setCreatedTransaction] = useState<Transaction | null>(null);
  
  const sourceAccount = accounts.find(acc => acc.id === sourceAccountId);

  // Single Send calculations
  const fee = deliverySpeed === 'Express' ? EXPRESS_FEE : STANDARD_FEE;
  const numericSendAmount = parseFloat(sendAmount) || 0;
  const exchangeRate = EXCHANGE_RATES[receiveCurrency] || 0;
  const receiveAmount = numericSendAmount * exchangeRate;
  const totalCost = numericSendAmount + fee;
  
  const amountError = useMemo(() => {
    if (numericSendAmount < 0) return "Amount cannot be negative.";
    if (numericSendAmount > 0 && !sourceAccount) return "Source account not found.";
    // Bypass balance check for external accounts
    if (sourceAccount && sourceAccount.type !== AccountType.EXTERNAL_LINKED) {
      if (numericSendAmount > 0 && totalCost > sourceAccount.balance) {
          return `Total cost of ${totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} exceeds your balance.`;
      }
    }
    return null;
  }, [numericSendAmount, totalCost, sourceAccount]);
  
  const isDetailsInvalid = amountError !== null || numericSendAmount <= 0 || !selectedRecipient || !sourceAccount;

  const liveTransaction = useMemo(() => {
    if (!createdTransaction) return null;
    return transactions.find(t => t.id === createdTransaction.id) || createdTransaction;
  }, [transactions, createdTransaction]);

  const hapticTrigger = useCallback(() => {
    if(hapticsEnabled) triggerHaptic();
  }, [hapticsEnabled]);

  const handleNextStep = useCallback(() => {
    hapticTrigger();
    setStep(prev => prev + 1);
  }, [hapticTrigger]);

  const handlePrevStep = useCallback(() => {
    hapticTrigger();
    setStep(prev => prev - 1);
    setError(''); // Clear errors when going back
  }, [hapticTrigger]);

  const handleSourceAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'link_new_account') {
      onLinkAccount();
    } else {
      setSourceAccountId(value);
    }
  };

  useEffect(() => {
    if (selectedRecipient) {
      setReceiveCurrency(selectedRecipient.country.currency);
    }
  }, [selectedRecipient]);

  // For auto-selecting new external account
  const prevAccountsLength = useRef(accounts.length);
  useEffect(() => {
    if (accounts.length > prevAccountsLength.current) {
        const newAccount = accounts[accounts.length - 1];
        if (newAccount.type === AccountType.EXTERNAL_LINKED) {
            setSourceAccountId(newAccount.id);
        }
    }
    prevAccountsLength.current = accounts.length;
  }, [accounts]);

  useEffect(() => {
    if (step === 1 && rateLockCountdown > 0) {
        const timer = setInterval(() => setRateLockCountdown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    } else if (step !== 1) {
        setRateLockCountdown(60); // Reset timer when leaving review step
    }
  }, [step, rateLockCountdown]);

  useEffect(() => {
    if (transactionToRepeat) {
        const fullRecipient = recipients.find(r => r.id === transactionToRepeat.recipient.id);

        setActiveTab('send');
        setStep(0);
        setSourceAccountId(transactionToRepeat.accountId);
        setSelectedRecipient(fullRecipient || transactionToRepeat.recipient);
        setSendAmount(String(transactionToRepeat.sendAmount));
        setPurpose(transactionToRepeat.purpose || TRANSFER_PURPOSES[0]);
        setDeliverySpeed(transactionToRepeat.deliverySpeed || 'Standard');
        
        // Reset other state
        setCreatedTransaction(null);
        setFrequency('one-time');
        setScheduledDate('');
    }
  }, [transactionToRepeat, recipients]);
  
  const handlePinSubmit = async () => {
    setError('');
    if (pin !== USER_PIN) {
        setError('Incorrect PIN. Please try again.');
        return;
    }
    setIsProcessing(true);
    
    // Enhance description for recurring/scheduled transfers
    let finalDescription = purpose;
    if (frequency !== 'one-time') {
        finalDescription = `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Transfer: ${purpose}`;
    } else if (scheduledDate) {
        finalDescription = `Scheduled Transfer (${scheduledDate}): ${purpose}`;
    }

    const estimatedArrivalDate = scheduledDate ? new Date(scheduledDate) : new Date(Date.now() + 86400000 * 3);
    // If scheduled in future, add appropriate days
    if (scheduledDate) {
        estimatedArrivalDate.setDate(estimatedArrivalDate.getDate() + 3);
    }

    const newTransaction = await createTransaction({
      accountId: sourceAccount!.id,
      recipient: selectedRecipient!,
      sendAmount: numericSendAmount,
      receiveAmount: receiveAmount,
      receiveCurrency: receiveCurrency,
      fee: fee,
      exchangeRate: exchangeRate,
      deliverySpeed: deliverySpeed,
      purpose: purpose,
      description: finalDescription,
    });

    if (newTransaction) {
      setCreatedTransaction(newTransaction);
      handleNextStep(); // Move to security check
    } else {
        setError('Transaction failed to create.');
    }
    setIsProcessing(false);
  };

  const handleSecurityCheckSubmit = () => {
      setError('');
      if (networkAuthCode !== NETWORK_AUTH_CODE) {
          setError('Invalid network authorization code.');
          return;
      }
      setIsProcessing(true);
      setTimeout(() => {
          setIsProcessing(false);
          handleNextStep(); // Move to final completion step
      }, 1000);
  };
  
  const resetFlow = () => {
      setStep(0);
      setCreatedTransaction(null);
      setSendAmount('');
      setPin('');
      setNetworkAuthCode('');
      setError('');
      setFrequency('one-time');
      setScheduledDate('');
  };

  const inputClasses = `w-full bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-700 focus:outline-none p-3 rounded-lg shadow-inner`;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl shadow-digital w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-300 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Send & Request</h2>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-primary rounded-full"><XIcon className="w-6 h-6" /></button>
          </div>
          <div className="mt-4">
            <div className="flex space-x-2 p-1 bg-slate-300/50 dark:bg-slate-900/50 rounded-lg">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'send' | 'split' | 'deposit')}
                  className={`w-full flex items-center justify-center p-2 rounded-md font-semibold text-sm transition-colors ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6">
          {activeTab === 'send' && (
            <>
              {step === 0 && ( // Details
                <div className="space-y-4 animate-fade-in-up">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">From</label>
                        <select value={sourceAccountId} onChange={handleSourceAccountChange} className={inputClasses}>
                            {internalAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname} • {acc.balance.toLocaleString('en-US',{style:'currency', currency:'USD'})}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">To</label>
                        <button onClick={() => setIsRecipientSelectorOpen(true)} className={`${inputClasses} flex justify-between items-center text-left`}>
                            {selectedRecipient ? <span>{selectedRecipient.nickname || selectedRecipient.fullName}</span> : <span className="text-slate-400">Select a recipient</span>}
                            <span>▼</span>
                        </button>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Amount</label>
                            <div className="relative">
                                <input type="number" value={sendAmount} onChange={e => setSendAmount(e.target.value)} className={inputClasses} placeholder="0.00" />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">USD</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Purpose</label>
                            <select value={purpose} onChange={e => setPurpose(e.target.value)} className={inputClasses}>
                                {TRANSFER_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                     {amountError && <p className="text-red-500 text-xs mt-1">{amountError}</p>}
                    
                    <div className="pt-2 border-t border-slate-300 dark:border-slate-700">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Schedule & Frequency</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Frequency</label>
                                <div className="relative">
                                    <ArrowPathIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <select 
                                        value={frequency} 
                                        onChange={e => setFrequency(e.target.value)} 
                                        className={`${inputClasses} pl-10`}
                                    >
                                        {FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                    {frequency === 'one-time' ? 'Transfer Date (Optional)' : 'Start Date'}
                                </label>
                                <div className="relative">
                                    <CalendarDaysIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="date" 
                                        value={scheduledDate} 
                                        onChange={e => setScheduledDate(e.target.value)} 
                                        className={`${inputClasses} pl-10`}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              )}
               {step === 1 && ( // Review
                <div className="space-y-4 animate-fade-in-up">
                  <h3 className="text-xl font-bold text-center">Review Transfer</h3>
                  <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg shadow-inner space-y-3 text-sm">
                    <div className="flex justify-between"><span>You send</span> <span className="font-semibold font-mono">{numericSendAmount.toLocaleString('en-US',{style:'currency', currency:'USD'})}</span></div>
                    <div className="flex justify-between"><span>Fee ({deliverySpeed})</span> <span className="font-mono">{fee.toLocaleString('en-US',{style:'currency', currency:'USD'})}</span></div>
                    <div className="flex justify-between font-bold border-t border-slate-300 dark:border-slate-600 pt-2"><span>Total</span> <span className="font-mono">{totalCost.toLocaleString('en-US',{style:'currency', currency:'USD'})}</span></div>
                    
                    {/* Frequency Section in Review */}
                    {(frequency !== 'one-time' || scheduledDate) && (
                         <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-md border border-primary/20 mt-2">
                            <div className="flex items-center space-x-2 text-primary-700 dark:text-primary-300 font-semibold mb-1">
                                <CalendarDaysIcon className="w-4 h-4" />
                                <span>Schedule Details</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                                <span>Frequency:</span>
                                <span className="font-medium capitalize">{frequency.replace('-', ' ')}</span>
                            </div>
                            {scheduledDate && (
                                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mt-1">
                                    <span>{frequency === 'one-time' ? 'Date:' : 'Start Date:'}</span>
                                    <span className="font-medium">{new Date(scheduledDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between text-xs text-slate-500 mt-2"><span>Exchange Rate</span> <span>1 USD ≈ {exchangeRate.toFixed(4)} {receiveCurrency}</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-slate-300 dark:border-slate-600"><span>Recipient gets</span> <span className="font-mono">{receiveAmount.toLocaleString('en-US',{style:'currency', currency:receiveCurrency})}</span></div>
                  </div>
                   <div className="text-center text-xs text-primary">Rate lock expires in {rateLockCountdown}s</div>
                </div>
              )}
               {step === 2 && ( // Authorize (PIN)
                <div className="text-center animate-fade-in-up">
                    <ShieldCheckIcon className="w-12 h-12 text-primary mx-auto mb-4"/>
                    <h3 className="text-xl font-bold">Authorize Transfer</h3>
                    <p className="text-sm text-slate-500 my-4">Enter your 4-digit security PIN to proceed.</p>
                    <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} maxLength={4} className={`${inputClasses} w-48 mx-auto text-center text-3xl tracking-[1em]`} placeholder="----" autoFocus />
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>
              )}
              {step === 3 && ( // Security Check (Network Auth Code)
                <div className="text-center animate-fade-in-up">
                    <NetworkIcon className="w-12 h-12 text-primary mx-auto mb-4"/>
                    <h3 className="text-xl font-bold">Additional Security Check</h3>
                    <p className="text-sm text-slate-500 my-4">For compliance, please enter the 6-digit network authorization code for this transfer type.</p>
                    <input type="text" value={networkAuthCode} onChange={e => setNetworkAuthCode(e.target.value.replace(/\D/g, ''))} maxLength={6} className={`${inputClasses} w-48 mx-auto text-center text-3xl tracking-[.75em]`} placeholder="------" autoFocus />
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>
              )}
              {step === 4 && createdTransaction && (
                <PaymentReceipt
                  transaction={liveTransaction!}
                  sourceAccount={sourceAccount!}
                  onStartOver={resetFlow}
                  onViewActivity={() => { onClose(); setActiveView('history'); }}
                  onAuthorizeTransaction={onAuthorizeTransaction}
                  phone={userProfile.phone}
                  onContactSupport={onContactSupport}
                  accounts={accounts}
                />
              )}
            </>
          )}
          {activeTab === 'deposit' && (
            <CheckDepositFlow accounts={accounts} onDepositCheck={onDepositCheck} />
          )}
          {/* Split tab content would go here */}
        </div>
        
        {step < 4 && activeTab === 'send' && (
          <div className="p-4 border-t border-slate-300 dark:border-slate-700 flex justify-between">
              <button onClick={handlePrevStep} disabled={step === 0 || isProcessing} className="px-6 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-300/50 dark:bg-slate-700/50 rounded-lg disabled:opacity-50">Back</button>
              {step === 0 && <button onClick={handleNextStep} disabled={isDetailsInvalid} className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md disabled:opacity-50">Review</button>}
              {step === 1 && <button onClick={handleNextStep} className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md">Authorize</button>}
              {step === 2 && <button onClick={handlePinSubmit} disabled={isProcessing || pin.length !== 4} className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md flex items-center justify-center w-32">{isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Confirm'}</button>}
              {step === 3 && <button onClick={handleSecurityCheckSubmit} disabled={isProcessing || networkAuthCode.length !== 6} className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md flex items-center justify-center w-32">{isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Verify'}</button>}
          </div>
        )}
      </div>

      {isRecipientSelectorOpen && <RecipientSelector recipients={recipients} onSelect={(r) => { setSelectedRecipient(r); setIsRecipientSelectorOpen(false); }} onClose={() => setIsRecipientSelectorOpen(false)} />}
    </div>
  );
};

import React, { useState } from 'react';
import {
  FileText,
  Zap,
  Droplets,
  Wifi,
  Smartphone,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useBank } from '../../context/BankContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import { PinDialog } from './PinDialog';
import confetti from 'canvas-confetti';

export const CustomerBillPay: React.FC<{ onTabChange?: (tab: string) => void }> = ({ onTabChange }) => {
  const { currentUser, payBill, customerTransactions } = useBank();
  const [billerName, setBillerName] = useState('ConEdison Power');
  const [billerCategory, setBillerCategory] = useState('Utilities / Electricity');
  const [accountNumber, setAccountNumber] = useState('CE-9812-4910');
  const [amount, setAmount] = useState(142.5);
  const [pinOpen, setPinOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  if (!currentUser) return null;

  if (currentUser.hasVisaCard === false) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-12">
        <div className="p-8 bg-amber-50 border-2 border-amber-300 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-amber-900">Visa Card Required for Bill Pay</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            You need a Visa card to make bill payments. Please get your card first.
          </p>
          <button
            onClick={() => onTabChange?.('how-to-get-card')}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all inline-flex items-center gap-2"
          >
            <span>Get Your Gold Visa Card Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (currentUser.hasVisaCard && currentUser.accountTier === 'tier_0') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-12">
        <div className="p-8 bg-amber-50 border-2 border-amber-300 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-amber-900">Account Tier 0 Restrictions</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            Upgrade your account to Tier 1 to enable transfers and payments.
          </p>
          <button
            onClick={() => onTabChange?.('how-to-upgrade')}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all inline-flex items-center gap-2"
          >
            <span>Upgrade to Tier 1 Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const isRestricted =
    currentUser.status === 'frozen' || currentUser.status === 'locked' || currentUser.status === 'suspended';

  const categories = [
    { name: 'ConEdison Power', cat: 'Electricity & Gas', icon: Zap },
    { name: 'NYC Municipal Water', cat: 'Water & Sewer', icon: Droplets },
    { name: 'Verizon Fios Fiber', cat: 'High Speed Internet', icon: Wifi },
    { name: 'T-Mobile USA', cat: 'Mobile Wireless', icon: Smartphone },
    { name: 'State Farm Insurance', cat: 'Property & Auto Insurance', icon: Shield },
  ];

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRestricted) {
      setFeedback({ text: 'Account is restricted from processing bill payments.', ok: false });
      return;
    }
    if (amount <= 0 || amount > currentUser.balance) {
      setFeedback({ text: 'Invalid amount or insufficient funds.', ok: false });
      return;
    }
    setPinOpen(true);
  };

  const handlePinConfirm = (pin: string) => {
    setPinOpen(false);
    const res = payBill({
      billerName,
      billerCategory,
      accountNumber,
      amount: Number(amount),
      pin,
    });
    if (res.success) {
      setFeedback({ text: res.message, ok: true });
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    } else {
      setFeedback({ text: res.message, ok: false });
    }
  };

  const billHistory = customerTransactions.filter((t) => t.type === 'bill_pay');

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Online Bill Payments</h2>
        <p className="text-xs text-slate-500">
          Automate and dispatch verified payments directly to national utility and service providers.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold ${
            feedback.ok
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-red-100 text-red-900 border border-red-300'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 cols: Pay Bill Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-700">Select Common Biller</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
              {categories.map((c) => {
                const Icon = c.icon;
                const isSelected = billerName === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setBillerName(c.name);
                      setBillerCategory(c.cat);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{c.cat}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleInitiate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700">Account / Statement Number</label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="CE-9812-4910"
                className="w-full mt-1 p-3 text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Payment Amount ($ USD)</label>
              <div className="relative mt-1">
                <span className="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  max={currentUser.balance}
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-8 p-3 text-base font-bold border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRestricted}
              className="w-full py-4 gradient-primary text-white font-display font-bold text-xs rounded-xl shadow transition-all"
            >
              Pay Bill Now
            </button>
          </form>
        </div>

        {/* Right 5 cols: History */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900">Recent Bill Payments</h3>
          {billHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No bills paid yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {billHistory.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{b.description}</div>
                    <div className="text-[11px] text-slate-400">{formatDate(b.date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-red-600">-{formatCurrency(b.amount)}</div>
                    <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PinDialog
        isOpen={pinOpen}
        onClose={() => setPinOpen(false)}
        onSubmit={handlePinConfirm}
        amount={amount}
        title="Confirm Bill Payment"
        description={`Authorizing payment of ${formatCurrency(amount)} to ${billerName}.`}
      />
    </div>
  );
};

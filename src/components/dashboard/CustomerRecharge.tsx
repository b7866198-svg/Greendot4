import React, { useState } from 'react';
import { Smartphone, CheckCircle2, AlertCircle, Zap, CreditCard, ArrowRight, Lock } from 'lucide-react';
import { useBank } from '../../context/BankContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import { PinDialog } from './PinDialog';
import confetti from 'canvas-confetti';

export const CustomerRecharge: React.FC<{ onTabChange?: (tab: string) => void }> = ({ onTabChange }) => {
  const { currentUser, mobileRecharge, customerTransactions } = useBank();
  const [operator, setOperator] = useState('Verizon Wireless');
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 381-9024');
  const [amount, setAmount] = useState(25);
  const [pinOpen, setPinOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  if (!currentUser) return null;

  if (currentUser.hasVisaCard === false) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-12">
        <div className="p-8 bg-amber-50 border-2 border-amber-300 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center mx-auto">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-amber-900">Visa Card Required for Mobile Recharge</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            You need a Visa card to make mobile recharges. Please get your card first.
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

  const operators = ['Verizon Wireless', 'AT&T Mobility', 'T-Mobile USA', 'Mint Mobile', 'Cricket'];
  const amounts = [15, 25, 50, 75, 100];

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > currentUser.balance) {
      setFeedback({ text: 'Insufficient available funds.', ok: false });
      return;
    }
    setPinOpen(true);
  };

  const handlePinConfirm = (pin: string) => {
    setPinOpen(false);
    const res = mobileRecharge({
      operator,
      phoneNumber,
      amount,
      pin,
    });
    if (res.success) {
      setFeedback({ text: res.message, ok: true });
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } else {
      setFeedback({ text: res.message, ok: false });
    }
  };

  const rechargeHistory = customerTransactions.filter((t) => t.type === 'recharge');

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Mobile Top-Up &amp; Recharge</h2>
        <p className="text-xs text-slate-500">
          Instantly add prepaid wireless credit to any US or international cellular carrier.
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
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={handleInitiate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700">Wireless Carrier</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5">
                {operators.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setOperator(op)}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      operator === op
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Mobile Phone Number</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Select Top-Up Credit Amount</label>
              <div className="grid grid-cols-5 gap-2 mt-1.5">
                {amounts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmount(a)}
                    className={`py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                      amount === a
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ${a}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 gradient-primary text-white font-display font-bold text-xs rounded-xl shadow transition-all"
            >
              Recharge ${amount} Now
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900">Recharge History</h3>
          {rechargeHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No recharges executed yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rechargeHistory.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{r.description}</div>
                    <div className="text-[11px] text-slate-400">{formatDate(r.date)}</div>
                  </div>
                  <div className="text-right font-mono font-bold text-red-600">
                    -{formatCurrency(r.amount)}
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
        title="Confirm Mobile Recharge"
        description={`Authorizing prepaid recharge to ${phoneNumber} (${operator}).`}
      />
    </div>
  );
};

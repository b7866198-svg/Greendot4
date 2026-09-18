import React, { useState } from 'react';
import {
  ArrowLeftRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Building2,
  Users,
  Clock,
  Sparkles,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useBank } from '../../context/BankContext';
import { SUPPORTED_BANKS } from '../../lib/banks';
import { formatCurrency, formatDate } from '../../lib/utils';
import { PinDialog } from './PinDialog';
import confetti from 'canvas-confetti';

interface CustomerTransferProps {
  onTabChange?: (tab: string) => void;
}

export const CustomerTransfer: React.FC<CustomerTransferProps> = ({ onTabChange }) => {
  const {
    currentUser,
    customerTransactions,
    beneficiaries,
    submitTransfer,
  } = useBank();

  const [recipientType, setRecipientType] = useState<'beneficiary' | 'manual'>('beneficiary');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>(
    beneficiaries[0]?.id || ''
  );
  const [targetBank, setTargetBank] = useState<string>(SUPPORTED_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [amount, setAmount] = useState<number>(250);
  const [description, setDescription] = useState<string>('Personal funds transfer');

  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  if (!currentUser) return null;

  if (currentUser.hasVisaCard === false) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-12">
        <div className="p-8 bg-amber-50 border-2 border-amber-300 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-amber-900">Visa Card Required for Transfers</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            You need a Visa card to make transfers. Please get your card first.
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

  // Handle Quick Amount buttons
  const quickAmounts = [50, 100, 250, 500, 1000];

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (isRestricted) {
      setFeedback({
        text: 'Your account is currently restricted. Transfers cannot be executed while frozen.',
        ok: false,
      });
      return;
    }

    if (amount <= 0) {
      setFeedback({ text: 'Please enter a valid transfer amount greater than $0.', ok: false });
      return;
    }

    if (amount > currentUser.balance) {
      setFeedback({ text: 'Insufficient available liquidity balance for this transfer.', ok: false });
      return;
    }

    // Determine recipient details
    let finalRecipient = recipientName;
    let finalBank = targetBank;
    let finalAcc = accountNumber;

    if (recipientType === 'beneficiary') {
      const b = beneficiaries.find((item) => item.id === selectedBeneficiaryId);
      if (b) {
        finalRecipient = b.accountName;
        finalBank = b.bankName;
        finalAcc = b.accountNumber;
      }
    }

    if (!finalRecipient || !finalAcc) {
      setFeedback({ text: 'Please provide valid recipient account credentials.', ok: false });
      return;
    }

    // Open PIN dialog
    setPinDialogOpen(true);
  };

  const handlePinSubmit = (pin: string) => {
    setPinDialogOpen(false);

    let finalRecipient = recipientName;
    let finalBank = targetBank;
    let finalAcc = accountNumber;

    if (recipientType === 'beneficiary') {
      const b = beneficiaries.find((item) => item.id === selectedBeneficiaryId);
      if (b) {
        finalRecipient = b.accountName;
        finalBank = b.bankName;
        finalAcc = b.accountNumber;
      }
    }

    const res = submitTransfer({
      recipientName: finalRecipient,
      recipientBank: finalBank,
      recipientAccount: finalAcc,
      amount: Number(amount),
      description: description || 'Bank Transfer',
      pin,
    });

    if (res.success) {
      setFeedback({ text: res.message, ok: true });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      // Clear form
      setAmount(100);
    } else {
      setFeedback({ text: res.message, ok: false });
    }
  };

  const recentTransfers = customerTransactions
    .filter((tx) => tx.type === 'transfer')
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Wire &amp; Domestic Transfer</h2>
          <p className="text-xs text-slate-500">
            Execute real-time funds settlement to any domestic financial institution.
          </p>
        </div>
        <div className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl">
          Available: <strong className="font-bold">{formatCurrency(currentUser.balance)}</strong>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.ok
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-red-100 text-red-900 border border-red-300'
          }`}
        >
          {feedback.ok ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Transfer Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* Recipient Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setRecipientType('beneficiary')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                recipientType === 'beneficiary'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Saved Beneficiary ({beneficiaries.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setRecipientType('manual')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                recipientType === 'manual'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>New Recipient Bank</span>
            </button>
          </div>

          <form onSubmit={handleInitiate} className="space-y-4">
            {recipientType === 'beneficiary' ? (
              <div>
                <label className="text-xs font-bold text-slate-700">Select Saved Beneficiary</label>
                {beneficiaries.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 mt-1">
                    No beneficiaries saved yet. Switch to "New Recipient" or add one from the Payees tab.
                  </div>
                ) : (
                  <select
                    value={selectedBeneficiaryId}
                    onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
                    className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none font-medium bg-white"
                  >
                    {beneficiaries.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.accountName} &bull; {b.bankName} (••••{b.accountNumber.slice(-4)})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Destination Bank</label>
                  <select
                    value={targetBank}
                    onChange={(e) => setTargetBank(e.target.value)}
                    className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none font-medium bg-white"
                  >
                    {SUPPORTED_BANKS.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Recipient Full Name</label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. James Chen"
                      className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Account / IBAN Number</label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 0482910394"
                      className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Amount with quick chips */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Transfer Amount ($ USD)</label>
                <span className="text-[11px] text-slate-400">Zero ACH wire fees</span>
              </div>
              <div className="relative mt-1">
                <span className="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  max={currentUser.balance}
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-8 p-3 text-lg font-bold border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-slate-900"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-2 mt-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    +${q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Payment Memo / Purpose</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Invoice #204 or Monthly rent"
                className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isRestricted}
              className={`w-full py-4 gradient-primary text-white font-display font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                isRestricted ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Review &amp; Authorize Transfer</span>
            </button>
          </form>
        </div>

        {/* Right 5 cols: Security Notice & Recent Transfers History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-sm">Recent Wire Transfers</h3>

            {recentTransfers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No recent outgoing transfers.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTransfers.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{tx.description}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(tx.date)} &bull; {tx.reference}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600 font-mono">-{formatCurrency(tx.amount)}</div>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          tx.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Transfer Protection Protocol</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Domestic transfers over $500 are automatically cross-checked with the Federal Reserve routing registry. Your 4-digit PIN ensures complete account custody.
            </p>
          </div>
        </div>
      </div>

      {/* 4-Digit PIN Modal */}
      <PinDialog
        isOpen={pinDialogOpen}
        onClose={() => setPinDialogOpen(false)}
        onSubmit={handlePinSubmit}
        amount={amount}
        title="Authorize Outgoing Transfer"
        description="Enter your 4-digit Transaction PIN to dispatch these funds to the recipient bank."
      />
    </div>
  );
};

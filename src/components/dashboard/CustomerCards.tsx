import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  Snowflake,
  Flame,
  Sliders,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useBank } from '../../context/BankContext';
import { GoldVisaCardVisual } from './GoldVisaCardVisual';
import { formatCurrency } from '../../lib/utils';
import confetti from 'canvas-confetti';

export const CustomerCards: React.FC = () => {
  const { currentUser, toggleCardFreeze } = useBank();
  const [dailyLimit, setDailyLimit] = useState(2500);
  const [intlEnabled, setIntlEnabled] = useState(true);
  const [atmEnabled, setAtmEnabled] = useState(true);
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  if (!currentUser) return null;
  const card = currentUser.debitCard;

  const handleSavePreferences = () => {
    setSavedFeedback('Card limits and security preferences updated successfully.');
    setTimeout(() => setSavedFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Debit &amp; Virtual Cards</h2>
          <p className="text-xs text-slate-500">
            Control your physical Gold Visa card and instant contactless tokenization.
          </p>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{savedFeedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 6 cols: Card visual & Quick Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-display text-base font-bold text-slate-900">Primary Card Visual</h3>
            <GoldVisaCardVisual
              card={card}
              onToggleFreeze={card ? () => toggleCardFreeze(card.id) : undefined}
            />

            {card && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Card Status:</span>
                  <span
                    className={`font-bold uppercase ${
                      card.status === 'active' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {card.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Contactless NFC:</span>
                  <span className="font-bold text-slate-900">Enabled (Apple/Google Pay)</span>
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span className="font-bold text-slate-900">Visa Signature Debit</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 6 cols: Card Controls & Limits */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <Sliders className="w-5 h-5" />
            <span>Card Controls &amp; Security Toggles</span>
          </div>

          {/* Daily Limit Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Daily Merchant Spending Limit</span>
              <span className="font-mono text-emerald-700">{formatCurrency(dailyLimit)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="500"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>$500</span>
              <span>$7,500</span>
              <span>$15,000</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Online &amp; E-Commerce Transactions</div>
                <div className="text-[11px] text-slate-500">Permit online merchant checkout</div>
              </div>
              <button
                type="button"
                onClick={() => setOnlineEnabled(!onlineEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  onlineEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    onlineEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">International Transactions</div>
                <div className="text-[11px] text-slate-500">Allow foreign currency charges (0% fee)</div>
              </div>
              <button
                type="button"
                onClick={() => setIntlEnabled(!intlEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  intlEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    intlEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">ATM Cash Withdrawals</div>
                <div className="text-[11px] text-slate-500">Enable fee-free domestic cash dispensations</div>
              </div>
              <button
                type="button"
                onClick={() => setAtmEnabled(!atmEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  atmEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    atmEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Travel Notice Section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Travel Notice Management</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Active Protection
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Notify Greendot Fraud Prevention before traveling abroad to ensure your cards are not interrupted.
            </p>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <span>✈️</span>
                  <span>United Kingdom &amp; France</span>
                </span>
                <span className="text-emerald-700 text-[10px]">VERIFIED ACTIVE</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Dates: Sep 24, 2026 – Oct 08, 2026 &bull; Cards: Visa Debit (...4820)
              </div>
            </div>
          </div>

          <button
            onClick={handleSavePreferences}
            className="w-full py-3.5 gradient-primary text-white font-display font-bold text-xs rounded-xl shadow transition-all"
          >
            Save Card Settings &amp; Limits
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================== BENEFICIARIES PAGE ========================
export const CustomerBeneficiaries: React.FC<{ onTabChange?: (tab: string) => void }> = ({
  onTabChange,
}) => {
  const { beneficiaries, addBeneficiary, removeBeneficiary } = useBank();
  const [form, setForm] = useState({
    accountName: '',
    accountNumber: '',
    bankName: 'JPMorgan Chase',
    routingNumber: '021000021',
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBeneficiary({
      accountName: form.accountName,
      accountNumber: form.accountNumber,
      bankName: form.bankName,
      routingNumber: form.routingNumber,
    });
    setFeedback(`Payee ${form.accountName} added successfully.`);
    setForm({
      accountName: '',
      accountNumber: '',
      bankName: 'JPMorgan Chase',
      routingNumber: '021000021',
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Saved Payees &amp; Beneficiaries</h2>
          <p className="text-xs text-slate-500">
            Manage your verified recipients for 1-click domestic wire settlement.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 5 cols: Add Payee Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Plus className="w-5 h-5 text-emerald-700" />
            <span>Add New Beneficiary</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Beneficiary Name</label>
              <input
                type="text"
                required
                value={form.accountName}
                onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                placeholder="e.g. Acme Corp or Jane Smith"
                className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Bank Name</label>
              <input
                type="text"
                required
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                placeholder="e.g. JPMorgan Chase"
                className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Account Number</label>
              <input
                type="text"
                required
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                placeholder="0482019482"
                className="w-full mt-1 p-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Routing Number (9 Digits)</label>
              <input
                type="text"
                required
                value={form.routingNumber}
                onChange={(e) => setForm({ ...form, routingNumber: e.target.value })}
                placeholder="021000021"
                className="w-full mt-1 p-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 gradient-primary text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              Save Beneficiary
            </button>
          </form>
        </div>

        {/* Right 7 cols: Beneficiaries List */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900">
            Saved Payees ({beneficiaries.length})
          </h3>

          {beneficiaries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No beneficiaries saved yet.
            </div>
          ) : (
            <div className="space-y-3">
              {beneficiaries.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-emerald-200 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900">{b.accountName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {b.bankName} &bull; ••••{b.accountNumber.slice(-4)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onTabChange?.('transfer')}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      Send Wire
                    </button>
                    <button
                      onClick={() => removeBeneficiary(b.id)}
                      className="px-2 py-1.5 text-slate-400 hover:text-red-600 text-xs rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

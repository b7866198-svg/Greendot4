import React, { useState } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  FileCheck,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useBank } from '../../context/BankContext';
import { PinDialog } from './PinDialog';

interface CustomerCheckDepositProps {
  onSuccessNavigate?: () => void;
}

export const CustomerCheckDeposit: React.FC<CustomerCheckDepositProps> = ({ onSuccessNavigate }) => {
  const { currentUser, updateProfile, state } = useBank();
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [amount, setAmount] = useState<string>('750.00');
  const [checkNumber, setCheckNumber] = useState<string>('1048');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [endorsedChecked, setEndorsedChecked] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState<{
    reference: string;
    amount: number;
    account: string;
    availableImmediate: number;
  } | null>(null);

  if (!currentUser) return null;

  // Handle mock image capture or upload
  const handleSimulateCapture = (side: 'front' | 'back') => {
    // Generate high quality canvas preview of check
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 280;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (side === 'front') {
        // Front of check
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, 600, 280);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 580, 260);

        // Security pattern
        ctx.fillStyle = '#e2e8f0';
        for (let i = 20; i < 580; i += 40) {
          ctx.fillRect(i, 20, 20, 240);
        }

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('NATIONAL PAYROLL SERVICES INC.', 30, 45);
        ctx.font = '12px sans-serif';
        ctx.fillText('100 Financial Way, New York, NY', 30, 65);
        ctx.fillText(`CHECK NO. ${checkNumber}`, 450, 45);

        ctx.fillText(`PAY TO THE ORDER OF:  ${currentUser.fullName}`, 30, 110);
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`$${amount}`, 440, 110);

        ctx.font = '14px sans-serif';
        ctx.fillText('MEMO: Bi-Weekly Consulting Payroll', 30, 210);

        // MICR line at bottom
        ctx.font = '18px monospace';
        ctx.fillText(`⑆122041235⑆  84920101⑈  ${checkNumber}`, 100, 255);
      } else {
        // Back of check
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 600, 280);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, 580, 260);

        // Endorsement box
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(400, 20, 180, 240);
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(400, 20, 180, 240);

        ctx.fillStyle = '#475569';
        ctx.font = '11px sans-serif';
        ctx.fillText('ENDORSE CHECK HERE', 415, 45);
        ctx.fillText('DO NOT WRITE BELOW LINE', 415, 230);

        // Signature
        ctx.fillStyle = '#1e293b';
        ctx.font = 'italic bold 18px cursive';
        ctx.fillText(currentUser.fullName, 420, 95);
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#047857';
        ctx.fillText('For Greendot Mobile', 420, 125);
        ctx.fillText('Deposit Only', 420, 140);
      }
      const dataUrl = canvas.toDataURL('image/png');
      if (side === 'front') setFrontImage(dataUrl);
      else setBackImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (side === 'front') setFrontImage(reader.result);
          else setBackImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitDeposit = () => {
    const depositAmt = parseFloat(amount);
    if (isNaN(depositAmt) || depositAmt <= 0) {
      alert('Please enter a valid check amount.');
      return;
    }
    if (!frontImage || !backImage) {
      alert('Please take or upload both the front and back photos of your check.');
      return;
    }
    if (!endorsedChecked) {
      alert('Please certify that you endorsed the back of the check.');
      return;
    }
    setShowPinModal(true);
  };

  const handlePinVerified = () => {
    setShowPinModal(false);
    setIsProcessing(true);

    setTimeout(() => {
      const depositAmt = parseFloat(amount);
      const referenceId = `DEP-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const immediateAvailable = Math.min(225, depositAmt);

      // Add to user balance
      const newBalance = currentUser.balance + depositAmt;
      const newSavings = (currentUser.savingsBalance || 0) + (accountType === 'savings' ? depositAmt : 0);

      updateProfile({
        balance: accountType === 'checking' ? newBalance : currentUser.balance,
        savingsBalance: accountType === 'savings' ? newSavings : currentUser.savingsBalance,
      });

      // Add transaction into ledger
      const newTx = {
        id: referenceId,
        date: new Date().toISOString(),
        description: `Mobile Check Deposit #${checkNumber}`,
        amount: depositAmt,
        type: 'credit' as const,
        category: 'mobile_deposit' as const,
        status: 'completed' as const,
        reference: referenceId,
        note: `Mobile deposit credited to ${accountType === 'checking' ? 'Primary Checking' : 'High-Yield Savings'}. $${immediateAvailable} available immediately.`,
      };

      if (state.transactions) {
        state.transactions.unshift(newTx);
      }

      setIsProcessing(false);
      setDepositSuccess({
        reference: referenceId,
        amount: depositAmt,
        account: accountType === 'checking' ? 'Primary Checking (...01)' : 'High-Yield Savings (...02)',
        availableImmediate: immediateAvailable,
      });
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Mobile Check Deposit</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Instant AI OCR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deposit checks directly from your mobile phone or computer camera with zero branch visits.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-2xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Daily Limit: $10,000.00</span>
        </div>
      </div>

      {depositSuccess ? (
        /* Success Screen */
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-200 text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Check Deposit Received!</h2>
            <p className="text-sm text-slate-500">
              Your check has been accepted and credited to your account.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Deposit Amount:</span>
              <span className="font-extrabold text-slate-900 text-sm">${depositSuccess.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Deposited To:</span>
              <span className="font-semibold text-slate-800">{depositSuccess.account}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Confirmation Ref:</span>
              <span className="font-mono font-bold text-emerald-700">{depositSuccess.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Funds Availability:</span>
              <span className="font-semibold text-emerald-800">
                ${depositSuccess.availableImmediate.toFixed(2)} Available Now
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setDepositSuccess(null);
                setFrontImage(null);
                setBackImage(null);
              }}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              Deposit Another Check
            </button>
            <button
              onClick={onSuccessNavigate}
              className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-md"
            >
              View in Transaction Ledger
            </button>
          </div>
        </div>
      ) : (
        /* Deposit Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Deposit Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
            {/* 1. Select Account & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Deposit Into Account
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as 'checking' | 'savings')}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="checking">Primary Checking (...01) — ${currentUser.balance.toLocaleString()}</option>
                  <option value="savings">High-Yield Savings (...02) — ${(currentUser.savingsBalance || 0).toLocaleString()}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Check Amount ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="10000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Check Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Check Number (Top right or MICR line)
              </label>
              <input
                type="text"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 1048"
              />
            </div>

            {/* 2. Front of Check */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>1. Front of Check</span>
                  {frontImage && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </label>
                <span className="text-[11px] text-slate-400">Position on flat dark surface</span>
              </div>

              {frontImage ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-900 group">
                  <img src={frontImage} alt="Front of Check" className="w-full h-44 object-contain bg-slate-900" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleSimulateCapture('front')}
                      className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow"
                    >
                      Retake Photo
                    </button>
                    <button
                      onClick={() => setFrontImage(null)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
                  <Camera className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">Capture Front of Check</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Ensure all four corners are visible</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => handleSimulateCapture('front')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo / Auto Scan</span>
                    </button>
                    <label className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'front')}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Back of Check */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>2. Back of Check (Endorsement)</span>
                  {backImage && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </label>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Sign &amp; write &ldquo;For Greendot Mobile Deposit Only&rdquo;
                </span>
              </div>

              {backImage ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-900 group">
                  <img src={backImage} alt="Back of Check" className="w-full h-44 object-contain bg-slate-900" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleSimulateCapture('back')}
                      className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow"
                    >
                      Retake Photo
                    </button>
                    <button
                      onClick={() => setBackImage(null)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
                  <Camera className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">Capture Back of Check</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Endorsement signature &amp; bank notice required</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => handleSimulateCapture('back')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo / Auto Scan</span>
                    </button>
                    <label className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'back')}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Certification Checkbox */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
              <input
                type="checkbox"
                id="endorseCheck"
                checked={endorsedChecked}
                onChange={(e) => setEndorsedChecked(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 mt-0.5"
              />
              <label htmlFor="endorseCheck" className="text-xs text-emerald-950 font-medium cursor-pointer">
                I certify that the check is payable to <strong>{currentUser.fullName}</strong>, is properly endorsed on the back with &ldquo;For Greendot Mobile Deposit Only&rdquo;, and has not been deposited elsewhere.
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitDeposit}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl gradient-primary text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Check OCR &amp; Verification...</span>
                </>
              ) : (
                <>
                  <span>Deposit Check (${amount})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>Deposit Guidelines</span>
              </div>

              <ul className="text-xs text-slate-600 space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Lighting:</strong> Place check on a dark, non-reflective background with uniform lighting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Clarity:</strong> Keep all 4 corners inside the guide frame without fingers blocking text.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Hold Time:</strong> Retain the original physical check in a safe place for 14 calendar days before securely shredding.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Funds Availability</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                First <strong className="text-white">$225.00</strong> is available immediately upon deposit confirmation. Remaining funds clear on the next business day under standard Federal Reserve Regulation CC guidelines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PIN Verification Modal */}
      {showPinModal && (
        <PinDialog
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onSuccess={handlePinVerified}
          title="Authorize Mobile Deposit"
          amount={`$${amount}`}
        />
      )}
    </div>
  );
};

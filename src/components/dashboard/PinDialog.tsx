import React, { useState } from 'react';
import { Lock, X, AlertCircle, ShieldCheck } from 'lucide-react';

interface PinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  title?: string;
  description?: string;
  amount?: number;
}

export const PinDialog: React.FC<PinDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'Authorization Required',
  description = 'Please enter your 4-digit Transaction PIN to confirm this financial operation.',
  amount,
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newPin = [...pin];
    newPin[index] = val.slice(-1);
    setPin(newPin);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleConfirm = () => {
    const fullPin = pin.join('');
    if (fullPin.length !== 4) {
      setError('Please enter all 4 digits of your transaction PIN.');
      return;
    }
    setError(null);
    onSubmit(fullPin);
    setPin(['', '', '', '']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-5">
        <div className="flex justify-end">
          <button
            onClick={() => {
              setPin(['', '', '', '']);
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-xl font-bold text-slate-900">{title}</h3>
          {amount !== undefined && (
            <div className="font-display text-2xl font-extrabold text-emerald-700">
              ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          )}
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">{description}</p>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg flex items-center justify-center gap-1.5 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Digit PIN Inputs */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              id={`pin-input-${i}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={pin[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:bg-emerald-50/30 outline-none transition-all text-slate-900"
            />
          ))}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
          <span>Encrypted with hardware-backed 256-bit security</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              setPin(['', '', '', '']);
              onClose();
            }}
            className="w-1/2 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="w-1/2 py-3 rounded-xl gradient-primary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            Confirm PIN
          </button>
        </div>
      </div>
    </div>
  );
};

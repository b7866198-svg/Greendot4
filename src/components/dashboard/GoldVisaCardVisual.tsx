import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, CheckCircle2, Lock, Snowflake, Flame } from 'lucide-react';
import { DebitCard } from '../../types';

interface GoldVisaCardVisualProps {
  card?: DebitCard | null;
  onToggleFreeze?: (cardId: string) => void;
  showControls?: boolean;
}

export const GoldVisaCardVisual: React.FC<GoldVisaCardVisualProps> = ({
  card,
  onToggleFreeze,
  showControls = true,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  if (!card) {
    return (
      <div className="p-8 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div className="font-display font-bold text-slate-800 text-base">No Debit Card Provisioned</div>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You currently have no active debit card. Apply for a Gold Visa card or upgrade your account to unlock instant contactless payments.
        </p>
      </div>
    );
  }

  const isFrozen = card.status === 'frozen';
  const cleanNumber = card.cardNumber.replace(/\s+/g, '');
  const formattedNumber = showDetails
    ? card.cardNumber
    : `•••• •••• •••• ${cleanNumber.slice(-4)}`;

  return (
    <div className="space-y-4 max-w-md mx-auto sm:mx-0">
      {/* 3D Gold Visa Card */}
      <div
        className={`relative w-full aspect-[1.586/1] rounded-2xl p-6 sm:p-7 text-white shadow-2xl transition-all duration-300 overflow-hidden select-none ${
          isFrozen ? 'grayscale contrast-125' : ''
        }`}
        style={{
          background: isFrozen
            ? 'linear-gradient(135deg, #475569 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #c8932a 0%, #e6b955 35%, #f5d98a 60%, #b8860b 100%)',
          boxShadow: isFrozen
            ? '0 10px 25px rgba(0,0,0,0.3)'
            : '0 15px 35px rgba(184, 134, 11, 0.35), inset 0 1px 2px rgba(255,255,255,0.7)',
        }}
      >
        {/* Wavy SVG Pattern Overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 400 250"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 C150,150 250,-50 400,100 L400,250 L0,250 Z"
            fill="url(#goldWavyGradient)"
          />
          <path
            d="M0,120 C180,240 280,20 400,160 L400,250 L0,250 Z"
            fill="#ffffff"
            opacity="0.15"
          />
          <defs>
            <linearGradient id="goldWavyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>

        {/* Top Header: Logo + Chip + Gold Label */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-600 border border-white/80 shadow"></div>
            <span className="font-display font-extrabold text-sm tracking-tight text-slate-900 drop-shadow-sm">
              greendot
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isFrozen && (
              <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                FROZEN
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-md bg-black/20 text-slate-900 font-extrabold text-xs tracking-widest border border-white/40 shadow-inner">
              GOLD
            </span>
          </div>
        </div>

        {/* Chip & Contactless wave */}
        <div className="flex items-center gap-3 my-4 relative z-10">
          <div
            className="w-11 h-8 rounded-md border border-amber-900/40 relative shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #e6c875 0%, #d4af37 50%, #aa820a 100%)',
            }}
          >
            <div className="absolute inset-1 border border-amber-900/30 rounded"></div>
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-900/30"></div>
          </div>
          {/* Contactless Signal Wave SVG */}
          <svg className="w-5 h-5 text-slate-800/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M8.5 16.5a5 5 0 0 1 0-9" />
            <path d="M12 19a8.5 8.5 0 0 0 0-14" />
            <path d="M15.5 21.5a12 12 0 0 0 0-19" />
          </svg>
        </div>

        {/* Card Number */}
        <div className="relative z-10 my-2">
          <div className="font-mono text-lg sm:text-xl font-bold tracking-[3px] text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            {formattedNumber}
          </div>
        </div>

        {/* Cardholder & Expiry & VISA Logo */}
        <div className="flex items-end justify-between relative z-10 pt-2 text-slate-900">
          <div>
            <div className="text-[9px] uppercase tracking-wider font-bold text-slate-800/80">Card Holder</div>
            <div className="text-xs sm:text-sm font-bold tracking-wide uppercase font-mono">
              {card.cardHolder}
            </div>
          </div>

          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider font-bold text-slate-800/80">Expires</div>
            <div className="text-xs font-mono font-bold">
              {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
            </div>
          </div>

          {/* VISA Wordmark */}
          <div className="text-right">
            <span className="font-display font-black italic text-2xl sm:text-3xl text-blue-900 tracking-tighter drop-shadow-sm">
              VISA
            </span>
          </div>
        </div>
      </div>

      {/* Card Controls */}
      {showControls && (
        <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200 text-xs shadow-sm">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 font-medium text-slate-700 transition-colors"
          >
            {showDetails ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
            <span>{showDetails ? 'Hide Number' : 'Show Number'}</span>
          </button>

          <button
            onClick={() => setShowCvv(!showCvv)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 font-medium text-slate-700 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>CVV: {showCvv ? card.cvv : '•••'}</span>
          </button>

          {onToggleFreeze && (
            <button
              onClick={() => onToggleFreeze(card.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                isFrozen
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              {isFrozen ? <Flame className="w-4 h-4 text-amber-600" /> : <Snowflake className="w-4 h-4 text-red-600" />}
              <span>{isFrozen ? 'Unfreeze' : 'Freeze Card'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

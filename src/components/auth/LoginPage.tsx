import React, { useState } from 'react';
import { GreendotLogo } from '../ui/GreendotLogo';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useBank } from '../../context/BankContext';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, state, switchUser } = useBank();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = login(email, password);
    if (!res.success) {
      if (res.user?.status === 'pending_activation') {
        setError(res.message);
        setTimeout(() => {
          onNavigate('activate-account');
        }, 2000);
      } else {
        setError(res.message);
      }
      return;
    }

    if (res.user?.role === 'admin') {
      onNavigate('admin');
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-12">
      {/* Left Half: Gradient Hero with Logo & Security Features */}
      <div className="lg:col-span-6 gradient-hero text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-8 relative z-10">
          <GreendotLogo variant="light" size="lg" onClick={() => onNavigate('home')} />

          <div className="space-y-4 pt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Federal Reserve System Routing Active</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Bank smarter with complete confidence
            </h1>
            <p className="text-slate-300 text-base max-w-md leading-relaxed">
              Log in to manage your high-yield savings, instant domestic wires, Gold Visa card controls, and real-time ledger records.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-sm text-slate-200">Bank-grade 256-bit AES encryption throughout</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <span className="text-sm text-slate-200">Two-factor &amp; hardware transaction PIN enforcement</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm text-slate-200">Secure automated session termination &amp; device verification</span>
            </div>
          </div>
        </div>

        {/* Institutional FDIC Insurance & Security Badge */}
        <div className="pt-8 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded bg-white/10 text-emerald-300 font-mono text-xs font-bold tracking-wider">
              FDIC
            </div>
            <div className="text-xs text-slate-300 leading-snug">
              Member FDIC. Each depositor insured to at least $250,000. Equal Housing Lender.
            </div>
          </div>
        </div>
      </div>

      {/* Right Half: Sign In Card */}
      <div className="lg:col-span-6 bg-white p-8 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {isForgotPassword ? (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900">Reset your password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your registered email address to receive secure reset credentials.
                </p>
              </div>

              {resetSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
                  <div className="font-bold">Password Reset Dispatched!</div>
                  <div>If an account matches {email}, a recovery token was logged to your inbox.</div>
                  <button
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetSent(false);
                    }}
                    className="mt-2 text-emerald-700 font-bold underline block"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setResetSent(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-700">Account Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 gradient-primary text-white font-bold text-sm rounded-xl shadow transition-all"
                  >
                    Send Recovery Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel and Return to Sign In
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Welcome to Online Banking
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Enter your credentials to securely access your Greendot accounts.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Email Address or Customer ID</label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@greendot.com or CUST-849201"
                    className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full p-3 pr-10 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 gradient-primary text-white font-display font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In Securely</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center space-y-2">
                <div className="text-xs text-slate-600">
                  Don't have an account yet?{' '}
                  <button
                    onClick={() => onNavigate('open-account')}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Open an Account
                  </button>
                </div>
                <div className="text-xs text-slate-500">
                  Received an activation code?{' '}
                  <button
                    onClick={() => onNavigate('activate-account')}
                    className="font-semibold text-emerald-600 hover:underline"
                  >
                    Activate Account Here
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

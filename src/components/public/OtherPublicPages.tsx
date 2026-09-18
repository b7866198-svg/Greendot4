import React, { useState } from 'react';
import {
  ShieldCheck,
  Building,
  Target,
  Users,
  Award,
  Calculator,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  HelpCircle,
  Mail,
  Phone,
  Send,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles,
  KeyRound,
  Check,
} from 'lucide-react';
import { useBank } from '../../context/BankContext';
import { formatCurrency } from '../../lib/utils';
import confetti from 'canvas-confetti';

// ======================== ABOUT PAGE ========================
export const AboutPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
          Our Foundation &amp; Mission
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Reinventing American banking with integrity &amp; technology
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          Founded in New York, Greendot Bank was created to challenge legacy institutions that profit from overdraft fees and sluggish transfers. We believe financial empowerment should be transparent, accessible, and high-yield.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900">Our Mission</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            To deliver an honest, friction-free banking experience that puts higher interest directly into our depositors' pockets, backed by unwavering bank-grade security.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900">Our Values</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Uncompromising data privacy, radical transparency in pricing, continuous fintech innovation, and proactive 24/7 human customer support.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900">Our Community</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Over 2 million verified customers across all 50 states, safeguarding over $15 billion in deposits with multi-bank insured custody.
          </p>
        </div>
      </div>

      {/* Leadership */}
      <div className="space-y-8 pt-8 border-t border-slate-200">
        <h2 className="font-display text-3xl font-bold text-slate-900 text-center">Executive Leadership</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-emerald-700 text-white text-xl font-bold flex items-center justify-center mx-auto shadow-md">
              EH
            </div>
            <div>
              <div className="font-bold text-slate-900">Dr. Eleanor Hayes</div>
              <div className="text-xs text-emerald-700 font-semibold">Chief Executive Officer</div>
              <div className="text-xs text-slate-500 mt-2">Former Treasury Advisor &amp; Fintech Founder</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-slate-800 text-white text-xl font-bold flex items-center justify-center mx-auto shadow-md">
              RK
            </div>
            <div>
              <div className="font-bold text-slate-900">Robert K. Vance</div>
              <div className="text-xs text-emerald-700 font-semibold">Chief Risk &amp; Security Officer</div>
              <div className="text-xs text-slate-500 mt-2">Ex-Cyber Defense Lead &amp; Cryptographer</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-emerald-600 text-white text-xl font-bold flex items-center justify-center mx-auto shadow-md">
              SL
            </div>
            <div>
              <div className="font-bold text-slate-900">Sophia Lin</div>
              <div className="text-xs text-emerald-700 font-semibold">Head of Digital Banking</div>
              <div className="text-xs text-slate-500 mt-2">Pioneered low-latency wire protocols</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================== LOANS PAGE ========================
export const LoansPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [loanAmount, setLoanAmount] = useState(250000);
  const [termMonths, setTermMonths] = useState(360);
  const [rate, setRate] = useState(5.25);

  const monthlyRate = rate / 100 / 12;
  const monthlyPayment =
    (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));

  return (
    <div className="py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
          Lending Products
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Transparent, competitive lending with no hidden fees
        </h1>
        <p className="text-slate-600 text-lg">
          Whether you're purchasing a home, refinancing an auto loan, or funding education, Greendot offers fast pre-approvals and locked-in rates.
        </p>
      </div>

      {/* 4 Loan Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => {
            setRate(5.25);
            setTermMonths(360);
          }}
          className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
            rate === 5.25 ? 'border-emerald-600 bg-emerald-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="text-xs font-bold uppercase text-emerald-700">Home Mortgage</div>
          <div className="font-display text-2xl font-bold text-slate-900 mt-2">5.25% APR</div>
          <div className="text-xs text-slate-500 mt-1">Terms up to 30 years &bull; Fixed &amp; ARM</div>
          <div className="text-xs text-slate-700 mt-4 leading-relaxed">
            Ideal for first-time buyers, second properties, and cash-out refinancing.
          </div>
        </div>

        <div
          onClick={() => {
            setRate(4.5);
            setTermMonths(60);
          }}
          className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
            rate === 4.5 ? 'border-emerald-600 bg-emerald-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="text-xs font-bold uppercase text-emerald-700">Auto Financing</div>
          <div className="font-display text-2xl font-bold text-slate-900 mt-2">4.50% APR</div>
          <div className="text-xs text-slate-500 mt-1">Terms 36 to 84 months &bull; New &amp; Used</div>
          <div className="text-xs text-slate-700 mt-4 leading-relaxed">
            Same-day dealership draft authorization and zero prepayment penalties.
          </div>
        </div>

        <div
          onClick={() => {
            setRate(3.99);
            setTermMonths(120);
          }}
          className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
            rate === 3.99 ? 'border-emerald-600 bg-emerald-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="text-xs font-bold uppercase text-emerald-700">Student Loans</div>
          <div className="font-display text-2xl font-bold text-slate-900 mt-2">3.99% APR</div>
          <div className="text-xs text-slate-500 mt-1">Undergraduate &amp; Graduate &bull; Refi</div>
          <div className="text-xs text-slate-700 mt-4 leading-relaxed">
            Flexible grace periods, auto-pay rate discounts, and co-signer release options.
          </div>
        </div>

        <div
          onClick={() => {
            setRate(6.99);
            setTermMonths(36);
          }}
          className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
            rate === 6.99 ? 'border-emerald-600 bg-emerald-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="text-xs font-bold uppercase text-emerald-700">Personal Loans</div>
          <div className="font-display text-2xl font-bold text-slate-900 mt-2">6.99% APR</div>
          <div className="text-xs text-slate-500 mt-1">Terms 12 to 60 months &bull; Unsecured</div>
          <div className="text-xs text-slate-700 mt-4 leading-relaxed">
            Consolidate debt, remodel your home, or cover unexpected expenses with rapid funding.
          </div>
        </div>
      </div>

      {/* Interactive Loan Calculator */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Calculator className="w-5 h-5" />
            <span>Interactive Monthly Payment Estimator</span>
          </div>

          <div>
            <div className="flex justify-between text-sm font-semibold text-slate-800 mb-2">
              <span>Loan Amount</span>
              <span className="font-mono text-emerald-700 font-bold">${loanAmount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="1000000"
              step="5000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>$5,000</span>
              <span>$500,000</span>
              <span>$1,000,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-semibold text-slate-800 mb-2">
              <span>Loan Term</span>
              <span className="font-mono text-emerald-700 font-bold">{termMonths} Months ({Math.round(termMonths / 12)} Yrs)</span>
            </div>
            <input
              type="range"
              min="12"
              max="360"
              step="12"
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="text-xs text-slate-500">
            *APR calculation based on current selected tier of {rate}%. Actual rate may vary based on creditworthiness, down payment, and verification.
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-8 space-y-6 text-center shadow-xl">
          <div className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            Estimated Monthly Payment
          </div>
          <div className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            ${isNaN(monthlyPayment) ? '0.00' : monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400">
            Principal + Interest at {rate}% APR
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full py-3.5 rounded-xl gradient-primary text-white font-display font-semibold hover:shadow-lg transition-all"
          >
            Apply Online in Customer Portal
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================== INVESTMENTS PAGE ========================
export const InvestmentsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
          Wealth Management
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Smarter investing for long-term compounding
        </h1>
        <p className="text-slate-600 text-lg">
          Automated index allocations, fractional shares, and ethically screened ESG portfolios designed for sustainable growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900">Automated Index Portfolios</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Low-cost diversified baskets of US &amp; international equities, inflation-protected bonds, and global commodities with daily algorithmic rebalancing.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900">ESG &amp; Clean Energy</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Screened investments in renewable energy, battery storage, clean water infrastructure, and carbon-negative enterprises.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900">Retirement IRAs</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Traditional, Roth, and SEP IRAs with maximum tax advantages, direct 401(k) rollover concierge, and zero account maintenance fees.
          </p>
        </div>
      </div>
    </div>
  );
};

// ======================== CAREERS PAGE ========================
export const CareersPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [applied, setApplied] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Senior Full Stack Engineer', resume: '' });

  return (
    <div className="py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
          Join Greendot Bank
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Help build the most trusted banking platform in America
        </h1>
        <p className="text-slate-600 text-lg">
          We are a distributed team of engineers, designers, compliance experts, and customer advocates shaping the future of money.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-slate-900">Open Positions</h2>
          {[
            { title: 'Senior Backend Engineer (Distributed Systems)', location: 'New York / Remote', dept: 'Engineering' },
            { title: 'Compliance & Anti-Money Laundering Officer', location: 'New York, NY', dept: 'Legal & Risk' },
            { title: 'Principal Product Designer', location: 'San Francisco / Remote', dept: 'Design' },
            { title: 'Customer Concierge Specialist (24/7)', location: 'Remote (US)', dept: 'Operations' },
          ].map((job, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{job.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{job.location} &bull; {job.dept}</div>
                </div>
                <button
                  onClick={() => setForm({ ...form, role: job.title })}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Apply &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Application Form */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-display text-xl font-bold text-slate-900">Quick Application</h3>
          {applied ? (
            <div className="p-6 bg-emerald-50 text-emerald-800 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold">Application Received!</div>
              <div className="text-xs">Our talent acquisition team will review your credentials within 48 hours.</div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setApplied(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Alex Taylor"
                  className="w-full mt-1 p-2.5 text-sm border border-slate-200 rounded-lg focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alex.taylor@example.com"
                  className="w-full mt-1 p-2.5 text-sm border border-slate-200 rounded-lg focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Role Applying For</label>
                <input
                  type="text"
                  readOnly
                  value={form.role}
                  className="w-full mt-1 p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">LinkedIn or Portfolio URL</label>
                <input
                  type="url"
                  required
                  value={form.resume}
                  onChange={(e) => setForm({ ...form, resume: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full mt-1 p-2.5 text-sm border border-slate-200 rounded-lg focus:border-emerald-600 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 gradient-primary text-white font-bold text-sm rounded-xl shadow hover:shadow-md transition-all"
              >
                Submit Application
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ======================== FAQ PAGE ========================
export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Greendot Bank offer 4.85% APY with zero monthly fees?',
      a: 'Unlike traditional brick-and-mortar banks burdened with thousands of costly physical branches, Greendot operates an ultra-efficient cloud architecture. We pass those structural savings directly to our customers through higher interest rates and zero account fees.',
    },
    {
      q: 'Are my funds insured by the FDIC?',
      a: 'Yes. All Greendot Bank deposits are insured up to $250,000 per depositor through our member FDIC status and partner bank sweep networks.',
    },
    {
      q: 'How do I activate a newly opened account?',
      a: 'When an administrator opens your account, you will receive a branded welcome email containing your 16-digit activation code (e.g. GRD-8821-4912-3011). Visit our Activate Account page, enter the code, and your portal will unlock instantly.',
    },
    {
      q: 'What is required to make external wire and bank transfers?',
      a: 'For customer security, money-out actions require: (1) an account tier of Tier 1 or higher, (2) an active Gold Visa debit card linked to your profile, and (3) your confidential 4-digit Transaction PIN.',
    },
    {
      q: 'Can I lock or freeze my Gold Visa Card if lost?',
      a: 'Instantly. Navigate to the Debit Cards tab in your customer dashboard and click "Freeze Card". This immediately halts all pending and new authorizations until you choose to unfreeze.',
    },
    {
      q: 'How fast do domestic money transfers clear?',
      a: 'Internal transfers between Greendot members are instantaneous (0 seconds). Domestic ACH transfers clear within 1-2 business days, while instant FedNow/RTP wires execute in seconds.',
    },
  ];

  return (
    <div className="py-16 space-y-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
          Support &amp; Answers
        </span>
        <h1 className="font-display text-4xl font-extrabold text-slate-900">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-600 text-base">
          Find fast answers to common questions about Greendot online banking, security, and transfers.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm transition-all"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-5 text-left font-bold text-slate-900 text-base flex items-center justify-between hover:text-emerald-700 transition-colors"
            >
              <span>{faq.q}</span>
              {openIndex === idx ? (
                <ChevronUp className="w-5 h-5 text-emerald-600 flex-shrink-0 ml-4" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
              )}
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fade-in">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ======================== CONTACT PAGE ========================
export const ContactPage: React.FC = () => {
  const { state } = useBank();
  const settings = state.appSettings;
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  return (
    <div className="py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
          Connect With Us
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          We're here 24 hours a day, 7 days a week
        </h1>
        <p className="text-slate-600 text-lg">
          Reach our dedicated banking specialists via telephone, secure messaging apps, or direct email inquiry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Customer Support Email</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{settings.support_email}</div>
              <div className="text-xs text-slate-500 mt-1">Average response time: &lt; 15 minutes</div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Toll-Free Telephone Hotline</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{settings.support_phone}</div>
              <div className="text-xs text-slate-500 mt-1">Available 24/7/365 with live human agents</div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Telegram Support Channel</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{settings.telegram_handle}</div>
              <div className="text-xs text-slate-500 mt-1">Direct encrypted chat with concierge</div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Headquarters</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">100 Financial Plaza, 38th Floor</div>
              <div className="text-xs text-slate-500 mt-1">New York, NY 10005, United States</div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">Send an inquiry</h2>

          {submitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-display text-lg font-bold text-emerald-950">Message Dispatched</h3>
              <p className="text-sm text-emerald-800 max-w-md mx-auto">
                Thank you, {form.name}. A representative has received your ticket and will follow up at {form.email}.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Sarah Mitchell"
                    className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="sarah@example.com"
                    className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-lg focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Inquiry regarding High-Yield Savings Account"
                  className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can assist you..."
                  className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 gradient-primary text-white font-display font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ======================== OPEN ACCOUNT REQUEST PAGE ========================
export const OpenAccountPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { createCustomer } = useBank();
  const [submitted, setSubmitted] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ customerId: string; activationCode: string; email: string } | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    accountType: 'checking' as 'checking' | 'savings' | 'investment',
    initialDeposit: 2500,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createCustomer({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      accountType: form.accountType,
      accountTier: 'tier_1',
      upgradeMinLoad: 800,
      initialDeposit: Number(form.initialDeposit) || 1000,
      hasVisaCard: true,
    });

    if (res.success) {
      setCreatedInfo({
        customerId: res.customer.customerId,
        activationCode: res.activationCode,
        email: form.email,
      });
      setSubmitted(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="py-16 max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
          Account Application
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
          Open your Greendot account in minutes
        </h1>
        <p className="text-slate-600 text-sm">
          Simple, transparent registration with automatic security provisioning and Gold Visa debit eligibility.
        </p>
      </div>

      {submitted && createdInfo ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200 shadow-xl space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-display text-2xl font-bold text-slate-900">Account Application Approved!</h3>
            <p className="text-slate-600 text-sm">
              Your profile has been created with customer ID{' '}
              <span className="font-bold text-slate-900">{createdInfo.customerId}</span>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50/80 border-2 border-dashed border-emerald-400 text-center space-y-2">
            <div className="text-xs uppercase font-bold tracking-wider text-emerald-800">Your Activation Code</div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-950 tracking-widest">
              {createdInfo.activationCode}
            </div>
            <div className="text-xs text-slate-500">A copy was dispatched to {createdInfo.email}.</div>
          </div>

          <button
            onClick={() => onNavigate('activate-account')}
            className="w-full py-4 gradient-primary text-white font-display font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Account Activation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-lg space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700">Legal Full Name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="e.g. Jonathan Doe"
                className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Email Address (for activation)</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jonathan.doe@example.com"
                className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Phone Number</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Select Primary Account Type</label>
              <div className="grid grid-cols-3 gap-3 mt-1">
                {(['checking', 'savings', 'investment'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, accountType: type })}
                    className={`py-3 px-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      form.accountType === type
                        ? 'gradient-primary text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Initial Deposit Amount ($ USD)</label>
              <div className="relative mt-1">
                <span className="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="100"
                  step="50"
                  required
                  value={form.initialDeposit}
                  onChange={(e) => setForm({ ...form, initialDeposit: Number(e.target.value) })}
                  className="w-full pl-8 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none font-bold text-slate-900"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Minimum deposit of $800 qualifies for complimentary Gold Visa card issuance.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-4 gradient-primary text-white font-display font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Submit Application &amp; Generate Code
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// ======================== ACTIVATE ACCOUNT PAGE ========================
export const ActivateAccountPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { state, activateAccount } = useBank();
  // Find if there is a pending customer Marcus Vance in state to suggest
  const pendingCustomer = state.profiles.find((p) => p.status === 'pending_activation');

  const [email, setEmail] = useState(pendingCustomer?.email || 'marcus.vance@example.com');
  const [code, setCode] = useState(pendingCustomer?.activationCode || 'GRD-8821-4912-3011');
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean; tempPass?: string } | null>(null);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = activateAccount(email, code);
    if (res.success) {
      setStatusMsg({ text: res.message, ok: true, tempPass: res.tempPass });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      setStatusMsg({ text: res.message, ok: false });
    }
  };

  return (
    <div className="py-16 max-w-xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <KeyRound className="w-7 h-7" />
        </div>
        <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
          Security Verification
        </span>
        <h1 className="font-display text-3xl font-extrabold text-slate-900">
          Activate Your Greendot Account
        </h1>
        <p className="text-slate-600 text-sm">
          Enter the activation code sent to your registered email address to unlock your online banking portal.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
        {statusMsg && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold ${
              statusMsg.ok
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-red-100 text-red-900 border border-red-300'
            }`}
          >
            <div>{statusMsg.text}</div>
            {statusMsg.tempPass && (
              <div className="mt-2 pt-2 border-t border-emerald-200">
                Temporary login password generated:{' '}
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded text-slate-900">
                  {statusMsg.tempPass}
                </span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Account Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. marcus.vance@example.com"
              className="w-full mt-1 p-3 text-sm border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Activation Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="GRD-XXXX-XXXX-XXXX"
              className="w-full mt-1 p-3 text-base font-mono font-bold tracking-wider text-center border border-slate-200 rounded-xl focus:border-emerald-600 outline-none uppercase text-emerald-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 gradient-primary text-white font-display font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Verify &amp; Activate Account
          </button>
        </form>

        {statusMsg?.ok && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>Proceed to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

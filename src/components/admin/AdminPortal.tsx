import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  Banknote,
  ReceiptText,
  Mail,
  Settings,
  ShieldCheck,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Snowflake,
  Flame,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  ExternalLink,
  Eye,
  KeyRound,
  Sparkles,
  RefreshCw,
  LogOut,
  Globe,
  Sliders,
  ChevronRight,
  Filter,
  HelpCircle,
  Megaphone,
  BarChart3,
  ShieldAlert,
  Database,
} from 'lucide-react';
import { useBank } from '../../context/BankContext';
import { CustomerProfile, Transaction, Loan, AppSettings, EmailLog, AccountTier, AccountStatus } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { GreendotLogo } from '../ui/GreendotLogo';
import { AdminKYC } from './AdminKYC';
import { AdminEmailCenter } from './AdminEmailCenter';
import { AdminAnnouncements } from './AdminAnnouncements';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminAuditLogs } from './AdminAuditLogs';
import confetti from 'canvas-confetti';

interface AdminPortalProps {
  onNavigateWebsite: () => void;
  onNavigateCustomer: (customerId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onNavigateWebsite,
  onNavigateCustomer,
}) => {
  const {
    state,
    logout,
    updateCustomerStatus,
    updateCustomerTier,
    updateCustomerCardStatus,
    adjustCustomerBalance,
    updateCustomer,
    fundCustomer,
    deductCustomer,
    approveLoan,
    rejectLoan,
    approveTransfer,
    rejectTransfer,
    updateAppSettings,
    createCustomer,
    activateAccount,
    supportTickets,
    replySupportTicket,
    issueDebitCard,
    toggleCardFreeze,
    deleteCustomer,
    reopenAccount,
  } = useBank();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'customers' | 'cards' | 'transactions' | 'loans' | 'emails' | 'settings' | 'new-customer' | 'support' | 'kyc' | 'email-center' | 'announcements' | 'analytics' | 'audit-logs'
  >('overview');

  const [selectedAdminTicket, setSelectedAdminTicket] = useState<any | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Transfer Rejection Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTxId, setRejectTxId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Compliance review required / Insufficient verification');

  // Customer Mutation Dialogs State (Edit, Fund, Deduct, Freeze, Lock, Suspend, Close, Reopen, Delete)
  const [actionModal, setActionModal] = useState<
    | null
    | 'edit'
    | 'fund'
    | 'deduct'
    | 'freeze'
    | 'unfreeze'
    | 'lock'
    | 'unlock'
    | 'suspend'
    | 'reactivate'
    | 'close'
    | 'reopen'
    | 'delete'
  >(null);
  const [targetCustomer, setTargetCustomer] = useState<CustomerProfile | null>(null);
  const [mutationFeedback, setMutationFeedback] = useState<string | null>(null);

  // Form states for customer action dialogs
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    accountTier: 'tier_1' as AccountTier,
    hasVisaCard: true,
  });

  const [fundForm, setFundForm] = useState({
    amount: 2500,
    accountId: '',
    senderName: 'Federal Reserve Bank / NY Wire',
    description: 'Administrative Capital Credit',
  });

  const [deductForm, setDeductForm] = useState({
    amount: 500,
    accountId: '',
    senderName: 'Greendot Underwriting Desk',
    description: 'Administrative Ledger Debit / Fee Recall',
  });

  const [actionReason, setActionReason] = useState('');
  const [reopenForm, setReopenForm] = useState({
    accountType: 'checking' as 'checking' | 'savings' | 'investment',
    initialDeposit: 1000,
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Customer Messaging state
  const [adminCustomerMsg, setAdminCustomerMsg] = useState('');
  const [msgSentSuccess, setMsgSentSuccess] = useState(false);

  // Search & Filters
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState<number>(1000);
  const [balanceAdjustType, setBalanceAdjustType] = useState<'credit' | 'debit'>('credit');

  // Preview Email Modal
  const [previewEmail, setPreviewEmail] = useState<EmailLog | null>(null);
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);

  const handleSendTestEmail = async () => {
    setTestEmailSending(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'greendot.bank.supportmail@gmail.com' }),
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailResult(`✓ Test email successfully sent via SMTP to ${data.recipient}! Message ID: ${data.messageId}`);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      } else {
        setTestEmailResult(`✗ Failed to send test email: ${data.error}`);
      }
    } catch (err: any) {
      setTestEmailResult(`✗ Error: ${err.message || 'Network error'}`);
    } finally {
      setTestEmailSending(false);
    }
  };

  // New customer creation form
  const [newCustForm, setNewCustForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    accountType: 'checking' as 'checking' | 'savings' | 'investment',
    initialDeposit: 5000,
    accountTier: 'tier_1' as 'tier_0' | 'tier_1' | 'tier_2' | 'tier_3',
    hasVisaCard: true,
  });
  const [newCustSuccess, setNewCustSuccess] = useState<string | null>(null);

  // App settings state
  const [settingsForm, setSettingsForm] = useState<AppSettings>({ ...state.appSettings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Overview calculations
  const totalBankDeposits = state.profiles.reduce((acc, p) => acc + p.balance, 0);
  const totalCustomers = state.profiles.length;
  const pendingLoans = state.loans.filter((l) => l.status === 'pending');
  const pendingTransfers = state.transactions.filter((t) => t.status === 'pending');
  const activeLoans = state.loans.filter((l) => l.status === 'active');

  const filteredCustomers = state.profiles.filter(
    (p) =>
      p.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
      p.customerId.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleAdjustBalance = (customerId: string) => {
    const finalAmount =
      balanceAdjustType === 'credit' ? Math.abs(balanceAdjustAmount) : -Math.abs(balanceAdjustAmount);
    adjustCustomerBalance(customerId, finalAmount, `Admin Manual Ledger ${balanceAdjustType.toUpperCase()}`);
    // Refresh selected customer from state
    const updated = state.profiles.find((p) => p.customerId === customerId);
    if (updated) setSelectedCustomer(updated);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
  };

  // Openers for customer mutation dialogs
  const openEditModal = (c: CustomerProfile) => {
    setTargetCustomer(c);
    setEditForm({
      fullName: c.fullName,
      email: c.email,
      phone: c.phone || '',
      address: c.address || '',
      accountTier: c.accountTier,
      hasVisaCard: c.hasVisaCard ?? true,
    });
    setActionModal('edit');
  };

  const openFundModal = (c: CustomerProfile) => {
    setTargetCustomer(c);
    const custAccounts = state.accounts.filter((a) => a.userId === c.userId);
    setFundForm({
      amount: 2500,
      accountId: custAccounts[0]?.id || '',
      senderName: 'Federal Reserve Bank / Wire Ops',
      description: 'Capital Deposit / Treasury Wire',
    });
    setActionModal('fund');
  };

  const openDeductModal = (c: CustomerProfile) => {
    setTargetCustomer(c);
    const custAccounts = state.accounts.filter((a) => a.userId === c.userId);
    setDeductForm({
      amount: 500,
      accountId: custAccounts[0]?.id || '',
      senderName: 'Greendot Underwriting Desk',
      description: 'Administrative Recovery / Fee Offset',
    });
    setActionModal('deduct');
  };

  const openFreezeModal = (c: CustomerProfile) => {
    setTargetCustomer(c);
    setActionReason('Suspicious transaction pattern flagged by AML rules');
    setActionModal('freeze');
  };

  const openUnfreezeModal = (c: CustomerProfile) => {
    setTargetCustomer(c);
    setActionReason('Identity and documentation verified by compliance');
    setActionModal('unfreeze');
  };

  const openLockModal = (c: CustomerProfile) => {
    setTargetCustomer(c);
    setActionReason('Account security lockdown initiated by administrator');
    setActionModal('lock');
  };

  const openUnlockModal = (c: CustomerProfile) => {
    setTargetCustomer(c);
    setActionReason('Security verification completed successfully');
    setActionModal('unlock');
  };

  const openSuspendModal = (c: CustomerProfile) => {
    setTargetCustomer(c);
    setActionReason('Regulatory compliance hold under review');
    setActionModal('suspend');
  };

  const openReactivateModal = (c: CustomerProfile) => {
    setTargetCustomer(c);
    setActionReason('Cleared by senior compliance officer');
    setActionModal('reactivate');
  };

  const openCloseModal = (c: CustomerProfile) => {
    setTargetCustomer(c);
    setActionReason('Customer relationship closed by bank administrator');
    setActionModal('close');
  };

  const openReopenModal = (c: CustomerProfile) => {
    setTargetCustomer(c);
    setReopenForm({
      accountType: 'checking',
      initialDeposit: 1000,
    });
    setActionModal('reopen');
  };

  const openDeleteModal = (c: CustomerProfile) => {
    setTargetCustomer(c);
    setDeleteConfirmText('');
    setActionModal('delete');
  };

  // Submit handlers for customer mutation dialogs
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomer) return;
    updateCustomer(targetCustomer.userId, editForm);
    const updated = { ...targetCustomer, ...editForm };
    if (selectedCustomer?.customerId === targetCustomer.customerId) {
      setSelectedCustomer(updated);
    }
    setActionModal(null);
    setMutationFeedback(`Customer ${targetCustomer.fullName} updated successfully.`);
    setTimeout(() => setMutationFeedback(null), 4000);
  };

  const handleFundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomer) return;
    const res = fundCustomer(
      targetCustomer.userId,
      fundForm.accountId,
      Number(fundForm.amount),
      fundForm.senderName,
      fundForm.description
    );
    if (res.success) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      const updated = state.profiles.find((p) => p.userId === targetCustomer.userId);
      if (updated && selectedCustomer?.customerId === targetCustomer.customerId) {
        setSelectedCustomer(updated);
      }
      setActionModal(null);
      setMutationFeedback(res.message);
      setTimeout(() => setMutationFeedback(null), 4000);
    }
  };

  const handleDeductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomer) return;
    const res = deductCustomer(
      targetCustomer.userId,
      deductForm.accountId,
      Number(deductForm.amount),
      deductForm.senderName,
      deductForm.description
    );
    if (res.success) {
      const updated = state.profiles.find((p) => p.userId === targetCustomer.userId);
      if (updated && selectedCustomer?.customerId === targetCustomer.customerId) {
        setSelectedCustomer(updated);
      }
      setActionModal(null);
      setMutationFeedback(res.message);
      setTimeout(() => setMutationFeedback(null), 4000);
    }
  };

  const handleStatusChangeSubmit = (newStatus: AccountStatus) => {
    if (!targetCustomer) return;
    updateCustomerStatus(targetCustomer.userId, newStatus, actionReason);
    const updated = { ...targetCustomer, status: newStatus };
    if (selectedCustomer?.customerId === targetCustomer.customerId) {
      setSelectedCustomer(updated);
    }
    setActionModal(null);
    setMutationFeedback(`Account status updated to ${newStatus.toUpperCase()}.`);
    setTimeout(() => setMutationFeedback(null), 4000);
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomer) return;
    const res = reopenAccount(targetCustomer.userId, reopenForm.accountType, Number(reopenForm.initialDeposit));
    if (res.success) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      const updated = state.profiles.find((p) => p.userId === targetCustomer.userId);
      if (updated && selectedCustomer?.customerId === targetCustomer.customerId) {
        setSelectedCustomer(updated);
      }
      setActionModal(null);
      setMutationFeedback(res.message);
      setTimeout(() => setMutationFeedback(null), 4000);
    }
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomer) return;
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE' && deleteConfirmText.trim() !== targetCustomer.customerId) {
      setMutationFeedback('Please type DELETE or the Customer ID to confirm permanent deletion.');
      return;
    }
    deleteCustomer(targetCustomer.userId);
    if (selectedCustomer?.customerId === targetCustomer.customerId) {
      setSelectedCustomer(null);
    }
    setActionModal(null);
    setMutationFeedback(`Customer profile #${targetCustomer.customerId} has been permanently deleted.`);
    setTimeout(() => setMutationFeedback(null), 4000);
  };

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createCustomer(newCustForm);
    if (res.success) {
      setNewCustSuccess(
        `Customer profile created: ${res.customer.fullName} (${res.customer.customerId}). Activation Code: ${res.activationCode}`
      );
      setNewCustForm({
        fullName: '',
        email: '',
        phone: '',
        accountType: 'checking',
        initialDeposit: 5000,
        accountTier: 'tier_1',
        hasVisaCard: true,
      });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col lg:flex-row">
      {/* ================= ADMIN SIDEBAR ================= */}
      <aside className="w-full lg:w-72 bg-[#090d16] border-r border-slate-800 p-6 flex flex-col justify-between select-none">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <GreendotLogo variant="light" size="sm" onClick={onNavigateWebsite} />
              <div className="text-[10px] font-bold font-mono tracking-widest text-emerald-400 mt-1 uppercase">
                Bank Operations Portal
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center">
              KO
            </div>
            <div>
              <div className="font-bold text-white">Kevin Owoeye</div>
              <div className="text-[11px] text-emerald-400">Chief Operations Admin</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 text-xs font-medium">
            {[
              { id: 'overview', label: 'Dashboard & Metrics', icon: TrendingUp },
              { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
              { id: 'audit-logs', label: `Audit Trail (${state.auditLogs?.length || 0})`, icon: ShieldAlert },
              { id: 'customers', label: `Customers (${state.profiles.length})`, icon: Users },
              { id: 'cards', label: `Debit Cards (${state.debitCards.length})`, icon: CreditCard },
              { id: 'new-customer', label: 'Provision New Customer', icon: Plus },
              {
                id: 'transactions',
                label: 'Ledger & Transfers',
                icon: ReceiptText,
                badge: pendingTransfers.length,
              },
              { id: 'loans', label: 'Loan Underwriting', icon: Banknote, badge: pendingLoans.length },
              {
                id: 'support',
                label: `Support Tickets (${supportTickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length})`,
                icon: HelpCircle,
                badge: supportTickets.filter((t) => t.status === 'open').length,
              },
              {
                id: 'kyc',
                label: `KYC Queue (${state.profiles.filter((p) => p.role === 'customer' && (p.kycStatus || 'pending') === 'pending').length})`,
                icon: ShieldCheck,
                badge: state.profiles.filter((p) => p.role === 'customer' && (p.kycStatus || 'pending') === 'pending').length,
              },
              { id: 'email-center', label: 'Email Center & Composer', icon: Mail },
              { id: 'announcements', label: `Announcements (${state.announcements?.length || 0})`, icon: Megaphone },
              { id: 'emails', label: `Email Logs (${state.emailLogs.length})`, icon: ReceiptText },
              { id: 'settings', label: 'App Settings & Banners', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSelectedCustomer(null);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 space-y-2 text-xs">
          <button
            onClick={onNavigateWebsite}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Public Website</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
        {/* TAB 1: OVERVIEW & METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Treasury &amp; System Health
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time bank liquidity, active depositors, and pending compliance queues.
              </p>
            </div>

            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-[#162032] border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Total Customer Liquidity
                </div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  {formatCurrency(totalBankDeposits)}
                </div>
                <div className="text-[11px] text-slate-500">Across {totalCustomers} consumer ledgers</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#162032] border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Registered Customers
                </div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                  {totalCustomers}
                </div>
                <div className="text-[11px] text-emerald-400">
                  {state.profiles.filter((p) => p.status === 'active').length} Active &bull;{' '}
                  {state.profiles.filter((p) => p.status === 'pending_activation').length} Pending
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#162032] border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Pending Transfers
                </div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-amber-400">
                  {pendingTransfers.length}
                </div>
                <div className="text-[11px] text-slate-500">Awaiting underwriting approval</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#162032] border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Loan Portfolio
                </div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-blue-400">
                  {activeLoans.length} Active
                </div>
                <div className="text-[11px] text-amber-400">{pendingLoans.length} pending review</div>
              </div>
            </div>

            {/* Quick action grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Transfers Queue */}
              <div className="p-6 rounded-3xl bg-[#162032] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-white">
                    Transfers Needing Approval ({pendingTransfers.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs font-bold text-emerald-400 hover:underline"
                  >
                    View Ledger &rarr;
                  </button>
                </div>

                {pendingTransfers.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    All outgoing wires are cleared.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTransfers.slice(0, 4).map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{tx.description}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {formatDate(tx.date)} &bull; {tx.reference}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono">{formatCurrency(tx.amount)}</span>
                          <button
                            onClick={() => approveTransfer(tx.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectTxId(tx.id);
                              setRejectReason('Compliance review / Treasury verification required');
                              setRejectModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-red-600/80 hover:bg-red-500 text-white font-bold"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Loan Underwriting */}
              <div className="p-6 rounded-3xl bg-[#162032] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-white">
                    Loan Applications Queue ({pendingLoans.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('loans')}
                    className="text-xs font-bold text-emerald-400 hover:underline"
                  >
                    All Loans &rarr;
                  </button>
                </div>

                {pendingLoans.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No loan applications waiting for review.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingLoans.slice(0, 4).map((l) => (
                      <div
                        key={l.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">
                            {l.loanType} &bull; {formatCurrency(l.amount)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Term: {l.termMonths} mo &bull; Cust: {l.customerId}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveLoan(l.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectLoan(l.id)}
                            className="px-2 py-1 rounded bg-red-600/80 hover:bg-red-500 text-white"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMERS MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">Customer Records Management</h2>
                <p className="text-xs text-slate-400">
                  Inspect ledgers, adjust balance, override tiers, and issue or freeze cards.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('new-customer')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Provision Customer</span>
              </button>
            </div>

            {/* Search input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search customers by name, email, or ID..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#162032] border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Customers Table */}
            <div className="bg-[#162032] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Customer Name / ID</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Tier</th>
                      <th className="py-3 px-4">Gold Card</th>
                      <th className="py-3 px-4 text-right">Balance</th>
                      <th className="py-3 px-4 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredCustomers.map((c) => (
                      <tr key={c.customerId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div>{c.fullName}</div>
                          <div className="text-[10px] font-mono text-emerald-400 font-normal">
                            {c.customerId}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">{c.email}</td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                              c.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : c.status === 'pending_activation'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : c.status === 'frozen'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono uppercase text-slate-300">
                          {c.accountTier}
                        </td>

                        <td className="py-3.5 px-4">
                          {c.debitCard ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>{c.debitCard.status}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">None</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                          {formatCurrency(c.balance)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedCustomer(c)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors"
                            >
                              Manage
                            </button>
                            <button
                              onClick={() => openFundModal(c)}
                              className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                              title="Credit customer account"
                            >
                              + Fund
                            </button>
                            <button
                              onClick={() => openEditModal(c)}
                              className="px-2.5 py-1 bg-blue-600/80 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
                              title="Edit customer details"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Selected Customer Full Management Panel */}
            {selectedCustomer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                <div className="bg-[#162032] rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-700 text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start pb-4 border-b border-slate-700">
                    <div>
                      <h3 className="font-display text-xl font-bold text-white">
                        Customer #{selectedCustomer.customerId}
                      </h3>
                      <div className="text-xs text-emerald-400">{selectedCustomer.fullName} &bull; {selectedCustomer.email}</div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-slate-400 hover:text-white p-1 text-base font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Customer Snapshot */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Current Balance</div>
                      <div className="font-mono text-lg font-bold text-emerald-400">
                        {formatCurrency(selectedCustomer.balance)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Status</div>
                      <div className="font-bold text-xs uppercase text-white mt-1">
                        {selectedCustomer.status}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Account Tier</div>
                      <div className="font-mono text-xs text-amber-400 font-bold uppercase mt-1">
                        {selectedCustomer.accountTier}
                      </div>
                    </div>
                  </div>

                  {/* Administrative Operations Command Suite */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Administrative Command Center (12 Core Operations)
                      </h4>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Audit Log Enforced
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => openEditModal(selectedCustomer)}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1 border border-slate-700"
                      >
                        <span className="text-blue-400">✏️ Edit Profile</span>
                        <span className="text-[10px] text-slate-400 font-normal">KYC, Tier, Visa</span>
                      </button>

                      <button
                        onClick={() => openFundModal(selectedCustomer)}
                        className="p-2.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1 border border-emerald-700/50"
                      >
                        <span className="text-emerald-400">💵 Fund Account</span>
                        <span className="text-[10px] text-emerald-200/60 font-normal">+ Inflow Credit</span>
                      </button>

                      <button
                        onClick={() => openDeductModal(selectedCustomer)}
                        className="p-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1 border border-red-700/50"
                      >
                        <span className="text-red-400">💸 Deduct Funds</span>
                        <span className="text-[10px] text-red-200/60 font-normal">- Ledger Debit</span>
                      </button>

                      {selectedCustomer.status === 'frozen' ? (
                        <button
                          onClick={() => openUnfreezeModal(selectedCustomer)}
                          className="p-2.5 bg-cyan-950/50 hover:bg-cyan-900/70 text-cyan-300 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1 border border-cyan-700/60"
                        >
                          <span className="text-cyan-400">🔓 Unfreeze</span>
                          <span className="text-[10px] text-cyan-200/60 font-normal">Restore Transfers</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openFreezeModal(selectedCustomer)}
                          className="p-2.5 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1 border border-blue-700/50"
                        >
                          <span className="text-blue-400">❄️ Freeze</span>
                          <span className="text-[10px] text-blue-200/60 font-normal">Halt Outflows</span>
                        </button>
                      )}

                      {selectedCustomer.status === 'locked' ? (
                        <button
                          onClick={() => openUnlockModal(selectedCustomer)}
                          className="p-2.5 bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1 border border-amber-700/60"
                        >
                          <span className="text-amber-400">🔑 Unlock</span>
                          <span className="text-[10px] text-amber-200/60 font-normal">Clear Sec Lock</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openLockModal(selectedCustomer)}
                          className="p-2.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1 border border-amber-700/50"
                        >
                          <span className="text-amber-400">🔒 Lock Account</span>
                          <span className="text-[10px] text-amber-200/60 font-normal">Security Hold</span>
                        </button>
                      )}

                      {selectedCustomer.status === 'suspended' ? (
                        <button
                          onClick={() => openReactivateModal(selectedCustomer)}
                          className="p-2.5 bg-purple-950/50 hover:bg-purple-900/70 text-purple-300 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1 border border-purple-700/60"
                        >
                          <span className="text-purple-400">▶️ Reactivate</span>
                          <span className="text-[10px] text-purple-200/60 font-normal">Clear Compliance</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openSuspendModal(selectedCustomer)}
                          className="p-2.5 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1 border border-purple-700/50"
                        >
                          <span className="text-purple-400">⏸️ Suspend</span>
                          <span className="text-[10px] text-purple-200/60 font-normal">Compliance Review</span>
                        </button>
                      )}

                      {selectedCustomer.status === 'closed' ? (
                        <button
                          onClick={() => openReopenModal(selectedCustomer)}
                          className="p-2.5 bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1 border border-emerald-700/60"
                        >
                          <span className="text-emerald-400">🔄 Reopen Account</span>
                          <span className="text-[10px] text-emerald-200/60 font-normal">Restore Customer</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openCloseModal(selectedCustomer)}
                          className="p-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1 border border-rose-700/50"
                        >
                          <span className="text-rose-400">❌ Close Account</span>
                          <span className="text-[10px] text-rose-200/60 font-normal">End Relationship</span>
                        </button>
                      )}

                      <button
                        onClick={() => openDeleteModal(selectedCustomer)}
                        className="p-2.5 bg-red-950/80 hover:bg-red-900 text-red-200 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-1 border border-red-600/70"
                      >
                        <span className="text-red-300">🗑️ Delete Record</span>
                        <span className="text-[10px] text-red-300/70 font-normal">Hard Purge</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Balance Adjustment Control */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Quick Balance Adjustment (Ledger Inflow/Outflow)
                    </h4>
                    <div className="flex gap-2">
                      <select
                        value={balanceAdjustType}
                        onChange={(e) => setBalanceAdjustType(e.target.value as any)}
                        className="p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl font-bold text-white outline-none"
                      >
                        <option value="credit">+ Credit (Deposit)</option>
                        <option value="debit">- Debit (Withdrawal)</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        step="50"
                        value={balanceAdjustAmount}
                        onChange={(e) => setBalanceAdjustAmount(Number(e.target.value))}
                        className="flex-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none"
                      />
                      <button
                        onClick={() => handleAdjustBalance(selectedCustomer.customerId)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        Execute
                      </button>
                    </div>
                  </div>

                  {/* Status & Tier Quick Actions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400">Override Status</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['active', 'frozen', 'locked', 'suspended'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              updateCustomerStatus(selectedCustomer.customerId, st);
                              setSelectedCustomer({ ...selectedCustomer, status: st });
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase transition-all ${
                              selectedCustomer.status === st
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400">Account Tier</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['tier_0', 'tier_1', 'tier_2', 'tier_3'] as const).map((tr) => (
                          <button
                            key={tr}
                            onClick={() => {
                              updateCustomerTier(selectedCustomer.customerId, tr);
                              setSelectedCustomer({ ...selectedCustomer, accountTier: tr });
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase transition-all ${
                              selectedCustomer.accountTier === tr
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {tr}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400">Greendot Gold Visa Card</label>
                      <div>
                        <button
                          onClick={() => {
                            const newStatus = !selectedCustomer.hasVisaCard;
                            updateCustomerCardStatus(selectedCustomer.customerId, newStatus);
                            setSelectedCustomer({ ...selectedCustomer, hasVisaCard: newStatus });
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase transition-all flex items-center gap-1.5 ${
                            selectedCustomer.hasVisaCard
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-600/50'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{selectedCustomer.hasVisaCard ? '✓ Card Settled & Linked' : '⏳ Card Not Linked'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Activation info if pending */}
                  {selectedCustomer.status === 'pending_activation' && selectedCustomer.activationCode && (
                    <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-amber-300">Pending Activation Code:</div>
                      <div className="font-mono text-base font-black text-white">
                        {selectedCustomer.activationCode}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Enter this code on the public Activate Account page or provide to client.
                      </div>
                    </div>
                  )}

                  {/* Send Admin Message / Notification */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Send Direct Message / Notification
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type notification message to customer..."
                        value={adminCustomerMsg}
                        onChange={(e) => setAdminCustomerMsg(e.target.value)}
                        className="flex-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                      />
                      <button
                        onClick={() => {
                          if (!adminCustomerMsg.trim()) return;
                          setMsgSentSuccess(true);
                          setTimeout(() => setMsgSentSuccess(false), 3000);
                          setAdminCustomerMsg('');
                        }}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
                      >
                        Send
                      </button>
                    </div>
                    {msgSentSuccess && (
                      <div className="text-[11px] text-emerald-400 font-bold">✓ Message dispatched to customer inbox.</div>
                    )}
                  </div>

                  {/* Account Lifecycle (Close / Reopen) */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white">Account Lifecycle Management</div>
                      <div className="text-[11px] text-slate-400">Permanently close or reopen customer relationship</div>
                    </div>
                    <div className="flex gap-2">
                      {selectedCustomer.status !== 'closed' ? (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to close this account?')) {
                              deleteCustomer(selectedCustomer.userId);
                              setSelectedCustomer(null);
                            }
                          }}
                          className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold rounded-xl"
                        >
                          Close Account
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            reopenAccount(selectedCustomer.userId, 'checking', 1000);
                            setSelectedCustomer(null);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                        >
                          Reopen Account
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Shortcut to switch into this customer account */}
                  <div className="pt-2 border-t border-slate-700 flex justify-between">
                    <button
                      onClick={() => onNavigateCustomer(selectedCustomer.customerId)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Launch Customer View</span>
                    </button>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NEW CUSTOMER PROVISIONING */}
        {activeTab === 'new-customer' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Provision New Customer Account</h2>
              <p className="text-xs text-slate-400">
                Register a new client ledger, configure starting tier and deposit balance, and dispatch activation codes.
              </p>
            </div>

            {newCustSuccess && (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold rounded-2xl space-y-1">
                <div className="font-bold">✓ Account Successfully Provisioned!</div>
                <div>{newCustSuccess}</div>
              </div>
            )}

            <form onSubmit={handleCreateCustomerSubmit} className="bg-[#162032] rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300">Legal Full Name</label>
                <input
                  type="text"
                  required
                  value={newCustForm.fullName}
                  onChange={(e) => setNewCustForm({ ...newCustForm, fullName: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  className="w-full mt-1 p-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newCustForm.email}
                    onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                    placeholder="marcus.vance@example.com"
                    className="w-full mt-1 p-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newCustForm.phone}
                    onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                    placeholder="+1 (555) 391-4902"
                    className="w-full mt-1 p-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Initial Deposit ($ USD)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={newCustForm.initialDeposit}
                    onChange={(e) => setNewCustForm({ ...newCustForm, initialDeposit: Number(e.target.value) })}
                    className="w-full mt-1 p-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Initial Account Tier</label>
                  <select
                    value={newCustForm.accountTier}
                    onChange={(e) => setNewCustForm({ ...newCustForm, accountTier: e.target.value as any })}
                    className="w-full mt-1 p-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none"
                  >
                    <option value="tier_0">Tier 0 - Basic ($0)</option>
                    <option value="tier_1">Tier 1 - Standard Verified ($800)</option>
                    <option value="tier_2">Tier 2 - Gold Privileged ($10,000)</option>
                    <option value="tier_3">Tier 3 - Private Wealth ($100,000)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Provision Client &amp; Dispatch Activation Code
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: TRANSACTIONS & LEDGER */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Bank-Wide Transaction Audit</h2>
              <p className="text-xs text-slate-400">
                All domestic wires, mobile recharges, bill payments, and manual adjustments.
              </p>
            </div>

            <div className="bg-[#162032] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">TX ID / Ref</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {state.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          {tx.id}
                          <div className="text-[10px] text-slate-500">{tx.reference}</div>
                        </td>
                        <td className="py-3.5 px-4 text-white font-medium">{tx.customerId}</td>
                        <td className="py-3.5 px-4 text-slate-300">{tx.description}</td>
                        <td className="py-3.5 px-4 text-slate-400">{formatDate(tx.date)}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                              tx.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : tx.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {tx.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => approveTransfer(tx.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => {
                                  setRejectTxId(tx.id);
                                  setRejectModalOpen(true);
                                }}
                                className="px-2 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded text-[10px]"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Settled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LOANS UNDERWRITING */}
        {activeTab === 'loans' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Loan Portfolio &amp; Underwriting</h2>
              <p className="text-xs text-slate-400">
                Review loan applications, approve credit disbursement, and monitor repayment terms.
              </p>
            </div>

            <div className="bg-[#162032] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Loan ID / Customer</th>
                      <th className="py-3 px-4">Type &amp; Purpose</th>
                      <th className="py-3 px-4">Term</th>
                      <th className="py-3 px-4">Rate</th>
                      <th className="py-3 px-4">Monthly Due</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Principal</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {state.loans.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div>{l.id}</div>
                          <div className="text-[10px] font-mono text-emerald-400 font-normal">
                            {l.customerId}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <div className="font-bold">{l.loanType}</div>
                          <div className="text-[10px] text-slate-500">{l.purpose}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono">{l.termMonths} mo</td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono">{l.interestRate}%</td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono font-bold">
                          {formatCurrency(l.monthlyPayment)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                              l.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : l.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                          {formatCurrency(l.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {l.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => approveLoan(l.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => rejectLoan(l.id)}
                                className="px-2 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded text-[10px]"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">Active</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB CARDS: DEBIT CARDS PORTFOLIO */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Debit Card Portfolio &amp; Issuance</h2>
              <p className="text-xs text-slate-400">
                Manage Gold Visa cards across all customers, issue new cards, freeze, or unfreeze.
              </p>
            </div>

            <div className="bg-[#162032] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Card ID / Holder</th>
                      <th className="py-3 px-4">Card Number</th>
                      <th className="py-3 px-4">Expiry / CVV</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Customer ID</th>
                      <th className="py-3 px-4 text-center">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {state.debitCards.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div>{c.id}</div>
                          <div className="text-[10px] text-amber-400 font-normal">{c.cardHolder}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{c.cardNumber}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {c.expiryMonth}/{c.expiryYear} &bull; CVV: {c.cvv}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                              c.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">{c.userId}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => toggleCardFreeze(c.id)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                              c.status === 'active'
                                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            {c.status === 'active' ? 'Freeze' : 'Unfreeze'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* KYC VERIFICATION QUEUE TAB */}
        {activeTab === 'kyc' && <AdminKYC />}

        {/* EMAIL CENTER & COMPOSER TAB */}
        {activeTab === 'email-center' && <AdminEmailCenter />}

        {/* ANNOUNCEMENTS ENGINE TAB */}
        {activeTab === 'announcements' && <AdminAnnouncements />}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && <AdminAnalytics />}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit-logs' && <AdminAuditLogs />}

        {/* TAB 6: EMAIL LOGS VIEWER & HTML PREVIEW */}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">Branded Email Transmissions</h2>
                <p className="text-xs text-slate-400">
                  Inspect every automated notification and security activation email sent to clients.
                </p>
              </div>
              <button
                onClick={handleSendTestEmail}
                disabled={testEmailSending}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>{testEmailSending ? 'Sending Test Mail...' : 'Send Test Email Now'}</span>
              </button>
            </div>

            {testEmailResult && (
              <div className={`p-4 rounded-2xl text-xs font-medium border ${testEmailResult.startsWith('✓') ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border-red-500/30 text-red-300'}`}>
                {testEmailResult}
              </div>
            )}

            <div className="bg-[#162032] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Email ID</th>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Template</th>
                      <th className="py-3 px-4">Dispatched At</th>
                      <th className="py-3 px-4 text-center">Inspect Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {state.emailLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{log.id}</td>
                        <td className="py-3.5 px-4 text-white">{log.toEmail}</td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">{log.subject}</td>
                        <td className="py-3.5 px-4 uppercase text-[10px] text-slate-400 font-mono">
                          {log.template}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{formatDate(log.sentAt)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setPreviewEmail(log)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview HTML</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Email HTML Preview Modal */}
            {previewEmail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
                <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
                  <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-400">To: {previewEmail.toEmail}</div>
                      <div className="font-bold text-sm">{previewEmail.subject}</div>
                    </div>
                    <button
                      onClick={() => setPreviewEmail(null)}
                      className="text-slate-400 hover:text-white font-bold p-1 text-base"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                    {/* Render raw HTML iframe or innerHTML safe preview */}
                    <div
                      className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: previewEmail.htmlContent }}
                    />
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
                    <button
                      onClick={() => setPreviewEmail(null)}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: SUPPORT TICKETS */}
        {activeTab === 'support' && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Customer Support &amp; Concierge Tickets</h2>
              <p className="text-xs text-slate-400">
                Review and respond to client inquiries, security verifications, and wire requests.
              </p>
            </div>

            {supportTickets.length === 0 ? (
              <div className="bg-[#162032] rounded-3xl p-12 text-center border border-slate-800 text-slate-400 space-y-2">
                <HelpCircle className="w-12 h-12 text-emerald-500 mx-auto opacity-50" />
                <div className="font-bold text-sm text-white">No Support Tickets</div>
                <div className="text-xs text-slate-500">All customer inquiries have been successfully addressed.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {supportTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedAdminTicket(t)}
                    className="bg-[#162032] p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                          {t.id}
                        </span>
                        <span className="text-xs font-bold text-white">{t.userName} ({t.userEmail})</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            t.status === 'resolved'
                              ? 'bg-emerald-900 text-emerald-200'
                              : t.status === 'in_progress'
                              ? 'bg-blue-900 text-blue-200'
                              : 'bg-amber-900 text-amber-200'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-200 truncate">{t.subject}</div>
                      <div className="text-xs text-slate-400 truncate">{t.message}</div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-[11px] text-slate-500">{formatDate(t.createdAt)}</div>
                      <div className="text-xs font-bold text-emerald-400 mt-1">
                        {t.replies?.length || 0} replies &rarr;
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Admin Ticket Reply Modal */}
            {selectedAdminTicket && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
                <div className="bg-[#162032] text-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-700 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-emerald-400 font-bold">{selectedAdminTicket.id}</span>
                        <span className="text-xs text-slate-300 font-bold">{selectedAdminTicket.userName}</span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-white mt-1">{selectedAdminTicket.subject}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedAdminTicket(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                    <div className="font-bold text-emerald-400">{selectedAdminTicket.userName}</div>
                    <p className="text-slate-300 whitespace-pre-wrap">{selectedAdminTicket.message}</p>
                    <div className="text-[10px] text-slate-500 pt-1">{formatDate(selectedAdminTicket.createdAt)}</div>
                  </div>

                  <div className="space-y-3">
                    {selectedAdminTicket.replies?.map((rep: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border text-xs space-y-1 ${
                          rep.sender === 'support'
                            ? 'bg-emerald-950/40 border-emerald-800 ml-4'
                            : 'bg-slate-900 border-slate-800 mr-4'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-emerald-400">{rep.senderName}</span>
                          <span className="text-[10px] text-slate-500">{formatDate(rep.timestamp)}</span>
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap">{rep.text}</p>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!adminReplyText.trim()) return;
                      replySupportTicket(selectedAdminTicket.id, adminReplyText);
                      setAdminReplyText('');
                      const updated = supportTickets.find((t) => t.id === selectedAdminTicket.id);
                      if (updated) setSelectedAdminTicket(updated);
                    }}
                    className="space-y-3 pt-2 border-t border-slate-800"
                  >
                    <textarea
                      required
                      rows={3}
                      placeholder="Type official support reply as Chief Concierge..."
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAdminTicket(null)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
                      >
                        Send Support Reply
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: APP SETTINGS & BANNER TOGGLES */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Global Bank Configuration</h2>
              <p className="text-xs text-slate-400">
                Adjust support contact numbers, toggle marketing banners, and control system availability.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl">
                ✓ Bank settings and banner configuration updated.
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="bg-[#162032] rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5">
              <h3 className="font-display text-base font-bold text-white pb-2 border-b border-slate-700">
                Support Channels &amp; Hotlines
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Support Phone Number</label>
                  <input
                    type="text"
                    value={settingsForm.support_phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, support_phone: e.target.value })}
                    className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Support Email</label>
                  <input
                    type="email"
                    value={settingsForm.support_email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, support_email: e.target.value })}
                    className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Telegram Support Handle</label>
                  <input
                    type="text"
                    value={settingsForm.telegram_handle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, telegram_handle: e.target.value })}
                    className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Default Currency Symbol</label>
                  <input
                    type="text"
                    value={settingsForm.default_currency}
                    onChange={(e) => setSettingsForm({ ...settingsForm, default_currency: e.target.value })}
                    className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <h3 className="font-display text-base font-bold text-white pt-4 pb-2 border-b border-slate-700">
                Customer Dashboard Banners &amp; Promos
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Enable Gold Visa Promotion Banner</div>
                    <div className="text-[11px] text-slate-400">
                      Displays the gold reward badge on customer overview screens
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.gold_card_banner_enabled}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, gold_card_banner_enabled: e.target.checked })
                    }
                    className="w-5 h-5 accent-emerald-500 rounded"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Gold Card Banner Text</label>
                  <input
                    type="text"
                    value={settingsForm.gold_card_banner_text}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gold_card_banner_text: e.target.value })}
                    className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs rounded-xl shadow transition-all"
              >
                Save Bank Settings
              </button>
            </form>

            {/* Supabase Cloud Database & Infrastructure Status */}
            <div className="bg-[#162032] rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white">Supabase Cloud Database &amp; Auth</h3>
                    <p className="text-[11px] text-slate-400">Production PostgreSQL &amp; Real-time synchronization engine</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active &amp; Connected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Project Reference</div>
                  <div className="font-mono text-emerald-400 font-medium select-all">ucyglwcuuabobeeomfde</div>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Supabase REST Endpoint</div>
                  <div className="font-mono text-slate-300 truncate select-all">https://ucyglwcuuabobeeomfde.supabase.co</div>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Schema Tables (15)</div>
                  <div className="text-slate-300 font-medium">profiles, accounts, debit_cards, transactions, audit_logs...</div>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sync Mechanism</div>
                  <div className="text-slate-300 font-medium">Auto-Hydration + Real-time REST Persistence</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Transfer Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#162032] border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-white text-base">Reject Transfer &amp; Notify Customer</h3>
            <p className="text-xs text-slate-400">
              Provide a clear written reason for rejection. This will be logged in audit trails and sent to the client.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full p-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rejectTxId) {
                    rejectTransfer(rejectTxId, rejectReason);
                  }
                  setRejectModalOpen(false);
                  setRejectTxId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 12 ADMINISTRATIVE OPERATION DIALOGS ================= */}

      {/* 1. EDIT PROFILE DIALOG */}
      {actionModal === 'edit' && targetCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#162032] border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <div>
                <h3 className="font-display font-bold text-white text-base">Edit Customer Profile</h3>
                <p className="text-xs text-slate-400">Customer #{targetCustomer.customerId} &bull; {targetCustomer.fullName}</p>
              </div>
              <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300">Legal Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Residential / Business Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Account Tier</label>
                  <select
                    value={editForm.accountTier}
                    onChange={(e) => setEditForm({ ...editForm, accountTier: e.target.value as AccountTier })}
                    className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none"
                  >
                    <option value="tier_0">Tier 0 (Unverified / Gated)</option>
                    <option value="tier_1">Tier 1 (Verified / $5k limit)</option>
                    <option value="tier_2">Tier 2 (Enhanced / $50k limit)</option>
                    <option value="tier_3">Tier 3 (Institutional / Unlimited)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="hasVisaCardCheck"
                    checked={editForm.hasVisaCard}
                    onChange={(e) => setEditForm({ ...editForm, hasVisaCard: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <label htmlFor="hasVisaCardCheck" className="text-xs font-bold text-slate-300 cursor-pointer">
                    Has Active Visa Card
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. FUND CUSTOMER ACCOUNT DIALOG (+ CREDIT) */}
      {actionModal === 'fund' && targetCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#162032] border border-emerald-700/60 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <div>
                <h3 className="font-display font-bold text-white text-base">Fund Account (Administrative Credit)</h3>
                <p className="text-xs text-emerald-400">Target: {targetCustomer.fullName} (#{targetCustomer.customerId})</p>
              </div>
              <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleFundSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300">Credit Amount ($ USD)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={fundForm.amount}
                  onChange={(e) => setFundForm({ ...fundForm, amount: Number(e.target.value) })}
                  className="w-full mt-1 p-3 text-lg font-mono font-bold bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Originating Entity / Wire Sender</label>
                <input
                  type="text"
                  required
                  value={fundForm.senderName}
                  onChange={(e) => setFundForm({ ...fundForm, senderName: e.target.value })}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Transaction Memo / Description</label>
                <input
                  type="text"
                  required
                  value={fundForm.description}
                  onChange={(e) => setFundForm({ ...fundForm, description: e.target.value })}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-[11px] text-emerald-300 space-y-0.5">
                <div className="font-bold">Immediate Ledger Posting:</div>
                <div>Funds will be credited immediately to the customer's checking balance and logged in Immutable Audit Records.</div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  Execute + Credit Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DEDUCT CUSTOMER ACCOUNT DIALOG (- DEBIT) */}
      {actionModal === 'deduct' && targetCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#162032] border border-red-700/60 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <div>
                <h3 className="font-display font-bold text-white text-base">Deduct Funds (Administrative Debit)</h3>
                <p className="text-xs text-red-400">Target: {targetCustomer.fullName} (#{targetCustomer.customerId})</p>
              </div>
              <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleDeductSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300">Debit Amount ($ USD)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={deductForm.amount}
                  onChange={(e) => setDeductForm({ ...deductForm, amount: Number(e.target.value) })}
                  className="w-full mt-1 p-3 text-lg font-mono font-bold bg-slate-900 border border-slate-700 rounded-xl text-red-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Beneficiary / Debit Originator</label>
                <input
                  type="text"
                  required
                  value={deductForm.senderName}
                  onChange={(e) => setDeductForm({ ...deductForm, senderName: e.target.value })}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Debit Reason / Regulatory Memo</label>
                <input
                  type="text"
                  required
                  value={deductForm.description}
                  onChange={(e) => setDeductForm({ ...deductForm, description: e.target.value })}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-[11px] text-red-300 space-y-0.5">
                <div className="font-bold">Ledger Reduction Warning:</div>
                <div>This operation debits customer balance immediately. An immutable audit record will log this administrative deduction.</div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  Execute - Debit Outflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4 & 5. FREEZE / UNFREEZE DIALOG */}
      {(actionModal === 'freeze' || actionModal === 'unfreeze') && targetCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#162032] border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-white text-base">
              {actionModal === 'freeze' ? 'Freeze Customer Account' : 'Unfreeze Customer Account'}
            </h3>
            <p className="text-xs text-slate-400">
              {actionModal === 'freeze'
                ? `Freezing #${targetCustomer.customerId} (${targetCustomer.fullName}) immediately disables outgoing transfers, bill payments, and card debits.`
                : `Unfreezing #${targetCustomer.customerId} (${targetCustomer.fullName}) restores all standard banking operations and card authorizations.`}
            </p>

            <div>
              <label className="text-xs font-bold text-slate-300">Reason / Regulatory Compliance Note</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={2}
                className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStatusChangeSubmit(actionModal === 'freeze' ? 'frozen' : 'active')}
                className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-lg transition-all ${
                  actionModal === 'freeze' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {actionModal === 'freeze' ? 'Confirm Freeze' : 'Confirm Unfreeze'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6 & 7. LOCK / UNLOCK DIALOG */}
      {(actionModal === 'lock' || actionModal === 'unlock') && targetCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#162032] border border-amber-700/60 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-white text-base">
              {actionModal === 'lock' ? 'Security Lock Account' : 'Unlock Account Security'}
            </h3>
            <p className="text-xs text-slate-400">
              {actionModal === 'lock'
                ? `Locking #${targetCustomer.customerId} (${targetCustomer.fullName}) terminates current sessions and prevents authentication and money operations.`
                : `Unlocking #${targetCustomer.customerId} (${targetCustomer.fullName}) restores account access for the customer.`}
            </p>

            <div>
              <label className="text-xs font-bold text-slate-300">Reason / Incident Report Reference</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={2}
                className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStatusChangeSubmit(actionModal === 'lock' ? 'locked' : 'active')}
                className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-lg transition-all ${
                  actionModal === 'lock' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {actionModal === 'lock' ? 'Confirm Security Lock' : 'Confirm Account Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8 & 9. SUSPEND / REACTIVATE DIALOG */}
      {(actionModal === 'suspend' || actionModal === 'reactivate') && targetCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#162032] border border-purple-700/60 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-white text-base">
              {actionModal === 'suspend' ? 'Suspend Account (Compliance Review)' : 'Reactivate Suspended Account'}
            </h3>
            <p className="text-xs text-slate-400">
              {actionModal === 'suspend'
                ? `Suspending #${targetCustomer.customerId} (${targetCustomer.fullName}) flags the customer for regulatory review and suspends all banking activity.`
                : `Reactivating #${targetCustomer.customerId} (${targetCustomer.fullName}) restores account standing to active after clearance.`}
            </p>

            <div>
              <label className="text-xs font-bold text-slate-300">Compliance Documentation Memo</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={2}
                className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStatusChangeSubmit(actionModal === 'suspend' ? 'suspended' : 'active')}
                className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-lg transition-all ${
                  actionModal === 'suspend' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {actionModal === 'suspend' ? 'Confirm Suspension' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. CLOSE ACCOUNT DIALOG */}
      {actionModal === 'close' && targetCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#162032] border border-rose-700/60 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-white text-base">Close Customer Relationship</h3>
            <p className="text-xs text-slate-400">
              Closing customer #{targetCustomer.customerId} marks accounts closed and terminates debit cards. Customer can be reopened later if requested.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-300">Reason for Account Closure</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={2}
                className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStatusChangeSubmit('closed')}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                Confirm Account Closure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. REOPEN ACCOUNT DIALOG */}
      {actionModal === 'reopen' && targetCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#162032] border border-emerald-700/60 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-white text-base">Reopen Customer Account</h3>
            <p className="text-xs text-slate-400">
              Restores customer #{targetCustomer.customerId} ({targetCustomer.fullName}) with an active checking/savings account and initial capital balance.
            </p>

            <form onSubmit={handleReopenSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300">New Account Type</label>
                <select
                  value={reopenForm.accountType}
                  onChange={(e) => setReopenForm({ ...reopenForm, accountType: e.target.value as any })}
                  className="w-full mt-1 p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none"
                >
                  <option value="checking">High-Yield Checking</option>
                  <option value="savings">Premier Savings (4.25% APY)</option>
                  <option value="investment">Wealth Investment Portfolio</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Initial Opening Balance ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={reopenForm.initialDeposit}
                  onChange={(e) => setReopenForm({ ...reopenForm, initialDeposit: Number(e.target.value) })}
                  className="w-full mt-1 p-2.5 text-xs font-mono font-bold bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  Reopen Account &amp; Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12. DELETE CUSTOMER DIALOG (PERMANENT PURGE) */}
      {actionModal === 'delete' && targetCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1215] border border-red-600 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-500">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-display font-bold text-white text-base">Permanent Customer Deletion</h3>
            </div>
            
            <p className="text-xs text-red-200/90 leading-relaxed">
              You are about to permanently delete customer <strong className="text-white">{targetCustomer.fullName}</strong> (#{targetCustomer.customerId}). All associated bank accounts, debit cards, transactions, and user sessions will be purged.
            </p>

            <div className="p-3 bg-red-950/60 border border-red-700/60 rounded-xl space-y-1 text-xs">
              <span className="text-red-300 font-bold">Confirmation Required:</span>
              <p className="text-[11px] text-slate-300">
                To confirm permanent deletion, type <strong className="text-white font-mono">DELETE</strong> or customer ID <strong className="text-white font-mono">{targetCustomer.customerId}</strong> below:
              </p>
              <input
                type="text"
                placeholder="Type DELETE to confirm..."
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full mt-2 p-2.5 text-xs bg-black/60 border border-red-700 rounded-xl text-white font-mono outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

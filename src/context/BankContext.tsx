import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BankState,
  loadState,
  saveState,
  resetState,
  INITIAL_STATE,
} from '../lib/store';
import {
  supabase,
  isSupabaseConfigured,
  supabaseDb,
} from '../lib/supabase';
import {
  Profile,
  Account,
  Transaction,
  Transfer,
  Beneficiary,
  DebitCard,
  Loan,
  Notification,
  AuditLog,
  AppSettings,
  SupportTicket,
  Announcement,
  EmailLog,
  AccountStatus,
  AccountTier,
  UserRole,
  BillPayment,
  MobileRecharge,
} from '../types';
import {
  generateAccountNumber,
  generateCustomerId,
  generateActivationCode,
  generateReceiptNumber,
  generateReference,
} from '../lib/utils';
import { renderBrandedEmailHtml } from '../lib/emailTemplates';

interface CreateCustomerData {
  fullName: string;
  email: string;
  phone: string;
  accountType: 'checking' | 'savings' | 'investment';
  accountTier: 'tier_0' | 'tier_1' | 'tier_2' | 'tier_3';
  upgradeMinLoad: number;
  initialDeposit: number;
  hasVisaCard?: boolean;
}

interface TransferParams {
  fromAccountId: string;
  toAccountNumber: string;
  toAccountName: string;
  bankName: string;
  amount: number;
  description: string;
  pin: string;
  isRecurring?: boolean;
}

interface BankContextType {
  state: BankState;
  currentUser: Profile | null;
  currentRole: UserRole | null;
  currentAccounts: Account[];
  currentCards: DebitCard[];
  currentTransactions: Transaction[];
  customerTransactions: Transaction[];
  currentTransfers: Transfer[];
  currentLoans: Loan[];
  customerLoans: Loan[];
  currentBeneficiaries: Beneficiary[];
  beneficiaries: Beneficiary[];
  currentNotifications: Notification[];
  notifications: Notification[];
  unreadNotificationCount: number;
  supportTickets: SupportTicket[];
  login: (email: string, password?: string) => { success: boolean; message: string; user?: Profile };
  logout: () => void;
  switchUser: (userId: string) => void;
  switchCustomer: (customerIdOrUserId: string) => void;
  loginAsAdmin: () => void;
  activateAccount: (email: string, code: string) => { success: boolean; message: string; tempPass?: string };
  createCustomer: (data: CreateCustomerData) => { success: boolean; customer: Profile; activationCode: string };
  updateCustomer: (userId: string, partial: Partial<Profile>) => void;
  fundCustomer: (userId: string, accountId: string, amount: number, senderName: string, description: string) => void;
  deductCustomer: (userId: string, accountId: string, amount: number, senderName: string, description: string) => void;
  updateCustomerStatus: (userId: string, status: AccountStatus, reason?: string) => void;
  updateCustomerTier: (userId: string, tier: AccountTier) => void;
  adjustCustomerBalance: (userId: string, amount: number, description?: string) => void;
  submitTransfer: (params: any) => { success: boolean; message: string; transfer?: Transfer };
  approveTransfer: (transferId: string) => void;
  rejectTransfer: (transferId: string, reason: string) => void;
  applyLoan: (loanTypeOrObj: any, amount?: number, termMonths?: number, purpose?: string) => { success: boolean; message: string };
  approveLoan: (loanId: string) => void;
  rejectLoan: (loanId: string, reason: string) => void;
  issueDebitCard: (userId: string, accountId: string) => void;
  toggleCardFreeze: (cardId?: string) => void;
  updateCardLimit: (cardId: string, limit: number) => void;
  verifyKyc: (userId: string, status: 'verified' | 'rejected') => void;
  payBill: (accountIdOrObj: any, billerName?: string, billerCategory?: string, accountReference?: string, amount?: number) => { success: boolean; message: string };
  rechargeMobile: (accountIdOrObj: any, phoneNumber?: string, carrier?: string, amount?: number) => { success: boolean; message: string };
  mobileRecharge: (accountIdOrObj: any, phoneNumber?: string, carrier?: string, amount?: number) => { success: boolean; message: string };
  addBeneficiary: (nameOrObj: any, accountNumber?: string, bankName?: string, nickname?: string) => void;
  deleteBeneficiary: (id: string) => void;
  removeBeneficiary: (id: string) => void;
  setTransactionPin: (pinOrUserId: string, currentPinOrNewPin?: string) => { success: boolean; message: string };
  upgradeAccountToTier1: () => { success: boolean; message: string };
  updateProfile: (userIdOrPartial: any, partial?: Partial<Profile>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  createSupportTicket: (ticket: { subject: string; message: string; category?: string }) => void;
  sendSupportTicket: (subject: string, message: string) => void;
  replySupportTicket: (ticketId: string, text: string) => void;
  sendAnnouncement: (title: string, category: 'general' | 'security_alert' | 'maintenance' | 'policy_update', content: string, targetAudience: 'all' | 'tier_1' | 'active_only') => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  updateAppSettings: (partial: Partial<AppSettings>) => void;
  deleteCustomer: (userId: string) => void;
  reopenAccount: (userId: string, accountType: 'checking' | 'savings' | 'investment', initialDeposit: number) => void;
  resetDemoData: () => void;
  exportBackupJson: () => string;
  exportFullStateJson: () => string;
  importBackupJson: (jsonString: string) => boolean;
  importFullStateJson: (jsonString: string) => boolean;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export const BankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<BankState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Synchronize Supabase Auth session & Database Tables if configured
  useEffect(() => {
    if (isSupabaseConfigured) {
      // 1. Hydrate tables from Supabase PostgreSQL
      Promise.all([
        supabaseDb.getTable<Profile>('profiles'),
        supabaseDb.getTable<Account>('accounts'),
        supabaseDb.getTable<DebitCard>('debit_cards'),
        supabaseDb.getTable<Transaction>('transactions'),
        supabaseDb.getTable<Transfer>('transfers'),
        supabaseDb.getTable<Loan>('loans'),
        supabaseDb.getTable<AuditLog>('audit_logs'),
        supabaseDb.getTable<Announcement>('announcements'),
      ])
        .then(([dbProfiles, dbAccounts, dbCards, dbTxns, dbTransfers, dbLoans, dbAudits, dbAnnouncements]) => {
          if (dbProfiles && dbProfiles.length > 0) {
            setState((prev) => ({
              ...prev,
              profiles: dbProfiles.length ? dbProfiles : prev.profiles,
              accounts: dbAccounts && dbAccounts.length ? dbAccounts : prev.accounts,
              debitCards: dbCards && dbCards.length ? dbCards : prev.debitCards,
              transactions: dbTxns && dbTxns.length ? dbTxns : prev.transactions,
              transfers: dbTransfers && dbTransfers.length ? dbTransfers : prev.transfers,
              loans: dbLoans && dbLoans.length ? dbLoans : prev.loans,
              auditLogs: dbAudits && dbAudits.length ? dbAudits : prev.auditLogs,
              announcements: dbAnnouncements && dbAnnouncements.length ? dbAnnouncements : prev.announcements,
            }));
          }
        })
        .catch((err) => console.warn('Supabase database sync note:', err));

      // 2. Hydrate Auth session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          const userEmail = session.user.email.toLowerCase();
          const matched = state.profiles.find((p) => p.email.toLowerCase() === userEmail);
          if (matched && state.currentUserId !== matched.userId) {
            setState((prev) => ({ ...prev, currentUserId: matched.userId }));
          }
        }
      }).catch((err) => console.warn('Supabase session load error:', err));

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user?.email) {
          const userEmail = session.user.email.toLowerCase();
          const matched = state.profiles.find((p) => p.email.toLowerCase() === userEmail);
          if (matched) {
            setState((prev) => ({ ...prev, currentUserId: matched.userId }));
          }
        } else if (event === 'SIGNED_OUT') {
          setState((prev) => ({ ...prev, currentUserId: null }));
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const rawUser = state.profiles.find((p) => p.userId === state.currentUserId) || null;

  const currentAccounts = rawUser
    ? state.accounts.filter((a) => a.userId === rawUser.userId)
    : [];

  const currentCards = rawUser
    ? state.debitCards.filter((c) => c.userId === rawUser.userId)
    : [];

  const primaryAccount = currentAccounts[0] || null;
  const totalBalance = currentAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const primaryCard = currentCards[0] || null;

  const currentUser: Profile | null = rawUser
    ? {
        ...rawUser,
        balance: primaryAccount?.balance ?? totalBalance,
        totalBalance,
        debitCard: primaryCard,
        primaryAccount,
      }
    : null;

  const currentRole: UserRole | null = currentUser?.role || null;

  const currentTransactions: Transaction[] = (currentUser
    ? state.transactions.filter((t) => t.userId === currentUser.userId)
    : []
  ).map((t) => ({ ...t, date: t.date || t.createdAt, fee: t.fee ?? 0 }));

  const customerTransactions = currentTransactions;

  const currentTransfers = currentUser
    ? state.transfers.filter((t) => t.userId === currentUser.userId)
    : [];

  const currentLoans = currentUser
    ? state.loans.filter((l) => l.userId === currentUser.userId)
    : [];

  const customerLoans = currentLoans;

  const currentBeneficiaries: Beneficiary[] = (currentUser
    ? state.beneficiaries.filter((b) => b.userId === currentUser.userId)
    : []
  ).map((b) => ({ ...b, accountName: b.accountName || b.name, routingNumber: b.routingNumber || '021000021' }));

  const beneficiaries = currentBeneficiaries;

  const currentNotifications: Notification[] = (currentUser
    ? state.notifications.filter((n) => n.userId === currentUser.userId)
    : []
  ).map((n) => ({ ...n, read: n.read ?? n.isRead, date: n.date || n.createdAt }));

  const notifications = currentNotifications;

  const supportTickets: SupportTicket[] = currentUser
    ? currentUser.role === 'admin'
      ? state.supportTickets
      : state.supportTickets.filter((t) => t.userId === currentUser.userId)
    : [];

  const unreadNotificationCount = currentNotifications.filter((n) => !n.isRead && !n.read).length;

  const login = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Direct check for admin email or admin shortcut
    if (
      cleanEmail === 'kevinowoeye@gmail.com' ||
      cleanEmail === 'admin@greendot.com' ||
      cleanEmail === 'admin'
    ) {
      const adminProfile =
        state.profiles.find((p) => p.email.toLowerCase() === 'kevinowoeye@gmail.com') ||
        state.profiles.find((p) => p.role === 'admin');

      if (adminProfile) {
        // Enforce password if not raw 'admin' bypass shortcut
        if (cleanEmail !== 'admin' && cleanPassword && cleanPassword !== 'Personal@01') {
          return { success: false, message: 'Invalid password for administrator account.' };
        }
        setState((prev) => ({ ...prev, currentUserId: adminProfile.userId }));
        return { success: true, message: 'Logged in as Administrator (Kevin Owoeye)', user: adminProfile };
      }
    }

    const found = state.profiles.find(
      (p) => p.email.toLowerCase() === cleanEmail || p.customerId.toLowerCase() === cleanEmail
    );

    if (!found) {
      if (cleanEmail === 'customer' || cleanEmail === 'demo' || cleanEmail === 'demo@greendot.com') {
        const demoUser = state.profiles.find((p) => p.role === 'customer');
        if (demoUser) {
          setState((prev) => ({ ...prev, currentUserId: demoUser.userId }));
          return { success: true, message: 'Welcome back!', user: demoUser };
        }
      }
      return { success: false, message: 'Invalid credentials. Check your email or customer ID.' };
    }

    // If logging into an admin account
    if (found.role === 'admin') {
      if (cleanPassword && cleanPassword !== 'Personal@01' && cleanPassword !== (found.password || 'Personal@01')) {
        return { success: false, message: 'Invalid password for administrator account.' };
      }
    }

    if (found.status === 'suspended') {
      return {
        success: false,
        message: `Account is suspended. Please contact Greendot Concierge support at ${state.appSettings.support_email || 'support@greendot.com'}.`,
      };
    }

    if (found.status === 'pending_activation') {
      return {
        success: false,
        message: 'Account is pending activation. Please enter the activation code from your welcome email.',
        user: found,
      };
    }

    // If Supabase is configured, trigger sign-in with password in parallel
    if (isSupabaseConfigured && cleanPassword) {
      supabase.auth
        .signInWithPassword({ email: found.email, password: cleanPassword })
        .catch((err) => console.warn('Supabase Auth error:', err.message));
    }

    setState((prev) => ({ ...prev, currentUserId: found.userId }));
    return { success: true, message: 'Welcome back!', user: found };
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch((err) => console.warn('Supabase sign-out error:', err.message));
    }
    setState((prev) => ({ ...prev, currentUserId: null }));
  };

  const switchUser = (userIdOrCustId: string) => {
    const user = state.profiles.find(
      (p) => p.userId === userIdOrCustId || p.customerId === userIdOrCustId || p.id === userIdOrCustId
    );
    if (user) {
      setState((prev) => ({ ...prev, currentUserId: user.userId }));
    }
  };

  const switchCustomer = switchUser;

  const loginAsAdmin = () => {
    const admin = state.profiles.find((p) => p.role === 'admin');
    if (admin) {
      setState((prev) => ({ ...prev, currentUserId: admin.userId }));
    }
  };

  const activateAccount = (email: string, code: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim().toUpperCase();

    const target = state.profiles.find(
      (p) => p.email.toLowerCase() === cleanEmail || (p.activationCode && p.activationCode.toUpperCase() === cleanCode)
    );

    if (!target) {
      return { success: false, message: 'No account found with this email or activation code.' };
    }

    if (target.activationCode && target.activationCode.replace(/-/g, '').toUpperCase() !== cleanCode.replace(/-/g, '').toUpperCase()) {
      return { success: false, message: 'Invalid activation code. Please check your email.' };
    }

    const tempPassword = 'Pass' + Math.floor(1000 + Math.random() * 9000) + '!';
    const now = new Date().toISOString();

    // Find account
    const acc = state.accounts.find((a) => a.userId === target.userId);

    const welcomeEmailHtml = renderBrandedEmailHtml({
      recipientName: target.fullName,
      recipientEmail: target.email,
      type: 'welcome',
      subject: 'Account Activated — Welcome to Greendot Online Banking',
      customerId: target.customerId,
      accountNumber: acc?.accountNumber,
      temporaryPassword: tempPassword,
    });

    const newEmailLog: EmailLog = {
      id: 'eml-' + Date.now(),
      recipient: target.email,
      subject: 'Account Activated — Welcome to Greendot Online Banking',
      emailType: 'welcome',
      htmlContent: welcomeEmailHtml,
      status: 'sent',
      sentAt: now,
    };

    const newNotif: Notification = {
      id: 'notif-' + Date.now(),
      userId: target.userId,
      type: 'success',
      title: 'Welcome to Greendot Bank',
      message: `Your account ${acc?.accountNumber || ''} is now active and ready for online banking.`,
      isRead: false,
      createdAt: now,
    };

    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.userId === target.userId
          ? {
              ...p,
              status: 'active',
              activatedAt: now,
              accountTier: 'tier_1',
              transactionPinHash: '1234', // default 1234
              hasVisaCard: true,
            }
          : p
      ),
      accounts: prev.accounts.map((a) =>
        a.userId === target.userId ? { ...a, status: 'active' } : a
      ),
      notifications: [newNotif, ...prev.notifications],
      emailLogs: [newEmailLog, ...prev.emailLogs],
      currentUserId: target.userId,
    }));

    return {
      success: true,
      message: 'Account activated successfully! Temporary PIN is set to 1234. Welcome to Greendot Bank.',
      tempPass: tempPassword,
    };
  };

  const createCustomer = (data: CreateCustomerData) => {
    const userId = 'cust-' + Date.now();
    const accountId = 'acc-' + Date.now();
    const cardId = 'card-' + Date.now();
    const customerId = generateCustomerId();
    const accountNumber = generateAccountNumber();
    const activationCode = generateActivationCode();
    const now = new Date().toISOString();

    const newProfile: Profile = {
      id: userId,
      userId,
      role: 'customer',
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      customerId,
      status: 'pending_activation',
      forcePasswordChange: true,
      twoFactorEnabled: false,
      kycStatus: 'pending',
      activationCode,
      hasVisaCard: data.hasVisaCard ?? (data.initialDeposit >= data.upgradeMinLoad),
      cardMinLoad: 200,
      accountTier: data.accountTier,
      upgradeMinLoad: data.upgradeMinLoad,
      createdAt: now,
      updatedAt: now,
    };

    const newAccount: Account = {
      id: accountId,
      userId,
      accountNumber,
      accountType: data.accountType,
      balance: data.initialDeposit,
      currency: 'USD',
      status: 'pending_activation',
      createdAt: now,
      updatedAt: now,
    };

    const newDebitCard: DebitCard = {
      id: cardId,
      userId,
      accountId,
      cardNumber: '4532 ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000),
      cardHolder: data.fullName.toUpperCase(),
      expiryMonth: (new Date().getMonth() + 1),
      expiryYear: new Date().getFullYear() + 4,
      cvv: String(Math.floor(100 + Math.random() * 900)),
      cardType: 'visa',
      status: 'active',
      pinSet: true,
      dailyLimit: 2500,
      createdAt: now,
    };

    const emailHtml = renderBrandedEmailHtml({
      recipientName: data.fullName,
      recipientEmail: data.email,
      type: 'activation',
      subject: 'Welcome to Greendot Bank — Activate Your Account',
      activationCode,
    });

    const newEmailLog: EmailLog = {
      id: 'eml-' + Date.now(),
      recipient: data.email,
      subject: 'Welcome to Greendot Bank — Activate Your Account',
      emailType: 'activation',
      htmlContent: emailHtml,
      status: 'sent',
      sentAt: now,
    };

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: 'CUSTOMER_CREATED',
      targetType: 'Profile',
      targetId: userId,
      targetName: data.fullName,
      details: { initialDeposit: data.initialDeposit, tier: data.accountTier, email: data.email },
      createdAt: now,
    };

    if (isSupabaseConfigured) {
      supabaseDb.upsertRecord('profiles', newProfile).catch(() => {});
      supabaseDb.upsertRecord('accounts', newAccount).catch(() => {});
      if (data.hasVisaCard) {
        supabaseDb.upsertRecord('debit_cards', newDebitCard).catch(() => {});
      }
      supabaseDb.upsertRecord('email_logs', newEmailLog).catch(() => {});
      supabaseDb.upsertRecord('audit_logs', audit).catch(() => {});
    }

    setState((prev) => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      accounts: [...prev.accounts, newAccount],
      debitCards: data.hasVisaCard ? [...prev.debitCards, newDebitCard] : prev.debitCards,
      emailLogs: [newEmailLog, ...prev.emailLogs],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return { success: true, customer: newProfile, activationCode };
  };

  const updateCustomer = (userId: string, partial: Partial<Profile>) => {
    const customer = state.profiles.find((p) => p.userId === userId);
    const now = new Date().toISOString();

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: 'CUSTOMER_PROFILE_UPDATED',
      targetType: 'Profile',
      targetId: userId,
      targetName: customer?.fullName || userId,
      details: partial,
      createdAt: now,
    };

    if (isSupabaseConfigured) {
      supabaseDb.upsertRecord('audit_logs', audit).catch(() => {});
      supabaseDb.upsertRecord('profiles', { userId, ...partial }).catch(() => {});
    }

    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.userId === userId ? { ...p, ...partial, updatedAt: now } : p)),
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const fundCustomer = (
    userId: string,
    accountId: string,
    amount: number,
    senderName: string,
    description: string
  ) => {
    const now = new Date().toISOString();
    const reference = generateReference('DEP');
    const customer = state.profiles.find((p) => p.userId === userId);
    const targetAccount = state.accounts.find((a) => a.id === accountId);

    if (!targetAccount) return;

    const newBalance = targetAccount.balance + amount;

    const newTxn: Transaction = {
      id: 'txn-' + Date.now(),
      accountId,
      userId,
      type: 'deposit',
      amount,
      description,
      reference,
      senderName,
      balanceAfter: newBalance,
      status: 'completed',
      createdAt: now,
    };

    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId,
      type: 'success',
      title: 'Funds Deposited',
      message: `+$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} credited from ${senderName}.`,
      isRead: false,
      createdAt: now,
    };

    const emailHtml = renderBrandedEmailHtml({
      recipientName: customer?.fullName,
      recipientEmail: customer?.email || '',
      type: 'credit_alert',
      subject: `Credit Alert — Funds Deposited ($${amount.toFixed(2)})`,
      amount,
      balanceAfter: newBalance,
      reference,
      senderName,
      accountNumber: targetAccount.accountNumber,
    });

    const emailLog: EmailLog = {
      id: 'eml-' + Date.now(),
      recipient: customer?.email || '',
      subject: `Credit Alert — Funds Deposited ($${amount.toFixed(2)})`,
      emailType: 'credit_alert',
      htmlContent: emailHtml,
      status: 'sent',
      sentAt: now,
    };

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: 'FUNDS_CREDITED',
      targetType: 'Account',
      targetId: accountId,
      targetName: `${customer?.fullName} ($${amount})`,
      details: { amount, senderName, description, newBalance },
      createdAt: now,
    };

    if (isSupabaseConfigured) {
      supabaseDb.upsertRecord('accounts', { id: accountId, balance: newBalance }).catch(() => {});
      supabaseDb.upsertRecord('transactions', newTxn).catch(() => {});
      supabaseDb.upsertRecord('notifications', notif).catch(() => {});
      supabaseDb.upsertRecord('email_logs', emailLog).catch(() => {});
      supabaseDb.upsertRecord('audit_logs', audit).catch(() => {});
    }

    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === accountId ? { ...a, balance: newBalance } : a)),
      transactions: [newTxn, ...prev.transactions],
      notifications: [notif, ...prev.notifications],
      emailLogs: [emailLog, ...prev.emailLogs],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const deductCustomer = (
    userId: string,
    accountId: string,
    amount: number,
    senderName: string,
    description: string
  ) => {
    const now = new Date().toISOString();
    const reference = generateReference('DR');
    const customer = state.profiles.find((p) => p.userId === userId);
    const targetAccount = state.accounts.find((a) => a.id === accountId);

    if (!targetAccount) return;

    const newBalance = Math.max(0, targetAccount.balance - amount);

    const newTxn: Transaction = {
      id: 'txn-' + Date.now(),
      accountId,
      userId,
      type: 'withdrawal',
      amount,
      description,
      reference,
      senderName,
      balanceAfter: newBalance,
      status: 'completed',
      createdAt: now,
    };

    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId,
      type: 'warning',
      title: 'Funds Deducted',
      message: `-$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} debited: ${description}.`,
      isRead: false,
      createdAt: now,
    };

    const emailHtml = renderBrandedEmailHtml({
      recipientName: customer?.fullName,
      recipientEmail: customer?.email || '',
      type: 'debit_alert',
      subject: `Debit Alert — Account Deducted ($${amount.toFixed(2)})`,
      amount,
      balanceAfter: newBalance,
      reference,
      senderName,
      accountNumber: targetAccount.accountNumber,
    });

    const emailLog: EmailLog = {
      id: 'eml-' + Date.now(),
      recipient: customer?.email || '',
      subject: `Debit Alert — Account Deducted ($${amount.toFixed(2)})`,
      emailType: 'debit_alert',
      htmlContent: emailHtml,
      status: 'sent',
      sentAt: now,
    };

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: 'FUNDS_DEBITED',
      targetType: 'Account',
      targetId: accountId,
      targetName: `${customer?.fullName} ($${amount})`,
      details: { amount, senderName, description, newBalance },
      createdAt: now,
    };

    if (isSupabaseConfigured) {
      supabaseDb.upsertRecord('accounts', { id: accountId, balance: newBalance }).catch(() => {});
      supabaseDb.upsertRecord('transactions', newTxn).catch(() => {});
      supabaseDb.upsertRecord('notifications', notif).catch(() => {});
      supabaseDb.upsertRecord('email_logs', emailLog).catch(() => {});
      supabaseDb.upsertRecord('audit_logs', audit).catch(() => {});
    }

    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === accountId ? { ...a, balance: newBalance } : a)),
      transactions: [newTxn, ...prev.transactions],
      notifications: [notif, ...prev.notifications],
      emailLogs: [emailLog, ...prev.emailLogs],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const updateCustomerStatus = (userId: string, status: AccountStatus, reason?: string) => {
    const customer = state.profiles.find((p) => p.userId === userId);
    const now = new Date().toISOString();

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: `ACCOUNT_STATUS_${status.toUpperCase()}`,
      targetType: 'Profile',
      targetId: userId,
      targetName: customer?.fullName || userId,
      details: { previousStatus: customer?.status, newStatus: status, reason },
      reason,
      createdAt: now,
    };

    if (isSupabaseConfigured) {
      supabaseDb.upsertRecord('profiles', { id: userId, userId, status }).catch(() => {});
      supabaseDb.upsertRecord('audit_logs', audit).catch(() => {});
    }

    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.userId === userId ? { ...p, status, updatedAt: now } : p)),
      accounts: prev.accounts.map((a) => (a.userId === userId ? { ...a, status } : a)),
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const updateCustomerTier = (userId: string, tier: AccountTier) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.userId === userId || p.customerId === userId ? { ...p, accountTier: tier } : p
      ),
    }));
  };

  const adjustCustomerBalance = (userId: string, amount: number, description = 'Treasury Adjustment') => {
    const acc = state.accounts.find((a) => a.userId === userId);
    if (!acc) return;
    const newBal = acc.balance + amount;
    const now = new Date().toISOString();
    const newTx: Transaction = {
      id: 'txn-' + Date.now(),
      accountId: acc.id,
      userId,
      type: amount >= 0 ? 'deposit' : 'withdrawal',
      amount: Math.abs(amount),
      fee: 0,
      description,
      reference: generateReference('ADJ'),
      senderName: 'Federal Treasury / Bank Admin',
      balanceAfter: newBal,
      status: 'completed',
      date: now,
      createdAt: now,
    };
    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === acc.id ? { ...a, balance: newBal } : a)),
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const submitTransfer = (params: any) => {
    if (!currentUser) return { success: false, message: 'Not authenticated.' };

    const toName = params.toAccountName || params.recipientName || 'External Recipient';
    const toBank = params.bankName || params.recipientBank || 'External Bank';
    const toAcc = params.toAccountNumber || params.recipientAccount || '0000000000';
    const fromAccId = params.fromAccountId || currentAccounts[0]?.id;

    // 1. Account status checks
    if (currentUser.status === 'frozen' || currentUser.status === 'locked' || currentUser.status === 'suspended') {
      return { success: false, message: `Account is ${currentUser.status}. Outgoing transactions are currently restricted.` };
    }

    // 2. Visa Card check
    if (!currentUser.hasVisaCard) {
      return { success: false, message: 'A Greendot Gold Visa Card is required to authorize external transfers.' };
    }

    // 3. Tier check
    if (currentUser.accountTier === 'tier_0') {
      return { success: false, message: 'Account is Tier 0. Please upgrade your account to Tier 1+ to execute money transfers.' };
    }

    // 4. PIN check
    const pin = (params.pin || '').trim();
    if (!currentUser.transactionPinHash || currentUser.transactionPinHash !== pin) {
      return { success: false, message: 'Incorrect 4-digit Transaction PIN.' };
    }

    // 5. Account funds check
    const sourceAccount = state.accounts.find((a) => a.id === fromAccId) || currentAccounts[0];
    if (!sourceAccount) {
      return { success: false, message: 'Source account not found.' };
    }

    const transferAmount = Number(params.amount) || 0;
    if (transferAmount <= 0) {
      return { success: false, message: 'Transfer amount must be greater than zero.' };
    }

    if (sourceAccount.balance < transferAmount) {
      return { success: false, message: 'Insufficient funds in selected account.' };
    }

    const now = new Date().toISOString();
    const reference = generateReference('TRF');
    const receiptNumber = generateReceiptNumber();

    // Deduct immediately or hold
    const updatedBalance = sourceAccount.balance - transferAmount;

    const newTransfer: Transfer = {
      id: 'trf-' + Date.now(),
      userId: currentUser.userId,
      fromAccountId: sourceAccount.id,
      toAccountNumber: toAcc,
      toAccountName: toName,
      bankName: toBank,
      amount: transferAmount,
      description: params.description || `Transfer to ${toName}`,
      reference,
      status: state.appSettings.transfer_approval_required ? 'pending' : 'approved',
      isRecurring: !!params.isRecurring,
      receiptNumber,
      createdAt: now,
      completedAt: !state.appSettings.transfer_approval_required ? now : undefined,
    };

    const newTxn: Transaction = {
      id: 'txn-' + Date.now(),
      accountId: sourceAccount.id,
      userId: currentUser.userId,
      type: 'transfer_out',
      amount: transferAmount,
      fee: 0,
      description: `Transfer to ${toName} (${toBank})`,
      reference,
      senderName: toName,
      balanceAfter: updatedBalance,
      status: state.appSettings.transfer_approval_required ? 'pending' : 'completed',
      date: now,
      createdAt: now,
    };

    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId: currentUser.userId,
      type: 'info',
      title: state.appSettings.transfer_approval_required ? 'Transfer Awaiting Verification' : 'Transfer Sent',
      message: `Transfer of $${params.amount.toFixed(2)} to ${params.toAccountName} is ${state.appSettings.transfer_approval_required ? 'queued for treasury approval' : 'completed'}.`,
      isRead: false,
      createdAt: now,
    };

    const emailHtml = renderBrandedEmailHtml({
      recipientName: currentUser.fullName,
      recipientEmail: currentUser.email,
      type: 'debit_alert',
      subject: `Debit Alert — Transfer of $${params.amount.toFixed(2)} Submitted`,
      amount: params.amount,
      balanceAfter: updatedBalance,
      reference,
      senderName: params.toAccountName,
      accountNumber: sourceAccount.accountNumber,
    });

    const emailLog: EmailLog = {
      id: 'eml-' + Date.now(),
      recipient: currentUser.email,
      subject: `Debit Alert — Transfer of $${params.amount.toFixed(2)} Submitted`,
      emailType: 'debit_alert',
      htmlContent: emailHtml,
      status: 'sent',
      sentAt: now,
    };

    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === params.fromAccountId ? { ...a, balance: updatedBalance } : a)),
      transfers: [newTransfer, ...prev.transfers],
      transactions: [newTxn, ...prev.transactions],
      notifications: [notif, ...prev.notifications],
      emailLogs: [emailLog, ...prev.emailLogs],
    }));

    return {
      success: true,
      message: state.appSettings.transfer_approval_required
        ? 'Transfer submitted! It has been securely routed for treasury approval.'
        : 'Transfer completed successfully!',
      transfer: newTransfer,
    };
  };

  const approveTransfer = (transferId: string) => {
    const trf = state.transfers.find((t) => t.id === transferId);
    if (!trf) return;

    const now = new Date().toISOString();
    const customer = state.profiles.find((p) => p.userId === trf.userId);

    // Atomic internal recipient processing if recipient is an internal Greendot account
    const recipientAccount = state.accounts.find(
      (a) => a.accountNumber === trf.toAccountNumber
    );

    let recipientTxn: Transaction | null = null;
    let recipientNotif: Notification | null = null;
    let newRecipientBalance = 0;

    if (recipientAccount) {
      newRecipientBalance = recipientAccount.balance + trf.amount;
      recipientTxn = {
        id: 'txn-' + Date.now() + '-in',
        accountId: recipientAccount.id,
        userId: recipientAccount.userId,
        type: 'transfer_in',
        amount: trf.amount,
        fee: 0,
        description: `Transfer from ${customer?.fullName || 'Greendot Member'} (${trf.reference})`,
        reference: trf.reference + '-IN',
        senderName: customer?.fullName || 'Greendot Member',
        balanceAfter: newRecipientBalance,
        status: 'completed',
        date: now,
        createdAt: now,
      };

      recipientNotif = {
        id: 'notif-' + Date.now() + '-in',
        userId: recipientAccount.userId,
        type: 'success',
        title: 'Transfer Received',
        message: `+$${trf.amount.toFixed(2)} received from ${customer?.fullName || 'Greendot Member'}.`,
        isRead: false,
        createdAt: now,
      };
    }

    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId: trf.userId,
      type: 'success',
      title: 'Transfer Approved & Cleared',
      message: `Your transfer of $${trf.amount.toFixed(2)} to ${trf.toAccountName} has been approved and cleared.`,
      isRead: false,
      createdAt: now,
    };

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: 'TRANSFER_APPROVED',
      targetType: 'Transfer',
      targetId: transferId,
      targetName: `${trf.toAccountName} ($${trf.amount})`,
      details: {
        amount: trf.amount,
        reference: trf.reference,
        internalRecipientCredited: !!recipientAccount,
      },
      createdAt: now,
    };

    if (isSupabaseConfigured) {
      supabaseDb.upsertRecord('audit_logs', audit).catch(() => {});
      supabaseDb.upsertRecord('transfers', { ...trf, status: 'approved', completedAt: now }).catch(() => {});
      if (recipientAccount && recipientTxn) {
        supabaseDb.upsertRecord('accounts', { id: recipientAccount.id, balance: newRecipientBalance }).catch(() => {});
        supabaseDb.upsertRecord('transactions', recipientTxn).catch(() => {});
      }
    }

    setState((prev) => ({
      ...prev,
      transfers: prev.transfers.map((t) =>
        t.id === transferId ? { ...t, status: 'approved', completedAt: now, approvedBy: currentUser?.fullName } : t
      ),
      accounts: recipientAccount
        ? prev.accounts.map((a) => (a.id === recipientAccount.id ? { ...a, balance: newRecipientBalance } : a))
        : prev.accounts,
      transactions: [
        ...(recipientTxn ? [recipientTxn] : []),
        ...prev.transactions.map((tx) => (tx.reference === trf.reference ? { ...tx, status: 'completed' as const } : tx)),
      ],
      notifications: [
        ...(recipientNotif ? [recipientNotif] : []),
        notif,
        ...prev.notifications,
      ],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const rejectTransfer = (transferId: string, reason: string) => {
    const trf = state.transfers.find((t) => t.id === transferId);
    if (!trf) return;

    const now = new Date().toISOString();
    const sourceAccount = state.accounts.find((a) => a.id === trf.fromAccountId);
    const restoredBalance = sourceAccount ? sourceAccount.balance + trf.amount : 0;

    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId: trf.userId,
      type: 'error',
      title: 'Transfer Declined',
      message: `Your transfer of $${trf.amount.toFixed(2)} was rejected. Reason: ${reason}. Funds have been refunded to your account.`,
      isRead: false,
      createdAt: now,
    };

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: 'TRANSFER_REJECTED',
      targetType: 'Transfer',
      targetId: transferId,
      targetName: `${trf.toAccountName} ($${trf.amount})`,
      details: { amount: trf.amount, reason },
      reason,
      createdAt: now,
    };

    if (isSupabaseConfigured) {
      supabaseDb.upsertRecord('audit_logs', audit).catch(() => {});
      supabaseDb.upsertRecord('transfers', { ...trf, status: 'rejected', rejectionReason: reason }).catch(() => {});
      if (sourceAccount) {
        supabaseDb.upsertRecord('accounts', { id: sourceAccount.id, balance: restoredBalance }).catch(() => {});
      }
    }

    setState((prev) => ({
      ...prev,
      transfers: prev.transfers.map((t) => (t.id === transferId ? { ...t, status: 'rejected', rejectionReason: reason } : t)),
      accounts: sourceAccount
        ? prev.accounts.map((a) => (a.id === trf.fromAccountId ? { ...a, balance: restoredBalance } : a))
        : prev.accounts,
      transactions: prev.transactions.map((tx) => (tx.reference === trf.reference ? { ...tx, status: 'failed' } : tx)),
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const applyLoan = (
    loanTypeOrObj: any,
    amount?: number,
    termMonths?: number,
    purpose?: string
  ) => {
    if (!currentUser) return { success: false, message: 'Please sign in.' };

    let lType: 'home' | 'auto' | 'student' | 'personal' = 'personal';
    let lAmt = 15000;
    let lTerm = 36;
    let lPurpose = 'Personal financing';

    if (typeof loanTypeOrObj === 'object' && loanTypeOrObj !== null) {
      const typeStr = (loanTypeOrObj.loanType || '').toLowerCase();
      lType = typeStr.includes('home')
        ? 'home'
        : typeStr.includes('auto')
        ? 'auto'
        : typeStr.includes('student')
        ? 'student'
        : 'personal';
      lAmt = Number(loanTypeOrObj.amount) || 15000;
      lTerm = Number(loanTypeOrObj.termMonths) || 36;
      lPurpose = loanTypeOrObj.purpose || 'Personal financing';
    } else {
      const typeStr = (loanTypeOrObj || '').toLowerCase();
      lType = typeStr.includes('home')
        ? 'home'
        : typeStr.includes('auto')
        ? 'auto'
        : typeStr.includes('student')
        ? 'student'
        : 'personal';
      lAmt = Number(amount) || 15000;
      lTerm = Number(termMonths) || 36;
      lPurpose = purpose || 'Personal financing';
    }

    const rateMap = { home: 5.25, auto: 4.5, student: 3.99, personal: 6.99 };
    const rate = rateMap[lType] || 6.99;
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = (lAmt * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -lTerm));
    const now = new Date().toISOString();

    const newLoan: Loan = {
      id: 'loan-' + Date.now(),
      userId: currentUser.userId,
      loanType: lType,
      amount: lAmt,
      interestRate: rate,
      termMonths: lTerm,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      remainingBalance: lAmt,
      status: 'pending',
      purpose: lPurpose,
      createdAt: now,
      updatedAt: now,
    };

    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId: currentUser.userId,
      type: 'info',
      title: 'Loan Application Submitted',
      message: `Your ${lType.toUpperCase()} loan request for $${lAmt.toLocaleString()} is under underwriting review.`,
      isRead: false,
      read: false,
      date: now,
      createdAt: now,
    };

    setState((prev) => ({
      ...prev,
      loans: [newLoan, ...prev.loans],
      notifications: [notif, ...prev.notifications],
    }));

    return { success: true, message: 'Loan application submitted for underwriter review!' };
  };

  const approveLoan = (loanId: string) => {
    const loan = state.loans.find((l) => l.id === loanId);
    if (!loan) return;

    const now = new Date().toISOString();
    const checkingAcc = state.accounts.find((a) => a.userId === loan.userId && a.accountType === 'checking') || state.accounts.find((a) => a.userId === loan.userId);

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: 'LOAN_APPROVED',
      targetType: 'Loan',
      targetId: loanId,
      targetName: `${loan.loanType.toUpperCase()} Loan ($${loan.amount})`,
      details: { amount: loan.amount, termMonths: loan.termMonths },
      createdAt: now,
    };

    let updatedAccounts = state.accounts;
    let newTxns = state.transactions;

    if (checkingAcc) {
      const newBal = checkingAcc.balance + loan.amount;
      updatedAccounts = state.accounts.map((a) => (a.id === checkingAcc.id ? { ...a, balance: newBal } : a));
      const txn: Transaction = {
        id: 'txn-' + Date.now(),
        accountId: checkingAcc.id,
        userId: loan.userId,
        type: 'deposit',
        amount: loan.amount,
        description: `Loan Disbursement: ${loan.loanType.toUpperCase()} Loan Approved`,
        reference: generateReference('LOAN'),
        senderName: 'Greendot Credit & Lending',
        balanceAfter: newBal,
        status: 'completed',
        createdAt: now,
      };
      newTxns = [txn, ...newTxns];
    }

    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId: loan.userId,
      type: 'success',
      title: 'Loan Approved & Funded!',
      message: `Your ${loan.loanType.toUpperCase()} loan for $${loan.amount.toLocaleString()} has been approved and disbursed.`,
      isRead: false,
      createdAt: now,
    };

    setState((prev) => ({
      ...prev,
      loans: prev.loans.map((l) => (l.id === loanId ? { ...l, status: 'active', approvedBy: currentUser?.fullName, approvedAt: now } : l)),
      accounts: updatedAccounts,
      transactions: newTxns,
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const rejectLoan = (loanId: string, reason: string) => {
    const loan = state.loans.find((l) => l.id === loanId);
    if (!loan) return;

    const now = new Date().toISOString();
    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: 'LOAN_REJECTED',
      targetType: 'Loan',
      targetId: loanId,
      targetName: `${loan.loanType.toUpperCase()} Loan ($${loan.amount})`,
      details: { amount: loan.amount, reason },
      reason,
      createdAt: now,
    };

    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId: loan.userId,
      type: 'error',
      title: 'Loan Application Update',
      message: `Your loan application could not be approved. Reason: ${reason}`,
      isRead: false,
      createdAt: now,
    };

    setState((prev) => ({
      ...prev,
      loans: prev.loans.map((l) => (l.id === loanId ? { ...l, status: 'rejected', rejectionReason: reason } : l)),
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const issueDebitCard = (userId: string, accountId: string) => {
    const user = state.profiles.find((p) => p.userId === userId);
    if (!user) return;

    const cardId = 'card-' + Date.now();
    const now = new Date().toISOString();

    const newCard: DebitCard = {
      id: cardId,
      userId,
      accountId,
      cardNumber: '4532 ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000),
      cardHolder: user.fullName.toUpperCase(),
      expiryMonth: 12,
      expiryYear: 2029,
      cvv: String(Math.floor(100 + Math.random() * 900)),
      cardType: 'visa',
      status: 'active',
      pinSet: true,
      dailyLimit: 3000,
      createdAt: now,
    };

    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId,
      type: 'success',
      title: 'Gold Visa Debit Card Issued',
      message: 'Your new Greendot Gold Visa Card is active and ready for in-store & digital transactions.',
      isRead: false,
      createdAt: now,
    };

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: 'DEBIT_CARD_ISSUED',
      targetType: 'DebitCard',
      targetId: cardId,
      targetName: user.fullName,
      details: { cardType: 'visa' },
      createdAt: now,
    };

    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.userId === userId ? { ...p, hasVisaCard: true } : p)),
      debitCards: [...prev.debitCards, newCard],
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const toggleCardFreeze = (cardId?: string) => {
    const targetId = cardId || currentCards[0]?.id;
    if (!targetId) return;
    setState((prev) => ({
      ...prev,
      debitCards: prev.debitCards.map((c) =>
        c.id === targetId
          ? { ...c, status: c.status === 'active' ? 'frozen' : 'active' }
          : c
      ),
    }));
  };

  const updateCardLimit = (cardId: string, limit: number) => {
    setState((prev) => ({
      ...prev,
      debitCards: prev.debitCards.map((c) => (c.id === cardId ? { ...c, dailyLimit: limit } : c)),
    }));
  };

  const verifyKyc = (userId: string, status: 'verified' | 'rejected') => {
    const user = state.profiles.find((p) => p.userId === userId);
    const now = new Date().toISOString();

    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId,
      type: status === 'verified' ? 'success' : 'error',
      title: status === 'verified' ? 'Identity Verification Verified' : 'KYC Verification Incomplete',
      message: status === 'verified'
        ? 'Your identity documents have been confirmed. Full banking capabilities unlocked.'
        : 'Please resubmit your identity verification documents or contact support.',
      isRead: false,
      createdAt: now,
    };

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: `KYC_${status.toUpperCase()}`,
      targetType: 'Profile',
      targetId: userId,
      targetName: user?.fullName || userId,
      details: { status },
      createdAt: now,
    };

    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.userId === userId ? { ...p, kycStatus: status } : p)),
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const payBill = (
    accountIdOrObj: any,
    billerName?: string,
    billerCategory?: string,
    accountReference?: string,
    amount?: number
  ) => {
    if (!currentUser) return { success: false, message: 'Not logged in.' };

    let accId = currentAccounts[0]?.id;
    let bName = '';
    let bCat = 'Utilities';
    let bRef = 'CE-9812-4910';
    let bAmt = 0;

    if (typeof accountIdOrObj === 'object' && accountIdOrObj !== null) {
      bName = accountIdOrObj.billerName || 'Service Provider';
      bCat = accountIdOrObj.billerCategory || 'Utilities';
      bRef = accountIdOrObj.accountNumber || accountIdOrObj.accountReference || 'ACC-98124';
      bAmt = Number(accountIdOrObj.amount) || 0;
      if (accountIdOrObj.accountId) accId = accountIdOrObj.accountId;
    } else {
      accId = accountIdOrObj;
      bName = billerName || 'Service Provider';
      bCat = billerCategory || 'Utilities';
      bRef = accountReference || 'ACC-98124';
      bAmt = Number(amount) || 0;
    }

    const acc = state.accounts.find((a) => a.id === accId) || currentAccounts[0];
    if (!acc || acc.balance < bAmt) return { success: false, message: 'Insufficient balance.' };

    const newBalance = acc.balance - bAmt;
    const now = new Date().toISOString();
    const reference = generateReference('BILL');

    const newBill: BillPayment = {
      id: 'bill-' + Date.now(),
      userId: currentUser.userId,
      accountId: acc.id,
      billerName: bName,
      billerCategory: bCat,
      accountReference: bRef,
      amount: bAmt,
      status: 'completed',
      createdAt: now,
    };

    const newTxn: Transaction = {
      id: 'txn-' + Date.now(),
      accountId: acc.id,
      userId: currentUser.userId,
      type: 'bill_pay',
      amount: bAmt,
      fee: 0,
      description: `Bill Payment to ${bName} (${bCat})`,
      reference,
      senderName: bName,
      balanceAfter: newBalance,
      status: 'completed',
      date: now,
      createdAt: now,
    };

    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === acc.id ? { ...a, balance: newBalance } : a)),
      billPayments: [newBill, ...prev.billPayments],
      transactions: [newTxn, ...prev.transactions],
    }));

    return { success: true, message: `Successfully paid $${bAmt.toFixed(2)} to ${bName}.` };
  };

  const rechargeMobile = (
    accountIdOrObj: any,
    phoneNumber?: string,
    carrier?: string,
    amount?: number
  ) => {
    if (!currentUser) return { success: false, message: 'Not logged in.' };

    let accId = currentAccounts[0]?.id;
    let pNum = '';
    let pCarrier = '';
    let pAmt = 0;

    if (typeof accountIdOrObj === 'object' && accountIdOrObj !== null) {
      pCarrier = accountIdOrObj.operator || accountIdOrObj.carrier || 'Wireless Carrier';
      pNum = accountIdOrObj.phoneNumber || '';
      pAmt = Number(accountIdOrObj.amount) || 0;
      if (accountIdOrObj.accountId) accId = accountIdOrObj.accountId;
    } else {
      accId = accountIdOrObj;
      pNum = phoneNumber || '';
      pCarrier = carrier || 'Wireless Carrier';
      pAmt = Number(amount) || 0;
    }

    const acc = state.accounts.find((a) => a.id === accId) || currentAccounts[0];
    if (!acc || acc.balance < pAmt) return { success: false, message: 'Insufficient balance.' };

    const newBalance = acc.balance - pAmt;
    const now = new Date().toISOString();
    const reference = generateReference('RCH');

    const newRecharge: MobileRecharge = {
      id: 'rech-' + Date.now(),
      userId: currentUser.userId,
      accountId: acc.id,
      phoneNumber: pNum,
      carrier: pCarrier,
      amount: pAmt,
      status: 'completed',
      createdAt: now,
    };

    const newTxn: Transaction = {
      id: 'txn-' + Date.now(),
      accountId: acc.id,
      userId: currentUser.userId,
      type: 'recharge',
      amount: pAmt,
      fee: 0,
      description: `Mobile Airtime Recharge (${pCarrier} - ${pNum})`,
      reference,
      senderName: pCarrier,
      balanceAfter: newBalance,
      status: 'completed',
      date: now,
      createdAt: now,
    };

    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === acc.id ? { ...a, balance: newBalance } : a)),
      mobileRecharges: [newRecharge, ...prev.mobileRecharges],
      transactions: [newTxn, ...prev.transactions],
    }));

    return { success: true, message: `Recharged $${pAmt.toFixed(2)} to ${pNum} (${pCarrier}).` };
  };

  const mobileRecharge = rechargeMobile;

  const addBeneficiary = (
    nameOrObj: any,
    accountNumber?: string,
    bankName?: string,
    nickname?: string
  ) => {
    if (!currentUser) return;
    let bName = '';
    let bAcc = '';
    let bBank = 'JPMorgan Chase';
    let bNick = '';
    let bRouting = '021000021';

    if (typeof nameOrObj === 'object' && nameOrObj !== null) {
      bName = nameOrObj.accountName || nameOrObj.name || '';
      bAcc = nameOrObj.accountNumber || '';
      bBank = nameOrObj.bankName || 'JPMorgan Chase';
      bNick = nameOrObj.nickname || bName;
      bRouting = nameOrObj.routingNumber || '021000021';
    } else {
      bName = nameOrObj || '';
      bAcc = accountNumber || '';
      bBank = bankName || 'JPMorgan Chase';
      bNick = nickname || bName;
    }

    const newBen: Beneficiary = {
      id: 'ben-' + Date.now(),
      userId: currentUser.userId,
      name: bName,
      accountName: bName,
      accountNumber: bAcc,
      bankName: bBank,
      nickname: bNick,
      routingNumber: bRouting,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, beneficiaries: [newBen, ...prev.beneficiaries] }));
  };

  const deleteBeneficiary = (id: string) => {
    setState((prev) => ({ ...prev, beneficiaries: prev.beneficiaries.filter((b) => b.id !== id) }));
  };

  const removeBeneficiary = deleteBeneficiary;

  const setTransactionPin = (pinOrUserId: string, currentPinOrNewPin?: string) => {
    if (!currentUser) return { success: false, message: 'Not logged in.' };
    let pinToSet = pinOrUserId;
    if (currentPinOrNewPin && /^\d{4}$/.test(currentPinOrNewPin)) {
      pinToSet = currentPinOrNewPin;
    }
    if (pinToSet.length !== 4 || !/^\d+$/.test(pinToSet)) {
      return { success: false, message: 'PIN must be exactly 4 numerical digits.' };
    }
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.userId === currentUser.userId ? { ...p, transactionPinHash: pinToSet } : p
      ),
    }));
    return { success: true, message: 'Transaction PIN updated securely.' };
  };

  const upgradeAccountToTier1 = () => {
    if (!currentUser) return { success: false, message: 'Not logged in.' };
    const minLoad = currentUser.upgradeMinLoad || 800;
    if (currentUser.balance < minLoad) {
      return { success: false, message: `Insufficient balance to meet Tier 1 minimum load requirement of $${minLoad}.00.` };
    }
    const now = new Date().toISOString();
    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId: currentUser.userId,
      type: 'success',
      title: 'Account Upgraded to Tier 1!',
      message: 'Congratulations! Your account has been upgraded to Tier 1. Full wire transfers, bill pay, and mobile recharges are now fully unlocked.',
      isRead: false,
      createdAt: now,
    };
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.userId === currentUser.userId ? { ...p, accountTier: 'tier_1', updatedAt: now } : p)),
      notifications: [notif, ...prev.notifications],
    }));
    return { success: true, message: 'Account successfully upgraded to Tier 1!' };
  };

  const updateProfile = (userIdOrPartial: any, partial?: Partial<Profile>) => {
    if (typeof userIdOrPartial === 'object' && userIdOrPartial !== null) {
      if (!currentUser) return;
      setState((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) =>
          p.userId === currentUser.userId ? { ...p, ...userIdOrPartial, updatedAt: new Date().toISOString() } : p
        ),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) =>
          p.userId === userIdOrPartial ? { ...p, ...(partial || {}), updatedAt: new Date().toISOString() } : p
        ),
      }));
    }
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.userId === currentUser.userId ? { ...n, isRead: true } : n)),
    }));
  };

  const sendSupportTicket = (subject: string, message: string) => {
    if (!currentUser) return;
    const newTicket: SupportTicket = {
      id: 'tkt-' + Date.now(),
      userId: currentUser.userId,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      subject,
      message,
      status: 'open',
      replies: [],
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, supportTickets: [newTicket, ...prev.supportTickets] }));
  };

  const createSupportTicket = (ticket: { subject: string; message: string; category?: string }) => {
    sendSupportTicket(ticket.subject, ticket.message);
  };

  const replySupportTicket = (ticketId: string, text: string) => {
    const isUserAdmin = currentUser?.role === 'admin';
    setState((prev) => ({
      ...prev,
      supportTickets: prev.supportTickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: isUserAdmin ? 'in_progress' : t.status,
          replies: [
            ...t.replies,
            {
              sender: isUserAdmin ? 'support' : 'user',
              senderName: currentUser?.fullName || (isUserAdmin ? 'Support Agent' : 'Customer'),
              text,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }),
    }));
  };

  const sendAnnouncement = (
    title: string,
    category: 'general' | 'security_alert' | 'maintenance' | 'policy_update',
    content: string,
    targetAudience: 'all' | 'tier_1' | 'active_only'
  ) => {
    const now = new Date().toISOString();
    const newAnc: Announcement = {
      id: 'anc-' + Date.now(),
      title,
      category,
      content,
      targetAudience,
      sentBy: currentUser?.fullName || 'Greendot Administration',
      createdAt: now,
    };

    // Filter target profiles
    const targets = state.profiles.filter((p) => {
      if (p.role === 'admin') return false;
      if (targetAudience === 'active_only' && p.status !== 'active') return false;
      if (targetAudience === 'tier_1' && p.accountTier === 'tier_0') return false;
      return true;
    });

    const newNotifs: Notification[] = targets.map((t) => ({
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      userId: t.userId,
      type: category === 'security_alert' ? 'security' : 'info',
      title,
      message: content,
      isRead: false,
      createdAt: now,
    }));

    const newEmailLogs: EmailLog[] = targets.map((t) => ({
      id: 'eml-' + Math.random().toString(36).substring(2, 9),
      recipient: t.email,
      subject: title,
      emailType: 'announcement',
      htmlContent: renderBrandedEmailHtml({
        recipientName: t.fullName,
        recipientEmail: t.email,
        type: 'announcement',
        subject: title,
        announcementCategory: category,
        content,
      }),
      status: 'sent',
      sentAt: now,
    }));

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: 'ANNOUNCEMENT_BROADCAST',
      targetType: 'Announcement',
      targetId: newAnc.id,
      targetName: title,
      details: { category, targetAudience, recipientCount: targets.length },
      createdAt: now,
    };

    setState((prev) => ({
      ...prev,
      announcements: [newAnc, ...prev.announcements],
      notifications: [...newNotifs, ...prev.notifications],
      emailLogs: [...newEmailLogs, ...prev.emailLogs],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      appSettings: { ...prev.appSettings, ...partial },
      auditLogs: [
        {
          id: 'audit-' + Date.now(),
          adminName: currentUser?.fullName || 'Administrator',
          adminId: currentUser?.userId,
          action: 'SETTINGS_UPDATED',
          targetType: 'AppSettings',
          targetId: 'global',
          targetName: 'Platform Configuration',
          details: partial,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const updateAppSettings = updateSettings;
  const exportFullStateJson = () => exportBackupJson();
  const importFullStateJson = (str: string) => importBackupJson(str);

  const deleteCustomer = (userId: string) => {
    const customer = state.profiles.find((p) => p.userId === userId);
    const now = new Date().toISOString();

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: 'CUSTOMER_PERMANENTLY_DELETED',
      targetType: 'Profile',
      targetId: userId,
      targetName: customer?.fullName || userId,
      details: { email: customer?.email },
      createdAt: now,
    };

    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.filter((p) => p.userId !== userId),
      accounts: prev.accounts.filter((a) => a.userId !== userId),
      transactions: prev.transactions.filter((t) => t.userId !== userId),
      transfers: prev.transfers.filter((t) => t.userId !== userId),
      debitCards: prev.debitCards.filter((c) => c.userId !== userId),
      loans: prev.loans.filter((l) => l.userId !== userId),
      notifications: prev.notifications.filter((n) => n.userId !== userId),
      beneficiaries: prev.beneficiaries.filter((b) => b.userId !== userId),
      auditLogs: [audit, ...prev.auditLogs],
      currentUserId: prev.currentUserId === userId ? null : prev.currentUserId,
    }));
  };

  const reopenAccount = (userId: string, accountType: 'checking' | 'savings' | 'investment', initialDeposit: number) => {
    const customer = state.profiles.find((p) => p.userId === userId);
    if (!customer) return;

    const newAccNum = generateAccountNumber();
    const newAccId = 'acc-' + Date.now();
    const activationCode = generateActivationCode();
    const now = new Date().toISOString();

    const newAccount: Account = {
      id: newAccId,
      userId,
      accountNumber: newAccNum,
      accountType,
      balance: initialDeposit,
      currency: 'USD',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const audit: AuditLog = {
      id: 'audit-' + Date.now(),
      adminName: currentUser?.fullName || 'Administrator',
      adminId: currentUser?.userId,
      action: 'ACCOUNT_REOPENED',
      targetType: 'Account',
      targetId: newAccId,
      targetName: customer.fullName,
      details: { accountType, initialDeposit },
      createdAt: now,
    };

    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.userId === userId ? { ...p, status: 'active', updatedAt: now } : p)),
      accounts: [...prev.accounts, newAccount],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const resetDemoData = () => {
    const reset = resetState();
    setState(reset);
  };

  const exportBackupJson = () => {
    return JSON.stringify(state, null, 2);
  };

  const importBackupJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profiles && parsed.accounts) {
        setState(parsed);
        saveState(parsed);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <BankContext.Provider
      value={{
        state,
        currentUser,
        currentRole,
        currentAccounts,
        currentCards,
        currentTransactions,
        customerTransactions,
        currentTransfers,
        currentLoans,
        customerLoans,
        currentBeneficiaries,
        beneficiaries,
        currentNotifications,
        notifications,
        unreadNotificationCount,
        supportTickets,
        login,
        logout,
        switchUser,
        switchCustomer,
        loginAsAdmin,
        activateAccount,
        createCustomer,
        updateCustomer,
        fundCustomer,
        deductCustomer,
        updateCustomerStatus,
        updateCustomerTier,
        adjustCustomerBalance,
        submitTransfer,
        approveTransfer,
        rejectTransfer,
        applyLoan,
        approveLoan,
        rejectLoan,
        issueDebitCard,
        toggleCardFreeze,
        updateCardLimit,
        verifyKyc,
        payBill,
        rechargeMobile,
        mobileRecharge,
        addBeneficiary,
        deleteBeneficiary,
        removeBeneficiary,
        setTransactionPin,
        upgradeAccountToTier1,
        updateProfile,
        markNotificationRead,
        markAllNotificationsRead,
        createSupportTicket,
        sendSupportTicket,
        replySupportTicket,
        sendAnnouncement,
        updateSettings,
        updateAppSettings,
        deleteCustomer,
        reopenAccount,
        resetDemoData,
        exportBackupJson,
        exportFullStateJson,
        importBackupJson,
        importFullStateJson,
      }}
    >
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
};

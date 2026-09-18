import { createClient } from '@supabase/supabase-js';
import {
  Profile,
  Account,
  Transaction,
  Transfer,
  Beneficiary,
  DebitCard,
  Loan,
  Notification,
  SupportTicket,
  AuditLog,
  AppSettings,
  BillPayment,
  MobileRecharge,
  Announcement,
  EmailLog,
} from '../types';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  metaEnv.VITE_SUPABASE_URL && metaEnv.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Database schema TypeScript definitions for Supabase tables
 */
export interface DatabaseSchema {
  profiles: Profile;
  accounts: Account;
  transactions: Transaction;
  transfers: Transfer;
  beneficiaries: Beneficiary;
  debit_cards: DebitCard;
  loans: Loan;
  notifications: Notification;
  support_tickets: SupportTicket;
  audit_logs: AuditLog;
  app_settings: AppSettings;
  bill_payments: BillPayment;
  mobile_recharges: MobileRecharge;
  announcements: Announcement;
  email_logs: EmailLog;
}

/**
 * Helper to fetch or synchronize current session user from Supabase auth or fallback state
 */
export async function getSupabaseAuthUser(): Promise<any | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session.user;
  } catch (err) {
    console.warn('Supabase auth session check failed:', err);
    return null;
  }
}

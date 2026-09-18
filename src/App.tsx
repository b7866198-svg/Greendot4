import React, { useState, useEffect } from 'react';
import { BankProvider, useBank } from './context/BankContext';
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicFooter } from './components/public/PublicFooter';
import { HomePage } from './components/public/HomePage';
import {
  AboutPage,
  LoansPage,
  InvestmentsPage,
  CareersPage,
  FaqPage,
  ContactPage,
  OpenAccountPage,
  ActivateAccountPage,
} from './components/public/OtherPublicPages';
import { MaintenancePage, LockdownPage, AdminAccessBypass } from './components/public/SpecialSystemPages';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { CustomerTransfer } from './components/dashboard/CustomerTransfer';
import { CustomerTransactions } from './components/dashboard/CustomerTransactions';
import { CustomerCards, CustomerBeneficiaries } from './components/dashboard/CustomerCards';
import { CustomerBillPay } from './components/dashboard/CustomerBillPay';
import { CustomerRecharge } from './components/dashboard/CustomerRecharge';
import { CustomerLoans } from './components/dashboard/CustomerLoans';
import { CustomerSupportCenter } from './components/dashboard/CustomerSupportCenter';
import { CustomerProfileSecurity } from './components/dashboard/CustomerProfileSecurity';
import { CustomerCheckDeposit } from './components/dashboard/CustomerCheckDeposit';
import { CustomerStatements } from './components/dashboard/CustomerStatements';
import { PwaInstallPrompt } from './components/ui/PwaInstallPrompt';
import {
  HowToGetCardView,
  HowToUpgradeView,
  NotificationsView,
} from './components/dashboard/SpecialStatusViews';
import { AdminPortal } from './components/admin/AdminPortal';
import { ExportDeployModal } from './components/export/ExportDeployModal';
import { ShieldCheck } from 'lucide-react';

const BankAppInner: React.FC = () => {
  const { currentUser, currentRole, switchCustomer, loginAsAdmin, state, logout } = useBank();

  const [page, setPage] = useState<string>('home');
  const [dashboardTab, setDashboardTab] = useState<string>('overview');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Automatically route to dashboard if customer logs in, or admin if admin
  useEffect(() => {
    if (currentRole === 'admin' && page !== 'admin') {
      setPage('admin');
    } else if (currentUser && (page === 'login' || page === 'activate')) {
      setPage('dashboard');
    }
  }, [currentRole, currentUser]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, dashboardTab]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* ================= ADMIN ACCESS BYPASS PAGE ================= */}
      {page === 'admin-access' && (
        <AdminAccessBypass onSuccessfulLogin={() => setPage('admin')} />
      )}

      {/* ================= LOCKDOWN MODE INTERCEPTOR ================= */}
      {page !== 'admin-access' && state.appSettings.lockdown_mode && currentRole !== 'admin' && (
        <LockdownPage onBypass={() => setPage('admin-access')} />
      )}

      {/* ================= MAINTENANCE MODE INTERCEPTOR ================= */}
      {page !== 'admin-access' && !state.appSettings.lockdown_mode && state.appSettings.maintenance_mode && currentRole !== 'admin' && (
        <MaintenancePage onBypass={() => setPage('admin-access')} />
      )}

      {/* ================= PUBLIC FLOW ================= */}
      {page !== 'admin-access' && (!state.appSettings.lockdown_mode && !state.appSettings.maintenance_mode || currentRole === 'admin') && page !== 'dashboard' && page !== 'admin' && (
        <>
          <PublicNavbar
            currentPage={page}
            onNavigate={(p) => setPage(p)}
            onOpenDeployModal={() => setIsDeployModalOpen(true)}
          />

          <main className="flex-1">
            {page === 'home' && (
              <HomePage
                onNavigate={(p) => setPage(p)}
                onOpenDeployModal={() => setIsDeployModalOpen(true)}
              />
            )}
            {page === 'about' && <AboutPage onNavigate={(p) => setPage(p)} />}
            {page === 'loans' && <LoansPage onNavigate={(p) => setPage(p)} />}
            {page === 'investments' && <InvestmentsPage onNavigate={(p) => setPage(p)} />}
            {page === 'careers' && <CareersPage onNavigate={(p) => setPage(p)} />}
            {page === 'faq' && <FaqPage onNavigate={(p) => setPage(p)} />}
            {page === 'contact' && <ContactPage />}
            {page === 'open-account' && (
              <OpenAccountPage
                onSuccess={(customerId, activationCode) => {
                  setPage('activate');
                }}
                onNavigateLogin={() => setPage('login')}
              />
            )}
            {page === 'activate' && (
              <ActivateAccountPage
                onSuccess={() => {
                  setPage('login');
                }}
                onNavigateLogin={() => setPage('login')}
              />
            )}
            {page === 'login' && (
              <LoginPage
                onSuccess={(role) => {
                  if (role === 'admin') setPage('admin');
                  else setPage('dashboard');
                }}
                onNavigateHome={() => setPage('home')}
                onNavigateRegister={() => setPage('open-account')}
                onNavigateActivate={() => setPage('activate')}
              />
            )}
          </main>

          <PublicFooter
            onNavigate={(p) => setPage(p)}
            onOpenDeployModal={() => setIsDeployModalOpen(true)}
          />
        </>
      )}

      {/* ================= CUSTOMER DASHBOARD FLOW ================= */}
      {page !== 'admin-access' && (!state.appSettings.lockdown_mode && !state.appSettings.maintenance_mode || currentRole === 'admin') && page === 'dashboard' && currentUser && (
        <DashboardLayout
          activeTab={dashboardTab}
          onTabChange={(t) => setDashboardTab(t)}
          onNavigateHome={() => setPage('home')}
          onOpenDeployModal={() => setIsDeployModalOpen(true)}
        >
          {dashboardTab === 'overview' && (
            <DashboardOverview onTabChange={(t) => setDashboardTab(t)} />
          )}
          {dashboardTab === 'transfer' && (
            <CustomerTransfer onTabChange={(t) => setDashboardTab(t)} />
          )}
          {dashboardTab === 'deposit' && (
            <CustomerCheckDeposit onSuccessNavigate={() => setDashboardTab('transactions')} />
          )}
          {dashboardTab === 'transactions' && <CustomerTransactions />}
          {dashboardTab === 'statements' && <CustomerStatements />}
          {dashboardTab === 'cards' && <CustomerCards />}
          {dashboardTab === 'beneficiaries' && (
            <CustomerBeneficiaries onTabChange={(t) => setDashboardTab(t)} />
          )}
          {dashboardTab === 'bill-pay' && (
            <CustomerBillPay onTabChange={(t) => setDashboardTab(t)} />
          )}
          {dashboardTab === 'recharge' && (
            <CustomerRecharge onTabChange={(t) => setDashboardTab(t)} />
          )}
          {dashboardTab === 'loans' && <CustomerLoans />}
          {dashboardTab === 'support' && <CustomerSupportCenter />}
          {dashboardTab === 'profile' && <CustomerProfileSecurity initialTab="profile" />}
          {dashboardTab === 'security' && <CustomerProfileSecurity initialTab="security" />}
          {dashboardTab === 'how-to-get-card' && (
            <HowToGetCardView onTabChange={(t) => setDashboardTab(t)} />
          )}
          {dashboardTab === 'how-to-upgrade' && (
            <HowToUpgradeView onTabChange={(t) => setDashboardTab(t)} />
          )}
          {dashboardTab === 'notifications' && <NotificationsView />}
        </DashboardLayout>
      )}

      {/* Fallback if user navigates to dashboard but is not logged in */}
      {page !== 'admin-access' && (!state.appSettings.lockdown_mode && !state.appSettings.maintenance_mode || currentRole === 'admin') && page === 'dashboard' && !currentUser && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-sm">
            <Lock className="w-12 h-12 text-emerald-700 mx-auto" />
            <h3 className="font-bold text-lg text-slate-900">Sign-in Required</h3>
            <p className="text-xs text-slate-500">
              Please sign into your verified Greendot customer account to access online banking.
            </p>
            <button
              onClick={() => setPage('login')}
              className="w-full py-3 gradient-primary text-white font-bold text-xs rounded-xl shadow"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      )}

      {/* ================= ADMIN PORTAL FLOW ================= */}
      {page !== 'admin-access' && page === 'admin' && (
        <AdminPortal
          onNavigateWebsite={() => setPage('home')}
          onNavigateCustomer={(customerId) => {
            switchCustomer(customerId);
            setPage('dashboard');
            setDashboardTab('overview');
          }}
        />
      )}

      {/* ================= PWA INSTALL PROMPT & APP BANNER ================= */}
      <PwaInstallPrompt />

      {/* ================= EXPORT & DEPLOY MODAL ================= */}
      <ExportDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BankProvider>
      <BankAppInner />
    </BankProvider>
  );
}

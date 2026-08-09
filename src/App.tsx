import React, { useState, useEffect } from 'react';
import { ViewTab, Transaction, Category, SyncSettings, AuthUser, AccountInfo, DebtItem } from './types';
import {
  loadStoredTransactions,
  saveTransactions,
  loadStoredCategories,
  saveCategories,
  loadStoredOpenBalance,
  saveOpenBalance,
  loadSyncSettings,
  saveSyncSettings,
  loadStoredAccounts,
  saveAccounts,
  loadStoredDebts,
  saveDebts,
  loadStoredPin,
  savePin,
  loadClosedMonths,
  saveClosedMonths,
  calculateBalanceSummary,
  resetToSampleData,
} from './utils/storage';
import { Header } from './components/Header';
import { BalanceSummaryCards } from './components/BalanceSummaryCards';
import { QuickAddModal } from './components/QuickAddModal';
import { TransactionList } from './components/TransactionList';
import { AnalyticsView } from './components/AnalyticsView';
import { CategoryManager } from './components/CategoryManager';
import { SyncModal } from './components/SyncModal';
import { FeaturesView } from './components/FeaturesView';
import { AuthModal } from './components/AuthModal';
import { KasbonManager } from './components/KasbonManager';
import { AccountsManager } from './components/AccountsManager';
import { ExportReportModal } from './components/ExportReportModal';
import { PinLockModal } from './components/PinLockModal';
import { SplashScreen } from './components/SplashScreen';
import {
  syncUserToFirestore,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  fetchTransactionsFromFirestore,
} from './utils/firestoreStorage';
import { Plus, Wallet, BarChart3, RefreshCw, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [openBalance, setOpenBalance] = useState<number>(0);
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    autoSync: false,
    cloudSyncEnabled: false,
  });

  // PIN Security State
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Time filter for dashboard
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);

  // Tutup Buku (Monthly Closing) State
  const [closedMonths, setClosedMonths] = useState<string[]>([]);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('current');

  // Quick Add Modal state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Auto-sync Toast notification state
  const [autoSyncToast, setAutoSyncToast] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    setTransactions(loadStoredTransactions());
    setCategories(loadStoredCategories());
    setAccounts(loadStoredAccounts());
    setDebts(loadStoredDebts());
    setOpenBalance(loadStoredOpenBalance());
    setSyncSettings(loadSyncSettings());
    setClosedMonths(loadClosedMonths());
    const pin = loadStoredPin();
    setSavedPin(pin);
    if (pin) {
      setIsUnlocked(false);
      setIsPinModalOpen(true);
    }

    try {
      const savedUser = localStorage.getItem('catat_keuangan_auth_user');
      if (savedUser) {
        const parsed: AuthUser = JSON.parse(savedUser);
        setCurrentUser(parsed);
        // Sync user to Firestore in background
        syncUserToFirestore(parsed, loadStoredOpenBalance());
        // Fetch transactions from Firestore if available
        fetchTransactionsFromFirestore(parsed.id).then((cloudTxs) => {
          if (cloudTxs && cloudTxs.length > 0) {
            setTransactions(cloudTxs);
            saveTransactions(cloudTxs);
          }
        });
      }
    } catch (e) {
      console.warn('Failed loading auth user', e);
    }
  }, []);

  const handleSaveDebts = (updatedDebts: DebtItem[]) => {
    setDebts(updatedDebts);
    saveDebts(updatedDebts);
  };

  const handleSaveAccounts = (updatedAccounts: AccountInfo[]) => {
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
  };

  const handleSavePin = (pin: string | null) => {
    setSavedPin(pin);
    savePin(pin);
  };

  const handleCloseCurrentMonth = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (!closedMonths.includes(currentMonth)) {
      const updated = [...closedMonths, currentMonth];
      setClosedMonths(updated);
      saveClosedMonths(updated);
    }
    setSelectedMonthFilter('current');
  };

  const handleLoginSuccess = async (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('catat_keuangan_auth_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed saving user', e);
    }
    // Sync user & transactions with Firestore
    await syncUserToFirestore(user, openBalance);
    const cloudTxs = await fetchTransactionsFromFirestore(user.id);
    if (cloudTxs && cloudTxs.length > 0) {
      setTransactions(cloudTxs);
      saveTransactions(cloudTxs);
    } else if (transactions.length > 0) {
      // Push existing local transactions to Firestore
      for (const tx of transactions) {
        saveTransactionToFirestore(user.id, tx);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('catat_keuangan_auth_user');
    } catch (e) {
      console.error('Failed removing user', e);
    }
    setIsAuthModalOpen(false);
  };

  // Background Auto-Sync Helper
  const triggerAutoSync = async (latestTxList: Transaction[], currentSettings?: SyncSettings) => {
    const activeSettings = currentSettings || syncSettings;
    if (!activeSettings.autoSync || !activeSettings.googleSheetsWebhookUrl) return;

    let targetUrl = activeSettings.googleSheetsWebhookUrl.trim();
    if (!targetUrl) return;

    if (targetUrl.endsWith('/dev')) {
      targetUrl = targetUrl.replace(/\/dev$/, '/exec');
    }

    try {
      const payload = latestTxList.map((tx) => {
        const matchedCat = categories.find((c) => c.id === tx.categoryId);
        return {
          date: tx.date,
          time: tx.time || '',
          type: tx.type,
          categoryName: matchedCat ? matchedCat.name : tx.categoryName,
          amount: tx.amount,
          account: tx.account,
          notes: tx.notes || '',
        };
      });

      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'clear_and_write',
          transactions: payload,
        }),
        mode: 'no-cors',
      });

      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const updatedSettings = {
        ...activeSettings,
        lastSyncTime: nowStr,
        cloudSyncEnabled: true,
      };
      setSyncSettings(updatedSettings);
      saveSyncSettings(updatedSettings);

      setAutoSyncToast(`⚡ Auto-sync: Data terkirim ke Google Sheets (${nowStr})`);
      setTimeout(() => setAutoSyncToast(null), 3500);
    } catch (err) {
      console.warn('Auto sync skipped (jaringan/offline):', err);
    }
  };

  // Save changes to storage whenever state updates
  const handleSaveTransactions = (newTxList: Transaction[]) => {
    setTransactions(newTxList);
    saveTransactions(newTxList);
    triggerAutoSync(newTxList);
  };

  const handleSaveCategories = (newCatList: Category[]) => {
    setCategories(newCatList);
    saveCategories(newCatList);
  };

  const summary = calculateBalanceSummary(transactions, openBalance, timeFilter);

  const handleUpdateOpenBalance = (newBalanceInput: number) => {
    const newBase = newBalanceInput - summary.priorNet;
    setOpenBalance(newBase);
    saveOpenBalance(newBase);
  };

  const handleUpdateSyncSettings = (newSettings: SyncSettings) => {
    setSyncSettings(newSettings);
    saveSyncSettings(newSettings);
    if (newSettings.autoSync && newSettings.googleSheetsWebhookUrl) {
      triggerAutoSync(transactions, newSettings);
    }
  };

  // Add / Edit Transaction
  const handleSaveTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    let savedTx: Transaction;
    if (editingTransaction) {
      // Update
      savedTx = {
        ...editingTransaction,
        ...txData,
      };
      const updatedList = transactions.map((t) =>
        t.id === editingTransaction.id ? savedTx : t
      );
      handleSaveTransactions(updatedList);
      setEditingTransaction(null);
    } else {
      // Add new
      savedTx = {
        ...txData,
        id: `tx-${Date.now()}`,
        createdAt: Date.now(),
      };
      handleSaveTransactions([savedTx, ...transactions]);
    }

    if (currentUser) {
      saveTransactionToFirestore(currentUser.id, savedTx);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    handleSaveTransactions(updated);
    if (currentUser) {
      deleteTransactionFromFirestore(currentUser.id, id);
    }
  };

  // Restore backup
  const handleRestoreBackup = (data: { transactions: Transaction[]; categories?: Category[]; openBalance?: number }) => {
    if (data.transactions) {
      handleSaveTransactions(data.transactions);
    }
    if (data.categories) {
      handleSaveCategories(data.categories);
    }
    if (typeof data.openBalance === 'number') {
      handleUpdateOpenBalance(data.openBalance);
    }
  };

  // Reset to Sample Data
  const handleResetSampleData = () => {
    resetToSampleData();
    setTransactions(loadStoredTransactions());
    setCategories(loadStoredCategories());
    setOpenBalance(loadStoredOpenBalance());
    setSyncSettings(loadSyncSettings());
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => {
          setEditingTransaction(null);
          setIsQuickAddOpen(true);
        }}
        totalBalance={summary.totalBalance}
        lastSyncTime={syncSettings.lastSyncTime}
        cloudSyncEnabled={syncSettings.cloudSyncEnabled}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        savedPin={savedPin}
        onOpenPinModal={() => setIsPinModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* 4 Core Cards: Open Balance, Cash In, Cash Out, Total Balance */}
            <BalanceSummaryCards
              openBalance={summary.openBalance}
              cashIn={summary.cashIn}
              cashOut={summary.cashOut}
              totalBalance={summary.totalBalance}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              onUpdateOpenBalance={handleUpdateOpenBalance}
            />

            {/* Daily Transaction List */}
            <TransactionList
              transactions={transactions}
              categories={categories}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsQuickAddOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              closedMonths={closedMonths}
              selectedMonthFilter={selectedMonthFilter}
              onSelectMonthFilter={setSelectedMonthFilter}
              onCloseCurrentMonth={handleCloseCurrentMonth}
            />
          </div>
        )}

        {/* KASBON TAB */}
        {activeTab === 'kasbon' && (
          <KasbonManager
            debts={debts}
            onSaveDebts={handleSaveDebts}
            onAddTransaction={(tx) => handleSaveTransaction(tx)}
          />
        )}

        {/* ACCOUNTS TAB */}
        {activeTab === 'accounts' && (
          <AccountsManager
            accounts={accounts}
            transactions={transactions}
            onSaveAccounts={handleSaveAccounts}
          />
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <AnalyticsView transactions={transactions} categories={categories} />
        )}

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <ExportReportModal
            transactions={transactions}
            totalBalance={summary.totalBalance}
          />
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <CategoryManager
            categories={categories}
            onAddCategory={(newCat) => {
              const catObj: Category = {
                ...newCat,
                id: `cat-${Date.now()}`,
              };
              handleSaveCategories([...categories, catObj]);
            }}
            onUpdateCategory={(updatedCat) => {
              const updated = categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
              handleSaveCategories(updated);
            }}
            onDeleteCategory={(id) => {
              const updated = categories.filter((c) => c.id !== id);
              handleSaveCategories(updated);
            }}
          />
        )}

        {/* SYNC TAB */}
        {activeTab === 'sync' && (
          <SyncModal
            transactions={transactions}
            categories={categories}
            openBalance={openBalance}
            syncSettings={syncSettings}
            onUpdateSyncSettings={handleUpdateSyncSettings}
            onRestoreBackup={handleRestoreBackup}
            onResetSampleData={handleResetSampleData}
          />
        )}

        {/* FEATURES TAB */}
        {activeTab === 'features' && (
          <FeaturesView
            onOpenSync={() => setActiveTab('sync')}
            onOpenCategories={() => setActiveTab('categories')}
            onOpenKasbon={() => setActiveTab('kasbon')}
            onOpenAccounts={() => setActiveTab('accounts')}
            onOpenExport={() => setActiveTab('export')}
            onOpenPinModal={() => setIsPinModalOpen(true)}
          />
        )}

      </main>

      {/* Auth Modal (Google & Phone Auth) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* PIN Lock Security Modal */}
      <PinLockModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        savedPin={savedPin}
        onSavePin={handleSavePin}
        isUnlocked={isUnlocked}
        setIsUnlocked={setIsUnlocked}
      />

      {/* Quick Floating Action Button for Mobile */}
      <div className="fixed bottom-5 right-5 z-40 sm:hidden">
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsQuickAddOpen(true);
          }}
          className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl flex items-center justify-center transition active:scale-95"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => {
          setIsQuickAddOpen(false);
          setEditingTransaction(null);
        }}
        categories={categories}
        onSaveTransaction={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      {/* Auto-Sync Toast Notification */}
      {autoSyncToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 border border-slate-700 animate-fade-in backdrop-blur-md">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span>{autoSyncToast}</span>
        </div>
      )}

      {/* Opening Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

    </div>
  );
}

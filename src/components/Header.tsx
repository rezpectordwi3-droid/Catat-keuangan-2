import React, { useState } from 'react';
import { ViewTab, AuthUser } from '../types';
import { Wallet, BarChart3, Tag, RefreshCw, Plus, ShieldCheck, Smartphone, User, LogIn, Sparkles, CheckCircle2, MessageSquare, CreditCard, Printer, Lock, Unlock } from 'lucide-react';
import { formatCompactRupiah } from '../utils/formatters';
import { InstallPwaModal } from './InstallPwaModal';

interface HeaderProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onOpenQuickAdd: () => void;
  totalBalance: number;
  lastSyncTime?: string;
  cloudSyncEnabled: boolean;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  savedPin: string | null;
  onOpenPinModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  totalBalance,
  cloudSyncEnabled,
  currentUser,
  onOpenAuth,
  savedPin,
  onOpenPinModal,
}) => {
  const [showInstallModal, setShowInstallModal] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                    Catat Keuangan
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Cloud Safe
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Pencatatan Harian & Analisis Warung</p>
              </div>
            </div>

            {/* User Login, PIN Lock, Quick Balance Badge & Quick Add */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* PIN Security Button */}
              <button
                onClick={onOpenPinModal}
                title={savedPin ? 'PIN Keamanan Aktif' : 'Setel PIN Keamanan'}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  savedPin
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-800'
                }`}
              >
                {savedPin ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>

              {/* User Account Login Button */}
              <button
                onClick={onOpenAuth}
                id="btn-user-auth"
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  currentUser
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                }`}
              >
                {currentUser ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Masuk / Login</span>
                  </>
                )}
              </button>

              <div className="hidden lg:flex flex-col items-end px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Saldo</span>
                <span className="text-sm font-bold text-slate-800">{formatCompactRupiah(totalBalance)}</span>
              </div>

              <button
                onClick={() => setShowInstallModal(true)}
                id="btn-install-app"
                title="Download / Pasang di HP"
                className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-xl transition border border-slate-200 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">Install App</span>
              </button>

              <button
                onClick={onOpenQuickAdd}
                id="btn-quick-add-header"
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Catat</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-100">
            <button
              onClick={() => setActiveTab('dashboard')}
              id="tab-dashboard"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Catatan Harian</span>
            </button>

            <button
              onClick={() => setActiveTab('kasbon')}
              id="tab-kasbon"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'kasbon'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Buku Kasbon</span>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              id="tab-accounts"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'accounts'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span>Multi-Kas</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              id="tab-analytics"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Grafik & Analisis</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              id="tab-export"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'export'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-4 h-4 text-teal-500" />
              <span>Cetak & Excel</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              id="tab-categories"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'categories'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Kategori & Plafon</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              id="tab-sync"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'sync'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync Cloud / Sheets</span>
              {cloudSyncEnabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('features')}
              id="tab-features"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'features'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Daftar Fitur</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Modal install PWA */}
      <InstallPwaModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
    </>
  );
};


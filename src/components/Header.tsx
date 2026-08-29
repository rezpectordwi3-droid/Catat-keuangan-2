import React, { useState } from 'react';
import { ViewTab, AuthUser } from '../types';
import {
  Wallet,
  BarChart3,
  Tag,
  RefreshCw,
  Plus,
  ShieldCheck,
  Smartphone,
  User,
  LogIn,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  CreditCard,
  Printer,
  Lock,
  Unlock,
  Receipt,
  Activity,
  Calculator as CalcIcon,
} from 'lucide-react';
import { formatCompactRupiah } from '../utils/formatters';
import { InstallPwaModal } from './InstallPwaModal';

interface HeaderProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onOpenQuickAdd: () => void;
  onOpenCalculator?: () => void;
  totalBalance: number;
  lastSyncTime?: string;
  cloudSyncEnabled: boolean;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  savedPin: string | null;
  onOpenPinModal: () => void;
  unpaidBillsCount?: number;
  healthScore?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  onOpenCalculator,
  totalBalance,
  cloudSyncEnabled,
  currentUser,
  onOpenAuth,
  savedPin,
  onOpenPinModal,
  unpaidBillsCount = 0,
  healthScore = 85,
}) => {
  const [showInstallModal, setShowInstallModal] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 sm:h-16 gap-2">
            {/* Logo & Title */}
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0" onClick={() => setActiveTab('dashboard')}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-sm shrink-0">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none truncate">
                    Catat Keuangan
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Cloud
                  </span>
                </div>
                <p className="hidden xs:block text-[10px] sm:text-xs text-slate-500 font-medium truncate">Kas Harian & Warung</p>
              </div>
            </div>

            {/* User Login, PIN Lock, Quick Balance Badge & Quick Add */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
              {/* PIN Security Button */}
              <button
                onClick={onOpenPinModal}
                title={savedPin ? 'PIN Keamanan Aktif' : 'Setel PIN Keamanan'}
                className={`p-1.5 sm:p-2 rounded-xl border transition cursor-pointer shrink-0 ${
                  savedPin
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-800'
                }`}
              >
                {savedPin ? <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>

              {/* User Account Login Button */}
              <button
                onClick={onOpenAuth}
                id="btn-user-auth"
                className={`inline-flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer shrink-0 ${
                  currentUser
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                }`}
              >
                {currentUser ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px] sm:text-[10px]">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.name}</span>
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden xs:inline">Masuk</span>
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
                className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs p-1.5 sm:px-3 sm:py-2 rounded-xl transition border border-slate-200 cursor-pointer shrink-0"
              >
                <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="hidden md:inline">Install</span>
              </button>

              {onOpenCalculator && (
                <button
                  onClick={onOpenCalculator}
                  id="btn-calculator-header"
                  title="Buka Kalkulator Finansial"
                  className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs p-1.5 sm:px-2.5 sm:py-2 rounded-xl transition border border-slate-200 cursor-pointer shrink-0"
                >
                  <CalcIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                  <span className="hidden sm:inline">Kalkulator</span>
                </button>
              )}

              <button
                onClick={onOpenQuickAdd}
                id="btn-quick-add-header"
                className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition shadow-xs active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span>+ Catat</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5 sm:py-2 no-scrollbar border-t border-slate-100 -mx-3 px-3 sm:mx-0 sm:px-0 w-[calc(100%+1.5rem)] sm:w-full">
            {/* Dashboard / Catatan Harian */}
            <button
              onClick={() => setActiveTab('dashboard')}
              id="tab-dashboard"
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span>Catatan</span>
            </button>

            {/* Skor Kesehatan Finansial */}
            <button
              onClick={() => setActiveTab('health')}
              id="tab-health"
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'health'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
              <span>Skor Finansial</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                {healthScore}
              </span>
            </button>

            {/* Jadwal Tagihan Rutin */}
            <button
              onClick={() => setActiveTab('bills')}
              id="tab-bills"
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'bills'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
              <span>Tagihan</span>
              {unpaidBillsCount > 0 && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                  {unpaidBillsCount}
                </span>
              )}
            </button>

            {/* Buku Kasbon */}
            <button
              onClick={() => setActiveTab('kasbon')}
              id="tab-kasbon"
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'kasbon'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span>Kasbon</span>
            </button>

            {/* Multi-Kas */}
            <button
              onClick={() => setActiveTab('accounts')}
              id="tab-accounts"
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'accounts'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
              <span>Multi-Kas</span>
            </button>

            {/* Grafik & Analisis */}
            <button
              onClick={() => setActiveTab('analytics')}
              id="tab-analytics"
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Grafik</span>
            </button>

            {/* Cetak & Excel */}
            <button
              onClick={() => setActiveTab('export')}
              id="tab-export"
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'export'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-500" />
              <span>Laporan</span>
            </button>

            {/* Kategori & Plafon */}
            <button
              onClick={() => setActiveTab('categories')}
              id="tab-categories"
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'categories'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Kategori</span>
            </button>

            {/* Sync Cloud / Sheets */}
            <button
              onClick={() => setActiveTab('sync')}
              id="tab-sync"
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'sync'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Cloud</span>
              {cloudSyncEnabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            {/* Daftar Fitur */}
            <button
              onClick={() => setActiveTab('features')}
              id="tab-features"
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'features'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
              <span>Menu</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Modal install PWA */}
      <InstallPwaModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
    </>
  );
};



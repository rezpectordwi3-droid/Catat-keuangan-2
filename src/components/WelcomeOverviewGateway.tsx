import React from 'react';
import { Transaction, AuthUser, FinancialHealthMetrics, BillItem, DebtItem } from '../types';
import { formatRupiah, formatCompactRupiah } from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  MessageSquare,
  Activity,
  Plus,
  ArrowUpRight,
  Receipt,
  Sun,
  Moon,
  Coffee,
  Calculator as CalcIcon,
} from 'lucide-react';

interface WelcomeOverviewGatewayProps {
  currentUser: AuthUser | null;
  totalBalance: number;
  transactions: Transaction[];
  bills: BillItem[];
  debts: DebtItem[];
  healthMetrics: FinancialHealthMetrics;
  onOpenQuickAdd: (type?: 'cash_in' | 'cash_out') => void;
  onOpenCalculator?: () => void;
  onNavigateTab: (tab: any) => void;
  onOpenAuth: () => void;
}

export const WelcomeOverviewGateway: React.FC<WelcomeOverviewGatewayProps> = ({
  currentUser,
  totalBalance,
  transactions,
  bills,
  debts,
  healthMetrics,
  onOpenQuickAdd,
  onOpenCalculator,
  onNavigateTab,
  onOpenAuth,
}) => {
  // Determine Greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return { text: 'Selamat Pagi', icon: <Coffee className="w-5 h-5 text-amber-500" /> };
    if (hour >= 11 && hour < 15) return { text: 'Selamat Siang', icon: <Sun className="w-5 h-5 text-amber-500" /> };
    if (hour >= 15 && hour < 19) return { text: 'Selamat Sore', icon: <Sun className="w-5 h-5 text-orange-500" /> };
    return { text: 'Selamat Malam', icon: <Moon className="w-5 h-5 text-indigo-400" /> };
  };

  const greeting = getGreeting();

  // Current Date Formatted
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTxs = transactions.filter((t) => (t.date || '').slice(0, 10) === todayStr);
  const todayCashIn = todayTxs.filter((t) => t.type === 'cash_in').reduce((s, t) => s + t.amount, 0);
  const todayCashOut = todayTxs.filter((t) => t.type === 'cash_out').reduce((s, t) => s + t.amount, 0);

  const unpaidBills = bills.filter((b) => b.status === 'unpaid');
  const unpaidReceivables = debts.filter((d) => d.type === 'receivable' && d.status === 'unpaid');
  const totalReceivablesAmount = unpaidReceivables.reduce((s, d) => s + d.amount, 0);

  // Health Score Color & Badge
  const getScoreBadge = () => {
    if (healthMetrics.score >= 85) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
        ring: 'text-emerald-600',
        label: 'Sangat Sehat',
      };
    }
    if (healthMetrics.score >= 70) {
      return {
        bg: 'bg-teal-500/10 text-teal-700 border-teal-300',
        ring: 'text-teal-600',
        label: 'Sehat',
      };
    }
    if (healthMetrics.score >= 50) {
      return {
        bg: 'bg-amber-500/10 text-amber-700 border-amber-300',
        ring: 'text-amber-600',
        label: 'Perlu Waspada',
      };
    }
    return {
      bg: 'bg-rose-500/10 text-rose-700 border-rose-300',
      ring: 'text-rose-600',
      label: 'Kritis',
    };
  };

  const scoreBadge = getScoreBadge();

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-slate-700/60">
        {/* Subtle Decorative Backdrop Elements */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Greeting & Date */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full w-fit backdrop-blur-md">
              {greeting.icon}
              <span>{greeting.text}, {currentUser ? currentUser.name : 'Juragan Warung'}!</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Ringkasan Kas Hari Ini
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{todayFormatted}</span>
            </p>
          </div>

          {/* Health Score Quick Card */}
          <div
            onClick={() => onNavigateTab('health')}
            className="flex items-center gap-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 p-3.5 sm:p-4 rounded-2xl cursor-pointer transition active:scale-98 backdrop-blur-md shadow-lg group"
          >
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xl shadow-md group-hover:scale-105 transition">
              {healthMetrics.score}
              <Activity className="w-3.5 h-3.5 absolute -top-1 -right-1 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Skor Finansial</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreBadge.bg}`}>
                  {scoreBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                {healthMetrics.statusLabel}
              </p>
              <span className="text-[11px] text-emerald-400 font-semibold inline-flex items-center gap-0.5 mt-1 group-hover:underline">
                Lihat Diagnosa &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* 3 Metric Mini Cards Inside Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-700/60">
          {/* Total Saldo */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Total Saldo Aktif</span>
              <span className="text-lg font-black text-white">{formatRupiah(totalBalance)}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          {/* Omset Hari Ini */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Pemasukan Hari Ini</span>
              <span className="text-lg font-black text-emerald-400">+{formatCompactRupiah(todayCashIn)}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Pengeluaran Hari Ini */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Pengeluaran Hari Ini</span>
              <span className="text-lg font-black text-rose-400">-{formatCompactRupiah(todayCashOut)}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Launcher Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* Catat Pemasukan */}
        <button
          onClick={() => onOpenQuickAdd('cash_in')}
          id="btn-gateway-cash-in"
          className="flex flex-col items-start p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition shadow-xs group cursor-pointer text-left active:scale-98"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition shadow-xs">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400 font-semibold">+ Pemasukan</span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">Catat Omset</span>
        </button>

        {/* Catat Pengeluaran */}
        <button
          onClick={() => onOpenQuickAdd('cash_out')}
          id="btn-gateway-cash-out"
          className="flex flex-col items-start p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-rose-50/60 border border-slate-200 hover:border-rose-300 transition shadow-xs group cursor-pointer text-left active:scale-98"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition shadow-xs">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400 font-semibold">- Pengeluaran</span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">Belanja / Stok</span>
        </button>

        {/* Kalkulator Finansial */}
        {onOpenCalculator && (
          <button
            onClick={onOpenCalculator}
            id="btn-gateway-calc"
            className="flex flex-col items-start p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 transition shadow-xs group cursor-pointer text-left active:scale-98"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition shadow-xs">
              <CalcIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <span className="text-[11px] sm:text-xs text-slate-400 font-semibold">Hitung Cepat</span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">Kalkulator</span>
          </button>
        )}

        {/* Jadwal Tagihan Rutin */}
        <button
          onClick={() => onNavigateTab('bills')}
          id="btn-gateway-bills"
          className="flex flex-col items-start p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 transition shadow-xs group cursor-pointer text-left active:scale-98 relative"
        >
          {unpaidBills.length > 0 && (
            <span className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
              {unpaidBills.length}
            </span>
          )}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition shadow-xs">
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400 font-semibold">Jadwal Rutin</span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">Cek Tagihan</span>
        </button>

        {/* Kasbon Pelanggan */}
        <button
          onClick={() => onNavigateTab('kasbon')}
          id="btn-gateway-kasbon"
          className="flex flex-col items-start p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 transition shadow-xs group cursor-pointer text-left active:scale-98 relative col-span-2 xs:col-span-1"
        >
          {unpaidReceivables.length > 0 && (
            <span className="absolute top-3 right-3 bg-teal-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
              {unpaidReceivables.length}
            </span>
          )}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition shadow-xs">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400 font-semibold">Hutang Piutang</span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">Buku Kasbon</span>
        </button>
      </div>

      {/* Quick Notification & Financial Reminder Bar */}
      {(unpaidBills.length > 0 || unpaidReceivables.length > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-amber-900 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/60 text-amber-800 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-700 fill-amber-700" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-amber-900">Perhatian Keuangan Warung</p>
              <p className="text-amber-800/90 font-medium">
                {unpaidBills.length > 0 && `${unpaidBills.length} jadwal tagihan belum lunas`}
                {unpaidBills.length > 0 && unpaidReceivables.length > 0 && ' • '}
                {unpaidReceivables.length > 0 && `Kasbon tertahan ${formatCompactRupiah(totalReceivablesAmount)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unpaidBills.length > 0 && (
              <button
                onClick={() => onNavigateTab('bills')}
                className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition cursor-pointer"
              >
                Bayar Tagihan
              </button>
            )}
            {unpaidReceivables.length > 0 && (
              <button
                onClick={() => onNavigateTab('kasbon')}
                className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Tagih Kasbon
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

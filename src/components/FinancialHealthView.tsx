import React, { useState } from 'react';
import { Transaction, FinancialHealthMetrics, DebtItem, BillItem } from '../types';
import { formatRupiah, formatCompactRupiah } from '../utils/formatters';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldAlert,
  Percent,
  Calendar,
  Clock,
  Coins,
  ChevronRight,
  Calculator,
  RefreshCw,
} from 'lucide-react';

interface FinancialHealthViewProps {
  metrics: FinancialHealthMetrics;
  transactions: Transaction[];
  totalBalance: number;
  debts: DebtItem[];
  bills: BillItem[];
  onNavigateTab: (tab: any) => void;
}

export const FinancialHealthView: React.FC<FinancialHealthViewProps> = ({
  metrics,
  transactions,
  totalBalance,
  debts,
  bills,
  onNavigateTab,
}) => {
  // Simulator state
  const [simSalesBoost, setSimSalesBoost] = useState<number>(10); // +10%
  const [simExpenseCut, setSimExpenseCut] = useState<number>(10); // -10%

  // Get color styles for the current score
  const getStatusTheme = () => {
    switch (metrics.status) {
      case 'excellent':
        return {
          gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          textAccent: 'text-emerald-600',
          borderAccent: 'border-emerald-500',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
        };
      case 'good':
        return {
          gradient: 'from-teal-600 via-emerald-600 to-cyan-700',
          badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
          textAccent: 'text-teal-600',
          borderAccent: 'border-teal-500',
          icon: <CheckCircle2 className="w-8 h-8 text-teal-400" />,
        };
      case 'warning':
        return {
          gradient: 'from-amber-600 via-orange-600 to-amber-700',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          textAccent: 'text-amber-600',
          borderAccent: 'border-amber-500',
          icon: <AlertTriangle className="w-8 h-8 text-amber-300" />,
        };
      case 'critical':
      default:
        return {
          gradient: 'from-rose-600 via-red-600 to-rose-700',
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
          textAccent: 'text-rose-600',
          borderAccent: 'border-rose-500',
          icon: <ShieldAlert className="w-8 h-8 text-rose-300" />,
        };
    }
  };

  const theme = getStatusTheme();

  // 30 Days totals
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);
  const recentTxs = transactions.filter((t) => (t.date || '').slice(0, 10) >= thirtyDaysAgoStr);
  const totalIn = recentTxs.filter((t) => t.type === 'cash_in').reduce((s, t) => s + t.amount, 0);
  const totalOut = recentTxs.filter((t) => t.type === 'cash_out').reduce((s, t) => s + t.amount, 0);

  // Simulated Outcome
  const simulatedSales = totalIn * (1 + simSalesBoost / 100);
  const simulatedExpenses = totalOut * (1 - simExpenseCut / 100);
  const simulatedProfit = simulatedSales - simulatedExpenses;
  const currentProfit = totalIn - totalOut;
  const potentialProfitGain = simulatedProfit - currentProfit;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Skor Kesehatan Finansial</h2>
            <p className="text-xs text-slate-500 font-medium">
              Analisis cerdas stabilitas kas, margin laba, dan ketahanan modal warung
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('dashboard')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer self-start sm:self-auto"
        >
          &larr; Kembali ke Catatan
        </button>
      </div>

      {/* Main Score Hero Card */}
      <div className={`rounded-3xl bg-gradient-to-br ${theme.gradient} text-white p-6 sm:p-8 shadow-xl relative overflow-hidden`}>
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Score Badge Circle */}
          <div className="flex flex-col items-center text-center">
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-white/15 backdrop-blur-md border-4 border-white/30 shadow-2xl">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">{metrics.score}</span>
                <span className="block text-[11px] uppercase tracking-widest text-white/80 font-bold">/ 100</span>
              </div>
            </div>
            <span className="mt-3 px-3 py-1 bg-white/20 backdrop-blur-md text-white font-extrabold text-xs rounded-full border border-white/30">
              {metrics.statusLabel}
            </span>
          </div>

          {/* Diagnostics Description */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="text-xl sm:text-2xl font-black">
                {metrics.score >= 70 ? 'Kondisi Keuangan Sangat Prima!' : 'Keuangan Perlu Penyesuaian & Penghematan'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl font-medium">
              Skor dihitung otomatis berdasarkan perputaran omset 30 hari terakhir, margin laba bersih ({metrics.profitMargin}%), rasio belanja operasional ({metrics.expenseRatio}%), dan estimasi ketahanan saldo kas Anda ({metrics.cashRunwayDays} hari).
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-white/70 block uppercase font-bold">Margin Laba</span>
                <span className="text-sm font-black text-white">{metrics.profitMargin}%</span>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-white/70 block uppercase font-bold">Beban Biaya</span>
                <span className="text-sm font-black text-white">{metrics.expenseRatio}%</span>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-white/70 block uppercase font-bold">Ketahanan Kas</span>
                <span className="text-sm font-black text-white">{metrics.cashRunwayDays} Hari</span>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-white/70 block uppercase font-bold">Risiko Kasbon</span>
                <span className="text-sm font-black text-white">{metrics.debtRiskRatio}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Profit Margin */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Margin Laba Bersih</h4>
                <p className="text-[11px] text-slate-500">Persentase sisa omset setelah dikurangi pengeluaran</p>
              </div>
            </div>
            <span className={`text-base font-black ${metrics.profitMargin >= 15 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {metrics.profitMargin}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${metrics.profitMargin >= 20 ? 'bg-emerald-500' : metrics.profitMargin >= 10 ? 'bg-teal-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, Math.max(5, metrics.profitMargin))}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {metrics.profitMargin >= 20
              ? '✅ Luar biasa! Margin laba bersih Anda tebal dan sangat sehat untuk pengembangan usaha.'
              : metrics.profitMargin >= 10
              ? '👍 Cukup baik. Masih bisa ditingkatkan dengan memperbanyak stok barang terlaris.'
              : '⚠️ Margin tipis. Waspadai kebocoran kas atau harga jual yang terlalu mepet modal.'}
          </p>
        </div>

        {/* Card 2: Expense Control */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Efisiensi Beban Pengeluaran</h4>
                <p className="text-[11px] text-slate-500">Rasio total biaya belanja terhadap pemasukan</p>
              </div>
            </div>
            <span className={`text-base font-black ${metrics.expenseRatio <= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {metrics.expenseRatio}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${metrics.expenseRatio <= 75 ? 'bg-emerald-500' : metrics.expenseRatio <= 90 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, Math.max(5, metrics.expenseRatio))}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {metrics.expenseRatio <= 75
              ? '✅ Pengeluaran terkontrol ketat di bawah 75% pemasukan warung.'
              : '⚠️ Pengeluaran cukup besar. Sebaiknya periksa pos belanja pribadi dan biaya operasional.'}
          </p>
        </div>

        {/* Card 3: Cash Runway */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Ketahanan Saldo Kas (Runway)</h4>
                <p className="text-[11px] text-slate-500">Estimasi hari warung bertahan tanpa omset baru</p>
              </div>
            </div>
            <span className="text-base font-black text-indigo-700">
              {metrics.cashRunwayDays} Hari
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${metrics.cashRunwayDays >= 20 ? 'bg-indigo-600' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, (metrics.cashRunwayDays / 30) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Saldo aktif saat ini ({formatCompactRupiah(totalBalance)}) cukup menopang biaya operasional sekitar {metrics.cashRunwayDays} hari.
          </p>
        </div>

        {/* Card 4: Kasbon & Piutang Risk */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Risiko Kasbon Pelanggan</h4>
                <p className="text-[11px] text-slate-500">Rasio piutang kasbon dibanding saldo aktif</p>
              </div>
            </div>
            <span className={`text-base font-black ${metrics.debtRiskRatio <= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {metrics.debtRiskRatio}%
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${metrics.debtRiskRatio <= 15 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, Math.max(5, metrics.debtRiskRatio))}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {metrics.debtRiskRatio <= 15
              ? '✅ Kasbon pelanggan sangat minim dan tidak mengganggu perputaran modal kulakan.'
              : '⚠️ Kasbon tertahan cukup banyak. Gunakan tombol Tagih WhatsApp di menu Kasbon.'}
          </p>
        </div>
      </div>

      {/* Recommendations & Action Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kelebihan Finansial */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            <h4 className="text-sm font-bold text-slate-900">Kelebihan Finansial Saat Ini</h4>
          </div>
          <ul className="space-y-2">
            {metrics.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rekomendasi Aksi Nyata */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-amber-700">
            <Zap className="w-5 h-5 text-amber-600 fill-amber-600" />
            <h4 className="text-sm font-bold text-slate-900">Rekomendasi Tindakan Pintar</h4>
          </div>
          <ul className="space-y-2">
            {metrics.recommendations.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Financial Growth Simulator */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg border border-slate-700 space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Simulasi Potensi Laba Warung</h4>
            <p className="text-xs text-slate-300">Uji dampak kenaikan omset dan penghematan biaya terhadap laba bersih</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Slider 1: Sales Boost */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Target Kenaikan Omset</span>
              <span className="text-emerald-400 font-bold">+{simSalesBoost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={simSalesBoost}
              onChange={(e) => setSimSalesBoost(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Slider 2: Expense Cut */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Penghematan Pengeluaran</span>
              <span className="text-teal-400 font-bold">-{simExpenseCut}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={simExpenseCut}
              onChange={(e) => setSimExpenseCut(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Simulator Results */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-950/60 border border-emerald-500/30 p-4 rounded-2xl text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Estimasi Tambahan Keuntungan Bersih:</span>
            <span className="text-lg font-black text-emerald-400">
              +{formatRupiah(Math.max(0, potentialProfitGain))} / bulan
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('categories')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs active:scale-95"
          >
            Atur Plafon Anggaran &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

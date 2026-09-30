import React, { useState } from 'react';
import { Transaction, BillItem, DebtItem, AutoCloseConfig, ClosedMonthSnapshot, MonthEndForecast } from '../types';
import { formatRupiah, formatCompactRupiah } from '../utils/formatters';
import { getMonthEndInfo, calculateMonthEndForecast } from '../utils/storage';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Receipt,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Calculator,
  ChevronRight,
  Sliders,
  DollarSign,
  PieChart,
  Target,
  Award,
} from 'lucide-react';

interface TipsAndForecastViewProps {
  transactions: Transaction[];
  totalBalance: number;
  bills: BillItem[];
  debts: DebtItem[];
  autoCloseConfig: AutoCloseConfig;
  onOpenAutoCloseSettings: () => void;
  onNavigateTab: (tab: any) => void;
}

export const TipsAndForecastView: React.FC<TipsAndForecastViewProps> = ({
  transactions,
  totalBalance,
  bills,
  debts,
  autoCloseConfig,
  onOpenAutoCloseSettings,
  onNavigateTab,
}) => {
  const monthInfo = getMonthEndInfo();
  const forecast: MonthEndForecast = calculateMonthEndForecast(
    transactions,
    totalBalance,
    bills,
    debts
  );

  // Emergency Fund Simulator State
  const [monthlyExpenseInput, setMonthlyExpenseInput] = useState<number>(
    forecast.dailyAvgExpense > 0 ? forecast.dailyAvgExpense * 30 : 3000000
  );

  // Micro Expense Simulator
  const [dailyLeakInput, setDailyLeakInput] = useState<number>(25000);

  // Helper Badge Color
  const getForecastBadge = () => {
    if (forecast.status === 'deficit_risk') {
      return {
        bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        cardBorder: 'border-rose-300 bg-rose-50/40',
        badgeTitle: '⚠️ Risiko Defisit',
        icon: AlertTriangle,
      };
    }
    if (forecast.status === 'moderate') {
      return {
        bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        cardBorder: 'border-amber-300 bg-amber-50/40',
        badgeTitle: '⚡ Perlu Waspada',
        icon: TrendingDown,
      };
    }
    return {
      bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      cardBorder: 'border-emerald-300 bg-emerald-50/40',
      badgeTitle: '✅ Surplus Aman',
      icon: TrendingUp,
    };
  };

  const badgeStyle = getForecastBadge();
  const BadgeIcon = badgeStyle.icon;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-7 animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-900/50">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Asisten Cerdas & Proyeksi Finansial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Proyeksi Tutup Buku & Strategi Finansial
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
            Prediksi sisa kas Anda pada tanggal akhir bulan, kalkulator batas aman belanja harian, serta panduan praktis memperkuat arus kas dan laba bersih usaha Anda.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAutoCloseSettings}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md flex items-center space-x-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>
                {autoCloseConfig.enabled
                  ? 'Otomatis Tutup Buku: Aktif'
                  : 'Aktifkan Otomatis Tutup Buku'}
              </span>
            </button>
            <div className="flex items-center space-x-1.5 text-xs text-indigo-200/80 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>
                Tutup Buku Otomatis: <strong>{monthInfo.formattedNextMonthStart}</strong> ({monthInfo.isLastDay ? 'Besok saat masuk bulan baru' : `Sisa ${monthInfo.daysRemaining} hari di bulan aktif`})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: PROYEKSI SALDO AKHIR BULAN */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Proyeksi Saldo Akhir Bulan
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dihitung secara real-time berdasarkan rata-rata laju pengeluaran harian, sisa hari, dan tagihan jatuh tempo.
            </p>
          </div>

          <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-extrabold ${badgeStyle.bg}`}>
            <BadgeIcon className="w-4 h-4" />
            <span>{badgeStyle.badgeTitle}</span>
          </div>
        </div>

        {/* 4 Cards Proyeksi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Rata-rata Belanja Harian */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Laju Belanja Harian
            </span>
            <div className="my-2">
              <span className="text-xl font-black text-slate-900">
                {formatRupiah(forecast.dailyAvgExpense)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Rata-rata per hari bulan ini
              </span>
            </div>
            <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
              Hari berjalan: {forecast.currentDay} dari {forecast.daysInMonth} hari
            </div>
          </div>

          {/* Card 2: Estimasi Sisa Belanja */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Estimasi Belanja Sisa Bulan
            </span>
            <div className="my-2">
              <span className="text-xl font-black text-rose-600">
                {formatRupiah(forecast.projectedRemainingExpense)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {forecast.daysRemaining} hari menuju akhir bulan
              </span>
            </div>
            <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
              {forecast.dailyAvgExpense.toLocaleString('id-ID')} × {forecast.daysRemaining} hari
            </div>
          </div>

          {/* Card 3: Tagihan Pending */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tagihan Rutin Menunggu
            </span>
            <div className="my-2">
              <span className="text-xl font-black text-amber-600">
                {formatRupiah(forecast.pendingBillsAmount)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Kewajiban belum terbayar
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('bills')}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer"
            >
              <span>Lihat Jadwal Tagihan</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 4: Proyeksi Saldo Akhir */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
            forecast.projectedFinalBalance >= 0
              ? 'bg-emerald-50/70 border-emerald-300'
              : 'bg-rose-50/70 border-rose-300'
          }`}>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Estimasi Saldo Tutup Buku
            </span>
            <div className="my-2">
              <span className={`text-2xl font-black tracking-tight ${
                forecast.projectedFinalBalance >= 0 ? 'text-emerald-800' : 'text-rose-700'
              }`}>
                {formatRupiah(forecast.projectedFinalBalance)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                Prediksi saldo per {monthInfo.formattedLastDate}
              </span>
            </div>
            <div className="text-[10px] font-bold text-slate-700 bg-white/90 p-2 rounded-lg border border-slate-200">
              Batas belanja aman: <strong className="text-emerald-700">{formatRupiah(forecast.safeDailyBudget)}/hari</strong>
            </div>
          </div>
        </div>

        {/* Kotak Rekomendasi Pintar */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-start space-x-3.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Diagnostik & Tindakan Rekomendasi
            </h4>
            <p className="text-xs text-indigo-900 leading-relaxed font-medium">
              {forecast.advice}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: TIPS FINANSIAL PINTAR MEMPERKAYA APLIKASI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Tips Tambahan Memperkaya Pengelolaan Kas</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strategi praktis yang dapat langsung Anda terapkan dengan fitur-fitur di aplikasi ini.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* TIP 1: Pembagian 6 Pos Multi-Kas */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Tips Multi-Kas
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    Aturan 6 Pos Kas Warung Teruji
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jangan satukan uang belanja dagangan dengan kebutuhan dapur. Gunakan fitur <strong>Multi-Kas (6 Pos)</strong>:
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
                <li><strong>Pos 1:</strong> Target Bayar Hutang Supplier (Bisa atur durasi pelunasan).</li>
                <li><strong>Pos 2:</strong> Belanja Stok Kulakan (50%).</li>
                <li><strong>Pos 3:</strong> Operasional Listrik & WiFi Kasir (10%).</li>
                <li><strong>Pos 4:</strong> Cadangan Kas Darurat (10%).</li>
                <li><strong>Pos 5:</strong> Pengembangan Usaha (5%).</li>
                <li><strong>Pos 6:</strong> Laba Bersih Prive Juragan (5-10%).</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigateTab('accounts')}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer border border-blue-200"
            >
              <span>Buka Menu Multi-Kas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TIP 2: Audit "Bocor Halus" (Micro-Expenses) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Audit Pengeluaran
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    Cegah & Audit "Bocor Halus"
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pengeluaran kecil di bawah Rp 25.000 yang sering tidak dicatat (rokok kasir, parkir kuli, admin transfer, kantong kresek) adalah penyebab utama saldo minus di akhir bulan!
              </p>
              {/* Mini Simulator Bocor Halus */}
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-rose-900">
                  <span>Kebocoran per hari:</span>
                  <span className="font-mono font-bold">{formatRupiah(dailyLeakInput)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={dailyLeakInput}
                  onChange={(e) => setDailyLeakInput(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-rose-100">
                  <span>Kebocoran per bulan:</span>
                  <strong className="text-rose-700 font-extrabold">
                    {formatRupiah(dailyLeakInput * 30)}
                  </strong>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer border border-rose-200"
            >
              <span>Catat Pengeluaran Kecil Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TIP 3: Disiplin Kasbon Pelanggan */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Manajemen Piutang
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    Aturan Emas Kasbon Pelanggan
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Piutang yang menumpuk mematikan modal putar. Terapkan 3 SOP anti bon macet:
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
                <li><strong>Plafon Kasbon:</strong> Tetapkan batas maksimal (misal max Rp 100.000 per orang).</li>
                <li><strong>Batas Waktu Ketat:</strong> Kasbon maksimal 3 - 5 hari kerja.</li>
                <li><strong>Audit Akhir Bulan:</strong> Selalu tagih via WhatsApp sebelum tanggal tutup buku agar saldo kas akhir bulan masuk ke laporan.</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigateTab('kasbon')}
              className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer border border-amber-200"
            >
              <span>Buka Buku Kasbon</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TIP 4: Kalkulator Dana Darurat Usaha */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Kalkulator Bisnis
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    Target Cadangan Dana Darurat
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hitung berapa modal aman warung jika terjadi kendala sepi pembeli selama 3 hingga 6 bulan ke depan:
              </p>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs space-y-2">
                <label className="text-[10px] font-bold text-slate-600 block">
                  Pengeluaran Operasional Bulanan:
                </label>
                <div className="flex items-center space-x-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
                  <span className="text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={monthlyExpenseInput}
                    onChange={(e) => setMonthlyExpenseInput(Math.max(0, Number(e.target.value)))}
                    className="w-full text-xs font-bold outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                  <div className="p-2 bg-white rounded-lg border border-emerald-200 text-emerald-900">
                    <span className="block text-slate-400">Target 3 Bulan:</span>
                    <strong className="text-xs font-black">{formatCompactRupiah(monthlyExpenseInput * 3)}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-200 text-emerald-900">
                    <span className="block text-slate-400">Target 6 Bulan:</span>
                    <strong className="text-xs font-black">{formatCompactRupiah(monthlyExpenseInput * 6)}</strong>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('health')}
              className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer border border-emerald-200"
            >
              <span>Cek Skor Kesehatan Finansial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TIP 5: Manfaat Tutup Buku Otomatis Setiap Tanggal Akhir Bulan */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Otomatisasi
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    Kenapa Tutup Buku Tiap Akhir Bulan?
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tutup buku di tanggal akhir bulan adalah standar akuntansi keuangan modern:
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
                <li><strong>Kunci Angka Pasti:</strong> Mencegah perubahan data transaksi yang sudah lewat.</li>
                <li><strong>Hitung Laba Akurat:</strong> Memastikan laba bersih tiap bulan terhitung tanpa bercampur dengan bulan baru.</li>
                <li><strong>Laporan PDF Instan:</strong> Seluruh arsip tersimpan rapi dan dapat diunduh kapan pun sebagai bukti keuangan.</li>
              </ul>
            </div>
            <button
              onClick={onOpenAutoCloseSettings}
              className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer border border-purple-200"
            >
              <span>Atur Tutup Buku Otomatis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TIP 6: Sinkronisasi Google Sheets & Cloud Otomatis */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    Keamanan Cloud
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    Data Aman & Bebas Khawatir HP Rusak
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pastikan Anda telah mengaktifkan <strong>Login Akun & Google Sheets Auto-Sync</strong> agar setiap pemasukan, pengeluaran, dan buku kasbon Anda otomatis ter-backup ke cloud secara gratis dan real-time.
              </p>
              <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-[11px] text-teal-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Mendukung sinkronisasi multi-perangkat kasir dan HP pemilik warung.</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('sync')}
              className="w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer border border-teal-200"
            >
              <span>Buka Menu Cloud & Sync</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

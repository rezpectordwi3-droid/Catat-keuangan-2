import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Scale, Edit2, Calendar, Check, X, Lock, RotateCcw } from 'lucide-react';
import { formatRupiah, formatCompactRupiah } from '../utils/formatters';

interface BalanceSummaryCardsProps {
  openBalance: number;
  cashIn: number;
  cashOut: number;
  totalBalance: number;
  timeFilter: 'today' | 'week' | 'month' | 'all';
  setTimeFilter: (filter: 'today' | 'week' | 'month' | 'all') => void;
  onUpdateOpenBalance: (newBalance: number) => void;
  selectedMonthFilter?: string; // 'current' | 'all' | 'YYYY-MM'
  onSelectMonthFilter?: (month: string) => void;
  closedMonths?: string[];
  availableMonths?: string[];
}

export const BalanceSummaryCards: React.FC<BalanceSummaryCardsProps> = ({
  openBalance,
  cashIn,
  cashOut,
  totalBalance,
  timeFilter,
  setTimeFilter,
  onUpdateOpenBalance,
  selectedMonthFilter = 'current',
  onSelectMonthFilter,
  closedMonths = [],
  availableMonths = [],
}) => {
  const [isEditingOpenBalance, setIsEditingOpenBalance] = useState(false);
  const [tempOpenBalance, setTempOpenBalance] = useState(String(openBalance));

  const isViewingSpecificMonth = Boolean(
    selectedMonthFilter && selectedMonthFilter !== 'current' && selectedMonthFilter !== 'all'
  );
  const isClosed = isViewingSpecificMonth && closedMonths.includes(selectedMonthFilter);

  const formatMonthLabel = (mStr: string) => {
    if (mStr === 'current') return 'Bulan Ini (Aktif)';
    if (mStr === 'all') return 'Semua Riwayat';
    const dateObj = new Date(`${mStr}-01T00:00:00`);
    return isNaN(dateObj.getTime())
      ? mStr
      : new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(dateObj);
  };

  const handleSaveOpenBalance = () => {
    const num = Number(tempOpenBalance.replace(/[^0-9]/g, ''));
    if (!isNaN(num)) {
      onUpdateOpenBalance(num);
    }
    setIsEditingOpenBalance(false);
  };

  return (
    <div className="space-y-4">
      {/* Specific / Closed Month Banner */}
      {isViewingSpecificMonth && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-3xl border border-indigo-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                  {isClosed ? '🔒 Laporan Tutup Buku' : '📅 Laporan Periode Bulan'}
                </span>
                <span className="text-[10px] text-slate-300 font-mono">
                  {selectedMonthFilter}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                Laporan Keuangan: {formatMonthLabel(selectedMonthFilter)}
              </h3>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Menampilkan seluruh laporan bulanan dari <strong>Saldo Awal Modal</strong> hingga <strong>Total Saldo Akhir</strong> di bulan tersebut.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onSelectMonthFilter) onSelectMonthFilter('current');
              setTimeFilter('month');
            }}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-md shrink-0 self-start sm:self-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Kembali ke Bulan Aktif</span>
          </button>
        </div>
      )}

      {/* Time & Month Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-xs w-full">
        <div className="flex items-center space-x-2 text-slate-700 text-xs sm:text-sm font-semibold">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Periode Tampilan:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Tabs */}
          <div className="grid grid-cols-4 sm:flex sm:items-center bg-slate-100 p-1 rounded-xl gap-1 w-full sm:w-auto">
            <button
              onClick={() => {
                if (onSelectMonthFilter) onSelectMonthFilter('current');
                setTimeFilter('today');
              }}
              className={`py-1.5 sm:px-3 sm:py-1 rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                !isViewingSpecificMonth && timeFilter === 'today'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => {
                if (onSelectMonthFilter) onSelectMonthFilter('current');
                setTimeFilter('week');
              }}
              className={`py-1.5 sm:px-3 sm:py-1 rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                !isViewingSpecificMonth && timeFilter === 'week'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Minggu
            </button>
            <button
              onClick={() => {
                if (onSelectMonthFilter) onSelectMonthFilter('current');
                setTimeFilter('month');
              }}
              className={`py-1.5 sm:px-3 sm:py-1 rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                !isViewingSpecificMonth && timeFilter === 'month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulan
            </button>
            <button
              onClick={() => {
                if (onSelectMonthFilter) onSelectMonthFilter('all');
                setTimeFilter('all');
              }}
              className={`py-1.5 sm:px-3 sm:py-1 rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                !isViewingSpecificMonth && timeFilter === 'all' && selectedMonthFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
          </div>

          {/* Month Selector Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5 shrink-0" />
            <select
              value={selectedMonthFilter}
              onChange={(e) => {
                if (onSelectMonthFilter) onSelectMonthFilter(e.target.value);
              }}
              className="text-xs font-bold text-slate-800 bg-transparent border-none outline-none cursor-pointer pr-1 w-full sm:w-auto"
            >
              <option value="current">Bulan Ini (Aktif)</option>
              <option value="all">Semua Riwayat (Tanpa Filter)</option>
              {availableMonths.map((m) => {
                const monthClosed = closedMonths.includes(m);
                return (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)} {monthClosed ? '🔒 [Tutup Buku]' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Main 4 Cards Grid: Open Balance, Cash In, Cash Out, Total Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* 1. Open Balance Card */}
        <div className={`p-4 rounded-2xl border shadow-xs transition relative ${
          isViewingSpecificMonth ? 'bg-indigo-50/40 border-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Saldo Awal (Open Balance)</span>
              {isClosed && (
                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-sm">
                  🔒 Tutup Buku
                </span>
              )}
            </span>
            <button
              onClick={() => {
                setTempOpenBalance(String(openBalance));
                setIsEditingOpenBalance(!isEditingOpenBalance);
              }}
              title={isClosed ? 'Koreksi Saldo Awal Modal Bulan Ini' : 'Ubah Saldo Awal'}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {isEditingOpenBalance ? (
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="text-xs font-bold text-slate-500">Rp</span>
              <input
                type="number"
                value={tempOpenBalance}
                onChange={(e) => setTempOpenBalance(e.target.value)}
                className="w-full text-sm font-bold border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveOpenBalance}
                className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditingOpenBalance(false)}
                className="p-1 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                {formatRupiah(openBalance)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isViewingSpecificMonth
                  ? `Saldo awal modal ${formatMonthLabel(selectedMonthFilter)}`
                  : 'Saldo awal akun/periode'}
              </p>
            </div>
          )}
        </div>

        {/* 2. Cash In (Pemasukan) Card */}
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              2. Cash In (Pemasukan)
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-700 tracking-tight">
            + {formatRupiah(cashIn)}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1">
            {isViewingSpecificMonth
              ? `Total pemasukan ${formatMonthLabel(selectedMonthFilter)}`
              : 'Total pemasukan tercatat'}
          </p>
        </div>

        {/* 3. Cash Out (Pengeluaran) Card */}
        <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
              3. Cash Out (Pengeluaran)
            </span>
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-rose-700 tracking-tight">
            - {formatRupiah(cashOut)}
          </div>
          <p className="text-[11px] text-rose-600/80 mt-1">
            {isViewingSpecificMonth
              ? `Total pengeluaran ${formatMonthLabel(selectedMonthFilter)}`
              : 'Total pengeluaran tercatat'}
          </p>
        </div>

        {/* 4. Total Balance (Total Saldo Akhir) Card */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>4. Total Saldo (Total Balance)</span>
              {isClosed && (
                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold px-1.5 py-0.5 rounded-sm">
                  Saldo Akhir
                </span>
              )}
            </span>
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            {formatRupiah(totalBalance)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Saldo Awal + Masuk - Keluar</span>
            <span className="text-emerald-400 font-semibold">{formatCompactRupiah(totalBalance)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Scale, Edit2, Calendar, Check, X } from 'lucide-react';
import { formatRupiah, formatCompactRupiah } from '../utils/formatters';

interface BalanceSummaryCardsProps {
  openBalance: number;
  cashIn: number;
  cashOut: number;
  totalBalance: number;
  timeFilter: 'today' | 'week' | 'month' | 'all';
  setTimeFilter: (filter: 'today' | 'week' | 'month' | 'all') => void;
  onUpdateOpenBalance: (newBalance: number) => void;
}

export const BalanceSummaryCards: React.FC<BalanceSummaryCardsProps> = ({
  openBalance,
  cashIn,
  cashOut,
  totalBalance,
  timeFilter,
  setTimeFilter,
  onUpdateOpenBalance,
}) => {
  const [isEditingOpenBalance, setIsEditingOpenBalance] = useState(false);
  const [tempOpenBalance, setTempOpenBalance] = useState(String(openBalance));

  const handleSaveOpenBalance = () => {
    const num = Number(tempOpenBalance.replace(/[^0-9]/g, ''));
    if (!isNaN(num)) {
      onUpdateOpenBalance(num);
    }
    setIsEditingOpenBalance(false);
  };

  return (
    <div className="space-y-4">
      {/* Time Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2 text-slate-700 text-xs sm:text-sm font-semibold">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Periode Tampilan:</span>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl space-x-1">
          <button
            onClick={() => setTimeFilter('today')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              timeFilter === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              timeFilter === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Minggu Ini
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              timeFilter === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              timeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Main 4 Cards Grid: Open Balance, Cash In, Cash Out, Total Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* 1. Open Balance Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              1. Saldo Awal (Open Balance)
            </span>
            <button
              onClick={() => {
                setTempOpenBalance(String(openBalance));
                setIsEditingOpenBalance(!isEditingOpenBalance);
              }}
              title="Ubah Saldo Awal"
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
                Saldo awal akun/periode
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
            Total pemasukan tercatat
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
            Total pengeluaran tercatat
          </p>
        </div>

        {/* 4. Total Balance (Total Saldo Akhir) Card */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              4. Total Saldo (Total Balance)
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

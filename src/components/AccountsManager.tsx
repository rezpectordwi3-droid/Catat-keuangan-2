import React, { useState } from 'react';
import { AccountInfo, Transaction } from '../types';
import { formatRupiah, formatCompactRupiah } from '../utils/formatters';
import { sanitizeAmount } from '../utils/storage';
import { Wallet, Building2, Smartphone, CreditCard, ArrowRightLeft, Edit2, Plus, CheckCircle2 } from 'lucide-react';

interface AccountsManagerProps {
  accounts: AccountInfo[];
  transactions: Transaction[];
  onSaveAccounts: (updatedAccounts: AccountInfo[]) => void;
}

export const AccountsManager: React.FC<AccountsManagerProps> = ({
  accounts,
  transactions,
  onSaveAccounts,
}) => {
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editBalanceInput, setEditBalanceInput] = useState<string>('');

  // Calculate real-time balance for each account based on transactions
  const getAccountStats = (accId: string) => {
    const accountTxs = transactions.filter((t) => t.account === accId);
    const totalIn = accountTxs
      .filter((t) => t.type === 'cash_in')
      .reduce((sum, t) => sum + sanitizeAmount(t.amount), 0);
    const totalOut = accountTxs
      .filter((t) => t.type === 'cash_out')
      .reduce((sum, t) => sum + sanitizeAmount(t.amount), 0);
    
    const baseAccount = accounts.find((a) => a.id === accId);
    const baseBalance = baseAccount ? sanitizeAmount(baseAccount.balance) : 0;
    const rawBalance = baseBalance + totalIn - totalOut;
    const currentBalance = Math.max(0, rawBalance);

    return {
      totalIn,
      totalOut,
      currentBalance,
      txCount: accountTxs.length,
    };
  };

  const handleStartEdit = (acc: AccountInfo) => {
    setEditingAccountId(acc.id);
    setEditBalanceInput(String(acc.balance));
  };

  const handleSaveEdit = (accId: string) => {
    const newBal = Number(editBalanceInput.replace(/\D/g, ''));
    const updated = accounts.map((a) =>
      a.id === accId ? { ...a, balance: newBal } : a
    );
    onSaveAccounts(updated);
    setEditingAccountId(null);
  };

  const totalOverallBalance = Math.max(
    0,
    accounts.reduce((sum, acc) => {
      const stats = getAccountStats(acc.id);
      return sum + stats.currentBalance;
    }, 0)
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className="w-6 h-6 text-blue-600" />;
      case 'Smartphone':
        return <Smartphone className="w-6 h-6 text-purple-600" />;
      case 'CreditCard':
        return <CreditCard className="w-6 h-6 text-rose-600" />;
      default:
        return <Wallet className="w-6 h-6 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-full">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-200">
            Multi-Kas & Rekening
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Manajemen Kas & Saldo Pembayaran
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau dan sesuaikan saldo tunai di Laci Kasir, Bank Transfer (BCA/BRI/Mandiri), QRIS, & E-Wallet.
          </p>
        </div>

        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex flex-col justify-center shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Gabungan Semua Kas</span>
          <span className="text-xl font-black text-emerald-400">{formatRupiah(totalOverallBalance)}</span>
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {accounts.map((acc) => {
          const stats = getAccountStats(acc.id);
          const isEditing = editingAccountId === acc.id;

          return (
            <div
              key={acc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {getIcon(acc.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{acc.name}</h3>
                    <span className="text-[11px] text-slate-500">{stats.txCount} transaksi tercatat</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartEdit(acc)}
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  title="Sesuaikan Saldo Awal"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Balance display or Edit Form */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Saldo Saat Ini</span>
                  {isEditing ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="text"
                        value={editBalanceInput}
                        onChange={(e) => setEditBalanceInput(e.target.value)}
                        className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold w-32 focus:outline-hidden"
                      />
                      <button
                        onClick={() => handleSaveEdit(acc.id)}
                        className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Simpan
                      </button>
                    </div>
                  ) : (
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {formatRupiah(stats.currentBalance)}
                    </div>
                  )}
                </div>

                <div className="text-right space-y-1 text-[11px]">
                  <div className="text-emerald-700 font-semibold">
                    + In: {formatCompactRupiah(stats.totalIn)}
                  </div>
                  <div className="text-rose-700 font-semibold">
                    - Out: {formatCompactRupiah(stats.totalOut)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ⚡ FITUR BARU: ALLOKASI OTOMATIS MULTI-KAS (6 POS) */}
      <MultiKasAutoAllocator totalOverallBalance={totalOverallBalance} />
    </div>
  );
};

// Sub-component for 6-Pos Automatic Multi-Kas Allocation
const MultiKasAutoAllocator: React.FC<{ totalOverallBalance: number }> = ({ totalOverallBalance }) => {
  const safeBalance = Math.max(0, sanitizeAmount(totalOverallBalance));
  const [totalToDivide, setTotalToDivide] = useState<number>(safeBalance || 10000000);

  // Pos 1: Target Total Hutang 12 Bulan (Automatic monthly calculation = total / 12)
  const [totalDebtTarget, setTotalDebtTarget] = useState<number>(12000000);

  // Pos 2 & 3: Nominal Tetap (Direct Inputs in Rp)
  const [salaryNominal, setSalaryNominal] = useState<number>(2500000);     // Pos 2: Gaji & Operasional
  const [utilitiesNominal, setUtilitiesNominal] = useState<number>(1000000);  // Pos 3: Sewa / Listrik / PDAM

  // Pos 4, 5, 6: Persentase (%) Pembagian Sisa Kas
  const [percentages, setPercentages] = useState({
    stock: 60,        // Pos 4: Modal Stok Kulakan (60%)
    development: 20,  // Pos 5: Pengembangan Usaha (20%)
    netProfit: 20,    // Pos 6: Laba Bersih / Dividen (20%)
  });

  const handlePctChange = (key: keyof typeof percentages, val: number) => {
    setPercentages((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, val)),
    }));
  };

  const safeTotalToDivide = Math.max(0, sanitizeAmount(totalToDivide));
  const monthlyDebtTarget = Math.round(totalDebtTarget / 12);
  const totalFixedExpenses = monthlyDebtTarget + salaryNominal + utilitiesNominal;
  const remainingCash = Math.max(0, safeTotalToDivide - totalFixedExpenses);

  const totalVarPercentage = percentages.stock + percentages.development + percentages.netProfit;

  // Calculated Amounts
  const stockAmount = Math.round((remainingCash * percentages.stock) / 100);
  const devAmount = Math.round((remainingCash * percentages.development) / 100);
  const profitAmount = Math.round((remainingCash * percentages.netProfit) / 100);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full mb-1">
            <span>✨ Fitur Pembagian Kas Otomatis (6 Pos)</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Pembagi Saldo Kas Warung Sehat</h3>
          <p className="text-xs text-slate-500">
            Kombinasi Nominal Tetap (Hutang, Gaji, Sewa) & Persentase Sisa Kas (Stok, Pengembangan, Laba)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTotalToDivide(safeBalance)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Gunakan Total Kas ({formatCompactRupiah(safeBalance)})
          </button>
        </div>
      </div>

      {/* Main Inputs: Total Kas & Sisa Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Total Kas yang Ingin Dibagi (Rp)
          </label>
          <input
            type="number"
            value={totalToDivide || ''}
            onChange={(e) => setTotalToDivide(Math.max(0, Number(e.target.value)))}
            placeholder="10000000"
            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">
            Total Beban Tetap (Pos 1 + Pos 2 + Pos 3)
          </label>
          <div className="px-3.5 py-2 bg-slate-200/60 border border-slate-300 rounded-xl text-sm font-bold text-slate-800">
            {formatRupiah(totalFixedExpenses)}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Sisa Kas untuk Variabel (Pos 4 + 5 + 6)
          </label>
          <div className="px-3.5 py-2 bg-emerald-100/80 border border-emerald-300 rounded-xl text-sm font-black text-emerald-950">
            {formatRupiah(remainingCash)}
          </div>
        </div>
      </div>

      {/* 6 Pos Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* POS 1: Target Bayar Hutang (12 Bulan) */}
        <div className="p-4 rounded-2xl border bg-rose-50 border-rose-200 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-rose-100 text-rose-800">
                POS 1
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                Target 12 Bulan
              </span>
            </div>

            <h4 className="font-bold text-slate-900 text-sm">Target Bayar Hutang (12 Bulan)</h4>
            <p className="text-[11px] text-slate-600">Pelunasan hutang toko dibagi rata 12 bulan</p>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Total Target Hutang (Rp):</label>
              <input
                type="number"
                value={totalDebtTarget || ''}
                onChange={(e) => setTotalDebtTarget(Math.max(0, Number(e.target.value)))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-rose-200/80 flex items-baseline justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Cicilan / Bulan:</span>
            <span className="text-base font-black text-rose-900">{formatRupiah(monthlyDebtTarget)}</span>
          </div>
        </div>

        {/* POS 2: Gaji & Operasional (Nominal Tetap) */}
        <div className="p-4 rounded-2xl border bg-blue-50 border-blue-200 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-blue-100 text-blue-800">
                POS 2
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                Nominal Tetap
              </span>
            </div>

            <h4 className="font-bold text-slate-900 text-sm">Gaji & Operasional</h4>
            <p className="text-[11px] text-slate-600">Nominal tetap gaji pemilik & karyawan harian</p>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Masukkan Nominal Gaji (Rp):</label>
              <input
                type="number"
                value={salaryNominal || ''}
                onChange={(e) => setSalaryNominal(Math.max(0, Number(e.target.value)))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200/80 flex items-baseline justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Nominal Alokasi:</span>
            <span className="text-base font-black text-blue-900">{formatRupiah(salaryNominal)}</span>
          </div>
        </div>

        {/* POS 3: Sewa Tempat / Listrik / PDAM (Nominal Tetap) */}
        <div className="p-4 rounded-2xl border bg-amber-50 border-amber-200 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-100 text-amber-800">
                POS 3
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                Nominal Tetap
              </span>
            </div>

            <h4 className="font-bold text-slate-900 text-sm">Sewa Tempat / Listrik / PDAM</h4>
            <p className="text-[11px] text-slate-600">Nominal tetap rutin sewa toko & tagihan rutin</p>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Masukkan Nominal Sewa/PDAM (Rp):</label>
              <input
                type="number"
                value={utilitiesNominal || ''}
                onChange={(e) => setUtilitiesNominal(Math.max(0, Number(e.target.value)))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200/80 flex items-baseline justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Nominal Alokasi:</span>
            <span className="text-base font-black text-amber-900">{formatRupiah(utilitiesNominal)}</span>
          </div>
        </div>

        {/* POS 4: Modal Stok Kulakan (% Sisa Kas) */}
        <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-200 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-100 text-emerald-800">
                POS 4
              </span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={percentages.stock}
                  onChange={(e) => handlePctChange('stock', Number(e.target.value))}
                  className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-bold text-slate-900"
                />
                <span className="text-xs font-bold text-slate-600">% Sisa</span>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 text-sm">Modal Stok Kulakan</h4>
            <p className="text-[11px] text-slate-600">Putaran kas belanja grosir barang & sembako</p>
          </div>

          <div className="pt-2 border-t border-emerald-200/80 flex items-baseline justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Hasil Alokasi:</span>
            <span className="text-base font-black text-emerald-900">{formatRupiah(stockAmount)}</span>
          </div>
        </div>

        {/* POS 5: Pengembangan Usaha (% Sisa Kas) */}
        <div className="p-4 rounded-2xl border bg-purple-50 border-purple-200 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-purple-100 text-purple-800">
                POS 5
              </span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={percentages.development}
                  onChange={(e) => handlePctChange('development', Number(e.target.value))}
                  className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-bold text-slate-900"
                />
                <span className="text-xs font-bold text-slate-600">% Sisa</span>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 text-sm">Pengembangan Usaha</h4>
            <p className="text-[11px] text-slate-600">Tabungan renovasi, etalase baru, & alat warung</p>
          </div>

          <div className="pt-2 border-t border-purple-200/80 flex items-baseline justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Hasil Alokasi:</span>
            <span className="text-base font-black text-purple-900">{formatRupiah(devAmount)}</span>
          </div>
        </div>

        {/* POS 6: Laba Bersih (% Sisa Kas) */}
        <div className="p-4 rounded-2xl border bg-teal-50 border-teal-200 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-teal-100 text-teal-800">
                POS 6
              </span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={percentages.netProfit}
                  onChange={(e) => handlePctChange('netProfit', Number(e.target.value))}
                  className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-bold text-slate-900"
                />
                <span className="text-xs font-bold text-slate-600">% Sisa</span>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 text-sm">Laba Bersih (Dividen)</h4>
            <p className="text-[11px] text-slate-600">Keuntungan murni bersih untuk tabungan pribadi</p>
          </div>

          <div className="pt-2 border-t border-teal-200/80 flex items-baseline justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Hasil Alokasi:</span>
            <span className="text-base font-black text-teal-900">{formatRupiah(profitAmount)}</span>
          </div>
        </div>

      </div>

      {/* Percentage Total Check for Pos 4, 5, 6 */}
      <div className="flex justify-end text-xs">
        <span className={`font-bold px-3 py-1 rounded-full ${totalVarPercentage === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          Total Persentase Sisa Kas (Pos 4+5+6): {totalVarPercentage}% {totalVarPercentage !== 100 ? '(Rekomendasi = 100%)' : '✓ Pas 100%'}
        </span>
      </div>
    </div>
  );
};

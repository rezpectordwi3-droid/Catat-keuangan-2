import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import { Search, Filter, Trash2, Edit3, ArrowUpRight, ArrowDownLeft, Utensils, Car, ShoppingCart, Receipt, Tv, HeartPulse, GraduationCap, MoreHorizontal, Briefcase, Store, Gift, TrendingUp, Calendar, Wallet, Building2, Smartphone, CreditCard, FileText, Printer } from 'lucide-react';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';
import { sanitizeTimeString, exportSingleNoteToMarkdown } from '../utils/storage';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onPrintTransaction?: (transaction: Transaction) => void;
  closedMonths?: string[];
  selectedMonthFilter?: string; // 'current' | 'all' | 'YYYY-MM'
  onSelectMonthFilter?: (monthStr: string) => void;
  onCloseCurrentMonth?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onEditTransaction,
  onDeleteTransaction,
  onPrintTransaction,
  closedMonths = [],
  selectedMonthFilter = 'current',
  onSelectMonthFilter,
  onCloseCurrentMonth,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'cash_in' | 'cash_out'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Map category ID to category object
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // Current month string (e.g. '2026-08')
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  // Available month options from transaction history
  const availableMonths = (Array.from(
    new Set(transactions.map((t) => (t.date || '').slice(0, 7)).filter(Boolean))
  ) as string[]).sort((a, b) => b.localeCompare(a));

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    // Search
    const matchesSearch =
      tx.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    // Type & Category
    const matchesType = selectedType === 'all' || tx.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || tx.categoryId === selectedCategory;

    // Month Filter
    let matchesMonth = true;
    if (selectedMonthFilter === 'current') {
      matchesMonth = tx.date.startsWith(currentMonthStr);
    } else if (selectedMonthFilter !== 'all' && selectedMonthFilter) {
      matchesMonth = tx.date.startsWith(selectedMonthFilter);
    }

    return matchesSearch && matchesType && matchesCategory && matchesMonth;
  });

  // Group transactions by date
  const groupedByDate: Record<string, Transaction[]> = {};
  filtered.forEach((tx) => {
    if (!groupedByDate[tx.date]) {
      groupedByDate[tx.date] = [];
    }
    groupedByDate[tx.date].push(tx);
  });

  // Sort dates descending (newest first)
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const getAccountBadge = (account: string) => {
    switch (account) {
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
            <Wallet className="w-3 h-3" /> Tunai
          </span>
        );
      case 'bank':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
            <Building2 className="w-3 h-3" /> Bank
          </span>
        );
      case 'ewallet':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200">
            <Smartphone className="w-3 h-3" /> E-Wallet
          </span>
        );
      case 'credit':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-300">
            <CreditCard className="w-3 h-3" /> K. Kredit
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'Car': return <Car className="w-4 h-4" />;
      case 'ShoppingCart': return <ShoppingCart className="w-4 h-4" />;
      case 'Receipt': return <Receipt className="w-4 h-4" />;
      case 'Tv': return <Tv className="w-4 h-4" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'Store': return <Store className="w-4 h-4" />;
      case 'Gift': return <Gift className="w-4 h-4" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4" />;
      default: return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-5">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Riwayat Catatan Transaksi</h2>
          <p className="text-xs text-slate-500">Daftar transaksi harian lengkap dengan rincian saldo</p>
        </div>

        {/* Tutup Buku & Month Filter Row */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Month Selector */}
          <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200 flex-1 sm:flex-initial">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5 shrink-0" />
            <select
              value={selectedMonthFilter}
              onChange={(e) => onSelectMonthFilter && onSelectMonthFilter(e.target.value)}
              className="text-xs bg-transparent border-none font-bold text-slate-800 outline-none cursor-pointer pr-1 w-full sm:w-auto truncate"
            >
              <option value="current">Bulan Ini (Aktif)</option>
              <option value="all">Semua Riwayat (Tanpa Filter)</option>
              {availableMonths.map((m) => {
                const dateObj = new Date(`${m}-01T00:00:00`);
                const monthName = isNaN(dateObj.getTime())
                  ? m
                  : new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(dateObj);
                const isClosed = closedMonths.includes(m);
                return (
                  <option key={m} value={m}>
                    {monthName} {isClosed ? '🔒 [Tutup Buku]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Tutup Buku Button */}
          {onCloseCurrentMonth && !closedMonths.includes(currentMonthStr) && (
            <button
              onClick={() => {
                if (
                  confirm(
                    `Apakah Anda yakin ingin melakukan Tutup Buku untuk bulan ini?\n\n- Catatan bulan ini akan DIKUNCI dan diarsipkan ke Riwayat.\n- Total Saldo saat ini akan otomatis dipindahkan ke dalam brankas "Multi-Kas".\n- Tampilan depan akan kosong (dimulai dari nol) untuk bulan baru agar Anda dapat memasukkan Saldo Awal sendiri.`
                  )
                ) {
                  onCloseCurrentMonth();
                  alert('🔒 Tutup buku berhasil! Saldo bulan ini telah diamankan di Multi-Kas. Layar transaksi kini bersih untuk memulai bulan baru.');
                }
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              title="Pisahkan & Arsipkan Catatan Bulan Ini"
            >
              <span>🔒 Tutup Buku</span>
            </button>
          )}
          {onCloseCurrentMonth && closedMonths.includes(currentMonthStr) && (
            <span className="px-2.5 sm:px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl flex items-center space-x-1.5 border border-slate-200">
               <span>🔒 Bulan Ini Ditutup</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter Row: Search, Type, Category */}
      <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 pt-1">
        {/* Search */}
        <div className="relative flex-1 min-w-0 sm:min-w-[160px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 outline-none cursor-pointer w-full"
          >
            <option value="all">Semua Jenis</option>
            <option value="cash_in">Pemasukan (+)</option>
            <option value="cash_out">Pengeluaran (-)</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 outline-none cursor-pointer w-full sm:max-w-[140px]"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List Grouped by Date */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">Tidak ada catatan transaksi ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => {
            const dateTxList = groupedByDate[dateStr];

            // Daily totals
            const dayCashIn = dateTxList
              .filter((t) => t.type === 'cash_in')
              .reduce((sum, t) => sum + t.amount, 0);

            const dayCashOut = dateTxList
              .filter((t) => t.type === 'cash_out')
              .reduce((sum, t) => sum + t.amount, 0);

            return (
              <div key={dateStr} className="space-y-2">
                
                {/* Date Group Header */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 bg-slate-100/80 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 border border-slate-200/60">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{formatDateIndonesian(dateStr)}</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-[11px] shrink-0">
                    {dayCashIn > 0 && (
                      <span className="text-emerald-700 font-bold whitespace-nowrap">+{formatRupiah(dayCashIn)}</span>
                    )}
                    {dayCashOut > 0 && (
                      <span className="text-rose-700 font-bold whitespace-nowrap">-{formatRupiah(dayCashOut)}</span>
                    )}
                  </div>
                </div>

                {/* Date Group Transactions */}
                <div className="divide-y divide-slate-100">
                  {dateTxList.map((tx) => {
                    const cat = categoryMap.get(tx.categoryId);
                    const isCashIn = tx.type === 'cash_in';

                    return (
                      <div
                        key={tx.id}
                        className="py-3 px-2 sm:px-3 hover:bg-slate-50/80 rounded-xl transition flex items-center justify-between gap-3 group"
                      >
                        {/* Left: Icon & Info */}
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold shadow-2xs`}
                            style={{ backgroundColor: cat?.color || (isCashIn ? '#10B981' : '#EF4444') }}
                          >
                            {getCategoryIcon(cat?.icon)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {tx.categoryName}
                              </span>
                              {getAccountBadge(tx.account)}
                            </div>
                            <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                              <span>{sanitizeTimeString(tx.time)}</span>
                              {tx.notes && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[180px] sm:max-w-md italic">{tx.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & Actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <div className="text-right">
                            <div
                              className={`text-sm sm:text-base font-extrabold tracking-tight ${
                                isCashIn ? 'text-emerald-600' : 'text-slate-900'
                              }`}
                            >
                              {isCashIn ? '+' : '-'} {formatRupiah(tx.amount)}
                            </div>
                          </div>

                          <div className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition flex items-center space-x-1 pl-2 border-l border-slate-100">
                            {onPrintTransaction && (
                              <button
                                onClick={() => onPrintTransaction(tx)}
                                title="Cetak Struk"
                                className="p-1 text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => exportSingleNoteToMarkdown(tx)}
                              title="Ekspor Catatan ke Markdown (.md)"
                              className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditTransaction(tx)}
                              title="Edit"
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini?')) {
                                  onDeleteTransaction(tx.id);
                                }
                              }}
                              title="Hapus"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

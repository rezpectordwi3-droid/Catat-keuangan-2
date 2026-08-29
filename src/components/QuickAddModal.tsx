import React, { useState, useEffect } from 'react';
import { Category, TransactionType, PaymentAccount, Transaction } from '../types';
import { X, Check, Utensils, Car, ShoppingCart, Receipt, Tv, HeartPulse, GraduationCap, MoreHorizontal, Briefcase, Store, Gift, TrendingUp, ArrowDownLeft, Wallet, Building2, Smartphone, CreditCard, Calendar, Clock, FileText, Zap } from 'lucide-react';
import { getTodayDateString, getCurrentTimeString, formatRupiah } from '../utils/formatters';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editingTransaction?: Transaction | null;
  initialType?: TransactionType;
  initialAmount?: number;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveTransaction,
  editingTransaction,
  initialType = 'cash_out',
  initialAmount = 0,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<number>(initialAmount);
  const [amountInput, setAmountInput] = useState<string>(initialAmount > 0 ? String(initialAmount) : '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [account, setAccount] = useState<PaymentAccount>('cash');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [notes, setNotes] = useState<string>('');

  // Preset categories filtered by type
  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount);
      setAmountInput(String(editingTransaction.amount));
      setSelectedCategoryId(editingTransaction.categoryId);
      setAccount(editingTransaction.account);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || getCurrentTimeString());
      setNotes(editingTransaction.notes || '');
    } else {
      resetForm();
      if (initialType) {
        setType(initialType);
      }
      if (initialAmount && initialAmount > 0) {
        setAmount(initialAmount);
        setAmountInput(String(initialAmount));
      }
    }
  }, [editingTransaction, isOpen, initialType, initialAmount]);

  // Set default category when type changes
  useEffect(() => {
    if (!editingTransaction) {
      const available = categories.filter((c) => c.type === type);
      if (available.length > 0 && (!selectedCategoryId || !available.some((c) => c.id === selectedCategoryId))) {
        setSelectedCategoryId(available[0].id);
      }
    }
  }, [type, categories]);

  const resetForm = () => {
    setType('cash_out');
    setAmount(0);
    setAmountInput('');
    const firstCat = categories.find((c) => c.type === 'cash_out');
    setSelectedCategoryId(firstCat ? firstCat.id : '');
    setAccount('cash');
    setDate(getTodayDateString());
    setTime(getCurrentTimeString());
    setNotes('');
  };

  const handleQuickAddChip = (value: number) => {
    const currentNum = Number(amountInput.replace(/[^0-9]/g, '')) || 0;
    const newNum = currentNum + value;
    setAmount(newNum);
    setAmountInput(String(newNum));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = Number(rawVal);
    setAmount(num);
    setAmountInput(rawVal);
  };

  const handleSubmit = (addAnother = false) => {
    if (!amount || amount <= 0) {
      alert('Masukkan jumlah nominal yang valid');
      return;
    }

    const selectedCat = categories.find((c) => c.id === selectedCategoryId);
    if (!selectedCat) {
      alert('Pilih kategori terlebih dahulu');
      return;
    }

    onSaveTransaction({
      date,
      time,
      type,
      amount,
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      account,
      notes: notes.trim(),
    });

    if (addAnother) {
      setAmount(0);
      setAmountInput('');
      setNotes('');
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const renderCategoryIcon = (iconName: string) => {
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
      case 'ArrowDownLeft': return <ArrowDownLeft className="w-4 h-4" />;
      default: return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              {editingTransaction ? 'Edit Transaksi' : 'Catat Transaksi Cepat'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
          
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('cash_out')}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                type === 'cash_out'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pengeluaran (Cash Out)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('cash_in')}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                type === 'cash_in'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pemasukan (Cash In)</span>
            </button>
          </div>

          {/* Amount Display & Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Jumlah Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-extrabold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountInput ? Number(amountInput).toLocaleString('id-ID') : ''}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-2xl font-black text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-0 outline-none transition"
              />
            </div>

            {/* Quick Chips (+10k, +20k, +50k, +100k, +500k) */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleQuickAddChip(10000)}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition active:scale-95 cursor-pointer"
              >
                +10rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddChip(20000)}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition active:scale-95 cursor-pointer"
              >
                +20rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddChip(50000)}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition active:scale-95 cursor-pointer"
              >
                +50rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddChip(100000)}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition active:scale-95 cursor-pointer"
              >
                +100rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddChip(500000)}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition active:scale-95 cursor-pointer"
              >
                +500rb
              </button>
              {amount > 0 && (
                <button
                  type="button"
                  onClick={() => { setAmount(0); setAmountInput(''); }}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer ml-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Category Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Pilih Kategori
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {filteredCategories.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center text-center space-y-1 transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {renderCategoryIcon(cat.icon)}
                    </div>
                    <span className="text-[11px] font-semibold line-clamp-1">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Account */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Metode / Akun Pembayaran
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'cash', label: 'Tunai', icon: <Wallet className="w-3.5 h-3.5" /> },
                { id: 'bank', label: 'Bank', icon: <Building2 className="w-3.5 h-3.5" /> },
                { id: 'ewallet', label: 'E-Wallet', icon: <Smartphone className="w-3.5 h-3.5" /> },
                { id: 'credit', label: 'Kartu Kredit', icon: <CreditCard className="w-3.5 h-3.5" /> },
              ].map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setAccount(acc.id as PaymentAccount)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                    account === acc.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {acc.icon}
                  <span>{acc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Tanggal
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Jam
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Catatan / Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Catatan / Keterangan (Opsional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="misal: Beli Nasi Goreng Warung, Bensin Pertamax..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2">
          {!editingTransaction && (
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Simpan & Tambah Lagi
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

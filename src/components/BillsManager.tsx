import React, { useState } from 'react';
import { BillItem, Transaction, PaymentAccount, Category } from '../types';
import { formatRupiah, formatCompactRupiah, getTodayDateString } from '../utils/formatters';
import {
  Receipt,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  Zap,
  Building2,
  Wallet,
  Smartphone,
  CreditCard,
  Share2,
  Check,
  RefreshCw,
  Sparkles,
  DollarSign,
} from 'lucide-react';

interface BillsManagerProps {
  bills: BillItem[];
  categories: Category[];
  onSaveBills: (bills: BillItem[]) => void;
  onAddTransaction: (tx: Transaction) => void;
}

export const BillsManager: React.FC<BillsManagerProps> = ({
  bills,
  categories,
  onSaveBills,
  onAddTransaction,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<BillItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryName, setCategoryName] = useState('Listrik & Sewa Warung');
  const [dueDateDay, setDueDateDay] = useState(20);
  const [repeatPeriod, setRepeatPeriod] = useState<'monthly' | 'weekly' | 'yearly' | 'once'>('monthly');
  const [account, setAccount] = useState<PaymentAccount>('bank');
  const [notes, setNotes] = useState('');

  // Payment Confirmation State
  const [payingBill, setPayingBill] = useState<BillItem | null>(null);
  const [payAccount, setPayAccount] = useState<PaymentAccount>('bank');

  // Quick Preset Templates
  const PRESETS = [
    { title: 'Listrik & Token PLN', category: 'Listrik & Sewa Warung', amount: 250000, day: 20, icon: '⚡' },
    { title: 'Sewa Kios / Tempat', category: 'Listrik & Sewa Warung', amount: 800000, day: 25, icon: '🏠' },
    { title: 'WiFi & Internet Kasir', category: 'Listrik & Sewa Warung', amount: 150000, day: 15, icon: '📶' },
    { title: 'Gaji Karyawan Warung', category: 'Lain-lain (Pengeluaran)', amount: 1200000, day: 1, icon: '👥' },
    { title: 'Cicilan Modal / KUR', category: 'Lain-lain (Pengeluaran)', amount: 500000, day: 10, icon: '💳' },
    { title: 'Retribusi Kebersihan & Pasar', category: 'Lain-lain (Pengeluaran)', amount: 50000, day: 5, icon: '🧹' },
  ];

  const handleOpenAddModal = (preset?: typeof PRESETS[0]) => {
    if (preset) {
      setTitle(preset.title);
      setCategoryName(preset.category);
      setAmount(String(preset.amount));
      setDueDateDay(preset.day);
    } else {
      setTitle('');
      setCategoryName(categories.find((c) => c.type === 'cash_out')?.name || 'Listrik & Sewa Warung');
      setAmount('');
      setDueDateDay(20);
    }
    setRepeatPeriod('monthly');
    setAccount('bank');
    setNotes('');
    setEditingBill(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (bill: BillItem) => {
    setEditingBill(bill);
    setTitle(bill.title);
    setAmount(String(bill.amount));
    setCategoryName(bill.categoryName);
    setDueDateDay(bill.dueDateDay || 20);
    setRepeatPeriod(bill.repeatPeriod || 'monthly');
    setAccount(bill.account || 'bank');
    setNotes(bill.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
    if (!title.trim() || cleanAmount <= 0) return;

    if (editingBill) {
      const updated = bills.map((b) =>
        b.id === editingBill.id
          ? {
              ...b,
              title: title.trim(),
              amount: cleanAmount,
              categoryName,
              dueDateDay: Number(dueDateDay),
              repeatPeriod,
              account,
              notes: notes.trim(),
            }
          : b
      );
      onSaveBills(updated);
    } else {
      const newBill: BillItem = {
        id: `bill-${Date.now()}`,
        title: title.trim(),
        amount: cleanAmount,
        categoryName,
        dueDateDay: Number(dueDateDay),
        repeatPeriod,
        account,
        status: 'unpaid',
        notes: notes.trim(),
        createdAt: Date.now(),
      };
      onSaveBills([...bills, newBill]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteBill = (id: string) => {
    if (confirm('Hapus jadwal tagihan ini?')) {
      const updated = bills.filter((b) => b.id !== id);
      onSaveBills(updated);
    }
  };

  // One-click pay bill and generate a cash_out transaction
  const handleConfirmPayBill = () => {
    if (!payingBill) return;

    const today = getTodayDateString();
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

    // 1. Mark bill as paid
    const updated = bills.map((b) =>
      b.id === payingBill.id
        ? {
            ...b,
            status: 'paid' as const,
            lastPaidDate: today,
          }
        : b
    );
    onSaveBills(updated);

    // 2. Find category ID or fallback
    const matchedCat = categories.find((c) => c.name.toLowerCase() === payingBill.categoryName.toLowerCase());
    const categoryId = matchedCat ? matchedCat.id : 'cat-tagihan';

    // 3. Create cash_out transaction
    const newTx: Transaction = {
      id: `tx-bill-${Date.now()}`,
      date: today,
      time: timeNow,
      type: 'cash_out',
      amount: payingBill.amount,
      categoryId: categoryId,
      categoryName: payingBill.categoryName,
      account: payAccount,
      notes: `Pembayaran Tagihan: ${payingBill.title}${payingBill.notes ? ` (${payingBill.notes})` : ''}`,
      createdAt: Date.now(),
    };

    onAddTransaction(newTx);
    setPayingBill(null);
  };

  // Toggle bill status manually
  const handleToggleStatus = (bill: BillItem) => {
    const nextStatus = bill.status === 'paid' ? 'unpaid' : 'paid';
    const updated = bills.map((b) =>
      b.id === bill.id
        ? {
            ...b,
            status: nextStatus,
            lastPaidDate: nextStatus === 'paid' ? getTodayDateString() : undefined,
          }
        : b
    );
    onSaveBills(updated);
  };

  // WhatsApp reminder generator
  const handleShareWhatsApp = (bill: BillItem) => {
    const text = `Halo, pengingat tagihan warung: *${bill.title}* sebesar *${formatRupiah(bill.amount)}* jatuh tempo setiap tanggal *${bill.dueDateDay}*. Mohon disiapkan pembayarannya ya. Terima kasih!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Summary Metrics
  const currentDay = new Date().getDate();
  const totalBillsAmount = bills.reduce((s, b) => s + b.amount, 0);
  const unpaidBills = bills.filter((b) => b.status === 'unpaid');
  const paidBills = bills.filter((b) => b.status === 'paid');
  const totalUnpaidAmount = unpaidBills.reduce((s, b) => s + b.amount, 0);
  const totalPaidAmount = paidBills.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Jadwal Tagihan & Pengeluaran Rutin</h2>
            <p className="text-xs text-slate-500 font-medium">
              Kelola tagihan bulanan (listrik, sewa, wifi, gaji) dan catat pembayaran dengan 1 klik
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          id="btn-add-bill"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Tambah Tagihan</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Tagihan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Rutin / Bulan</span>
            <span className="text-lg font-black text-slate-800 block mt-0.5">{formatRupiah(totalBillsAmount)}</span>
            <span className="text-xs text-slate-500">{bills.length} jadwal tagihan</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Belum Lunas */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Belum Dibayar</span>
            <span className="text-lg font-black text-amber-700 block mt-0.5">{formatRupiah(totalUnpaidAmount)}</span>
            <span className="text-xs text-amber-700/80 font-semibold">{unpaidBills.length} tagihan pending</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Sudah Lunas */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Sudah Lunas</span>
            <span className="text-lg font-black text-emerald-700 block mt-0.5">{formatRupiah(totalPaidAmount)}</span>
            <span className="text-xs text-emerald-700/80 font-semibold">{paidBills.length} tagihan lunas</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Fast Preset Templates */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Tambah Cepat dari Template Tagihan Warung:</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleOpenAddModal(p)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer shadow-2xs"
            >
              <span>{p.icon}</span>
              <span>{p.title}</span>
              <span className="text-slate-400 font-normal">({formatCompactRupiah(p.amount)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* List of Bills */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Daftar Tagihan & Status</h3>
          <span className="text-xs text-slate-500">Hari ini: Tanggal {currentDay}</span>
        </div>

        {bills.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Belum ada jadwal tagihan</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tambahkan tagihan listrik, sewa kios, internet, atau gaji karyawan agar keuangan warung selalu terencana.
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              + Tambah Tagihan Pertama
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bills.map((bill) => {
              const isPaid = bill.status === 'paid';
              const daysDiff = bill.dueDateDay - currentDay;

              // Due status calculation
              let dueBadge = { text: `Tgl ${bill.dueDateDay}`, color: 'bg-slate-100 text-slate-700 border-slate-200' };
              if (isPaid) {
                dueBadge = { text: 'Sudah Lunas', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
              } else if (daysDiff === 0) {
                dueBadge = { text: 'Jatuh Tempo Hari Ini!', color: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' };
              } else if (daysDiff > 0 && daysDiff <= 3) {
                dueBadge = { text: `H-${daysDiff} Jatuh Tempo`, color: 'bg-amber-100 text-amber-800 border-amber-300' };
              } else if (daysDiff < 0) {
                dueBadge = { text: `Lewat ${Math.abs(daysDiff)} Hari`, color: 'bg-rose-50 text-rose-700 border-rose-200' };
              }

              return (
                <div
                  key={bill.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/80 ${
                    isPaid ? 'opacity-70 bg-slate-50/50' : ''
                  }`}
                >
                  {/* Left Info */}
                  <div className="flex items-start space-x-3.5">
                    <button
                      onClick={() => handleToggleStatus(bill)}
                      title={isPaid ? 'Tandai Belum Lunas' : 'Tandai Lunas'}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition shrink-0 cursor-pointer mt-0.5 ${
                        isPaid
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-300 text-slate-400 hover:border-emerald-500 hover:text-emerald-600'
                      }`}
                    >
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-bold ${isPaid ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {bill.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dueBadge.color}`}>
                          {dueBadge.text}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                        <span>Kategori: {bill.categoryName}</span>
                        <span>•</span>
                        <span>Jatuh Tempo Tiap Tanggal {bill.dueDateDay}</span>
                        {bill.notes && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 italic">{bill.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & Amount */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block font-medium">Nominal</span>
                      <span className="text-base font-black text-slate-900">{formatRupiah(bill.amount)}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {!isPaid && (
                        <button
                          onClick={() => {
                            setPayingBill(bill);
                            setPayAccount(bill.account || 'bank');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                        >
                          Bayar & Catat
                        </button>
                      )}

                      <button
                        onClick={() => handleShareWhatsApp(bill)}
                        title="Bagikan Pengingat via WhatsApp"
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(bill)}
                        title="Edit Tagihan"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteBill(bill.id)}
                        title="Hapus Tagihan"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add / Edit Bill */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingBill ? 'Edit Jadwal Tagihan' : 'Tambah Jadwal Tagihan Rutin'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBill} className="space-y-3.5">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Tagihan / Keperluan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Listrik PLN, Sewa Kios, WiFi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-medium outline-hidden"
                />
              </div>

              {/* Amount & Due Date Day */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nominal (Rp) *</label>
                  <input
                    type="text"
                    required
                    placeholder="250.000"
                    value={amount ? parseInt(amount, 10).toLocaleString('id-ID') : ''}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-bold text-slate-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Jatuh Tempo (Tgl 1-31) *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDateDay}
                    onChange={(e) => setDueDateDay(Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-bold text-slate-900 outline-hidden"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Pengeluaran</label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm font-medium outline-hidden bg-white cursor-pointer"
                >
                  {categories
                    .filter((c) => c.type === 'cash_out')
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Default Payment Account */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Default Rekening / Kas Pembayaran</label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value as PaymentAccount)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm font-medium outline-hidden bg-white cursor-pointer"
                >
                  <option value="bank">Bank Transfer / QRIS</option>
                  <option value="cash">Laci Kasir / Tunai</option>
                  <option value="ewallet">E-Wallet (GoPay/OVO/DANA)</option>
                  <option value="credit">Kartu Kredit / Hutang</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: No. Pelanggan PLN 12345678"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm font-medium outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                >
                  {editingBill ? 'Simpan Perubahan' : 'Simpan Tagihan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Bayar & Catat Pengeluaran */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <DollarSign className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Bayar Tagihan Sekarang?</h3>
              <p className="text-xs text-slate-500">
                Status akan ditandai <span className="font-bold text-emerald-600">LUNAS</span> dan pengeluaran sebesar{' '}
                <span className="font-bold text-slate-800">{formatRupiah(payingBill.amount)}</span> akan otomatis dicatat di buku kas hari ini.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Tagihan:</span>
                <span className="font-bold text-slate-800">{payingBill.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal:</span>
                <span className="font-black text-rose-600">{formatRupiah(payingBill.amount)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Rekening / Sumber Dana:</label>
              <select
                value={payAccount}
                onChange={(e) => setPayAccount(e.target.value as PaymentAccount)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-hidden bg-white"
              >
                <option value="bank">Bank Transfer / QRIS</option>
                <option value="cash">Laci Kasir / Tunai</option>
                <option value="ewallet">E-Wallet (GoPay/OVO/DANA)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPayingBill(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmPayBill}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-95"
              >
                Konfirmasi Bayar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

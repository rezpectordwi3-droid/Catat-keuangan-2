import React, { useState } from 'react';
import { DebtItem, Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { MessageSquare, Plus, CheckCircle2, Clock, Trash2, ArrowUpRight, ArrowDownLeft, AlertCircle, Calendar, User, Search, Filter } from 'lucide-react';

interface KasbonManagerProps {
  debts: DebtItem[];
  onSaveDebts: (updatedDebts: DebtItem[]) => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const KasbonManager: React.FC<KasbonManagerProps> = ({
  debts,
  onSaveDebts,
  onAddTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'receivable' | 'payable'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'receivable' | 'payable'>('receivable');
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  // Summary Totals
  const totalReceivables = debts
    .filter((d) => d.type === 'receivable' && d.status === 'unpaid')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPayables = debts
    .filter((d) => d.type === 'payable' && d.status === 'unpaid')
    .reduce((sum, d) => sum + d.amount, 0);

  // Handle Add New Kasbon / Debt
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount.replace(/\D/g, ''));
    if (!customerName.trim() || !parsedAmount) return;

    const newDebt: DebtItem = {
      id: `debt-${Date.now()}`,
      customerName: customerName.trim(),
      phone: phone.trim() || undefined,
      type,
      amount: parsedAmount,
      dueDate,
      notes: notes.trim() || undefined,
      status: 'unpaid',
      createdAt: Date.now(),
    };

    onSaveDebts([newDebt, ...debts]);
    setIsModalOpen(false);

    // Reset Form
    setCustomerName('');
    setPhone('');
    setAmount('');
    setNotes('');
  };

  // Mark as Paid
  const handleMarkAsPaid = (debt: DebtItem) => {
    const updated = debts.map((d) =>
      d.id === debt.id
        ? { ...d, status: 'paid' as const, paidAt: Date.now() }
        : d
    );
    onSaveDebts(updated);

    // Automatically ask/add transaction record if desired
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (debt.type === 'receivable') {
      // Pelanggan bayar kasbon -> Pemasukan
      onAddTransaction({
        date: todayStr,
        time: timeStr,
        type: 'cash_in',
        amount: debt.amount,
        categoryId: 'cat-penjualan',
        categoryName: 'Pelunasan Kasbon Pelanggan',
        account: 'cash',
        notes: `Pelunasan kasbon: ${debt.customerName} (${debt.notes || ''})`,
      });
    } else {
      // Warung bayar supplier -> Pengeluaran
      onAddTransaction({
        date: todayStr,
        time: timeStr,
        type: 'cash_out',
        amount: debt.amount,
        categoryId: 'cat-stok',
        categoryName: 'Pelunasan Hutang Supplier',
        account: 'cash',
        notes: `Pelunasan hutang supplier: ${debt.customerName} (${debt.notes || ''})`,
      });
    }
  };

  // Delete
  const handleDelete = (id: string) => {
    onSaveDebts(debts.filter((d) => d.id !== id));
  };

  // Send WhatsApp Reminder
  const handleSendWhatsApp = (debt: DebtItem) => {
    if (!debt.phone) return;
    const cleanPhone = debt.phone.replace(/\D/g, '').replace(/^0/, '62');
    const msg = `Halo Kak ${debt.customerName}, sekadar mengingatkan catatan kasbon di Warung sebesar ${formatRupiah(debt.amount)} dengan jatuh tempo tanggal ${debt.dueDate}. Mohon konfirmasinya ya kak. Terima kasih! 🙏`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Filtered List
  const filteredList = debts.filter((d) => {
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.customerName.toLowerCase().includes(q) ||
        (d.notes && d.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-200">
              Buku Kasbon
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Catatan Hutang & Piutang Warung
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola pelanggan kasbon sembako & hutang barang ke agen supplier dengan mudah.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Catatan Kasbon</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Piutang (Orang Utang ke Warung) */}
        <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-800">Piutang Pelanggan (Belum Dibayar)</span>
            <div className="text-2xl font-black text-amber-900 mt-1">
              {formatRupiah(totalReceivables)}
            </div>
            <p className="text-[11px] text-amber-700 mt-1">
              {debts.filter((d) => d.type === 'receivable' && d.status === 'unpaid').length} transaksi kasbon aktif
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        {/* Hutang (Warung Utang ke Supplier) */}
        <div className="bg-rose-50/70 border border-rose-200 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-800">Hutang Warung ke Supplier</span>
            <div className="text-2xl font-black text-rose-900 mt-1">
              {formatRupiah(totalPayables)}
            </div>
            <p className="text-[11px] text-rose-700 mt-1">
              {debts.filter((d) => d.type === 'payable' && d.status === 'unpaid').length} tagihan ke agen/supplier
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pelanggan / catatan..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">Semua Jenis (Piutang & Hutang)</option>
            <option value="receivable">Kasbon Pelanggan (Piutang)</option>
            <option value="payable">Hutang ke Supplier</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="unpaid">Belum Lunas</option>
            <option value="paid">Sudah Lunas</option>
          </select>
        </div>
      </div>

      {/* Table / Cards List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <User className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">Belum ada catatan kasbon atau hutang.</p>
            <p className="text-[11px]">Klik tombol "Tambah Catatan Kasbon" di atas untuk memulai.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredList.map((debt) => {
              const isUnpaid = debt.status === 'unpaid';
              const isReceivable = debt.type === 'receivable';

              return (
                <div
                  key={debt.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        {debt.customerName}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          isReceivable
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}
                      >
                        {isReceivable ? 'Kasbon Pelanggan' : 'Hutang Supplier'}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isUnpaid
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isUnpaid ? 'Belum Lunas' : 'Lunas'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      {debt.phone && (
                        <span>No. HP: <strong className="text-slate-700">{debt.phone}</strong></span>
                      )}
                      <span>Jatuh Tempo: <strong className="text-slate-700">{debt.dueDate}</strong></span>
                      {debt.notes && <span>Catatan: {debt.notes}</span>}
                    </div>
                  </div>

                  {/* Right Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className={`text-base sm:text-lg font-black ${isReceivable ? 'text-amber-700' : 'text-rose-700'}`}>
                        {formatRupiah(debt.amount)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isUnpaid && debt.phone && (
                        <button
                          onClick={() => handleSendWhatsApp(debt)}
                          title="Kirim pengingat WhatsApp"
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}

                      {isUnpaid ? (
                        <button
                          onClick={() => handleMarkAsPaid(debt)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tandai Lunas</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Paid
                        </span>
                      )}

                      <button
                        onClick={() => handleDelete(debt.id)}
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

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden relative">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Tambah Catatan Kasbon / Hutang</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDebt} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Catatan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('receivable')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      type === 'receivable'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Kasbon Pelanggan (Piutang)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('payable')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      type === 'payable'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Hutang ke Supplier
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Pelanggan / Agen Supplier
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Bu Ani / Agen Sembako Jaya"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP / WhatsApp (Opsional untuk pengingat WA)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Nominal (Rp)
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Jatuh Tempo
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Barang / Keterangan
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Beras 5kg & Minyak Goreng 2L"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

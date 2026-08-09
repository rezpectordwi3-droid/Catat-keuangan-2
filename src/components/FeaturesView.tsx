import React from 'react';
import { Sparkles, FileSpreadsheet, ShieldCheck, Wallet, Bell, Lock, RefreshCw, Layers, ArrowUpRight, CheckCircle2, MessageSquare, CreditCard, Printer } from 'lucide-react';

interface FeaturesViewProps {
  onOpenSync: () => void;
  onOpenCategories: () => void;
  onOpenKasbon: () => void;
  onOpenAccounts: () => void;
  onOpenExport: () => void;
  onOpenPinModal: () => void;
}

export const FeaturesView: React.FC<FeaturesViewProps> = ({
  onOpenSync,
  onOpenCategories,
  onOpenKasbon,
  onOpenAccounts,
  onOpenExport,
  onOpenPinModal,
}) => {
  const featuresList = [
    {
      id: 'cloud-sync',
      title: 'Sinkronisasi Google Sheets & Cloud Auto-Backup',
      description: 'Semua transaksi warung otomatis tersimpan di Google Firestore & terkirim langsung ke Google Sheets Anda secara real-time.',
      icon: RefreshCw,
      badge: 'Aktif & Siap Pakai',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      actionText: 'Buka Sync & Backup',
      action: onOpenSync,
    },
    {
      id: 'kasbon-debt',
      title: 'Buku Kasbon & Pengingat Hutang Piutang Warung',
      description: 'Catat nama pelanggan yang berhutang sembako/stok, tanggal jatuh tempo, dan kirim pesan pengingat tagihan via WhatsApp.',
      icon: MessageSquare,
      badge: 'Aktif & Siap Pakai',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      actionText: 'Buka Buku Kasbon',
      action: onOpenKasbon,
    },
    {
      id: 'multi-account',
      title: 'Manajemen Multi-Kas & Rekening Pembayaran',
      description: 'Lacak kas di Laci Tunai Kasir, Rekening Bank (BCA/BRI/Mandiri), QRIS, hingga E-Wallet (GoPay, OVO, DANA).',
      icon: CreditCard,
      badge: 'Aktif & Siap Pakai',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      actionText: 'Atur Multi-Kas',
      action: onOpenAccounts,
    },
    {
      id: 'export-report',
      title: 'Ekspor Laporan Keuangan ke PDF & Excel',
      description: 'Cetak rekapitulasi laba rugi, total pemasukan, dan pengeluaran kasir dalam bentuk file spreadsheet CSV / PDF siap cetak.',
      icon: Printer,
      badge: 'Aktif & Siap Pakai',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      actionText: 'Ekspor Laporan',
      action: onOpenExport,
    },
    {
      id: 'budget-alert',
      title: 'Plafon Anggaran Bulanan & Notifikasi Pengeluaran',
      description: 'Setel batas pengeluaran bulanan per kategori (misal: Belanja Stok Grosir max 5jt) agar keuangan warung tidak kebobolan.',
      icon: Bell,
      badge: 'Aktif & Siap Pakai',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      actionText: 'Atur Plafon Anggaran',
      action: onOpenCategories,
    },
    {
      id: 'app-security',
      title: 'Kunci PIN Keamanan & Akses Terproteksi',
      description: 'Lindungi rekap saldo dan laporan keuangan warung dengan Kunci PIN 4-digit agar aman dari pembukaan tanpa izin.',
      icon: Lock,
      badge: 'Aktif & Siap Pakai',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      actionText: 'Setel Kunci PIN',
      action: onOpenPinModal,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner Intro */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekosistem Keuangan Warung Lengkap</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Semua Fitur Telah Aktif & Siap Dites
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Klik tombol aksi pada kartu fitur di bawah ini untuk mencoba langsung setiap modul pembukuan warung secara live!
          </p>
        </div>

        {/* Abstract Deco */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
          <Layers className="w-80 h-80 text-emerald-400" />
        </div>
      </div>

      {/* Grid of Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {featuresList.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.actionText && item.action ? (
                <button
                  onClick={item.action}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2 border-t border-slate-100 cursor-pointer"
                >
                  <span>{item.actionText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-400 pt-2 border-t border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Fitur Siap Diaktifkan</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

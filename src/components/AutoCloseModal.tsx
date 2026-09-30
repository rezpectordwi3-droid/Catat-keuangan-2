import React, { useState } from 'react';
import { AutoCloseConfig, ClosedMonthSnapshot } from '../types';
import { getMonthEndInfo } from '../utils/storage';
import { formatRupiah } from '../utils/formatters';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  X,
  RotateCcw,
  Sliders,
} from 'lucide-react';

interface AutoCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AutoCloseConfig;
  onSaveConfig: (config: AutoCloseConfig) => void;
  onExecuteNow: () => void;
  closedMonths: string[];
  closedMonthSnapshots: Record<string, ClosedMonthSnapshot>;
}

export const AutoCloseModal: React.FC<AutoCloseModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onExecuteNow,
  closedMonths,
  closedMonthSnapshots,
}) => {
  const [enabled, setEnabled] = useState(config.enabled ?? true);
  const [carryOverMode, setCarryOverMode] = useState<'zero' | 'rollover'>(
    config.carryOverMode || 'zero'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const monthInfo = getMonthEndInfo();

  const handleSave = () => {
    const updated: AutoCloseConfig = {
      ...config,
      enabled,
      carryOverMode,
    };
    onSaveConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const lastClosedMonthStr = config.lastAutoClosedMonth || closedMonths[closedMonths.length - 1];
  const lastSnapshot = lastClosedMonthStr ? closedMonthSnapshots[lastClosedMonthStr] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Automasi Pembukuan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Otomatis Tutup Buku Akhir Bulan
          </h2>
          <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
            Sistem secara otomatis mengarsipkan kas saat berganti ke tanggal baru bulan berikutnya (tanggal 1), sehingga seluruh transaksi bulan aktif tetap bebas dicatat sampai akhir bulan tanpa terpotong.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Main Toggle Card */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition">
            <div className="space-y-1 pr-4">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Aktifkan Tutup Buku Otomatis</span>
                {enabled && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Aktif
                  </span>
                )}
              </span>
              <p className="text-xs text-slate-500 leading-normal">
                Bulan aktif tetap berjalan penuh sampai hari terakhir. Tepat saat tanggal berganti ke bulan baru ({monthInfo.formattedNextMonthStart}), buku bulan berjalan otomatis ditutup & diarsipkan rapi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                enabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Mode Saldo Awal Bulan Baru */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Perlakuan Saldo Masuk Bulan Baru</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pilihan 1: Mulai dari Nol */}
              <div
                onClick={() => setCarryOverMode('zero')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  carryOverMode === 'zero'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      Mulai dari Nol (Rp 0)
                    </span>
                    <input
                      type="radio"
                      name="carryOverMode"
                      checked={carryOverMode === 'zero'}
                      onChange={() => setCarryOverMode('zero')}
                      className="text-emerald-600"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block mt-1">
                    ★ Disiplin Warung
                  </span>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Saldo akhir bulan disimpan aman di Multi-Kas. Bulan baru mulai fresh dari Rp 0 untuk hitung laba bersih akurat.
                  </p>
                </div>
              </div>

              {/* Pilihan 2: Rollover Saldo */}
              <div
                onClick={() => setCarryOverMode('rollover')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  carryOverMode === 'rollover'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      Teruskan Saldo (Rollover)
                    </span>
                    <input
                      type="radio"
                      name="carryOverMode"
                      checked={carryOverMode === 'rollover'}
                      onChange={() => setCarryOverMode('rollover')}
                      className="text-emerald-600"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md inline-block mt-1">
                    Akumulatif
                  </span>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Total sisa saldo akhir bulan otomatis dialihkan menjadi Saldo Awal modal bulan berikutnya.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Jadwal & Countdown */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Jadwal Eksekusi Tutup Buku Otomatis</span>
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                {monthInfo.isLastDay
                  ? 'Besok (Saat Masuk Bulan Baru)'
                  : `Sisa ${monthInfo.daysRemaining} Hari di Bulan Ini`}
              </span>
            </div>
            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>{monthInfo.formattedNextMonthStart} (Tanggal 1)</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Pukul 00:00 WIB
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              {monthInfo.isLastDay
                ? `Hari ini adalah tanggal terakhir bulan (${monthInfo.formattedLastDate})! Anda tetap bebas mencatat seluruh transaksi kasir hari ini. Tutup buku otomatis baru akan dijalankan saat tanggal berganti ke 1 ${monthInfo.nextMonthName}.`
                : `Bulan berjalan tetap aktif untuk mencatat transaksi sampai tanggal ${monthInfo.formattedLastDate}. Saat berganti ke tanggal 1 ${monthInfo.nextMonthName}, buku bulan ini otomatis diarsipkan rapi.`}
            </p>
          </div>

          {/* Riwayat Penutupan Terakhir */}
          {lastSnapshot && (
            <div className="p-3.5 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Arsip Tutup Buku Terakhir:</span>
                <span className="font-mono text-emerald-700 font-extrabold">
                  {lastClosedMonthStr}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Total Saldo Terakhir Diamankan:</span>
                <span className="font-bold text-slate-800">
                  {formatRupiah(lastSnapshot.totalBalance)}
                </span>
              </div>
              {lastSnapshot.isAutoClosed && (
                <div className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Ditutup otomatis oleh sistem tepat pada akhir bulan</span>
                </div>
              )}
            </div>
          )}

          {/* Tombol Eksekusi Manual Cepat */}
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onExecuteNow();
                onClose();
              }}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Tutup Buku Sekarang (Manual)</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <span>Simpan Pengaturan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

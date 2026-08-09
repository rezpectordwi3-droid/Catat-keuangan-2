import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { FileSpreadsheet, Printer, Download, Calendar, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

interface ExportReportModalProps {
  transactions: Transaction[];
  totalBalance: number;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  transactions,
  totalBalance,
}) => {
  const [timePeriod, setTimePeriod] = useState<'month' | 'all'>('month');

  // Filter transactions
  const getFilteredTransactions = () => {
    if (timePeriod === 'all') return transactions;
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return transactions.filter((t) => t.date.startsWith(currentMonthPrefix));
  };

  const filtered = getFilteredTransactions();

  const totalIn = filtered
    .filter((t) => t.type === 'cash_in')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = filtered
    .filter((t) => t.type === 'cash_out')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIn - totalOut;

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['Tanggal', 'Waktu', 'Jenis', 'Kategori', 'Nominal (Rp)', 'Akun Kas', 'Catatan'];
    const rows = filtered.map((t) => [
      t.date,
      t.time || '',
      t.type === 'cash_in' ? 'Pemasukan' : 'Pengeluaran',
      `"${t.categoryName}"`,
      t.amount,
      t.account,
      `"${t.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_Warung_${timePeriod}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print / PDF Report
  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = filtered
      .map(
        (t) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.date} ${t.time || ''}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.type === 'cash_in' ? '<span style="color: green; font-weight: bold;">+ Pemasukan</span>' : '<span style="color: red; font-weight: bold;">- Pengeluaran</span>'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.categoryName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.notes || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">${formatRupiah(t.amount)}</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Keuangan Warung</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .summary-box { display: flex; gap: 15px; margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
            .stat { flex: 1; }
            .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
            .stat-val { font-size: 16px; font-weight: bold; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
            th { text-align: left; padding: 8px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; }
          </style>
        </head>
        <body>
          <h1>REKAPITULASI LAPORAN KEUANGAN WARUNG</h1>
          <p style="font-size: 12px; color: #666;">Dicetak pada: ${new Date().toLocaleDateString('id-ID')} | Periode: ${timePeriod === 'month' ? 'Bulan Ini' : 'Semua Data'}</p>
          
          <div class="summary-box">
            <div class="stat">
              <div class="stat-label">Total Pemasukan</div>
              <div class="stat-val" style="color: green;">${formatRupiah(totalIn)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total Pengeluaran</div>
              <div class="stat-val" style="color: red;">${formatRupiah(totalOut)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Laba Bersih</div>
              <div class="stat-val" style="color: #0284c7;">${formatRupiah(netProfit)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Kategori</th>
                <th>Catatan</th>
                <th style="text-align: right;">Nominal</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-teal-200">
            Cetak & Ekspor Laporan
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Ekspor Laporan Keuangan ke Excel & PDF
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Unduh rekapitulasi transaksi kasir untuk pembukuan bulanan atau cetak file PDF resmi.
          </p>
        </div>

        {/* Filter Period */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setTimePeriod('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              timePeriod === 'month'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setTimePeriod('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              timePeriod === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Data ({transactions.length})
          </button>
        </div>
      </div>

      {/* Summary Stat Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
          <span className="text-xs font-semibold text-emerald-800">Total Pemasukan</span>
          <div className="text-xl font-black text-emerald-900 mt-1">{formatRupiah(totalIn)}</div>
        </div>

        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
          <span className="text-xs font-semibold text-rose-800">Total Pengeluaran</span>
          <div className="text-xl font-black text-rose-900 mt-1">{formatRupiah(totalOut)}</div>
        </div>

        <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl">
          <span className="text-xs font-semibold text-sky-800">Estimasi Laba Bersih</span>
          <div className="text-xl font-black text-sky-900 mt-1">{formatRupiah(netProfit)}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Ekspor File Excel / CSV</h3>
          <p className="text-xs text-slate-500">
            Unduh seluruh baris transaksi dalam format file CSV spreadsheet yang kompatibel dengan Microsoft Excel dan Google Sheets.
          </p>
          <button
            onClick={handleExportCsv}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Spreadsheet (.CSV)</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Cetak PDF / Laporan Print</h3>
          <p className="text-xs text-slate-500">
            Format laporan siap cetak kertas A4 lengkap dengan tabel rincian transaksi dan ringkasan Laba Rugi.
          </p>
          <button
            onClick={handlePrintPdf}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF / Print Laporan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

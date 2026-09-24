import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { downloadFinancialReportPdf } from '../utils/pdfGenerator';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  FileText,
  FileDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Search,
  Sparkles,
} from 'lucide-react';

interface ExportReportModalProps {
  transactions: Transaction[];
  totalBalance: number;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  transactions,
  totalBalance,
}) => {
  const [timePeriod, setTimePeriod] = useState<'month' | 'all'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Filter transactions based on period
  const getFilteredTransactions = () => {
    if (timePeriod === 'all') return transactions;
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return transactions.filter((t) => t.date.startsWith(currentMonthPrefix));
  };

  const filtered = getFilteredTransactions();

  // Search filter for preview
  const displayedForPreview = filtered.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.categoryName || '').toLowerCase().includes(q) ||
      (t.notes || '').toLowerCase().includes(q) ||
      (t.account || '').toLowerCase().includes(q) ||
      t.date.includes(q)
    );
  });

  const totalIn = filtered
    .filter((t) => t.type === 'cash_in')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = filtered
    .filter((t) => t.type === 'cash_out')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIn - totalOut;

  // Handle Download PDF
  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    try {
      const periodLabel = timePeriod === 'month' ? 'Bulan Ini' : 'Semua Data';
      downloadFinancialReportPdf({
        transactions: filtered,
        totalBalance,
        totalIn,
        totalOut,
        netProfit,
        periodLabel,
      });

      setDownloadSuccessMessage('File PDF laporan keuangan berhasil diunduh!');
      setTimeout(() => {
        setDownloadSuccessMessage(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to download PDF report', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

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
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_Warung_${timePeriod}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccessMessage('File spreadsheet CSV berhasil diunduh!');
    setTimeout(() => {
      setDownloadSuccessMessage(null);
    }, 4000);
  };

  // Safe Print / PDF Report (uses iframe or popup fallback)
  const handlePrintPdf = () => {
    const periodLabel = timePeriod === 'month' ? 'Bulan Ini' : 'Semua Data';
    const rowsHtml = filtered
      .map(
        (t, idx) => `
      <tr>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;">${idx + 1}</td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e2e8f0;">${t.date} ${t.time || ''}</td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: ${t.type === 'cash_in' ? '#059669' : '#e11d48'};">
          ${t.type === 'cash_in' ? '+ Pemasukan' : '- Pengeluaran'}
        </td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e2e8f0;">${t.categoryName}</td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase;">${t.account || 'Tunai'}</td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e2e8f0; color: #475569;">${t.notes || '-'}</td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: ${t.type === 'cash_in' ? '#047857' : '#be123c'};">
          ${t.type === 'cash_in' ? '+' : '-'} ${formatRupiah(t.amount)}
        </td>
      </tr>
    `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Laporan Keuangan Warung - ${periodLabel}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 0; padding: 15px; font-size: 11px; }
            .header-bar { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo-text { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
            .sub-title { font-size: 11px; color: #64748b; margin-top: 2px; }
            .meta-info { text-align: right; font-size: 10px; color: #64748b; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .card { padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; }
            .card-title { font-size: 9px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
            .card-val { font-size: 14px; font-weight: 800; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; padding: 8px; background: #0f172a; color: #ffffff; font-size: 10px; text-transform: uppercase; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <div class="logo-text">UANG WARUNG</div>
              <div class="sub-title">Laporan Rekapitulasi Pembukuan & Arus Kas Keuangan</div>
            </div>
            <div class="meta-info">
              <div><strong>Periode:</strong> ${periodLabel}</div>
              <div><strong>Dicetak:</strong> ${new Date().toLocaleString('id-ID')}</div>
            </div>
          </div>

          <div class="summary-grid">
            <div class="card" style="background: #ecfdf5; border-color: #a7f3d0;">
              <div class="card-title" style="color: #065f46;">Total Pemasukan</div>
              <div class="card-val" style="color: #047857;">${formatRupiah(totalIn)}</div>
            </div>
            <div class="card" style="background: #fff1f2; border-color: #fecdd3;">
              <div class="card-title" style="color: #9f1239;">Total Pengeluaran</div>
              <div class="card-val" style="color: #be123c;">${formatRupiah(totalOut)}</div>
            </div>
            <div class="card" style="background: ${netProfit >= 0 ? '#f0f9ff' : '#fff7ed'}; border-color: ${netProfit >= 0 ? '#bae6fd' : '#fed7aa'};">
              <div class="card-title" style="color: ${netProfit >= 0 ? '#0369a1' : '#c2410c'};">Laba Bersih</div>
              <div class="card-val" style="color: ${netProfit >= 0 ? '#0284c7' : '#ea580c'};">${formatRupiah(netProfit)}</div>
            </div>
            <div class="card" style="background: #f8fafc; border-color: #cbd5e1;">
              <div class="card-title" style="color: #334155;">Saldo Kas Saat Ini</div>
              <div class="card-val" style="color: #0f172a;">${formatRupiah(totalBalance)}</div>
            </div>
          </div>

          <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">Rincian Transaksi (${filtered.length} baris)</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 25px; text-align: center;">No</th>
                <th style="width: 110px;">Tanggal & Waktu</th>
                <th style="width: 90px;">Jenis</th>
                <th>Kategori</th>
                <th style="width: 70px;">Akun</th>
                <th>Catatan</th>
                <th style="text-align: right; width: 110px;">Nominal</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #94a3b8;">Tidak ada transaksi pada periode ini</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Dokumen resmi dihasilkan otomatis oleh Aplikasi Uang Warung © ${new Date().getFullYear()} • Sistem Kasir & Keuangan Digital
          </div>
        </body>
      </html>
    `;

    // Try iframe print first
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();
        iframe.contentWindow?.focus();
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1500);
        }, 500);
        return;
      }
    } catch (e) {
      console.warn('Iframe print failed, falling back to popup', e);
    }

    // Popup fallback
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-teal-200 mb-1.5">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>Cetak & Unduh Laporan Resmi</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Laporan Keuangan & Rekapitulasi Kas
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Unduh langsung dokumen PDF siap simpan/cetak, atau ekspor format Excel/CSV spreadsheet untuk keperluan pembukuan warung Anda.
          </p>
        </div>

        {/* Filter Period */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setTimePeriod('month')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              timePeriod === 'month'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Bulan Ini ({filtered.length})</span>
          </button>
          <button
            onClick={() => setTimePeriod('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              timePeriod === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Semua Data ({transactions.length})</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {downloadSuccessMessage && (
        <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex items-center space-x-3 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">Berhasil Mengunduh!</div>
            <div className="text-xs text-emerald-100">{downloadSuccessMessage}</div>
          </div>
        </div>
      )}

      {/* Summary Stat Box */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Total Pemasukan</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-950 mt-1.5">{formatRupiah(totalIn)}</div>
          <span className="text-[10px] text-emerald-700 mt-0.5 block font-medium">
            {filtered.filter((t) => t.type === 'cash_in').length} transaksi masuk
          </span>
        </div>

        <div className="bg-rose-50 border border-rose-200/80 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">Total Pengeluaran</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-950 mt-1.5">{formatRupiah(totalOut)}</div>
          <span className="text-[10px] text-rose-700 mt-0.5 block font-medium">
            {filtered.filter((t) => t.type === 'cash_out').length} transaksi keluar
          </span>
        </div>

        <div className="bg-sky-50 border border-sky-200/80 p-4 rounded-2xl shadow-2xs">
          <span className="text-xs font-bold text-sky-800 block">Estimasi Laba Bersih</span>
          <div className={`text-xl font-black mt-1.5 ${netProfit >= 0 ? 'text-sky-950' : 'text-amber-900'}`}>
            {formatRupiah(netProfit)}
          </div>
          <span className="text-[10px] text-sky-700 mt-0.5 block font-medium">
            {netProfit >= 0 ? 'Surplus / Untung' : 'Defisit Operasional'}
          </span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xs">
          <span className="text-xs font-bold text-slate-300 block">Total Saldo Kas Saat Ini</span>
          <div className="text-xl font-black text-emerald-400 mt-1.5">{formatRupiah(totalBalance)}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
            Saldo riil tersimpan di kas
          </span>
        </div>
      </div>

      {/* 3 Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: UNDUH LAPORAN PDF (Featured) */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-indigo-700/60 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shadow-inner">
                <FileDown className="w-6 h-6 text-indigo-300" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                ⭐ Download PDF
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-white text-base">Unduh Dokumen PDF (.pdf)</h3>
              <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed">
                Unduh langsung berkas file PDF resmi (A4). Dilengkapi kop Uang Warung, kartu ringkasan keuangan, serta tabel data rapi siap dibagikan atau disimpan di HP/komputer.
              </p>
            </div>
          </div>

          <div className="pt-2 relative z-10">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf || filtered.length === 0}
              className={`w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-indigo-900/50 flex items-center justify-center space-x-2 cursor-pointer ${
                filtered.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Download className="w-4 h-4 text-white" />
              <span>{isDownloadingPdf ? 'Membuat PDF...' : 'Download File PDF (.pdf)'}</span>
            </button>
            {filtered.length === 0 && (
              <span className="text-[10px] text-indigo-300 block text-center mt-1.5">
                Tidak ada data pada periode ini
              </span>
            )}
          </div>
        </div>

        {/* Card 2: CETAK / PRINT LANGSUNG */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
                <Printer className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Cetak Printer
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">Cetak Langsung (Print)</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Buka jendela dialog cetak printer ke kertas fisik A4 dengan tampilan hitam putih bersih dan ringkas hemat tinta.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handlePrintPdf}
              disabled={filtered.length === 0}
              className={`w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer ${
                filtered.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Buka Dialog Cetak / Print</span>
            </button>
          </div>
        </div>

        {/* Card 3: EKSPOR EXCEL / CSV */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Spreadsheet
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">Ekspor File Excel / CSV</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Unduh seluruh baris transaksi dalam format file CSV spreadsheet yang kompatibel dengan Microsoft Excel dan Google Sheets.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleExportCsv}
              disabled={filtered.length === 0}
              className={`w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer ${
                filtered.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Unduh Spreadsheet (.CSV)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Preview Table of Transactions included in Export */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Pratinjau Data Laporan ({filtered.length} Transaksi)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar transaksi yang akan masuk ke dalam file laporan PDF maupun file Excel/CSV.
            </p>
          </div>

          {/* Quick Search inside preview */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Akun Kas</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-right">Nominal (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedForPreview.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada transaksi ditemukan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery ? 'Coba ubah kata kunci pencarian Anda' : 'Belum ada transaksi pada periode yang dipilih'}
                    </p>
                  </td>
                </tr>
              ) : (
                displayedForPreview.map((t, index) => {
                  const isIncome = t.type === 'cash_in';
                  return (
                    <tr key={t.id || index} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-center text-slate-400 font-medium">{index + 1}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                        {t.date} <span className="text-slate-400 text-[10px]">{t.time}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isIncome ? '+ Masuk' : '- Keluar'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">{t.categoryName}</td>
                      <td className="py-3 px-4 uppercase text-slate-600 font-medium text-[11px] whitespace-nowrap">
                        {t.account || 'Tunai'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{t.notes || '-'}</td>
                      <td
                        className={`py-3 px-4 text-right font-black whitespace-nowrap ${
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatRupiah(t.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Menampilkan {displayedForPreview.length} dari {filtered.length} transaksi</span>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Format Ekspor Tersedia:</span>
            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold text-[10px]">.PDF</span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">.CSV</span>
          </div>
        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Transaction, Category, SyncSettings } from '../types';
import { exportToCSV, exportJSONBackup, generateGoogleSheetsClipboardText, sanitizeDateString, sanitizeTimeString, sanitizeAmount, sanitizeTransaction } from '../utils/storage';
import { RefreshCw, FileSpreadsheet, Download, Upload, Copy, Check, ShieldCheck, Database, HelpCircle, ExternalLink, Sparkles, Zap, RotateCcw, FileText, HardDrive } from 'lucide-react';

interface SyncModalProps {
  transactions: Transaction[];
  categories: Category[];
  openBalance: number;
  syncSettings: SyncSettings;
  onUpdateSyncSettings: (settings: SyncSettings) => void;
  onRestoreBackup: (data: { transactions: Transaction[]; categories?: Category[]; openBalance?: number }) => void;
  onResetSampleData: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  transactions,
  categories,
  openBalance,
  syncSettings,
  onUpdateSyncSettings,
  onRestoreBackup,
  onResetSampleData,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(syncSettings.googleSheetsWebhookUrl || '');
  const [copiedClipboard, setCopiedClipboard] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Copy formatted Google Sheets TSV data
  const handleCopyForGoogleSheets = () => {
    const text = generateGoogleSheetsClipboardText(transactions, openBalance);
    navigator.clipboard.writeText(text);
    setCopiedClipboard(true);
    setTimeout(() => setCopiedClipboard(false), 2500);
  };

  // Google Apps Script code snippet
  const googleAppsScriptCode = `// ==========================================
// KODE GOOGLE APPS SCRIPT (CATAT KEUANGAN)
// Tempelkan kode ini di Ekstensi > Apps Script
// ==========================================

function getSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      return ss.getActiveSheet();
    }
  } catch (e) {}
  
  // Jika script berdiri sendiri (standalone), isi ID Spreadsheet Anda di bawah:
  const SHEET_ID = "ISI_ID_SPREADSHEET_ANDA_DISINI";
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName("Sheet1") || ss.getActiveSheet();
}

function ensureHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Tanggal", "Jam", "Jenis", "Kategori", "Pemasukan", "Pengeluaran", "Akun", "Catatan"]);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#f3f4f6");
  }
}

// GET DATA (AMBIL DARI SHEET KE APLIKASI)
function doGet(e) {
  try {
    const sheet = getSheet();
    ensureHeader(sheet);
    // Menggunakan getDisplayValues agar membaca teks sesuai tampilan cell (menghindari kerancuan format tanggal/angka)
    const displayValues = sheet.getDataRange().getDisplayValues();
    let result = [];

    for (let i = 1; i < displayValues.length; i++) {
      const row = displayValues[i];
      if (!row[0] && !row[2] && !row[3] && !row[4] && !row[5]) continue;

      const dateStr = String(row[0] || "").trim();
      const timeStr = String(row[1] || "").trim();
      const jenisStr = String(row[2] || "").trim().toLowerCase();
      const categoryStr = String(row[3] || "").trim();

      // Fungsi pembersih angka rupiah
      const parseAmountStr = function(val) {
        if (!val) return 0;
        const clean = String(val).replace(/[^0-9]/g, '');
        const num = Number(clean);
        return (isNaN(num) || num > 500000000) ? 0 : num;
      };

      const rawPemasukan = parseAmountStr(row[4]);
      const rawPengeluaran = parseAmountStr(row[5]);

      const isMasuk = jenisStr.includes("masuk") || jenisStr.includes("in") || (rawPemasukan > 0 && rawPengeluaran === 0);
      const type = isMasuk ? "cash_in" : "cash_out";
      const amount = isMasuk ? rawPemasukan : (rawPengeluaran || rawPemasukan);

      let validDate = dateStr;
      if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(validDate)) {
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 2000 && parsedDate.getFullYear() < 2100) {
          const yyyy = parsedDate.getFullYear();
          const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const dd = String(parsedDate.getDate()).padStart(2, '0');
          validDate = yyyy + '-' + mm + '-' + dd;
        } else {
          validDate = new Date().toISOString().slice(0, 10);
        }
      }

      let validTime = timeStr;
      if (!/^\\d{1,2}:\\d{2}$/.test(validTime)) {
        const timeMatch = timeStr.match(/\\b(\\d{1,2}):(\\d{2})\\b/);
        if (timeMatch) {
          validTime = (timeMatch[1].length === 1 ? '0' + timeMatch[1] : timeMatch[1]) + ':' + timeMatch[2];
        } else {
          validTime = "12:00";
        }
      }

      result.push({
        date: validDate,
        time: validTime,
        type: type,
        categoryName: categoryStr || (isMasuk ? "Penjualan / Omset Warung" : "Belanja Stok Grosir"),
        amount: Math.abs(amount),
        account: String(row[6] || "cash"),
        notes: String(row[7] || "")
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      transactions: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString(),
      transactions: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// SIMPAN DATA (KIRIM DARI APLIKASI KE SHEET)
function doPost(e) {
  try {
    const sheet = getSheet();
    ensureHeader(sheet);
    const data = JSON.parse(e.postData.contents);

    if (data.action === "clear_and_write" && Array.isArray(data.transactions)) {
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).clearContent();
      }

      if (data.transactions.length > 0) {
        const rows = data.transactions.map(function(tx) {
          return [
            String(tx.date || "").slice(0, 10),
            String(tx.time || "12:00").slice(0, 5),
            tx.type === "cash_in" ? "Pemasukan" : "Pengeluaran",
            tx.categoryName || "",
            tx.type === "cash_in" ? Number(tx.amount || 0) : 0,
            tx.type === "cash_out" ? Number(tx.amount || 0) : 0,
            tx.account || "cash",
            tx.notes || ""
          ];
        });

        const range = sheet.getRange(2, 1, rows.length, 8);
        range.setValues(rows);

        // ATUR FORMAT KOLOM OTOMATIS: Mencegah Google Sheets mengubah angka uang menjadi tanggal!
        sheet.getRange(2, 1, rows.length, 1).setNumberFormat("yyyy-mm-dd"); // Tanggal
        sheet.getRange(2, 2, rows.length, 1).setNumberFormat("@");          // Jam (Text)
        sheet.getRange(2, 3, rows.length, 2).setNumberFormat("@");          // Jenis & Kategori (Text)
        sheet.getRange(2, 5, rows.length, 2).setNumberFormat("#,##0");      // Pemasukan & Pengeluaran (Angka Rupiah)
        sheet.getRange(2, 7, rows.length, 2).setNumberFormat("@");          // Akun & Catatan (Text)
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Data berhasil disimpan dengan format rapi!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Helper to normalize Google Apps Script Webhook URL or ID
  const normalizeWebhookUrl = (raw: string): string => {
    let cleaned = raw.trim();
    if (!cleaned) return '';
    // Replace /dev with /exec because test deployments (/dev) require Google login and block external API access
    if (cleaned.endsWith('/dev')) {
      cleaned = cleaned.replace(/\/dev$/, '/exec');
    }
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      return cleaned;
    }
    if (cleaned.includes('script.google.com') || cleaned.includes('macros/s/')) {
      return 'https://' + cleaned.replace(/^(https?:\/\/)?/, '');
    }
    const cleanId = cleaned.replace(/\/(exec|dev)$/, '').replace(/^\//, '');
    return `https://script.google.com/macros/s/${cleanId}/exec`;
  };

  const handleSaveWebhook = () => {
    const normalized = normalizeWebhookUrl(webhookUrl);
    setWebhookUrl(normalized);
    const updated = {
      ...syncSettings,
      googleSheetsWebhookUrl: normalized,
      cloudSyncEnabled: !!normalized,
    };
    onUpdateSyncSettings(updated);
    if (normalized) {
      setSyncStatusMsg(`Pengaturan Webhook disimpan! URL: ${normalized}`);
    } else {
      setSyncStatusMsg('Pengaturan Google Sheets Webhook telah dikosongkan.');
    }
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  // Push / Write to Google Sheets
  const handleTriggerWebSync = async () => {
    const targetUrl = normalizeWebhookUrl(syncSettings.googleSheetsWebhookUrl || webhookUrl);
    if (!targetUrl) {
      alert('Silakan isi URL Webhook Google Sheets terlebih dahulu.');
      return;
    }

    setSyncing(true);
    setSyncStatusMsg('Mengirim data transaksi ke Google Sheets...');

    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'clear_and_write',
          transactions,
          openBalance,
          updatedAt: new Date().toISOString(),
        }),
        mode: 'no-cors', // Apps Script webapp standard
      });

      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      onUpdateSyncSettings({
        ...syncSettings,
        googleSheetsWebhookUrl: targetUrl,
        lastSyncTime: nowStr,
        cloudSyncEnabled: true,
      });

      setSyncStatusMsg(`Berhasil dikirim ke Google Sheets pada pukul ${nowStr}`);
    } catch (e: any) {
      console.warn('Web sync push warning:', e);
      setSyncStatusMsg('Gagal menyambungkan ke Webhook. Pastikan URL Web App sudah aktif.');
    } finally {
      setSyncing(false);
    }
  };

  // Pull / Fetch from Google Sheets
  const handleFetchFromWebSync = async () => {
    const url = normalizeWebhookUrl(syncSettings.googleSheetsWebhookUrl || webhookUrl);
    if (!url) {
      alert('Silakan isi URL Webhook Google Sheets terlebih dahulu.');
      return;
    }

    setSyncing(true);
    setSyncStatusMsg('Mengambil data dari Google Sheets...');

    try {
      const res = await fetch(url);
      const text = await res.text();

      // Check if response is HTML (Google login page or standard webpage redirect)
      if (text.trim().startsWith('<') || text.toLowerCase().includes('<!doctype') || text.toLowerCase().includes('<html')) {
        setSyncStatusMsg('Gagal: URL mengembalikan halaman HTML. Pastikan di Apps Script: "Akses/Who has access" diatur ke "Anyone" (Siapa Saja) dan URL Web App sudah benar.');
        return;
      }

      let json: any;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        setSyncStatusMsg('Gagal: Respon dari Google Sheets bukan format JSON yang valid. Periksa kembali URL Web App.');
        return;
      }

      if (json && json.success && Array.isArray(json.transactions)) {
        const mappedTransactions: Transaction[] = json.transactions.map((tx: any, idx: number) => {
          // Find matching category or fallback
          const matchedCat = categories.find(c => c.name.toLowerCase() === (tx.categoryName || '').toLowerCase());
          return sanitizeTransaction({
            id: `gs-${Date.now()}-${idx}`,
            date: sanitizeDateString(tx.date),
            time: sanitizeTimeString(tx.time),
            type: tx.type === 'cash_in' ? 'cash_in' : 'cash_out',
            categoryId: matchedCat ? matchedCat.id : (tx.type === 'cash_in' ? 'cat-penjualan' : 'cat-stok'),
            categoryName: tx.categoryName || (tx.type === 'cash_in' ? 'Penjualan / Omset Warung' : 'Belanja Stok Grosir'),
            amount: sanitizeAmount(tx.amount),
            account: tx.account || 'cash',
            notes: tx.notes || '',
            createdAt: Date.now() - (json.transactions.length - idx) * 1000
          });
        });

        onRestoreBackup({ transactions: mappedTransactions });
        const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        onUpdateSyncSettings({
          ...syncSettings,
          googleSheetsWebhookUrl: url,
          lastSyncTime: nowStr,
          cloudSyncEnabled: true,
        });
        setSyncStatusMsg(`Berhasil mengimpor ${mappedTransactions.length} transaksi dari Google Sheets!`);
      } else {
        setSyncStatusMsg('Respon Google Sheets tidak memuat daftar transaksi yang valid.');
      }
    } catch (e: any) {
      console.warn('Web sync fetch warning:', e);
      const msg = String(e?.message || e || '');
      if (msg.includes('Failed to fetch')) {
        setSyncStatusMsg('Gagal terhubung ke Google Sheets. Pastikan URL Web App benar & "Who has access" di Google Apps Script diatur ke "Anyone".');
      } else {
        setSyncStatusMsg(`Gagal mengambil data dari Google Sheets: ${msg}`);
      }
    } finally {
      setSyncing(false);
    }
  };

  // Helper to normalize imported transactions from various JSON shapes
  const normalizeTransactions = (rawList: any[]): Transaction[] => {
    return rawList.map((item: any, idx: number) => {
      // Determine amount & type
      let amt = sanitizeAmount(item.amount || item.nominal || item.jumlah || 0);
      let type: 'cash_in' | 'cash_out' = item.type === 'cash_in' || item.type === 'cash_out' ? item.type : 'cash_out';

      if (item.jenis) {
        const j = String(item.jenis).toLowerCase();
        if (j.includes('masuk') || j.includes('in') || j.includes('penjualan') || j.includes('omset')) {
          type = 'cash_in';
        } else if (j.includes('keluar') || j.includes('out') || j.includes('pengeluaran') || j.includes('stok')) {
          type = 'cash_out';
        }
      }

      if (item.pemasukan && Number(item.pemasukan) > 0) {
        amt = sanitizeAmount(item.pemasukan);
        type = 'cash_in';
      } else if (item.pengeluaran && Number(item.pengeluaran) > 0) {
        amt = sanitizeAmount(item.pengeluaran);
        type = 'cash_out';
      }

      const categoryName = item.categoryName || item.kategori || (type === 'cash_in' ? 'Penjualan / Omset Warung' : 'Belanja Stok Grosir');
      const matchedCat = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());

      return sanitizeTransaction({
        id: item.id || `restored-${Date.now()}-${idx}`,
        date: sanitizeDateString(item.date || item.tanggal),
        time: sanitizeTimeString(item.time || item.jam),
        type: type,
        categoryId: matchedCat ? matchedCat.id : (item.categoryId || (type === 'cash_in' ? 'cat-penjualan' : 'cat-stok')),
        categoryName: categoryName,
        amount: amt,
        account: item.account || item.akun || 'cash',
        notes: item.notes || item.catatan || item.note || '',
        createdAt: item.createdAt || (Date.now() - (rawList.length - idx) * 1000)
      });
    });
  };

  // Handle JSON Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content || content.trim().startsWith('<')) {
          alert('File yang diunggah bukan file JSON cadangan yang valid.');
          return;
        }

        const json = JSON.parse(content);
        let rawTransactions: any[] = [];
        let restoredCategories: Category[] | undefined = undefined;
        let restoredOpenBalance: number | undefined = undefined;

        if (Array.isArray(json)) {
          rawTransactions = json;
        } else if (json && typeof json === 'object') {
          if (Array.isArray(json.transactions)) {
            rawTransactions = json.transactions;
          } else if (Array.isArray(json.data)) {
            rawTransactions = json.data;
          } else if (Array.isArray(json.records)) {
            rawTransactions = json.records;
          } else if (Array.isArray(json.items)) {
            rawTransactions = json.items;
          } else if (json.amount || json.nominal || json.jumlah || json.date || json.tanggal) {
            // Single object transaction
            rawTransactions = [json];
          }

          if (Array.isArray(json.categories)) {
            restoredCategories = json.categories;
          }
          if (typeof json.openBalance === 'number') {
            restoredOpenBalance = json.openBalance;
          }
        }

        if (rawTransactions.length > 0) {
          const formatted = normalizeTransactions(rawTransactions);
          onRestoreBackup({
            transactions: formatted,
            categories: restoredCategories,
            openBalance: restoredOpenBalance,
          });
          alert(`Berhasil memulihkan ${formatted.length} catatan transaksi dari file backup JSON!`);
        } else {
          alert('File JSON tidak memuat daftar transaksi yang dapat dibaca. Pastikan file berisi data transaksi.');
        }
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file backup JSON. Periksa apakah isi file berformat JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-md border border-slate-800 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Sinkronisasi Cloud & Google Sheets</h2>
            <p className="text-xs text-slate-300">
              Simpan dan amankan catatan pengeluaran Anda ke Google Sheets atau cadangan file lokal
            </p>
          </div>
        </div>

        {syncSettings.lastSyncTime && (
          <div className="inline-flex items-center space-x-1.5 text-xs bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" />
            <span>Terakhir disinkronkan: {syncSettings.lastSyncTime}</span>
          </div>
        )}
      </div>

      {/* Grid: 3 Options for Storage, Backup, and Syncing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* OPTION 1: Local Storage & Data Sampel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">1. Penyimpanan Lokal (localStorage)</h3>
              <p className="text-xs text-slate-500">Otomatis tersimpan instan di memori browser HP/PC</p>
            </div>
          </div>

          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Penyimpanan Otomatis Aktif</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Setiap kali Anda menambah, merubah, atau menghapus catatan transaksi, data langsung tersimpan secara otomatis ke <code className="bg-amber-100/80 px-1 rounded font-mono">localStorage</code> tanpa khawatir hilang saat halaman ditutup.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data ke Data Sampel awal? Data saat ini akan digantikan dengan data contoh.')) {
                  onResetSampleData();
                  alert('Data berhasil di-reset ke Data Sampel bawaan!');
                }
              }}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Ke Data Sampel Bawaan</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              *Gunakan fitur ini jika ingin mencoba ulang aplikasi dengan data contoh warung.
            </p>
          </div>
        </div>

        {/* OPTION 2: File JSON & Markdown Backup/Restore */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">2. Ekspor & Impor File (JSON / MD)</h3>
              <p className="text-xs text-slate-500">Cadangan lengkap JSON & ekspor catatan tunggal .MD</p>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 space-y-2 text-xs text-slate-600">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Ekspor Catatan Tunggal (.MD)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Anda dapat mengunduh catatan individual per transaksi ke file <b>Markdown (.md)</b> dengan menekan ikon <FileText className="w-3 h-3 inline text-emerald-600" /> pada daftar transaksi di Dashboard.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => exportJSONBackup(transactions, categories, openBalance)}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Seluruh Data Format JSON</span>
            </button>

            <label className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer text-center">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Impor / Restore File JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* OPTION 3: 1-Click Copy & CSV Export */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">3. Salin Format Google Sheets & CSV</h3>
              <p className="text-xs text-slate-500">Salin langsung dengan 1-Click atau unduh CSV Excel</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleCopyForGoogleSheets}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              {copiedClipboard ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copiedClipboard ? 'Disalin ke Clipboard!' : 'Salin Format Google Sheets (1-Click)'}</span>
            </button>

            <button
              onClick={() => exportToCSV(transactions)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Unduh File CSV (Excel / Sheets)</span>
            </button>
          </div>
        </div>

      </div>

      {/* OPTION 3: Google Apps Script Webhook Sync Setup */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">3. Sinkronisasi Otomatis via Google Webhook</h3>
              <p className="text-xs text-slate-500">Hubungkan langsung ke Google Sheets secara otomatis</p>
            </div>
          </div>

          {syncSettings.googleSheetsWebhookUrl && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleTriggerWebSync}
                disabled={syncing}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                title="Kirim catatan lokal ke Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Kirim ke Sheets</span>
              </button>

              <button
                onClick={handleFetchFromWebSync}
                disabled={syncing}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                title="Tarik catatan dari Google Sheets ke HP"
              >
                <Download className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Tarik dari Sheets</span>
              </button>
            </div>
          )}
        </div>

        {syncStatusMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-200">
            {syncStatusMsg}
          </div>
        )}

        {/* Input Webhook URL */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">URL Webhook Google Apps Script</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSaveWebhook}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer"
            >
              Simpan URL
            </button>
          </div>
        </div>

        {/* Auto-Sync Toggle Switch */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="flex items-center space-x-2.5">
            <Zap className={`w-4 h-4 ${syncSettings.autoSync ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold text-slate-800">Auto-Sync Otomatis</div>
              <div className="text-[11px] text-slate-500">Otomatis update Google Sheets setiap kali Anda merubah, menambah, atau menghapus transaksi</div>
            </div>
          </div>
          <button
            onClick={() => {
              const updated = { ...syncSettings, autoSync: !syncSettings.autoSync };
              onUpdateSyncSettings(updated);
              setSyncStatusMsg(updated.autoSync ? 'Auto-Sync diaktifkan! Data akan dikirim otomatis.' : 'Auto-Sync dinonaktifkan.');
              setTimeout(() => setSyncStatusMsg(null), 3000);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              syncSettings.autoSync ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
            title="Aktifkan/Nonaktifkan Auto Sync"
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              syncSettings.autoSync ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Accordion Guide on how to setup Apps Script */}
        <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Panduan Cara Membuat Webhook Google Sheets (1 Menit):</span>
          </div>

          <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed pl-1">
            <li>Di HP Android/iPhone: Buka Google Sheets lewat browser Chrome HP &amp; centang <b>"Situs Desktop" (Desktop Site)</b> agar menu <b>Ekstensi &gt; Apps Script</b> muncul (karena di app bawaan HP menu ini disembunyikan).</li>
            <li>Hapus semua isi kode default, lalu tempelkan kode Apps Script di bawah ini.</li>
            <li>Klik tombol <b>Terapkan (Deploy) &gt; Penerapan Baru (New deployment)</b>.</li>
            <li>Pilih Jenis: <b>Aplikasi Web (Web App)</b>, Dan Atur <i>Akses / Who has access</i>: <b>Siapa Saja (Anyone)</b>.</li>
            <li>Salin URL Webapp yang dihasilkan ke kotak input di atas &amp; simpan.</li>
          </ol>

          <div className="pt-2">
            <button
              onClick={handleCopyScript}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Kode Apps Script Disalin!' : 'Salin Kode Apps Script'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

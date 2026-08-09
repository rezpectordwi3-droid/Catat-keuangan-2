import { Transaction, Category, AccountInfo, SyncSettings, DailyBalance, DebtItem } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_ACCOUNTS, INITIAL_SYNC_SETTINGS, INITIAL_TRANSACTIONS, DEFAULT_OPEN_BALANCE } from '../data/initialData';

const KEYS = {
  TRANSACTIONS: 'catat_keuangan_transactions_v1',
  CATEGORIES: 'catat_keuangan_categories_v1',
  ACCOUNTS: 'catat_keuangan_accounts_v1',
  SETTINGS: 'catat_keuangan_settings_v1',
  OPEN_BALANCE: 'catat_keuangan_open_balance_v1',
  DEBTS: 'catat_keuangan_debts_v1',
  PIN_CODE: 'catat_keuangan_pin_v1',
};

export const loadStoredDebts = (): DebtItem[] => {
  try {
    const data = localStorage.getItem(KEYS.DEBTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveDebts = (debts: DebtItem[]) => {
  try {
    localStorage.setItem(KEYS.DEBTS, JSON.stringify(debts));
  } catch (e) {
    console.error('Failed saving debts', e);
  }
};

export const loadStoredPin = (): string | null => {
  try {
    return localStorage.getItem(KEYS.PIN_CODE);
  } catch (e) {
    return null;
  }
};

export const savePin = (pin: string | null) => {
  try {
    if (pin) {
      localStorage.setItem(KEYS.PIN_CODE, pin);
    } else {
      localStorage.removeItem(KEYS.PIN_CODE);
    }
  } catch (e) {
    console.error('Failed saving pin', e);
  }
};

// Helper to clean and sanitize time strings (e.g. convert "Sat Dec 30 1899 23:45:00..." to "23:45")
export const sanitizeTimeString = (rawTime?: any): string => {
  if (!rawTime) return '12:00';
  const str = String(rawTime).trim();
  // If it's already HH:mm
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
    return str.slice(0, 5);
  }
  // Try extracting HH:mm from long timestamp string like "Sat Dec 30 1899 23:45:00"
  const match = str.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
  if (match) {
    const hh = match[1].padStart(2, '0');
    const mm = match[2].padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return '12:00';
};

// Helper to sanitize date string (fix "1899" or invalid dates)
export const sanitizeDateString = (rawDate?: any): string => {
  if (!rawDate) return new Date().toISOString().slice(0, 10);
  const str = String(rawDate).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    // Check for corrupt 2001 or 1899/1900 dates
    if (str.startsWith('1899') || str.startsWith('1900') || str.startsWith('2001')) {
      return new Date().toISOString().slice(0, 10);
    }
    return str;
  }
  const parsed = new Date(rawDate);
  if (!isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    if (yyyy < 2010 || yyyy > 2035) {
      return new Date().toISOString().slice(0, 10);
    }
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return new Date().toISOString().slice(0, 10);
};

// Helper to sanitize numeric amount (prevent 30 Trillion timestamp corruption)
export const sanitizeAmount = (rawAmount: any): number => {
  if (typeof rawAmount === 'string') {
    const cleanStr = rawAmount.replace(/[^0-9.]/g, '');
    const num = Number(cleanStr);
    if (isNaN(num) || !isFinite(num) || num > 500_000_000) return 0;
    return Math.abs(num);
  }
  const num = Number(rawAmount);
  if (isNaN(num) || !isFinite(num) || Math.abs(num) > 500_000_000) return 0;
  return Math.abs(num);
};

export const sanitizeTransaction = (tx: any): Transaction => {
  let cleanDate = sanitizeDateString(tx.date);
  if (cleanDate.startsWith('2001') || cleanDate.startsWith('1899') || cleanDate.startsWith('1900')) {
    cleanDate = new Date().toISOString().slice(0, 10);
  }
  return {
    id: String(tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
    date: cleanDate,
    time: sanitizeTimeString(tx.time),
    type: tx.type === 'cash_in' ? 'cash_in' : 'cash_out',
    categoryId: String(tx.categoryId || (tx.type === 'cash_in' ? 'cat-penjualan' : 'cat-stok')),
    categoryName: String(tx.categoryName || (tx.type === 'cash_in' ? 'Penjualan / Omset Warung' : 'Belanja Stok Grosir')),
    amount: sanitizeAmount(tx.amount),
    account: String(tx.account || 'cash') as any,
    notes: String(tx.notes || ''),
    createdAt: typeof tx.createdAt === 'number' && tx.createdAt < 2000000000000 ? tx.createdAt : Date.now(),
  };
};

export const loadStoredTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    const rawList: any[] = data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
    if (!Array.isArray(rawList)) return INITIAL_TRANSACTIONS;
    return rawList.map(sanitizeTransaction);
  } catch (e) {
    console.error('Failed loading transactions', e);
    return INITIAL_TRANSACTIONS;
  }
};

export const saveTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed saving transactions', e);
  }
};

export const loadStoredCategories = (): Category[] => {
  try {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  } catch (e) {
    console.error('Failed loading categories', e);
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = (categories: Category[]) => {
  try {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed saving categories', e);
  }
};

export const loadStoredAccounts = (): AccountInfo[] => {
  try {
    const data = localStorage.getItem(KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : INITIAL_ACCOUNTS;
  } catch (e) {
    console.error('Failed loading accounts', e);
    return INITIAL_ACCOUNTS;
  }
};

export const saveAccounts = (accounts: AccountInfo[]) => {
  try {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed saving accounts', e);
  }
};

export const loadStoredOpenBalance = (): number => {
  try {
    const data = localStorage.getItem(KEYS.OPEN_BALANCE);
    const num = data !== null ? Number(data) : DEFAULT_OPEN_BALANCE;
    if (isNaN(num) || !isFinite(num) || Math.abs(num) > 100_000_000_000) {
      return DEFAULT_OPEN_BALANCE;
    }
    return Math.max(0, num);
  } catch (e) {
    return DEFAULT_OPEN_BALANCE;
  }
};

export const saveOpenBalance = (amount: number) => {
  try {
    const cleanAmount = sanitizeAmount(amount);
    localStorage.setItem(KEYS.OPEN_BALANCE, String(cleanAmount));
  } catch (e) {
    console.error('Failed saving open balance', e);
  }
};

export const loadSyncSettings = (): SyncSettings => {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SYNC_SETTINGS;
  } catch (e) {
    return INITIAL_SYNC_SETTINGS;
  }
};

export const saveSyncSettings = (settings: SyncSettings) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed saving sync settings', e);
  }
};

// Calculate summary totals for a given list of transactions, base starting balance, and selected time filter
export const calculateBalanceSummary = (
  allTransactions: Transaction[],
  baseOpenBalance: number,
  period: 'today' | 'week' | 'month' | 'all' = 'today'
) => {
  const cleanBaseOpen = sanitizeAmount(baseOpenBalance);

  const getTodayStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getTodayStr();
  let startDateLimit = '';

  if (period === 'today') {
    startDateLimit = todayStr;
  } else if (period === 'week') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    startDateLimit = `${yyyy}-${mm}-${dd}`;
  } else if (period === 'month') {
    startDateLimit = `${todayStr.slice(0, 7)}-01`;
  }

  if (period === 'all' || !startDateLimit) {
    let cashIn = 0;
    let cashOut = 0;
    allTransactions.forEach((t) => {
      const amt = sanitizeAmount(t.amount);
      if (t.type === 'cash_in') cashIn += amt;
      else if (t.type === 'cash_out') cashOut += amt;
    });
    return {
      openBalance: cleanBaseOpen,
      priorNet: 0,
      cashIn,
      cashOut,
      totalBalance: cleanBaseOpen + cashIn - cashOut,
    };
  }

  let priorCashIn = 0;
  let priorCashOut = 0;
  let currentCashIn = 0;
  let currentCashOut = 0;

  allTransactions.forEach((t) => {
    const txDate = (t.date || '').slice(0, 10);
    const amt = sanitizeAmount(t.amount);
    if (txDate < startDateLimit) {
      if (t.type === 'cash_in') priorCashIn += amt;
      else if (t.type === 'cash_out') priorCashOut += amt;
    } else {
      if (t.type === 'cash_in') currentCashIn += amt;
      else if (t.type === 'cash_out') currentCashOut += amt;
    }
  });

  const priorNet = priorCashIn - priorCashOut;
  const effectiveOpenBalance = cleanBaseOpen + priorNet;
  const totalBalance = effectiveOpenBalance + currentCashIn - currentCashOut;

  return {
    openBalance: effectiveOpenBalance,
    priorNet,
    cashIn: currentCashIn,
    cashOut: currentCashOut,
    totalBalance,
  };
};

// Export to CSV string compatible with Excel & Google Sheets
export const exportToCSV = (transactions: Transaction[]) => {
  const headers = ['Tanggal', 'Jam', 'Jenis Transaksi', 'Kategori', 'Pemasukan', 'Pengeluaran', 'Akun', 'Catatan'];
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  const rows = sorted.map((t) => [
    t.date,
    t.time || '12:00',
    t.type === 'cash_in' ? 'Pemasukan' : 'Pengeluaran',
    `"${(t.categoryName || '').replace(/"/g, '""')}"`,
    t.type === 'cash_in' ? t.amount : 0,
    t.type === 'cash_out' ? t.amount : 0,
    t.account,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `pencatatan_keuangan_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Format as tab-separated values for direct Ctrl+C / Ctrl+V into Google Sheets
export const generateGoogleSheetsClipboardText = (transactions: Transaction[], _openBalance: number): string => {
  const headers = ['Tanggal', 'Jam', 'Jenis Transaksi', 'Kategori', 'Pemasukan', 'Pengeluaran', 'Akun', 'Catatan'];
  
  // Sort oldest to newest for chronological balance calculation
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);

  const rows = sorted.map((t) => {
    const cashInVal = t.type === 'cash_in' ? t.amount : 0;
    const cashOutVal = t.type === 'cash_out' ? t.amount : 0;
    return [
      t.date,
      t.time || '12:00',
      t.type === 'cash_in' ? 'Pemasukan' : 'Pengeluaran',
      t.categoryName,
      cashInVal,
      cashOutVal,
      t.account,
      t.notes || '-',
    ].join('\t');
  });

  return [
    headers.join('\t'),
    ...rows
  ].join('\n');
};

// Backup JSON file export
export const exportJSONBackup = (transactions: Transaction[], categories: Category[], openBalance: number) => {
  const backupData = {
    version: 1,
    exportDate: new Date().toISOString(),
    openBalance,
    categories,
    transactions,
  };
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `backup_catatkeuangan_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export single transaction note to Markdown (.md)
export const exportSingleNoteToMarkdown = (transaction: Transaction) => {
  const isCashIn = transaction.type === 'cash_in';
  const jenisText = isCashIn ? 'Pemasukan (Cash In)' : 'Pengeluaran (Cash Out)';

  const mdContent = `# Catatan Transaksi: ${transaction.categoryName}

- **ID Transaksi**: \`${transaction.id}\`
- **Tanggal**: ${transaction.date}
- **Waktu**: ${transaction.time || '12:00'}
- **Jenis Transaksi**: ${jenisText}
- **Kategori**: ${transaction.categoryName}
- **Jumlah / Nominal**: Rp ${transaction.amount.toLocaleString('id-ID')}
- **Metode Pembayaran**: ${transaction.account.toUpperCase()}
- **Penyimpanan**: Otomatis Tersimpan di localStorage (Penyimpanan Lokal)

---

### Detail & Catatan Keterangan:
${transaction.notes ? transaction.notes : 'Tidak ada catatan tambahan.'}

---
*Diekspor dari Aplikasi Catatan Keuangan pada ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*
`;

  const safeCategoryName = transaction.categoryName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fileName = `catatan_${safeCategoryName}_${transaction.date}.md`;
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Reset localStorage data to default sample data
export const resetToSampleData = () => {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
    localStorage.setItem(KEYS.OPEN_BALANCE, String(DEFAULT_OPEN_BALANCE));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SYNC_SETTINGS));
  } catch (e) {
    console.error('Failed to reset sample data', e);
  }
};

const KEYS_CLOSED_MONTHS = 'catat_keuangan_closed_months_v1';

export const loadClosedMonths = (): string[] => {
  try {
    const data = localStorage.getItem(KEYS_CLOSED_MONTHS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveClosedMonths = (months: string[]) => {
  try {
    localStorage.setItem(KEYS_CLOSED_MONTHS, JSON.stringify(months));
  } catch (e) {
    console.error('Failed saving closed months', e);
  }
};

// Calculate carried-over open balance up to a given month (YYYY-MM)
export const calculateCarriedOpenBalance = (
  allTransactions: Transaction[],
  baseOpenBalance: number,
  targetMonthStr?: string // e.g. '2026-08' or 'all'
): number => {
  const cleanBase = sanitizeAmount(baseOpenBalance);
  if (!targetMonthStr || targetMonthStr === 'all') {
    return cleanBase;
  }
  
  // Calculate net cash flow from transactions strictly BEFORE targetMonthStr (e.g. before '2026-08-01')
  const startDate = `${targetMonthStr}-01`;
  let priorIn = 0;
  let priorOut = 0;

  allTransactions.forEach((t) => {
    const txDate = (t.date || '').slice(0, 10);
    const amt = sanitizeAmount(t.amount);
    if (txDate < startDate) {
      if (t.type === 'cash_in') priorIn += amt;
      else if (t.type === 'cash_out') priorOut += amt;
    }
  });

  return cleanBase + priorIn - priorOut;
};


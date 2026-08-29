import { Transaction, Category, AccountInfo, SyncSettings, DailyBalance, DebtItem, BillItem, FinancialHealthMetrics } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_ACCOUNTS, INITIAL_SYNC_SETTINGS, INITIAL_TRANSACTIONS, DEFAULT_OPEN_BALANCE, INITIAL_BILLS } from '../data/initialData';

const KEYS = {
  TRANSACTIONS: 'catat_keuangan_transactions_v1',
  CATEGORIES: 'catat_keuangan_categories_v1',
  ACCOUNTS: 'catat_keuangan_accounts_v1',
  SETTINGS: 'catat_keuangan_settings_v1',
  OPEN_BALANCE: 'catat_keuangan_open_balance_v1',
  DEBTS: 'catat_keuangan_debts_v1',
  PIN_CODE: 'catat_keuangan_pin_v1',
  BILLS: 'catat_keuangan_bills_v1',
};

export const loadStoredBills = (): BillItem[] => {
  try {
    const data = localStorage.getItem(KEYS.BILLS);
    return data ? JSON.parse(data) : INITIAL_BILLS;
  } catch (e) {
    return INITIAL_BILLS;
  }
};

export const saveBills = (bills: BillItem[]) => {
  try {
    localStorage.setItem(KEYS.BILLS, JSON.stringify(bills));
  } catch (e) {
    console.error('Failed saving bills', e);
  }
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

// Helper to sanitize date string (handles ISO YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, Excel dates, etc.)
export const sanitizeDateString = (rawDate?: any): string => {
  if (!rawDate) return new Date().toISOString().slice(0, 10);
  const str = String(rawDate).trim();
  if (!str) return new Date().toISOString().slice(0, 10);

  // 1. ISO format YYYY-MM-DD or with time (e.g., 2026-08-13, 2026-08-13T10:30:00)
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const yyyy = parseInt(isoMatch[1], 10);
    const mm = String(parseInt(isoMatch[2], 10)).padStart(2, '0');
    const dd = String(parseInt(isoMatch[3], 10)).padStart(2, '0');
    if (yyyy >= 2015 && yyyy <= 2040 && parseInt(mm, 10) >= 1 && parseInt(mm, 10) <= 12 && parseInt(dd, 10) >= 1 && parseInt(dd, 10) <= 31) {
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  // 2. Format YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[\/\.](\d{1,2})[\/\.](\d{1,2})/);
  if (ymdMatch) {
    const yyyy = parseInt(ymdMatch[1], 10);
    const mm = String(parseInt(ymdMatch[2], 10)).padStart(2, '0');
    const dd = String(parseInt(ymdMatch[3], 10)).padStart(2, '0');
    if (yyyy >= 2015 && yyyy <= 2040 && parseInt(mm, 10) >= 1 && parseInt(mm, 10) <= 12 && parseInt(dd, 10) >= 1 && parseInt(dd, 10) <= 31) {
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  // 3. Indonesian / International format DD/MM/YYYY, DD-MM-YYYY, or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmyMatch) {
    const p1 = parseInt(dmyMatch[1], 10);
    const p2 = parseInt(dmyMatch[2], 10);
    const yyyy = parseInt(dmyMatch[3], 10);
    // If p1 <= 31 and p2 <= 12 -> DD/MM/YYYY
    if (p1 >= 1 && p1 <= 31 && p2 >= 1 && p2 <= 12) {
      const dd = String(p1).padStart(2, '0');
      const mm = String(p2).padStart(2, '0');
      if (yyyy >= 2015 && yyyy <= 2040) {
        return `${yyyy}-${mm}-${dd}`;
      }
    }
    // If p1 <= 12 and p2 <= 31 -> MM/DD/YYYY
    if (p1 >= 1 && p1 <= 12 && p2 >= 1 && p2 <= 31) {
      const mm = String(p1).padStart(2, '0');
      const dd = String(p2).padStart(2, '0');
      if (yyyy >= 2015 && yyyy <= 2040) {
        return `${yyyy}-${mm}-${dd}`;
      }
    }
  }

  // 4. Short year format DD/MM/YY (e.g. 13/08/26)
  const dmyShortMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
  if (dmyShortMatch) {
    const dd = String(parseInt(dmyShortMatch[1], 10)).padStart(2, '0');
    const mm = String(parseInt(dmyShortMatch[2], 10)).padStart(2, '0');
    const yy = parseInt(dmyShortMatch[3], 10);
    const yyyy = yy < 50 ? 2000 + yy : 1900 + yy;
    if (yyyy >= 2015 && yyyy <= 2040) {
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  // 5. Excel serial date number (e.g. 45518 approx 2024)
  if (/^\d{5}$/.test(str)) {
    const serial = parseInt(str, 10);
    if (serial > 35000 && serial < 60000) {
      const utc_days = Math.floor(serial - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
      const yyyy = date_info.getUTCFullYear();
      const mm = String(date_info.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(date_info.getUTCDate()).padStart(2, '0');
      if (yyyy >= 2015 && yyyy <= 2040) {
        return `${yyyy}-${mm}-${dd}`;
      }
    }
  }

  // 6. Standard JS Date parser
  const parsed = new Date(rawDate);
  if (!isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    if (yyyy >= 2015 && yyyy <= 2040) {
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
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
  const cleanDate = sanitizeDateString(tx.date || tx.tanggal);
  return {
    id: String(tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
    date: cleanDate,
    time: sanitizeTimeString(tx.time || tx.jam),
    type: tx.type === 'cash_in' ? 'cash_in' : 'cash_out',
    categoryId: String(tx.categoryId || (tx.type === 'cash_in' ? 'cat-penjualan' : 'cat-stok')),
    categoryName: String(tx.categoryName || tx.kategori || (tx.type === 'cash_in' ? 'Penjualan / Omset Warung' : 'Belanja Stok Grosir')),
    amount: sanitizeAmount(tx.amount || tx.nominal || tx.jumlah),
    account: String(tx.account || tx.akun || 'cash') as any,
    notes: String(tx.notes || tx.catatan || ''),
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

  return cleanBase + (priorIn - priorOut);
};

// Calculate comprehensive Financial Health Metrics (Financify-grade diagnostics)
export const calculateFinancialHealthMetrics = (
  transactions: Transaction[],
  currentTotalBalance: number,
  debts: DebtItem[] = [],
  bills: BillItem[] = []
): FinancialHealthMetrics => {
  const cleanBalance = Math.max(0, currentTotalBalance);

  // Consider transactions in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

  const recentTxs = transactions.filter((t) => (t.date || '').slice(0, 10) >= thirtyDaysAgoStr);
  const relevantTxs = recentTxs.length >= 3 ? recentTxs : transactions;

  const totalIn = relevantTxs.filter((t) => t.type === 'cash_in').reduce((s, t) => s + sanitizeAmount(t.amount), 0);
  const totalOut = relevantTxs.filter((t) => t.type === 'cash_out').reduce((s, t) => s + sanitizeAmount(t.amount), 0);

  const netProfit = totalIn - totalOut;
  const profitMargin = totalIn > 0 ? Math.round((netProfit / totalIn) * 100) : 0;
  const expenseRatio = totalIn > 0 ? Math.round((totalOut / totalIn) * 100) : (totalOut > 0 ? 100 : 0);

  const avgDailyExpense = Math.max(1, Math.round(totalOut / Math.max(1, Math.min(30, relevantTxs.length || 1))));
  const cashRunwayDays = avgDailyExpense > 0 ? Math.round(cleanBalance / avgDailyExpense) : 30;

  const unpaidReceivables = debts.filter((d) => d.type === 'receivable' && d.status === 'unpaid').reduce((s, d) => s + sanitizeAmount(d.amount), 0);
  const debtRiskRatio = cleanBalance > 0 ? Math.round((unpaidReceivables / cleanBalance) * 100) : (unpaidReceivables > 0 ? 100 : 0);

  // Score Calculation (Max 100)
  let score = 0;

  // 1. Margin & Profit (Max 30 pts)
  if (profitMargin >= 30) score += 30;
  else if (profitMargin >= 20) score += 25;
  else if (profitMargin >= 10) score += 18;
  else if (profitMargin > 0) score += 10;
  else score += 2;

  // 2. Expense Ratio (Max 25 pts)
  if (expenseRatio <= 65) score += 25;
  else if (expenseRatio <= 80) score += 18;
  else if (expenseRatio <= 95) score += 10;
  else score += 2;

  // 3. Cash Runway (Max 25 pts)
  if (cashRunwayDays >= 30) score += 25;
  else if (cashRunwayDays >= 14) score += 18;
  else if (cashRunwayDays >= 7) score += 10;
  else score += 3;

  // 4. Debt & Kasbon Control (Max 20 pts)
  if (debtRiskRatio <= 10) score += 20;
  else if (debtRiskRatio <= 25) score += 14;
  else if (debtRiskRatio <= 40) score += 8;
  else score += 2;

  // Boundaries
  score = Math.max(10, Math.min(100, score));

  // Determine Status
  let status: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
  let statusLabel = 'Sehat & Terkendali';

  if (score >= 85) {
    status = 'excellent';
    statusLabel = 'Sangat Sehat (Prima)';
  } else if (score >= 70) {
    status = 'good';
    statusLabel = 'Sehat & Stabil';
  } else if (score >= 50) {
    status = 'warning';
    statusLabel = 'Waspada (Perlu Penghematan)';
  } else {
    status = 'critical';
    statusLabel = 'Kritis (Defisit / Arus Kas Rendah)';
  }

  // Generate Strengths & Recommendations
  const strengths: string[] = [];
  const recommendations: string[] = [];

  if (profitMargin > 15) {
    strengths.push(`Margin keuntungan bersih positif di angka ${profitMargin}%`);
  }
  if (expenseRatio <= 75 && totalIn > 0) {
    strengths.push(`Beban pengeluaran terkendali rapi di bawah 75% dari pemasukan (${expenseRatio}%)`);
  }
  if (cashRunwayDays >= 14) {
    strengths.push(`Ketahanan saldo kas aman untuk operasional ${cashRunwayDays} hari ke depan`);
  }
  if (debtRiskRatio < 15) {
    strengths.push('Kasbon pelanggan terkontrol baik dan tidak membebani arus kas');
  }

  if (strengths.length === 0) {
    strengths.push('Catatan transaksi mulai terdata dengan teratur');
  }

  if (expenseRatio > 85) {
    recommendations.push('Kurangi belanja non-esensial atau negosiasikan harga grosir dengan suplier');
  }
  if (cashRunwayDays < 10) {
    recommendations.push('Sisihkan minimal 10% omset harian ke rekening tabungan dana darurat warung');
  }
  if (unpaidReceivables > 200000) {
    recommendations.push(`Kirim pengingat tagih kasbon ke pelanggan yang memiliki total piutang tertahan`);
  }
  const upcomingBills = bills.filter((b) => b.status === 'unpaid');
  if (upcomingBills.length > 0) {
    recommendations.push(`Siapkan dana untuk ${upcomingBills.length} jadwal tagihan rutin sebelum tanggal jatuh tempo`);
  }
  if (profitMargin < 10) {
    recommendations.push('Tingkatkan promosi produk bermargin tinggi untuk mempertebal keuntungan bersih');
  }

  if (recommendations.length === 0) {
    recommendations.push('Pertahankan disiplin pencatatan harian dan rutinitas tutup buku tiap akhir bulan');
  }

  return {
    score,
    status,
    statusLabel,
    profitMargin,
    expenseRatio,
    cashRunwayDays,
    debtRiskRatio,
    strengths,
    recommendations,
  };
};



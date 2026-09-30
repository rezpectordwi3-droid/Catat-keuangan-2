import { Transaction, Category, AccountInfo, SyncSettings, DailyBalance, DebtItem, BillItem, FinancialHealthMetrics, AutoCloseConfig, MonthEndForecast, ClosedMonthSnapshot, MenuItem, OrderBill, OrderItem, StoreProfile } from '../types';
export type { ClosedMonthSnapshot };
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
  AUTO_CLOSE_CONFIG: 'catat_keuangan_auto_close_config_v1',
  ORDER_BILLS: 'catat_keuangan_order_bills_v1',
  MENU_ITEMS: 'catat_keuangan_menu_items_v2',
  STORE_PROFILE: 'catat_keuangan_store_profile_v1',
};

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  name: 'Warung Soto & Rawon',
  phone: '0812-3456-7890',
  address: 'Jl. Raya Kuliner No. 10',
  tagline: 'Soto Lamongan, Rawon & Aneka Kuliner',
  footerMessage: 'Maturnuwun sampun mampir & jajan! 🙏\nSemoga berkah, kenyang & sehat selalu.',
};

export const loadStoredStoreProfile = (): StoreProfile => {
  try {
    const data = localStorage.getItem(KEYS.STORE_PROFILE);
    return data ? JSON.parse(data) : DEFAULT_STORE_PROFILE;
  } catch (e) {
    return DEFAULT_STORE_PROFILE;
  }
};

export const saveStoredStoreProfile = (profile: StoreProfile) => {
  try {
    localStorage.setItem(KEYS.STORE_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed saving store profile', e);
  }
};

// Menu Bawaan Warung Soto & Rawon sesuai permintaan harga & varian terbaru
export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-soto-dinein',
    name: 'Soto Lamongan (Makan di Tempat)',
    category: 'makanan',
    defaultPrice: 30000,
    icon: 'Soup',
    notes: 'Termasuk nasi & minum',
  },
  {
    id: 'menu-soto-bungkus',
    name: 'Soto Lamongan (Bungkus)',
    category: 'makanan',
    defaultPrice: 25000,
    icon: 'ShoppingBag',
    notes: 'Porsi bungkus bawa pulang',
  },
  {
    id: 'menu-rawon',
    name: 'Rawon',
    category: 'makanan',
    defaultPrice: 40000,
    icon: 'Utensils',
    notes: 'Daging sapi kuah kluwek khas Jatim',
  },
  {
    id: 'menu-es-jeruk',
    name: 'Es Jeruk',
    category: 'minuman',
    defaultPrice: 5000,
    icon: 'GlassWater',
    notes: 'Perasan jeruk segar asli',
  },
  {
    id: 'menu-es-kopi',
    name: 'Es Kopi',
    category: 'minuman',
    defaultPrice: 5000,
    icon: 'Coffee',
    notes: 'Kopi hitam / kopi susu dingin',
  },
  {
    id: 'menu-krupuk',
    name: 'Krupuk',
    category: 'tambahan',
    defaultPrice: 5000,
    icon: 'Sparkles',
    notes: 'Renyah gurih pelengkap soto/rawon',
  },
  {
    id: 'menu-telur-asin',
    name: 'Telur Asin',
    category: 'tambahan',
    defaultPrice: 8000,
    icon: 'Egg',
    notes: 'Telur asin masir gurih',
  },
  {
    id: 'menu-telur-rebus',
    name: 'Telur Rebus (Add-on)',
    category: 'tambahan',
    defaultPrice: 5000,
    icon: 'Egg',
    notes: 'Add-on telur rebus matang',
  },
];

export const loadStoredMenuItems = (): MenuItem[] => {
  try {
    const data = localStorage.getItem(KEYS.MENU_ITEMS);
    return data ? JSON.parse(data) : DEFAULT_MENU_ITEMS;
  } catch (e) {
    return DEFAULT_MENU_ITEMS;
  }
};

export const saveStoredMenuItems = (items: MenuItem[]) => {
  try {
    localStorage.setItem(KEYS.MENU_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed saving menu items', e);
  }
};

export const loadStoredOrderBills = (): OrderBill[] => {
  try {
    const data = localStorage.getItem(KEYS.ORDER_BILLS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredOrderBills = (bills: OrderBill[]) => {
  try {
    localStorage.setItem(KEYS.ORDER_BILLS, JSON.stringify(bills));
  } catch (e) {
    console.error('Failed saving order bills', e);
  }
};

// Generator Teks Struk WhatsApp Digital
export const generateWhatsAppNotaText = (
  bill: OrderBill,
  profile?: StoreProfile
): string => {
  const storeName = profile?.name || 'Warung Soto & Rawon';
  const line = '--------------------------------------';
  const itemLines = bill.items
    .map((it) => {
      const sub = it.price * it.qty;
      return `• ${it.qty}x ${it.name} @Rp ${it.price.toLocaleString('id-ID')} = Rp ${sub.toLocaleString('id-ID')}`;
    })
    .join('\n');

  const orderTypeStr = bill.orderType === 'dine_in' ? 'Makan di Tempat' : 'Bungkus / Take Away';
  const tableStr = bill.tableNumber ? ` (Meja ${bill.tableNumber})` : '';

  let paymentDetail = `Metode Bayar: *${bill.paymentMethod.toUpperCase()}*`;
  if (bill.paymentMethod === 'cash' && bill.cashTendered) {
    paymentDetail += `\nUang Diterima: Rp ${bill.cashTendered.toLocaleString('id-ID')}\nKembalian: Rp ${(bill.changeAmount || 0).toLocaleString('id-ID')}`;
  } else if (bill.paymentMethod === 'kasbon') {
    paymentDetail += ` *(Belum Lunas / Masuk Kasbon)*`;
  }

  let contactInfo = '';
  if (profile?.address) {
    contactInfo += `\n📍 ${profile.address}`;
  }
  if (profile?.phone) {
    contactInfo += `\n📞 ${profile.phone}`;
  }

  const footer = profile?.footerMessage || 'Maturnuwun sampun rawuh & jajan! 🙏\nSemoga sehat, kenyang & berkah selalu.';

  return `🧾 *${storeName.toUpperCase()}*${contactInfo}
${line}
No. Nota: *${bill.id}*
Waktu: ${bill.date} | ${bill.time} WIB
Pelanggan: *${bill.customerName || 'Pelanggan'}*
Tipe: ${orderTypeStr}${tableStr}
Total Pelanggan: *${bill.totalCustomers || 1} Orang*
${line}
*PESANAN MENU:*
${itemLines}
${line}
Subtotal: Rp ${bill.subtotal.toLocaleString('id-ID')}${
    bill.discount > 0 ? `\nDiskon: -Rp ${bill.discount.toLocaleString('id-ID')}` : ''
  }
*TOTAL: Rp ${bill.total.toLocaleString('id-ID')}*
${paymentDetail}
${line}
${footer}`;
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
  period: 'today' | 'week' | 'month' | 'all' = 'today',
  closedMonths: string[] = []
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
    const txMonth = txDate.slice(0, 7);
    const amt = sanitizeAmount(t.amount);

    // PENTING: Jika bulan transaksi ini sudah ditutup buku (tercatat di closedMonths),
    // data transaksi tersebut telah diarsipkan permanen.
    // Maka transaksi ini TIDAK BOLEH lagi dihitung pada Cash In/Cash Out layar aktif berjalan.
    if (closedMonths.includes(txMonth)) {
      return;
    }

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
const KEYS_CLOSED_MONTH_SNAPSHOTS = 'catat_keuangan_closed_month_snapshots_v1';

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

export const loadClosedMonthSnapshots = (): Record<string, ClosedMonthSnapshot> => {
  try {
    const data = localStorage.getItem(KEYS_CLOSED_MONTH_SNAPSHOTS);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

export const saveClosedMonthSnapshot = (snapshot: ClosedMonthSnapshot) => {
  try {
    const current = loadClosedMonthSnapshots();
    current[snapshot.month] = snapshot;
    localStorage.setItem(KEYS_CLOSED_MONTH_SNAPSHOTS, JSON.stringify(current));
  } catch (e) {
    console.error('Failed saving closed month snapshot', e);
  }
};

export const deleteClosedMonthSnapshot = (month: string) => {
  try {
    const current = loadClosedMonthSnapshots();
    delete current[month];
    localStorage.setItem(KEYS_CLOSED_MONTH_SNAPSHOTS, JSON.stringify(current));
  } catch (e) {
    console.error('Failed deleting closed month snapshot', e);
  }
};

// ==========================================
// PENGATURAN & LOGIKA OTOMATIS TUTUP BUKU
// ==========================================
export const loadAutoCloseConfig = (): AutoCloseConfig => {
  try {
    const data = localStorage.getItem(KEYS.AUTO_CLOSE_CONFIG);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  return {
    enabled: true, // Otomatis aktif sesuai permintaan pengguna
    carryOverMode: 'zero', // default mulai dari nol (clean slate), atau rollover
  };
};

export const saveAutoCloseConfig = (config: AutoCloseConfig) => {
  try {
    localStorage.setItem(KEYS.AUTO_CLOSE_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed saving auto close config', e);
  }
};

// Helper kalkulasi tanggal akhir bulan
export const getMonthEndInfo = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 to 11
  const day = date.getDate();

  // Hari terakhir dari bulan berjalan (Day 0 of next month)
  const lastDateObj = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDateObj.getDate();
  const daysRemaining = Math.max(0, totalDaysInMonth - day);
  const isLastDay = day === totalDaysInMonth;
  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const formattedLastDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(lastDateObj);

  // Tanggal 1 bulan berikutnya (saat eksekusi tutup buku otomatis dieksekusi)
  const nextMonthFirstDateObj = new Date(year, month + 1, 1);
  const nextMonthStr = `${nextMonthFirstDateObj.getFullYear()}-${String(nextMonthFirstDateObj.getMonth() + 1).padStart(2, '0')}`;
  const formattedNextMonthStart = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(nextMonthFirstDateObj);
  const nextMonthName = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(nextMonthFirstDateObj);

  return {
    year,
    month: month + 1,
    day,
    totalDaysInMonth,
    daysRemaining,
    isLastDay,
    lastDateObj,
    formattedLastDate,
    currentMonthStr,
    nextMonthFirstDateObj,
    nextMonthStr,
    formattedNextMonthStart,
    nextMonthName,
  };
};

// Proyeksi & Prediksi Saldo Akhir Bulan (Month-End Forecast)
export const calculateMonthEndForecast = (
  transactions: Transaction[],
  currentTotalBalance: number,
  bills: BillItem[] = [],
  debts: DebtItem[] = []
): MonthEndForecast => {
  const now = new Date();
  const monthInfo = getMonthEndInfo(now);
  const currentMonthStr = monthInfo.currentMonthStr;

  // Transaksi di bulan aktif berjalan
  const monthTxs = transactions.filter((t) => (t.date || '').slice(0, 7) === currentMonthStr);
  const currentCashIn = monthTxs.filter((t) => t.type === 'cash_in').reduce((s, t) => s + sanitizeAmount(t.amount), 0);
  const currentCashOut = monthTxs.filter((t) => t.type === 'cash_out').reduce((s, t) => s + sanitizeAmount(t.amount), 0);

  // Hari berjalan (minimal 1)
  const daysElapsed = Math.max(1, monthInfo.day);
  const dailyAvgExpense = Math.round(currentCashOut / daysElapsed);
  const dailyAvgIncome = Math.round(currentCashIn / daysElapsed);

  const daysRemaining = monthInfo.daysRemaining;

  // Tagihan jatuh tempo yang belum terbayar
  const pendingBills = bills.filter((b) => b.status === 'unpaid');
  const pendingBillsAmount = pendingBills.reduce((s, b) => s + sanitizeAmount(b.amount), 0);

  // Piutang kasbon belum tertagih
  const pendingReceivables = debts.filter((d) => d.type === 'receivable' && d.status === 'unpaid');
  const pendingReceivablesAmount = pendingReceivables.reduce((s, d) => s + sanitizeAmount(d.amount), 0);

  // Estimasi pengeluaran & pemasukan tersisa sampai akhir bulan
  const projectedRemainingExpense = dailyAvgExpense * daysRemaining;
  const projectedRemainingIncome = dailyAvgIncome * daysRemaining;

  // Estimasi saldo akhir saat tutup buku
  const projectedFinalBalance = Math.round(
    currentTotalBalance + projectedRemainingIncome - projectedRemainingExpense - pendingBillsAmount
  );

  // Alokasi belanja harian aman tersisa
  const safeAvailable = Math.max(0, currentTotalBalance - pendingBillsAmount);
  const safeDailyBudget = daysRemaining > 0 ? Math.round(safeAvailable / daysRemaining) : safeAvailable;

  let status: 'surplus' | 'moderate' | 'deficit_risk' = 'surplus';
  let advice = '';

  if (projectedFinalBalance < 0 || (currentTotalBalance - pendingBillsAmount < 0)) {
    status = 'deficit_risk';
    advice = `Peringatan: Proyeksi saldo akhir bulan berisiko defisit. Terdapat tagihan pending Rp ${pendingBillsAmount.toLocaleString('id-ID')} & pengeluaran rata-rata Rp ${dailyAvgExpense.toLocaleString('id-ID')}/hari. Batasi belanja harian max Rp ${safeDailyBudget.toLocaleString('id-ID')}/hari serta segera tagih piutang kasbon Rp ${pendingReceivablesAmount.toLocaleString('id-ID')}.`;
  } else if (projectedFinalBalance < (currentTotalBalance * 0.3) || (dailyAvgExpense > dailyAvgIncome && dailyAvgExpense > 0)) {
    status = 'moderate';
    advice = `Laju belanja harian (Rp ${dailyAvgExpense.toLocaleString('id-ID')}/hari) cukup tinggi. Jaga batas aman belanja harian di angka Rp ${safeDailyBudget.toLocaleString('id-ID')}/hari agar saldo tetap surplus saat tutup buku akhir bulan.`;
  } else {
    status = 'surplus';
    advice = `Arus kas sehat & aman! Saldo diproyeksikan surplus sekitar Rp ${projectedFinalBalance.toLocaleString('id-ID')} menjelang pergantian ke bulan baru ${monthInfo.nextMonthName}.`;
  }

  return {
    daysInMonth: monthInfo.totalDaysInMonth,
    currentDay: monthInfo.day,
    daysRemaining,
    isLastDay: monthInfo.isLastDay,
    dailyAvgExpense,
    dailyAvgIncome,
    projectedRemainingExpense,
    projectedRemainingIncome,
    pendingBillsAmount,
    projectedFinalBalance,
    status,
    advice,
    safeDailyBudget,
  };
};

export interface AutoCloseResult {
  closedMonthsAdded: string[];
  newSnapshots: Record<string, ClosedMonthSnapshot>;
  newClosedMonths: string[];
  newOpenBalance: number;
  lastClosedSnapshot?: ClosedMonthSnapshot;
  wasTriggered: boolean;
}

// Engine Pemeriksa & Pengeksekusi Tutup Buku Otomatis
export const checkAndExecuteAutoClosing = (
  allTransactions: Transaction[],
  currentOpenBalance: number,
  currentClosedMonths: string[],
  currentSnapshots: Record<string, ClosedMonthSnapshot>,
  config: AutoCloseConfig
): AutoCloseResult => {
  const now = new Date();
  const monthInfo = getMonthEndInfo(now);
  const currentMonthStr = monthInfo.currentMonthStr; // e.g. '2026-09'

  // SELF-HEALING: Jika bulan aktif yang sedang berjalan (currentMonthStr) sempat terlanjur ditutup
  // secara otomatis oleh sistem versi sebelumnya, buka kembali kunci bulan aktif ini agar pengguna
  // tetap bebas mencatat transaksi sampai akhir bulan penuh.
  let cleanedClosedMonths = [...currentClosedMonths];
  let cleanedSnapshots = { ...currentSnapshots };

  if (cleanedClosedMonths.includes(currentMonthStr)) {
    const activeSnapshot = cleanedSnapshots[currentMonthStr];
    if (activeSnapshot?.isAutoClosed) {
      cleanedClosedMonths = cleanedClosedMonths.filter((m) => m !== currentMonthStr);
      delete cleanedSnapshots[currentMonthStr];
      deleteClosedMonthSnapshot(currentMonthStr);
      saveClosedMonths(cleanedClosedMonths);
    }
  }

  if (!config.enabled) {
    return {
      closedMonthsAdded: [],
      newSnapshots: cleanedSnapshots,
      newClosedMonths: cleanedClosedMonths,
      newOpenBalance: currentOpenBalance,
      wasTriggered: false,
    };
  }

  // Kumpulkan semua bulan yang memiliki transaksi
  const txMonthsSet = new Set<string>();
  allTransactions.forEach((t) => {
    const m = (t.date || '').slice(0, 7);
    if (m && m.length === 7) txMonthsSet.add(m);
  });

  const candidateMonths: string[] = [];

  // PENTING (Permintaan Pengguna):
  // Tutup buku otomatis HANYA dilakukan saat kalender telah berganti ke tanggal baru bulan selanjutnya (m < currentMonthStr).
  // BUKAN di -1 hari terakhir atau hari terakhir di bulan aktif ini!
  // Bulan aktif berjalan (currentMonthStr) TIDAK AKAN PERNAH ditutup otomatis selama bulan tersebut masih berlangsung.
  Array.from(txMonthsSet)
    .sort()
    .forEach((m) => {
      if (m < currentMonthStr && !cleanedClosedMonths.includes(m)) {
        candidateMonths.push(m);
      }
    });

  // Bulan kalender persis sebelum bulan aktif ini (jika belum ditutup dan ada aktivitas)
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  if (!cleanedClosedMonths.includes(prevMonthStr) && !candidateMonths.includes(prevMonthStr)) {
    const hasPastActivity =
      allTransactions.some((t) => (t.date || '').slice(0, 7) <= prevMonthStr) || currentOpenBalance > 0;
    if (hasPastActivity) {
      candidateMonths.push(prevMonthStr);
      candidateMonths.sort();
    }
  }

  if (candidateMonths.length === 0) {
    return {
      closedMonthsAdded: [],
      newSnapshots: cleanedSnapshots,
      newClosedMonths: cleanedClosedMonths,
      newOpenBalance: currentOpenBalance,
      wasTriggered: false,
    };
  }

  const updatedClosedMonths = [...cleanedClosedMonths];
  const updatedSnapshots = { ...cleanedSnapshots };
  let runningOpenBalance = currentOpenBalance;
  let lastSnapshot: ClosedMonthSnapshot | undefined;

  candidateMonths.forEach((targetMonth) => {
    const monthTxs = allTransactions.filter((t) => (t.date || '').slice(0, 7) === targetMonth);
    const mCashIn = monthTxs.filter((t) => t.type === 'cash_in').reduce((s, t) => s + sanitizeAmount(t.amount), 0);
    const mCashOut = monthTxs.filter((t) => t.type === 'cash_out').reduce((s, t) => s + sanitizeAmount(t.amount), 0);

    const mOpen = calculateCarriedOpenBalance(allTransactions, currentOpenBalance, targetMonth);
    const mTotal = mOpen + mCashIn - mCashOut;

    const snapshot: ClosedMonthSnapshot = {
      month: targetMonth,
      closedAt: Date.now(),
      openBalance: mOpen,
      cashIn: mCashIn,
      cashOut: mCashOut,
      totalBalance: mTotal,
      transactionCount: monthTxs.length,
      isAutoClosed: true,
    };

    updatedSnapshots[targetMonth] = snapshot;
    saveClosedMonthSnapshot(snapshot);

    if (!updatedClosedMonths.includes(targetMonth)) {
      updatedClosedMonths.push(targetMonth);
    }
    lastSnapshot = snapshot;

    // Tentukan modal awal bulan berikutnya
    if (config.carryOverMode === 'rollover') {
      runningOpenBalance = mTotal;
    } else {
      runningOpenBalance = 0; // Bersih dari nol
    }
  });

  saveClosedMonths(updatedClosedMonths);
  saveOpenBalance(runningOpenBalance);

  const updatedConfig: AutoCloseConfig = {
    ...config,
    lastAutoClosedMonth: candidateMonths[candidateMonths.length - 1],
    lastAutoClosedAt: Date.now(),
  };
  saveAutoCloseConfig(updatedConfig);

  return {
    closedMonthsAdded: candidateMonths,
    newSnapshots: updatedSnapshots,
    newClosedMonths: updatedClosedMonths,
    newOpenBalance: runningOpenBalance,
    lastClosedSnapshot: lastSnapshot,
    wasTriggered: true,
  };
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

// Calculate complete summary for a specific month (from Saldo Awal to Total Balance)
export const calculateSpecificMonthSummary = (
  allTransactions: Transaction[],
  baseOpenBalance: number,
  targetMonthStr: string, // 'YYYY-MM'
  closedSnapshots: Record<string, ClosedMonthSnapshot> = {}
) => {
  const monthTxs = allTransactions.filter((t) => (t.date || '').slice(0, 7) === targetMonthStr);
  let cashIn = 0;
  let cashOut = 0;
  monthTxs.forEach((t) => {
    const amt = sanitizeAmount(t.amount);
    if (t.type === 'cash_in') cashIn += amt;
    else if (t.type === 'cash_out') cashOut += amt;
  });

  // If a saved snapshot exists for this closed month, use its exact recorded numbers!
  if (closedSnapshots[targetMonthStr]) {
    const s = closedSnapshots[targetMonthStr];
    const openBalance = sanitizeAmount(s.openBalance);
    const totalBalance = openBalance + cashIn - cashOut;
    return {
      openBalance,
      priorNet: 0,
      cashIn,
      cashOut,
      totalBalance: s.totalBalance && totalBalance === 0 && monthTxs.length === 0 ? s.totalBalance : totalBalance,
      isClosed: true,
      closedAt: s.closedAt,
    };
  }

  // If no snapshot exists yet, compute open modal based on carried balance
  const openBalance = calculateCarriedOpenBalance(allTransactions, baseOpenBalance, targetMonthStr);
  const totalBalance = openBalance + cashIn - cashOut;

  return {
    openBalance,
    priorNet: 0,
    cashIn,
    cashOut,
    totalBalance,
    isClosed: false,
  };
};

// Calculate comprehensive Financial Health Metrics (Financify-grade diagnostics)
export const calculateFinancialHealthMetrics = (
  transactions: Transaction[],
  currentTotalBalance: number,
  debts: DebtItem[] = [],
  bills: BillItem[] = [],
  closedMonths: string[] = []
): FinancialHealthMetrics => {
  const cleanBalance = Math.max(0, currentTotalBalance);

  // Current month string (e.g. '2026-08')
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  // Evaluate only transactions in the current month that are not closed
  const currentMonthActiveTxs = transactions.filter((t) => {
    const m = (t.date || '').slice(0, 7);
    return m === currentMonthStr && !closedMonths.includes(m);
  });

  // If current month is closed or has no transactions yet, reset score to 0 (Fresh / Awal Bulan)
  if (currentMonthActiveTxs.length === 0 || closedMonths.includes(currentMonthStr)) {
    return {
      score: 0,
      status: 'good',
      statusLabel: 'Awal Bulan / Ter-reset',
      profitMargin: 0,
      expenseRatio: 0,
      cashRunwayDays: 0,
      debtRiskRatio: 0,
      strengths: ['Bulan baru dimulai atau baru saja tutup buku. Skor siap dihitung dari nol.'],
      recommendations: ['Mulai catat transaksi pemasukan & pengeluaran bulan ini untuk menganalisis skor kesehatan keuangan terbaru.'],
    };
  }

  const relevantTxs = currentMonthActiveTxs;

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



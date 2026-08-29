import { Category, Transaction, PaymentAccount, AccountInfo, SyncSettings, BillItem } from '../types';
import { getTodayDateString } from '../utils/formatters';

export const DEFAULT_CATEGORIES: Category[] = [
  // Pengeluaran (Cash Out)
  { id: 'cat-stok', name: 'Belanja Stok Grosir', type: 'cash_out', icon: 'ShoppingCart', color: '#EF4444', monthlyBudget: 5000000 },
  { id: 'cat-tagihan', name: 'Listrik & Sewa Warung', type: 'cash_out', icon: 'Receipt', color: '#6366F1', monthlyBudget: 1000000 },
  { id: 'cat-transport', name: 'Bensin & Transport Kulakan', type: 'cash_out', icon: 'Car', color: '#F59E0B', monthlyBudget: 500000 },
  { id: 'cat-pribadi', name: 'Prive / Ambil Kas Pribadi', type: 'cash_out', icon: 'Utensils', color: '#EC4899', monthlyBudget: 1500000 },
  { id: 'cat-lain-out', name: 'Lain-lain (Pengeluaran)', type: 'cash_out', icon: 'MoreHorizontal', color: '#6B7280' },

  // Pemasukan (Cash In)
  { id: 'cat-penjualan', name: 'Penjualan / Omset Warung', type: 'cash_in', icon: 'Store', color: '#10B981' },
  { id: 'cat-modal', name: 'Tambahan Modal Kas', type: 'cash_in', icon: 'Briefcase', color: '#3B82F6' },
  { id: 'cat-lain-in', name: 'Lain-lain (Pemasukan)', type: 'cash_in', icon: 'ArrowDownLeft', color: '#06B6D4' },
];

export const INITIAL_ACCOUNTS: AccountInfo[] = [
  { id: 'cash', name: 'Laci Kasir / Tunai', iconName: 'Wallet', balance: 0 },
  { id: 'bank', name: 'Bank Transfer / QRIS', iconName: 'Building2', balance: 0 },
  { id: 'ewallet', name: 'E-Wallet (GoPay/OVO/DANA)', iconName: 'Smartphone', balance: 0 },
  { id: 'credit', name: 'Kartu Kredit / Hutang Supplier', iconName: 'CreditCard', balance: 0 },
];

export const INITIAL_SYNC_SETTINGS: SyncSettings = {
  autoSync: false,
  cloudSyncEnabled: false,
  googleSheetsWebhookUrl: '',
};

export const INITIAL_BILLS: BillItem[] = [
  {
    id: 'bill-1',
    title: 'Listrik & Token PLN',
    amount: 250000,
    categoryName: 'Listrik & Sewa Warung',
    dueDateDay: 20,
    repeatPeriod: 'monthly',
    account: 'bank',
    status: 'unpaid',
    notes: 'ID Pelanggan PLN Warung',
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'bill-2',
    title: 'Sewa Kios / Tempat',
    amount: 750000,
    categoryName: 'Listrik & Sewa Warung',
    dueDateDay: 25,
    repeatPeriod: 'monthly',
    account: 'bank',
    status: 'unpaid',
    notes: 'Transfer pemilik ruko',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'bill-3',
    title: 'WiFi & Internet Kasir',
    amount: 150000,
    categoryName: 'Listrik & Sewa Warung',
    dueDateDay: 15,
    repeatPeriod: 'monthly',
    account: 'ewallet',
    status: 'unpaid',
    notes: 'IndiHome / Biznet',
    createdAt: Date.now() - 86400000 * 2,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const DEFAULT_OPEN_BALANCE = 0; // Modal Awal Kosong


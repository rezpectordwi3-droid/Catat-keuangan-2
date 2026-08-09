export type TransactionType = 'cash_in' | 'cash_out';

export type PaymentAccount = 'cash' | 'bank' | 'ewallet' | 'credit';

export interface AccountInfo {
  id: PaymentAccount;
  name: string;
  iconName: string;
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string; // Tailwind color class or hex
  monthlyBudget?: number; // Optional budget for cash_out categories
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  account: PaymentAccount;
  notes: string;
  createdAt: number;
}

export interface DailyBalance {
  date: string; // YYYY-MM-DD
  openBalance: number;
  cashIn: number;
  cashOut: number;
  totalBalance: number;
}

export interface SyncSettings {
  googleSheetsWebhookUrl?: string;
  autoSync: boolean;
  lastSyncTime?: string;
  cloudSyncEnabled: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  provider: 'google' | 'phone';
  verified: boolean;
  createdAt: number;
}

export interface DebtItem {
  id: string;
  customerName: string;
  phone?: string;
  type: 'receivable' | 'payable'; // 'receivable' = Pelanggan Kasbon (Piutang Warung), 'payable' = Hutang Supplier
  amount: number;
  dueDate: string;
  notes?: string;
  status: 'unpaid' | 'paid';
  createdAt: number;
  paidAt?: number;
}

export type ViewTab = 'dashboard' | 'analytics' | 'categories' | 'kasbon' | 'accounts' | 'export' | 'sync' | 'features';

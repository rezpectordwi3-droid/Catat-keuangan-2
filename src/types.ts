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

export interface BillItem {
  id: string;
  title: string;
  amount: number;
  categoryName: string;
  dueDateDay: number; // 1 - 31 (day of month for recurring bill)
  repeatPeriod: 'monthly' | 'weekly' | 'yearly' | 'once';
  account: PaymentAccount;
  status: 'unpaid' | 'paid';
  lastPaidDate?: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
}

export interface FinancialHealthMetrics {
  score: number; // 0 - 100
  status: 'excellent' | 'good' | 'warning' | 'critical';
  statusLabel: string;
  profitMargin: number; // percentage
  expenseRatio: number; // percentage
  cashRunwayDays: number; // estimated days of runway
  debtRiskRatio: number; // percentage of debt vs cash
  strengths: string[];
  recommendations: string[];
}

export interface ClosedMonthSnapshot {
  month: string; // e.g. '2026-08'
  closedAt: number;
  openBalance: number;
  cashIn: number;
  cashOut: number;
  totalBalance: number;
  transactionCount?: number;
  isAutoClosed?: boolean;
}

export interface AutoCloseConfig {
  enabled: boolean;
  carryOverMode: 'zero' | 'rollover'; // 'zero' = mulai dari nol (clean slate), 'rollover' = teruskan saldo akhir
  lastAutoClosedMonth?: string;
  lastAutoClosedAt?: number;
}

export interface MonthEndForecast {
  daysInMonth: number;
  currentDay: number;
  daysRemaining: number;
  isLastDay: boolean;
  dailyAvgExpense: number;
  dailyAvgIncome: number;
  projectedRemainingExpense: number;
  projectedRemainingIncome: number;
  pendingBillsAmount: number;
  projectedFinalBalance: number;
  status: 'surplus' | 'moderate' | 'deficit_risk';
  advice: string;
  safeDailyBudget: number;
}

export type MenuCategory = 'makanan' | 'minuman' | 'tambahan' | 'produk' | 'jasa' | 'lainnya';

export interface StoreProfile {
  name: string;
  phone?: string;
  address?: string;
  tagline?: string;
  footerMessage?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  defaultPrice: number;
  icon?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  qty: number;
}

export interface OrderBill {
  id: string; // e.g. "NOTA-20260928-001"
  orderNumber: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName: string;
  customerPhone?: string;
  tableNumber?: string;
  orderType: 'dine_in' | 'take_away';
  totalCustomers: number; // Total customer / orang yang belanja atau makan di sini
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'qris' | 'bank' | 'kasbon';
  cashTendered?: number;
  changeAmount?: number;
  status: 'paid' | 'kasbon';
  notes?: string;
  createdAt: number;
}

export type ViewTab =
  | 'dashboard'
  | 'nota'
  | 'bills'
  | 'health'
  | 'kasbon'
  | 'accounts'
  | 'analytics'
  | 'export'
  | 'categories'
  | 'sync'
  | 'features'
  | 'tips';


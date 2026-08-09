import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { formatRupiah, formatCompactRupiah, formatDateShort } from '../utils/formatters';
import { TrendingUp, TrendingDown, PieChart as PieIcon, BarChart2, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories: Category[];
}

interface PieChartItem {
  name: string;
  value: number;
  color: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, categories }) => {
  const [analyticsMode, setAnalyticsMode] = useState<'weekly' | 'monthly'>('weekly');

  // Helper for category map
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // --- WEEKLY DATA PREPARATION ---
  // Get last 7 days including today
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
      days.push({
        dateStr,
        label: `${dayName} (${day}/${month})`,
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  const weeklyChartData = last7Days.map((day) => {
    const dayTxs = transactions.filter((t) => t.date === day.dateStr);
    const cashIn = dayTxs.filter((t) => t.type === 'cash_in').reduce((s, t) => s + t.amount, 0);
    const cashOut = dayTxs.filter((t) => t.type === 'cash_out').reduce((s, t) => s + t.amount, 0);

    return {
      name: day.label,
      Pemasukan: cashIn,
      Pengeluaran: cashOut,
    };
  });

  const totalWeeklyCashIn = weeklyChartData.reduce((s, d) => s + d.Pemasukan, 0);
  const totalWeeklyCashOut = weeklyChartData.reduce((s, d) => s + d.Pengeluaran, 0);
  const avgDailyExpense = Math.round(totalWeeklyCashOut / 7);

  // Find day with highest spending
  const maxSpendDay = [...weeklyChartData].sort((a, b) => b.Pengeluaran - a.Pengeluaran)[0];

  // --- MONTHLY DATA PREPARATION ---
  // Filter transactions for current month
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(currentMonthStr));

  // Expense breakdown by category for monthly pie chart
  const categoryExpenseTotals: Record<string, number> = {};
  currentMonthTxs
    .filter((t) => t.type === 'cash_out')
    .forEach((t) => {
      categoryExpenseTotals[t.categoryId] = (categoryExpenseTotals[t.categoryId] || 0) + t.amount;
    });

  const pieChartData: PieChartItem[] = Object.keys(categoryExpenseTotals)
    .map((catId) => {
      const cat = categoryMap.get(catId);
      return {
        name: cat ? cat.name : 'Lain-lain',
        value: categoryExpenseTotals[catId],
        color: cat ? cat.color : '#6B7280',
      };
    })
    .sort((a, b) => b.value - a.value);

  const totalMonthlyCashOut = currentMonthTxs
    .filter((t) => t.type === 'cash_out')
    .reduce((s, t) => s + t.amount, 0);

  const totalMonthlyCashIn = currentMonthTxs
    .filter((t) => t.type === 'cash_in')
    .reduce((s, t) => s + t.amount, 0);

  // Category Budget Progress Analysis
  const expenseCategories = categories.filter((c) => c.type === 'cash_out');
  const budgetProgress = expenseCategories.map((cat) => {
    const spent = categoryExpenseTotals[cat.id] || 0;
    const budget = cat.monthlyBudget || 0;
    const percentage = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
    return {
      ...cat,
      spent,
      budget,
      percentage,
      isOverBudget: budget > 0 && spent > budget,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Grafik Analisis Keuangan</h2>
          <p className="text-xs text-slate-500">Visualisasi arus kas harian, mingguan, dan bulanan</p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-2xl space-x-1">
          <button
            onClick={() => setAnalyticsMode('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              analyticsMode === 'weekly'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analisis Mingguan</span>
          </button>
          <button
            onClick={() => setAnalyticsMode('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              analyticsMode === 'monthly'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-4 h-4" />
            <span>Analisis Bulanan</span>
          </button>
        </div>
      </div>

      {/* WEEKLY ANALYTICS VIEW */}
      {analyticsMode === 'weekly' && (
        <div className="space-y-6">
          
          {/* Weekly Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase">Pemasukan 7 Hari Terakhir</span>
              <div className="text-lg font-black text-emerald-600 mt-1">
                + {formatRupiah(totalWeeklyCashIn)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase">Pengeluaran 7 Hari Terakhir</span>
              <div className="text-lg font-black text-rose-600 mt-1">
                - {formatRupiah(totalWeeklyCashOut)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase">Rata-Rata Pengeluaran/Hari</span>
              <div className="text-lg font-black text-slate-900 mt-1">
                {formatRupiah(avgDailyExpense)}
              </div>
            </div>
          </div>

          {/* Weekly Bar Chart */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Arus Kas 7 Hari Terakhir (Cash In vs Cash Out)</h3>
                <p className="text-xs text-slate-500">Perbandingan pemasukan dan pengeluaran harian</p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tickFormatter={(v) => formatCompactRupiah(v)} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(value: number) => [formatRupiah(value), '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar dataKey="Pemasukan" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Insight Box */}
          {maxSpendDay && maxSpendDay.Pengeluaran > 0 && (
            <div className="bg-slate-900 text-white p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Pengeluaran Tertinggi Mingguan</h4>
                  <p className="text-xs text-slate-300">
                    Hari <span className="font-bold text-white">{maxSpendDay.name}</span> mencatatkan pengeluaran terbesar yaitu{' '}
                    <span className="font-bold text-amber-400">{formatRupiah(maxSpendDay.Pengeluaran)}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* MONTHLY ANALYTICS VIEW */}
      {analyticsMode === 'monthly' && (
        <div className="space-y-6">
          
          {/* Monthly Comparison Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pie Chart: Expenses by Category */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Proporsi Pengeluaran per Kategori</h3>
                <p className="text-xs text-slate-500">Persentase alokasi pengeluaran bulan ini</p>
              </div>

              {pieChartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  Belum ada pengeluaran di bulan ini
                </div>
              ) : (
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [formatRupiah(value), 'Total']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Category Legend List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                {pieChartData.map((item, idx) => {
                  const pct = totalMonthlyCashOut > 0 ? ((item.value / totalMonthlyCashOut) * 100).toFixed(1) : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">{pct}% ({formatCompactRupiah(item.value)})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Budget Tracker Progress Bars */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Target & Anggaran Kategori (Monthly Budget)</h3>
                <p className="text-xs text-slate-500">Pemantauan batas pengeluaran bulanan</p>
              </div>

              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {budgetProgress.map((item) => (
                  <div key={item.id} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{item.name}</span>
                      <span className="text-slate-600">
                        {formatRupiah(item.spent)} / {item.budget > 0 ? formatRupiah(item.budget) : 'Tanpa Batas'}
                      </span>
                    </div>

                    {item.budget > 0 && (
                      <div className="space-y-1">
                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.isOverBudget
                                ? 'bg-rose-600'
                                : item.percentage > 80
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={item.isOverBudget ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                            {item.isOverBudget ? '⚠️ Melebihi Anggaran!' : `${item.percentage}% terpakai`}
                          </span>
                          <span className="text-slate-400">
                            Sisa: {formatRupiah(Math.max(item.budget - item.spent, 0))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

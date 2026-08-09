import React, { useState } from 'react';
import { Category, TransactionType } from '../types';
import { Plus, Trash2, Edit2, Check, X, Utensils, Car, ShoppingCart, Receipt, Tv, HeartPulse, GraduationCap, MoreHorizontal, Briefcase, Store, Gift, TrendingUp, ArrowDownLeft } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

const AVAILABLE_ICONS = [
  'Utensils',
  'Car',
  'ShoppingCart',
  'Receipt',
  'Tv',
  'HeartPulse',
  'GraduationCap',
  'Briefcase',
  'Store',
  'Gift',
  'TrendingUp',
  'ArrowDownLeft',
  'MoreHorizontal',
];

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6B7280', // Gray
];

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [activeType, setActiveType] = useState<TransactionType>('cash_out');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Utensils');
  const [color, setColor] = useState('#10B981');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('');

  const filteredCategories = categories.filter((c) => c.type === activeType);

  const resetForm = () => {
    setName('');
    setIcon('Utensils');
    setColor('#10B981');
    setMonthlyBudget('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setMonthlyBudget(cat.monthlyBudget ? String(cat.monthlyBudget) : '');
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Nama kategori tidak boleh kosong');
      return;
    }

    const budgetNum = monthlyBudget ? Number(monthlyBudget.replace(/[^0-9]/g, '')) : undefined;

    if (editingId) {
      onUpdateCategory({
        id: editingId,
        name: name.trim(),
        type: activeType,
        icon,
        color,
        monthlyBudget: budgetNum,
      });
    } else {
      onAddCategory({
        name: name.trim(),
        type: activeType,
        icon,
        color,
        monthlyBudget: budgetNum,
      });
    }

    resetForm();
  };

  const renderIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'Car': return <Car className="w-4 h-4" />;
      case 'ShoppingCart': return <ShoppingCart className="w-4 h-4" />;
      case 'Receipt': return <Receipt className="w-4 h-4" />;
      case 'Tv': return <Tv className="w-4 h-4" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'Store': return <Store className="w-4 h-4" />;
      case 'Gift': return <Gift className="w-4 h-4" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4" />;
      case 'ArrowDownLeft': return <ArrowDownLeft className="w-4 h-4" />;
      default: return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Type Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Kelola Kategori & Anggaran</h2>
          <p className="text-xs text-slate-500">Kustomisasi kategori pemasukan, pengeluaran & batas anggaran</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl space-x-1">
            <button
              onClick={() => { setActiveType('cash_out'); resetForm(); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeType === 'cash_out' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => { setActiveType('cash_in'); resetForm(); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeType === 'cash_in' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Pemasukan
            </button>
          </div>

          <button
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Kategori Baru</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Category Modal Form Card */}
      {(isAdding || editingId) && (
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-300 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama Kategori</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Tabungan, Hewan Peliharaan..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            {activeType === 'cash_out' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Target Anggaran Bulanan (Rp)</label>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="misal: 1000000 (Kosongkan jika tanpa batas)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Pilih Warna Badge</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Pilih Ikon</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-xl border text-slate-700 transition cursor-pointer ${
                    icon === ic ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {renderIconComponent(ic)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Kategori</span>
            </button>
          </div>
        </div>
      )}

      {/* Category List Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between group hover:border-slate-300 transition"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold"
                style={{ backgroundColor: cat.color }}
              >
                {renderIconComponent(cat.icon)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{cat.name}</h4>
                {cat.monthlyBudget ? (
                  <p className="text-[11px] text-slate-500">
                    Batas: <span className="font-semibold text-slate-700">{formatRupiah(cat.monthlyBudget)}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Tanpa Batas Anggaran</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => handleStartEdit(cat)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`)) {
                    onDeleteCategory(cat.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

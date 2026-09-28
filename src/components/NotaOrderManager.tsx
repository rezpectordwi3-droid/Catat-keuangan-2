import React, { useState } from 'react';
import { MenuItem, OrderBill, OrderItem, Transaction, DebtItem, StoreProfile, MenuCategory } from '../types';
import { formatRupiah, formatCompactRupiah } from '../utils/formatters';
import { generateWhatsAppNotaText, DEFAULT_MENU_ITEMS, DEFAULT_STORE_PROFILE } from '../utils/storage';
import {
  Receipt,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  Users,
  Utensils,
  Coffee,
  Sparkles,
  ShoppingBag,
  Clock,
  Search,
  MessageCircle,
  Edit2,
  RotateCcw,
  Tag,
  User,
  Phone,
  Table as TableIcon,
  ShieldCheck,
  Settings,
  Store,
  MapPin,
  X,
  Package,
  Wrench,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { ReceiptImageModal } from './ReceiptImageModal';

interface NotaOrderManagerProps {
  menuItems: MenuItem[];
  onUpdateMenuItems: (items: MenuItem[]) => void;
  orderBills: OrderBill[];
  onSaveOrderBill: (bill: OrderBill) => void;
  onRecordTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onRecordKasbon: (debt: Omit<DebtItem, 'id' | 'createdAt'>) => void;
  onPrintBill: (bill: OrderBill) => void;
  storeProfile?: StoreProfile;
  onUpdateStoreProfile?: (profile: StoreProfile) => void;
}

export const NotaOrderManager: React.FC<NotaOrderManagerProps> = ({
  menuItems,
  onUpdateMenuItems,
  orderBills,
  onSaveOrderBill,
  onRecordTransaction,
  onRecordKasbon,
  onPrintBill,
  storeProfile = DEFAULT_STORE_PROFILE,
  onUpdateStoreProfile,
}) => {
  // Active Tab: 'pos' (Buat Nota Baru) | 'history' (Riwayat Nota) | 'menu_manage' (Kelola Menu)
  const [activeSubTab, setActiveSubTab] = useState<'pos' | 'history' | 'menu_manage'>('pos');

  // Menu Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Current Order State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [totalCustomers, setTotalCustomers] = useState<number>(1);
  const [orderType, setOrderType] = useState<'dine_in' | 'take_away'>('dine_in');
  const [tableNumber, setTableNumber] = useState('1');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'bank' | 'kasbon'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [imageModalBill, setImageModalBill] = useState<OrderBill | null>(null);

  // Price Editing state inside order bill table
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Modal: Store Profile / Header Settings
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<StoreProfile>(storeProfile);

  // Modal: Add / Edit Menu Item
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [menuFormName, setMenuFormName] = useState('');
  const [menuFormCategory, setMenuFormCategory] = useState<MenuCategory>('makanan');
  const [menuFormPrice, setMenuFormPrice] = useState<number>(10000);
  const [menuFormNotes, setMenuFormNotes] = useState('');

  // Calculations
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = Math.max(0, subtotal - discountAmount);
  const changeAmount = paymentMethod === 'cash' && cashTendered > 0 ? Math.max(0, cashTendered - total) : 0;
  const spendPerPax = totalCustomers > 0 ? Math.round(total / totalCustomers) : total;

  // Add Item to Order
  const handleAddItem = (menu: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === menu.id);
      if (existing) {
        return prev.map((i) =>
          i.id === menu.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: menu.id,
          name: menu.name,
          category: menu.category,
          price: menu.defaultPrice,
          qty: 1,
        },
      ];
    });
  };

  // Modify Item Quantity
  const handleUpdateQty = (itemId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((i) => {
          if (i.id === itemId) {
            const nextQty = i.qty + delta;
            return nextQty > 0 ? { ...i, qty: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  // Change Item Price in Current Bill
  const handleUpdateItemPrice = (itemId: string, newPrice: number) => {
    setOrderItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, price: Math.max(0, newPrice) } : i))
    );
    setEditingItemId(null);
  };

  // Remove Item
  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Reset Form
  const handleResetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setTotalCustomers(1);
    setOrderType('dine_in');
    setTableNumber('1');
    setOrderItems([]);
    setDiscountAmount(0);
    setCashTendered(0);
    setOrderNotes('');
  };

  // Construct current bill object
  const buildCurrentBill = (): OrderBill => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    const orderNum = orderBills.length + 1;
    const billId = `NOTA-${yyyy}${mm}${dd}-${String(orderNum).padStart(3, '0')}`;

    return {
      id: billId,
      orderNumber: orderNum,
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}:${min}`,
      customerName: customerName.trim() || 'Pelanggan',
      customerPhone: customerPhone.trim() || undefined,
      tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
      orderType,
      totalCustomers: Math.max(1, totalCustomers),
      items: orderItems,
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
      cashTendered: paymentMethod === 'cash' ? cashTendered : undefined,
      changeAmount: paymentMethod === 'cash' ? changeAmount : undefined,
      status: paymentMethod === 'kasbon' ? 'kasbon' : 'paid',
      notes: orderNotes.trim() || undefined,
      createdAt: Date.now(),
    };
  };

  // Save Order and record to Financial Transactions or Kasbon
  const handleSaveAndComplete = (autoWhatsApp = false) => {
    if (orderItems.length === 0) {
      alert('Pilih minimal 1 menu makanan/minuman terlebih dahulu!');
      return;
    }

    const bill = buildCurrentBill();

    // 1. Save Order Bill to storage
    onSaveOrderBill(bill);

    // 2. Record to Cash In Transactions
    if (paymentMethod !== 'kasbon') {
      const itemsSummary = bill.items.map((i) => `${i.qty}x ${i.name}`).join(', ');
      onRecordTransaction({
        date: bill.date,
        time: bill.time,
        type: 'cash_in',
        amount: bill.total,
        categoryId: 'cat_warung_sales',
        categoryName: 'Penjualan Warung / Makanan',
        account: paymentMethod === 'cash' ? 'cash' : paymentMethod === 'qris' ? 'ewallet' : 'bank',
        notes: `Nota ${bill.id}: ${itemsSummary} (${bill.customerName} - ${bill.totalCustomers} org)`,
      });
    } else {
      // 3. Record to Kasbon if unpaid
      onRecordKasbon({
        customerName: bill.customerName,
        phone: bill.customerPhone,
        type: 'receivable',
        amount: bill.total,
        dueDate: bill.date,
        notes: `Nota ${bill.id}: ${bill.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}`,
        status: 'unpaid',
      });
    }

    // 4. WhatsApp Send
    if (autoWhatsApp) {
      handleSendWhatsApp(bill);
    }

    setToastMessage(`✓ Nota ${bill.id} berhasil dicatat & masuk ke kasir!`);
    setTimeout(() => setToastMessage(null), 3500);

    handleResetForm();
  };

  // Open Image Receipt (Anti-Tamper PNG Card)
  const handleOpenImageReceipt = (billToOpen?: OrderBill) => {
    if (billToOpen) {
      setImageModalBill(billToOpen);
      return;
    }

    if (orderItems.length === 0) {
      alert('Pilih minimal 1 menu makanan/minuman terlebih dahulu!');
      return;
    }

    const bill = buildCurrentBill();

    // Auto-save bill so it doesn't get lost
    onSaveOrderBill(bill);

    // Record to cash transactions if paid
    if (paymentMethod !== 'kasbon') {
      const itemsSummary = bill.items.map((i) => `${i.qty}x ${i.name}`).join(', ');
      onRecordTransaction({
        date: bill.date,
        time: bill.time,
        type: 'cash_in',
        amount: bill.total,
        categoryId: 'cat_warung_sales',
        categoryName: 'Penjualan Warung / Makanan',
        account: paymentMethod === 'cash' ? 'cash' : paymentMethod === 'qris' ? 'ewallet' : 'bank',
        notes: `Nota ${bill.id}: ${itemsSummary} (${bill.customerName} - ${bill.totalCustomers} org)`,
      });
    } else {
      onRecordKasbon({
        customerName: bill.customerName,
        phone: bill.customerPhone,
        type: 'receivable',
        amount: bill.total,
        dueDate: bill.date,
        notes: `Nota ${bill.id}: ${bill.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}`,
        status: 'unpaid',
      });
    }

    setImageModalBill(bill);
    setToastMessage(`✓ Nota ${bill.id} tersimpan! Menampilkan gambar struk.`);
    setTimeout(() => setToastMessage(null), 3000);
    handleResetForm();
  };

  // Send WhatsApp Text
  const handleSendWhatsApp = (bill: OrderBill) => {
    const text = generateWhatsAppNotaText(bill, storeProfile);
    const encoded = encodeURIComponent(text);
    let url = `https://wa.me/?text=${encoded}`;
    if (bill.customerPhone) {
      let cleanPhone = bill.customerPhone.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.slice(1);
      }
      url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    }
    window.open(url, '_blank');
  };

  // Open Add Menu Modal
  const handleOpenAddMenuModal = () => {
    setEditingMenuId(null);
    setMenuFormName('');
    setMenuFormCategory('makanan');
    setMenuFormPrice(10000);
    setMenuFormNotes('');
    setIsMenuModalOpen(true);
  };

  // Open Edit Menu Modal
  const handleOpenEditMenuModal = (item: MenuItem) => {
    setEditingMenuId(item.id);
    setMenuFormName(item.name);
    setMenuFormCategory(item.category);
    setMenuFormPrice(item.defaultPrice);
    setMenuFormNotes(item.notes || '');
    setIsMenuModalOpen(true);
  };

  // Save Menu Item (Add or Update)
  const handleSaveMenuItem = () => {
    if (!menuFormName.trim()) {
      alert('Nama menu/produk tidak boleh kosong!');
      return;
    }
    if (menuFormPrice < 0) {
      alert('Harga tidak boleh negatif!');
      return;
    }

    if (editingMenuId) {
      // Update existing item
      const updated = menuItems.map((m) =>
        m.id === editingMenuId
          ? {
              ...m,
              name: menuFormName.trim(),
              category: menuFormCategory,
              defaultPrice: Number(menuFormPrice),
              notes: menuFormNotes.trim() || undefined,
            }
          : m
      );
      onUpdateMenuItems(updated);
      setToastMessage(`✓ Menu "${menuFormName.trim()}" berhasil diperbarui!`);
    } else {
      // Add new item
      const newItem: MenuItem = {
        id: `menu_${Date.now()}`,
        name: menuFormName.trim(),
        category: menuFormCategory,
        defaultPrice: Number(menuFormPrice),
        notes: menuFormNotes.trim() || undefined,
        icon:
          menuFormCategory === 'makanan'
            ? 'Soup'
            : menuFormCategory === 'minuman'
            ? 'Coffee'
            : menuFormCategory === 'produk'
            ? 'Package'
            : menuFormCategory === 'jasa'
            ? 'Wrench'
            : 'Sparkles',
      };
      onUpdateMenuItems([...menuItems, newItem]);
      setToastMessage(`✓ Menu baru "${newItem.name}" berhasil ditambahkan!`);
    }

    setIsMenuModalOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Delete Menu Item
  const handleDeleteMenuItem = (itemId: string, itemName: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus "${itemName}" dari daftar menu?`);
    if (!confirmDelete) return;

    const filtered = menuItems.filter((m) => m.id !== itemId);
    onUpdateMenuItems(filtered);
    setToastMessage(`✓ Menu "${itemName}" telah dihapus.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset to Default Menus
  const handleResetDefaultMenus = () => {
    const confirmReset = window.confirm(
      'Apakah Anda ingin mengembalikan daftar menu ke menu bawaan warung (Soto Lamongan, Rawon, Es Jeruk, Krupuk, Telur)?'
    );
    if (!confirmReset) return;

    onUpdateMenuItems(DEFAULT_MENU_ITEMS);
    setToastMessage('✓ Daftar menu dikembalikan ke menu bawaan Soto & Rawon!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save Store Profile / Header Nota Settings
  const handleSaveStoreProfile = () => {
    if (!profileForm.name.trim()) {
      alert('Nama Toko / Warung tidak boleh kosong!');
      return;
    }
    if (onUpdateStoreProfile) {
      onUpdateStoreProfile(profileForm);
    }
    setIsProfileModalOpen(false);
    setToastMessage('✓ Profil Toko & Header Nota berhasil disimpan!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Unique categories for filtering
  const availableCategories = Array.from(new Set(menuItems.map((m) => m.category)));

  // Calculate Today's Total from Order Bills
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBills = orderBills.filter((b) => b.date === todayStr);
  const todayRevenue = todayBills.filter((b) => b.status === 'paid').reduce((s, b) => s + b.total, 0);
  const todayCustomersTotal = todayBills.reduce((s, b) => s + (b.totalCustomers || 1), 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold border border-emerald-500/40 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Metrics Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full">
                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kasir & Nota Digital</span>
              </div>
              <button
                onClick={() => {
                  setProfileForm(storeProfile);
                  setIsProfileModalOpen(true);
                }}
                className="inline-flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 text-xs font-bold px-3 py-1 rounded-full transition cursor-pointer"
                title="Sesuaikan nama warung/toko, no telp, dan alamat di nota"
              >
                <Settings className="w-3 h-3 text-amber-400" />
                <span>⚙️ Header Nota & Profil Toko</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>{storeProfile.name || 'Warung Soto & Rawon'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>{storeProfile.tagline || 'Soto Lamongan, Rawon & Aneka Kuliner'}</span>
              {storeProfile.address && (
                <span className="text-slate-400 text-xs hidden sm:inline">• 📍 {storeProfile.address}</span>
              )}
              {storeProfile.phone && (
                <span className="text-slate-400 text-xs hidden sm:inline">• 📞 {storeProfile.phone}</span>
              )}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-4 py-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-300 font-semibold block uppercase">Omset Nota Hari Ini</span>
              <span className="text-base sm:text-lg font-black text-emerald-400">{formatRupiah(todayRevenue)}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-4 py-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-300 font-semibold block uppercase">Pelanggan Hari Ini</span>
              <span className="text-base sm:text-lg font-black text-amber-300">{todayCustomersTotal} Orang</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveSubTab('pos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'pos'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Nota Baru</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Riwayat Nota ({orderBills.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('menu_manage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'menu_manage'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Kelola Daftar Menu & Harga ({menuItems.length})</span>
          </button>

          <button
            onClick={() => {
              setProfileForm(storeProfile);
              setIsProfileModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 ml-auto"
          >
            <Store className="w-3.5 h-3.5 text-amber-300" />
            <span>Atur Header Toko</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: POS / BUAT NOTA BARU */}
      {activeSubTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: MENU CATALOG (7 COLS) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Category Filter */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 bg-slate-100 px-3 py-2 rounded-xl">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari menu / produk / jasa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 outline-none w-full"
                />
              </div>

              {/* Dynamic Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Semua ({menuItems.length})
                </button>

                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer capitalize flex items-center space-x-1 ${
                      selectedCategory === cat
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] opacity-70">
                      ({menuItems.filter((m) => m.category === cat).length})
                    </span>
                  </button>
                ))}

                <button
                  onClick={handleOpenAddMenuModal}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1 ml-auto"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Menu</span>
                </button>
              </div>
            </div>

            {/* Menu Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {filteredMenuItems.map((item) => {
                const selectedInBill = orderItems.find((i) => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none relative group hover:scale-[1.02] ${
                      selectedInBill
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    {/* Qty Badge if already selected */}
                    {selectedInBill && (
                      <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-scale-up">
                        {selectedInBill.qty}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            item.category === 'makanan'
                              ? 'bg-amber-100 text-amber-800'
                              : item.category === 'minuman'
                              ? 'bg-blue-100 text-blue-800'
                              : item.category === 'produk'
                              ? 'bg-purple-100 text-purple-800'
                              : item.category === 'jasa'
                              ? 'bg-cyan-100 text-cyan-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.category}
                        </span>
                        <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 leading-snug">
                        {item.name}
                      </h4>
                      {item.notes && (
                        <p className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 rounded-md px-1.5 py-0.5 mt-1 font-semibold inline-block">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-700">
                        {formatRupiah(item.defaultPrice)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        + Tambah
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Custom Menu Button */}
            <div className="pt-2">
              <button
                onClick={handleOpenAddMenuModal}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>+ Tambah Menu / Produk Baru untuk Toko Anda</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER BILL DRAWER (5 COLS) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-md p-5 sm:p-6 space-y-5 sticky top-20">
            {/* Bill Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{storeProfile.name || 'Nota Pesanan'}</h3>
                  <p className="text-[11px] text-slate-400">{storeProfile.tagline || 'Sistem Kasir Digital'}</p>
                </div>
              </div>

              {orderItems.length > 0 && (
                <button
                  onClick={handleResetForm}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Nota</span>
                </button>
              )}
            </div>

            {/* CUSTOMER & TABLE INFO INPUTS */}
            <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
              {/* Row 1: Nama Customer & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Nama Pelanggan</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nama (cth: Pak Eko)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>No. WhatsApp (Kirim Nota)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 2: Total Customer (Orang) & Order Type / Meja */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                {/* Total Customer Input */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-600" />
                    <span>Total Customer (Orang)</span>
                  </label>
                  <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-xl px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setTotalCustomers(Math.max(1, totalCustomers - 1))}
                      className="p-1 rounded-md text-slate-500 hover:bg-slate-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={totalCustomers}
                      onChange={(e) => setTotalCustomers(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-xs font-black text-center outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTotalCustomers(totalCustomers + 1)}
                      className="p-1 rounded-md text-slate-500 hover:bg-slate-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Dine In vs Take Away */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1 flex items-center gap-1">
                    <TableIcon className="w-3 h-3 text-slate-400" />
                    <span>Tipe Pesanan & Meja</span>
                  </label>
                  <div className="flex items-center space-x-1">
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as any)}
                      className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-2 py-1.5 outline-none flex-1"
                    >
                      <option value="dine_in">Makan Sini</option>
                      <option value="take_away">Bungkus</option>
                    </select>
                    {orderType === 'dine_in' && (
                      <input
                        type="text"
                        placeholder="Meja"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-14 text-xs font-black bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-center outline-none"
                        title="Nomor Meja"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ORDER ITEMS LIST TABLE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase px-1">
                <span>Menu Dipesan</span>
                <span>Jumlah & Subtotal</span>
              </div>

              {orderItems.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold">Belum ada menu yang dipilih</p>
                  <p className="text-[11px] text-slate-400">Klik menu di samping untuk menambahkan ke nota</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{item.name}</span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        {/* Harga Satuan (Bisa di-edit nominalnya jika harga khusus) */}
                        <div className="flex items-center space-x-1">
                          {editingItemId === item.id ? (
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] text-slate-400">Rp</span>
                              <input
                                type="number"
                                defaultValue={item.price}
                                onBlur={(e) => handleUpdateItemPrice(item.id, Number(e.target.value))}
                                className="w-20 text-xs font-bold border border-emerald-400 rounded-md px-1.5 py-0.5 outline-none"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingItemId(item.id)}
                              title="Klik untuk ubah nominal harga satuan"
                              className="text-[11px] text-slate-500 font-bold hover:text-emerald-700 flex items-center space-x-1 cursor-pointer"
                            >
                              <span>@ {formatRupiah(item.price)}</span>
                              <Edit2 className="w-2.5 h-2.5 text-slate-400" />
                            </button>
                          )}
                        </div>

                        {/* Qty Controls & Subtotal */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-0.5">
                            <button
                              onClick={() => handleUpdateQty(item.id, -1)}
                              className="w-5 h-5 rounded-md bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-black">{item.qty}</span>
                            <button
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className="w-5 h-5 rounded-md bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-black text-slate-900 w-20 text-right">
                            {formatRupiah(item.price * item.qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TOTAL & CALCULATIONS */}
            {orderItems.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2.5 text-xs">
                {/* Subtotal */}
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal Pesanan:</span>
                  <span className="font-bold text-slate-900">{formatRupiah(subtotal)}</span>
                </div>

                {/* Diskon Optional */}
                <div className="flex items-center justify-between text-slate-600">
                  <span>Potongan / Diskon:</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-slate-400">-Rp</span>
                    <input
                      type="number"
                      value={discountAmount || ''}
                      placeholder="0"
                      onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                      className="w-20 text-xs font-bold text-right border border-slate-200 rounded-lg px-1.5 py-0.5 outline-none"
                    />
                  </div>
                </div>

                {/* Grand Total */}
                <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-900 uppercase block">Total Pembayaran</span>
                    <span className="text-[10px] text-emerald-700">
                      Rata-rata: <strong>{formatRupiah(spendPerPax)}</strong> / orang ({totalCustomers} org)
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight">
                    {formatRupiah(total)}
                  </span>
                </div>

                {/* METODE PEMBAYARAN */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Metode Pembayaran:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'cash', label: 'Tunai' },
                      { id: 'qris', label: 'QRIS' },
                      { id: 'bank', label: 'Transfer' },
                      { id: 'kasbon', label: 'Kasbon' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`py-1.5 rounded-xl text-xs font-extrabold text-center transition cursor-pointer border ${
                          paymentMethod === m.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Tendered & Kembalian Calculator */}
                {paymentMethod === 'cash' && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Uang Diterima:</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-bold text-slate-400">Rp</span>
                        <input
                          type="number"
                          value={cashTendered || ''}
                          placeholder={String(total)}
                          onChange={(e) => setCashTendered(Number(e.target.value))}
                          className="w-28 text-xs font-black text-right border border-slate-300 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Quick Cash Buttons */}
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setCashTendered(total)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Uang Pas
                      </button>
                      {[50000, 100000, 150000, 200000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCashTendered(amt)}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100"
                        >
                          {formatCompactRupiah(amt)}
                        </button>
                      ))}
                    </div>

                    {cashTendered > 0 && (
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-xs">
                        <span className="font-bold text-slate-600">Kembalian:</span>
                        <span className="font-black text-emerald-700 text-sm">
                          {formatRupiah(changeAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="space-y-2 pt-2">
                  {/* Primary Save & Record to Cash */}
                  <button
                    onClick={() => handleSaveAndComplete(false)}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-2xl font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Selesaikan & Catat Kas Masuk</span>
                  </button>

                  {/* Anti-Tamper Image Receipt Button */}
                  <button
                    onClick={() => handleOpenImageReceipt()}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center space-x-2 cursor-pointer border border-emerald-500/30"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    <span>📸 Kirim Gambar Struk ke WA (Anti-Manipulasi)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Preview / Print Thermal */}
                    <button
                      onClick={() => {
                        const bill = buildCurrentBill();
                        onPrintBill(bill);
                      }}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-700" />
                      <span>Cetak Thermal</span>
                    </button>

                    {/* Kirim Teks WA Biasa */}
                    <button
                      onClick={() => handleSaveAndComplete(true)}
                      className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kirim Teks WA</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RIWAYAT NOTA PESANAN */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Riwayat Nota Pelanggan Terakhir
              </h3>
              <p className="text-xs text-slate-500">
                Semua struk nota yang telah diterbitkan dan tersimpan di sistem kasir.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
              Total {orderBills.length} Nota Tercatat
            </div>
          </div>

          {orderBills.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold">Belum ada riwayat nota yang diterbitkan.</p>
              <button
                onClick={() => setActiveSubTab('pos')}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
              >
                + Buat Nota Sekarang
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orderBills.slice().reverse().map((bill) => (
                <div
                  key={bill.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-2xl transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {bill.id}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {bill.date} • {bill.time} WIB
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                          bill.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {bill.status === 'paid' ? `Lunas (${bill.paymentMethod})` : 'Kasbon'}
                      </span>
                    </div>

                    <div className="text-sm font-extrabold text-slate-900">
                      {bill.customerName} {bill.tableNumber ? `(Meja ${bill.tableNumber})` : `(${bill.orderType === 'dine_in' ? 'Makan Sini' : 'Bungkus'})`} • {bill.totalCustomers || 1} Orang
                    </div>

                    <p className="text-xs text-slate-500">
                      {bill.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-start md:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Tagihan</span>
                      <span className="text-base font-black text-emerald-700">{formatRupiah(bill.total)}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenImageReceipt(bill)}
                        title="Lihat / Kirim Gambar Struk Resmi (Anti-Manipulasi)"
                        className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs flex items-center space-x-1 text-xs font-bold"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-200" />
                        <span className="hidden sm:inline">Gambar Struk</span>
                      </button>
                      <button
                        onClick={() => handleSendWhatsApp(bill)}
                        title="Kirim Teks ke WhatsApp"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onPrintBill(bill)}
                        title="Cetak Struk Ulang (Thermal)"
                        className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: KELOLA DAFTAR HARGA MENU & FULL CRUD */}
      {activeSubTab === 'menu_manage' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Kelola Menu & Produk Toko
              </h3>
              <p className="text-xs text-slate-500">
                Tambah, edit nama, kategori, harga, atau hapus menu agar sesuai dengan warung/toko Anda.
              </p>
            </div>
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                onClick={handleResetDefaultMenus}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                title="Kembalikan daftar ke menu bawaan warung Soto & Rawon"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Menu Bawaan</span>
              </button>
              <button
                onClick={handleOpenAddMenuModal}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Menu / Produk</span>
              </button>
            </div>
          </div>

          {/* Menu Items Grid with Edit & Delete */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition flex flex-col justify-between shadow-2xs space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        item.category === 'makanan'
                          ? 'bg-amber-100 text-amber-800'
                          : item.category === 'minuman'
                          ? 'bg-blue-100 text-blue-800'
                          : item.category === 'produk'
                          ? 'bg-purple-100 text-purple-800'
                          : item.category === 'jasa'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.category}
                    </span>

                    <span className="text-xs font-black text-emerald-700">
                      {formatRupiah(item.defaultPrice)}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 leading-snug">{item.name}</h4>
                  {item.notes && (
                    <p className="text-[11px] text-slate-500 mt-1 italic leading-tight">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditMenuModal(item)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      title="Edit menu ini"
                    >
                      <Edit2 className="w-3 h-3 text-slate-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item.id, item.name)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs transition cursor-pointer"
                      title="Hapus menu ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT MENU ITEM (POPUPS OVER ANY TAB)                       */}
      {/* ========================================================================= */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsMenuModalOpen(false)} />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 p-5 sm:p-6 space-y-4 animate-slide-up border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    {editingMenuId ? 'Edit Menu / Produk' : 'Tambah Menu / Produk Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingMenuId ? 'Perbarui rincian menu yang sudah ada' : 'Masukkan menu makanan, minuman, atau barang toko'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Menu / Produk:</label>
                <input
                  type="text"
                  placeholder="Contoh: Soto Lamongan, Nasi Putih, Kopi Susu, Biskuit..."
                  value={menuFormName}
                  onChange={(e) => setMenuFormName(e.target.value)}
                  className="w-full font-bold border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori:</label>
                  <select
                    value={menuFormCategory}
                    onChange={(e) => setMenuFormCategory(e.target.value as MenuCategory)}
                    className="w-full font-bold border border-slate-300 rounded-xl p-2.5 outline-none bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="makanan">🍲 Makanan Utama</option>
                    <option value="minuman">🍹 Minuman</option>
                    <option value="tambahan">🌾 Tambahan / Pelengkap</option>
                    <option value="produk">📦 Produk / Sembako</option>
                    <option value="jasa">🛠️ Jasa / Layanan</option>
                    <option value="lainnya">🔖 Lainnya / Umum</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harga Satuan (Rp):</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    placeholder="Contoh: 15000"
                    value={menuFormPrice || ''}
                    onChange={(e) => setMenuFormPrice(Number(e.target.value))}
                    className="w-full font-black border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Keterangan / Deskripsi Singkat <span className="text-slate-400 font-normal">(Opsional):</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Termasuk nasi & minum, Porsi jumbo, Kemasan 500gr..."
                  value={menuFormNotes}
                  onChange={(e) => setMenuFormNotes(e.target.value)}
                  className="w-full font-medium border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMenuModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveMenuItem}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
              >
                {editingMenuId ? 'Simpan Perubahan' : 'Tambah ke Menu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: STORE PROFILE & NOTA HEADER SETTINGS                             */}
      {/* ========================================================================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsProfileModalOpen(false)} />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 p-5 sm:p-6 space-y-4 animate-slide-up border border-slate-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    Pengaturan Header Nota & Profil Toko
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kustomisasi nama usaha, alamat, no telp, dan pesan nota untuk warung/toko Anda
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Preview Box */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center font-mono space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Pratinjau Kop Nota Struk
              </span>
              <h4 className="text-sm font-black text-slate-900 uppercase">
                {profileForm.name || 'NAMA WARUNG / TOKO ANDA'}
              </h4>
              <p className="text-[11px] text-slate-600">
                {profileForm.tagline || 'Slogan atau Subjudul Usaha'}
              </p>
              {(profileForm.address || profileForm.phone) && (
                <p className="text-[10px] text-slate-500">
                  {[profileForm.address, profileForm.phone ? `Telp/WA: ${profileForm.phone}` : ''].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>

            {/* Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Warung / Toko:</label>
                <input
                  type="text"
                  placeholder="Contoh: Warung Soto & Rawon Bu Siti, Toko Berkah, Kedai Kopi..."
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full font-bold border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Slogan / Subjudul Toko:</label>
                <input
                  type="text"
                  placeholder="Contoh: Soto Lamongan, Rawon & Aneka Kuliner / Sedia Kebutuhan Pokok Murah"
                  value={profileForm.tagline || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                  className="w-full font-medium border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. Telepon / WhatsApp:</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-3456-7890"
                    value={profileForm.phone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full font-bold border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alamat Usaha:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Raya Lamongan No. 10"
                    value={profileForm.address || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full font-medium border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pesan Catatan Kaki / Ucapan di Nota:
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Maturnuwun sampun mampir & jajan! 🙏\nSemoga berkah & sehat selalu."
                  value={profileForm.footerMessage || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, footerMessage: e.target.value })}
                  className="w-full font-medium border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStoreProfile}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
              >
                Simpan Profil Toko
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pratinjau & Kirim Gambar Struk (Anti-Manipulasi) */}
      <ReceiptImageModal
        isOpen={!!imageModalBill}
        onClose={() => setImageModalBill(null)}
        bill={imageModalBill}
        profile={storeProfile}
        onPrintThermal={onPrintBill}
      />
    </div>
  );
};

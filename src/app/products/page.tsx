'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, UnitType } from '@/types/pos';
import { storage } from '@/lib/storage';
import { playBeep, playCashChime, playRemoveSound } from '@/lib/audio';
import RoleGuard from '@/components/RoleGuard';
import { 
  Boxes, 
  Tags, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Package, 
  Eye, 
  EyeOff
} from 'lucide-react';

const EMOJI_PRESETS = ['🍈', '🥭', '🍉', '🍍', '🍌', '🍎', '🍇', '🍓', '🍒', '🥑', '🥥', '🍊', '📦', '🍿', '🥤', '⭐'];

const UNIT_OPTIONS: { label: string; value: UnitType }[] = [
  { label: 'กิโลกรัม (กก.)', value: 'kg' },
  { label: 'ชิ้น / ลูก', value: 'piece' },
  { label: 'กล่อง', value: 'box' },
  { label: 'ถาด', value: 'tray' }
];

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');

  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formUnitType, setFormUnitType] = useState<UnitType>('kg');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formCost, setFormCost] = useState<string>('');
  const [formStock, setFormStock] = useState<string>('');
  const [formEmoji, setFormEmoji] = useState('🍈');
  const [formIsActive, setFormIsActive] = useState(true);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🏷️');

  // Quick Price Edit State
  const [quickPriceProductId, setQuickPriceProductId] = useState<string | null>(null);
  const [quickPriceVal, setQuickPriceVal] = useState<string>('');

  const loadData = () => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
  };

  useEffect(() => {
    loadData();

    const handleDataChanged = () => {
      loadData();
    };

    window.addEventListener('pzt_products_changed', handleDataChanged);
    window.addEventListener('pzt_categories_changed', handleDataChanged);
    return () => {
      window.removeEventListener('pzt_products_changed', handleDataChanged);
      window.removeEventListener('pzt_categories_changed', handleDataChanged);
    };
  }, []);

  const openAddModal = () => {
    playBeep(650, 0.04);
    setEditingProduct(null);
    const defaultCat = categories[0]?.name || 'ทุเรียน';
    setFormSku(`SKU-${defaultCat.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormCategory(defaultCat);
    setFormUnitType('kg');
    setFormPrice('');
    setFormCost('');
    setFormStock('100');
    setFormEmoji('🍈');
    setFormIsActive(true);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    playBeep(650, 0.04);
    setEditingProduct(p);
    setFormSku(p.sku || `SKU-${p.id.toUpperCase()}`);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormUnitType(p.unit_type);
    setFormPrice(p.price_per_unit.toString());
    setFormCost(p.cost_per_unit.toString());
    setFormStock(p.current_stock.toString());
    setFormEmoji(p.image_emoji || '🍈');
    setFormIsActive(p.is_active);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('กรุณากรอกชื่อสินค้า');
      return;
    }

    const price = parseFloat(formPrice) || 0;
    const cost = parseFloat(formCost) || 0;
    const stock = parseFloat(formStock) || 0;

    if (price <= 0) {
      alert('กรุณากรอกราคาขายให้ถูกต้อง');
      return;
    }

    const productData: Product = {
      id: editingProduct ? editingProduct.id : 'p-' + Date.now(),
      sku: formSku.trim() || `SKU-PRD-${Math.floor(100 + Math.random() * 900)}`,
      name: formName.trim(),
      category: formCategory || 'ทั่วไป',
      unit_type: formUnitType,
      price_per_unit: price,
      cost_per_unit: cost,
      current_stock: stock,
      image_emoji: formEmoji,
      is_active: formIsActive,
      created_at: editingProduct?.created_at || new Date().toISOString()
    };

    storage.saveProduct(productData);
    playCashChime();
    setIsProductModalOpen(false);
    loadData();
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`ยืนยันการลบสินค้า "${name}" หรือไม่?`)) {
      playRemoveSound();
      storage.deleteProduct(id);
      loadData();
    }
  };

  const handleToggleActive = (p: Product) => {
    playBeep(600, 0.04);
    storage.saveProduct({
      ...p,
      is_active: !p.is_active
    });
    loadData();
  };

  // Quick inline price save
  const handleSaveQuickPrice = (id: string) => {
    const val = parseFloat(quickPriceVal);
    if (!val || val <= 0) {
      alert('กรุณากรอกราคาให้ถูกต้อง');
      return;
    }
    storage.updateProductPrice(id, val);
    playBeep(750, 0.05);
    setQuickPriceProductId(null);
    setQuickPriceVal('');
    loadData();
  };

  // Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      alert('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    storage.saveCategory({
      name: newCatName.trim(),
      icon_emoji: newCatEmoji
    });

    playCashChime();
    setNewCatName('');
    loadData();
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const count = products.filter(p => p.category === name).length;
    if (count > 0) {
      if (!confirm(`มีสินค้าจำนวน ${count} รายการอยู่ในหมวด "${name}"\nคุณยังต้องการลบหมวดหมู่นี้หรือไม่?`)) {
        return;
      }
    } else {
      if (!confirm(`ยืนยันการลบหมวดหมู่ "${name}" หรือไม่?`)) {
        return;
      }
    }
    playRemoveSound();
    storage.deleteCategory(id);
    loadData();
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ทั้งหมด' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      p.name.toLowerCase().includes(q) || 
      (p.sku && p.sku.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // KPI Calculations
  const totalSkus = products.length;
  const activeProductsCount = products.filter(p => p.is_active).length;
  const lowStockCount = products.filter(p => p.current_stock < 20).length;

  // Margin calculation helper
  const numPrice = parseFloat(formPrice) || 0;
  const numCost = parseFloat(formCost) || 0;
  const marginBaht = numPrice - numCost;
  const marginPercent = numPrice > 0 ? Math.round((marginBaht / numPrice) * 100) : 0;

  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <div className="space-y-6 pb-20">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
              <Boxes className="h-7 w-7 text-emerald-600" />
              <span>จัดการสินค้า & รหัส SKU (SKU Management)</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
              เพิ่ม-ลดรายการผลไม้ กำหนดรหัส SKU ปรับราคาขายหน้าร้านประจำวัน และจัดการหมวดหมู่สินค้า
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black text-sm sm:text-base hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" />
              <span>+ เพิ่มสินค้า / SKU ใหม่</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">จำนวน SKU ทั้งหมด</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1">
              {totalSkus} <span className="text-sm text-slate-500 font-sans">รายการ</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">กำลังเปิดขายหน้าร้าน</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 mt-1">
              {activeProductsCount} <span className="text-sm text-slate-500 font-sans">รายการ</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">สินค้าสต็อกใกล้หมด (&lt;20)</span>
            <div className={`text-2xl sm:text-3xl font-black font-mono mt-1 ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {lowStockCount} <span className="text-sm text-slate-500 font-sans">รายการ</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">หมวดหมู่สินค้า</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-700 mt-1">
              {categories.length} <span className="text-sm text-slate-500 font-sans">หมวดหมู่</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs: Products vs Categories */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => {
              playBeep(650, 0.03);
              setActiveTab('products');
            }}
            className={`px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 transition-all ${
              activeTab === 'products'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>รายการสินค้า & SKU ({products.length})</span>
          </button>

          <button
            onClick={() => {
              playBeep(650, 0.03);
              setActiveTab('categories');
            }}
            className={`px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 transition-all ${
              activeTab === 'categories'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tags className="h-4 w-4" />
            <span>จัดการหมวดหมู่ ({categories.length})</span>
          </button>
        </div>

        {/* TAB 1: Products & SKU Catalog */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Search & Category Filter Bar */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อสินค้า หรือ รหัส SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 scrollbar-none">
                {['ทั้งหมด', ...categories.map(c => c.name)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      playBeep(650, 0.03);
                      setSelectedCategory(cat);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all active:scale-95 ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Container */}
            <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
              
              {/* Mobile Card View (< sm) */}
              <div className="block sm:hidden space-y-3">
                {filteredProducts.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium">
                    ไม่พบสินค้าที่ตรงกับการค้นหา
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const margin = p.price_per_unit - (p.cost_per_unit || 0);
                    const marginPct = p.price_per_unit > 0 ? Math.round((margin / p.price_per_unit) * 100) : 0;
                    return (
                      <div 
                        key={p.id} 
                        className={`p-4 rounded-2xl border-2 space-y-2.5 shadow-2xs transition-all ${
                          p.is_active ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-3xl p-1.5 rounded-xl bg-white border border-slate-200 shrink-0">
                              {p.image_emoji}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                {p.sku && (
                                  <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                                    {p.sku}
                                  </span>
                                )}
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                                  {p.category}
                                </span>
                              </div>
                              <h4 className="font-bold text-slate-900 text-base mt-0.5 leading-tight">{p.name}</h4>
                            </div>
                          </div>

                          {/* Active toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(p)}
                            className={`p-1.5 rounded-xl border text-xs font-bold transition-colors ${
                              p.is_active 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-slate-200 text-slate-500 border-slate-300'
                            }`}
                            title={p.is_active ? 'กดเพื่อพักขาย' : 'กดเพื่อเปิดขาย'}
                          >
                            {p.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        </div>

                        {/* Financial & Stock Details */}
                        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">ราคาขาย</span>
                            <span className="text-sm font-black font-mono text-emerald-700">
                              ฿{p.price_per_unit}/{p.unit_type === 'kg' ? 'กก.' : 'ชิ้น'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">ต้นทุน</span>
                            <span className="text-sm font-mono font-bold text-slate-700">
                              ฿{p.cost_per_unit || 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">กำไร/หน่วย</span>
                            <span className="text-sm font-mono font-black text-amber-700">
                              +{marginPct}%
                            </span>
                          </div>
                        </div>

                        {/* Stock & Actions */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                          <span className={`text-xs font-bold ${p.current_stock < 20 ? 'text-red-600' : 'text-slate-600'}`}>
                            สต็อก: {p.current_stock} {p.unit_type === 'kg' ? 'กก.' : 'ชิ้น'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal(p)}
                              className="py-1.5 px-3 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span>แก้ไข</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                              aria-label="ลบสินค้า"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Table View (sm+) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-slate-600 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="pb-3">รหัส SKU</th>
                      <th className="pb-3">สินค้า</th>
                      <th className="pb-3">หมวดหมู่</th>
                      <th className="pb-3">หน่วย</th>
                      <th className="pb-3">ราคาขาย (฿)</th>
                      <th className="pb-3">ต้นทุน (฿)</th>
                      <th className="pb-3">กำไร (Margin)</th>
                      <th className="pb-3">สต็อก</th>
                      <th className="pb-3 text-center">สถานะ</th>
                      <th className="pb-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                          ไม่พบสินค้าที่ตรงกับการค้นหา
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const margin = p.price_per_unit - (p.cost_per_unit || 0);
                        const marginPct = p.price_per_unit > 0 ? Math.round((margin / p.price_per_unit) * 100) : 0;
                        const isQuickEditing = quickPriceProductId === p.id;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 font-mono font-bold text-slate-800 text-xs">
                              <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
                                {p.sku || '-'}
                              </span>
                            </td>

                            <td className="py-4">
                              <div className="flex items-center gap-2.5">
                                <span className="text-2xl p-1 rounded-xl bg-slate-100 shrink-0">
                                  {p.image_emoji}
                                </span>
                                <div className="font-bold text-slate-900">{p.name}</div>
                              </div>
                            </td>

                            <td className="py-4">
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                                {p.category}
                              </span>
                            </td>

                            <td className="py-4 text-slate-600 font-medium">
                              {p.unit_type === 'kg' ? 'กิโลกรัม (กก.)' :
                               p.unit_type === 'piece' ? 'ชิ้น / ลูก' :
                               p.unit_type === 'box' ? 'กล่อง' : 'ถาด'}
                            </td>

                            {/* Price with Quick Inline Edit */}
                            <td className="py-4">
                              {isQuickEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    step="1"
                                    value={quickPriceVal}
                                    onChange={(e) => setQuickPriceVal(e.target.value)}
                                    className="w-20 px-2 py-1 text-sm font-mono font-bold rounded-lg border-2 border-emerald-500 bg-white"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveQuickPrice(p.id)}
                                    className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                    title="บันทึกราคา"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setQuickPriceProductId(null)}
                                    className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
                                    title="ยกเลิก"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  onClick={() => {
                                    setQuickPriceProductId(p.id);
                                    setQuickPriceVal(p.price_per_unit.toString());
                                  }}
                                  className="cursor-pointer group flex items-center gap-1.5"
                                  title="คลิกเพื่อแก้ไขราคาขายด่วน"
                                >
                                  <span className="font-mono font-black text-emerald-700 text-base">
                                    ฿{p.price_per_unit}
                                  </span>
                                  <Edit className="h-3 w-3 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                                </div>
                              )}
                            </td>

                            <td className="py-4 font-mono text-slate-500">
                              ฿{p.cost_per_unit || 0}
                            </td>

                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
                                margin >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700'
                              }`}>
                                +฿{margin} ({marginPct}%)
                              </span>
                            </td>

                            <td className="py-4 font-mono font-bold">
                              <span className={p.current_stock < 20 ? 'text-red-600' : 'text-slate-800'}>
                                {p.current_stock}
                              </span>
                            </td>

                            <td className="py-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleActive(p)}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                                  p.is_active 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}
                              >
                                {p.is_active ? 'เปิดขาย' : 'พักขาย'}
                              </button>
                            </td>

                            <td className="py-4 text-right space-x-1.5">
                              <button
                                onClick={() => openEditModal(p)}
                                className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                                title="แก้ไขข้อมูลสินค้า"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="ลบสินค้านี้"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: Categories Management */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Tags className="h-5 w-5 text-emerald-600" />
                <span>เพิ่มหมวดหมู่สินค้าใหม่</span>
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ชื่อหมวดหมู่ (เช่น ผลไม้นำเข้า, น้ำผลไม้, ของฝาก) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ผลไม้นำเข้า, ทุเรียนแปรรูป"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  เลือกไอคอนอิโมจิ:
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCatEmoji(emoji)}
                      className={`text-2xl p-2 rounded-xl border transition-all ${
                        newCatEmoji === emoji
                          ? 'bg-emerald-100 border-emerald-500 scale-110 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                + บันทึกหมวดหมู่ใหม่
              </button>
            </form>

            {/* Categories List Cards */}
            <div className="lg:col-span-2 p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 mb-4">
                หมวดหมู่สินค้าทั้งหมด ({categories.length} หมวด)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const productCount = products.filter(p => p.category === cat.name).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 rounded-2xl bg-white border border-slate-200 shrink-0">
                          {cat.icon_emoji || '🏷️'}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{cat.name}</h4>
                          <span className="text-xs text-slate-500 font-semibold">
                            {productCount} รายการสินค้าในหมวดนี้
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="ลบหมวดหมู่นี้"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Modal: Add / Edit Product */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-2xl text-slate-900">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Package className="h-6 w-6 text-emerald-600" />
                  <span>{editingProduct ? 'แก้ไขข้อมูลสินค้า & SKU' : 'เพิ่มสินค้า & รหัส SKU ใหม่'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 pt-3">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* SKU */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      รหัส SKU (เช่น SKU-MON-001) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                      placeholder="SKU-XXX-001"
                      className="w-full px-4 py-2.5 text-sm font-mono font-bold rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      หมวดหมู่สินค้า *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm font-bold rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.icon_emoji} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ชื่อผลไม้ / ชื่อสินค้า *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="เช่น ทุเรียนพวงมณีตัดสด, ส้มโอทับทิมสยาม"
                    className="w-full px-4 py-3 text-base font-bold rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Unit Type & Emoji Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      หน่วยนับ *
                    </label>
                    <select
                      value={formUnitType}
                      onChange={(e) => setFormUnitType(e.target.value as UnitType)}
                      className="w-full px-4 py-2.5 text-sm font-bold rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      สต็อกเริ่มต้น
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-2.5 text-sm font-mono font-bold rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Pricing & Cost Calculation */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-emerald-900 block mb-1">
                        ราคาขายหน้าร้าน (฿) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="180"
                        className="w-full px-4 py-2.5 text-xl font-black font-mono rounded-2xl bg-white border-2 border-emerald-300 text-emerald-800 focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        ราคาต้นทุนต่อหน่วย (฿)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={formCost}
                        onChange={(e) => setFormCost(e.target.value)}
                        placeholder="120"
                        className="w-full px-4 py-2.5 text-xl font-bold font-mono rounded-2xl bg-white border-2 border-slate-300 text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Margin preview */}
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 pt-1 border-t border-emerald-200/70">
                    <span>กำไรต่อหน่วย: <strong>฿{marginBaht.toFixed(2)}</strong></span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black">
                      Margin: {marginPercent}%
                    </span>
                  </div>
                </div>

                {/* Emoji Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    เลือกรูปภาพประจำสินค้า (Emoji Icon):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_PRESETS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormEmoji(emoji)}
                        className={`text-2xl p-2 rounded-xl border transition-all ${
                          formEmoji === emoji
                            ? 'bg-emerald-100 border-emerald-500 scale-110 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Status Toggle */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-sm font-bold text-slate-700">สถานะเปิดขายหน้าร้าน:</span>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-colors ${
                      formIsActive ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {formIsActive ? 'เปิดขาย (Active)' : 'พักขาย (Inactive)'}
                  </button>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="w-1/3 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    {editingProduct ? 'บันทึกการแก้ไข' : '+ เพิ่มสินค้าลงระบบ'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </RoleGuard>
  );
}

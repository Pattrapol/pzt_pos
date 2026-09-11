'use client';

import React, { useState, useEffect } from 'react';
import { Product, OrderItem, Order, StoreSettings } from '@/types/pos';
import { storage } from '@/lib/storage';
import WeighingModal from '@/components/WeighingModal';
import CheckoutModal from '@/components/CheckoutModal';
import ReceiptModal from '@/components/ReceiptModal';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Scale, 
  CreditCard, 
  Plus, 
  ArrowRight,
  X,
  ChevronUp
} from 'lucide-react';

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(storage.getSettings());

  // Modals state
  const [weighingProduct, setWeighingProduct] = useState<Product | null>(null);
  const [isWeighingOpen, setIsWeighingOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const loadData = () => {
    setProducts(storage.getProducts());
    setSettings(storage.getSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = ['ทั้งหมด', 'ทุเรียน', 'ทุเรียนแกะเนื้อ', 'ผลไม้สด', 'แปรรูป'];

  const filteredProducts = products.filter((p) => {
    if (!p.is_active) return false;
    const matchesCategory = selectedCategory === 'ทั้งหมด' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartTotalWeight = cart.reduce((sum, item) => sum + (item.unit_type === 'kg' ? item.quantity_or_weight : 0), 0);

  const handleAddToCart = (itemData: {
    product: Product;
    quantityOrWeight: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
  }) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product_id === itemData.product.id && i.unit_price === itemData.unitPrice && i.notes === itemData.notes
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity_or_weight + itemData.quantityOrWeight;
        const newSubtotal = Math.round((newQty * itemData.unitPrice) * 100) / 100;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity_or_weight: newQty,
          subtotal: newSubtotal
        };
        return updated;
      }

      const newItem: OrderItem = {
        id: 'item-' + Date.now(),
        product_id: itemData.product.id,
        product_name: itemData.product.name,
        unit_type: itemData.product.unit_type,
        unit_price: itemData.unitPrice,
        quantity_or_weight: itemData.quantityOrWeight,
        subtotal: itemData.subtotal,
        item_cost: itemData.product.cost_per_unit || 0,
        notes: itemData.notes
      };

      return [...prev, newItem];
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setIsMobileCartOpen(false);
      return next;
    });
  };

  const handleClearCart = () => {
    if (cart.length > 0 && confirm('ต้องการลบสินค้าทั้งหมดในตะกร้าหรือไม่?')) {
      setCart([]);
      setIsMobileCartOpen(false);
    }
  };

  const handleOrderCompleted = (newOrder: Order) => {
    const saved = storage.createOrder(newOrder);
    setCompletedOrder(saved);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsMobileCartOpen(false);
    setIsReceiptOpen(true);
    loadData();
  };

  return (
    <div className="relative pb-24 lg:pb-0">
      
      {/* Main Container: Flex on Desktop, Column on Mobile */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8.5rem)]">
        
        {/* Left: Products & Weighing Catalog */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs">
          
          {/* Top Controls: Search and Category Pills */}
          <div className="space-y-3 sm:space-y-4 pb-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อผลไม้ (เช่น หมอนทอง, ก้านยาว)..."
                className="w-full pl-12 pr-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-medium"
              />
            </div>

            {/* Categories Pill Tabs - Scrollable with comfortable touch */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-bold rounded-2xl whitespace-nowrap transition-all active:scale-95 ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid: 1 col on ultra-narrow, 2 cols on mobile, 3 cols on tablet, 4 on desktop */}
          <div className="flex-1 pt-4 grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 content-start">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400">
                <p className="text-lg font-medium">ไม่พบผลไม้ที่ค้นหา</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isLowStock = product.current_stock < 20;
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      setWeighingProduct(product);
                      setIsWeighingOpen(true);
                    }}
                    className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-3xl bg-slate-50/70 border-2 border-slate-200/90 hover:border-emerald-500 hover:bg-white hover:shadow-lg cursor-pointer transition-all active:scale-[0.98]"
                  >
                    {/* Stock & Emoji */}
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform">
                        {product.image_emoji}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        isLowStock 
                          ? 'bg-red-50 text-red-600 border border-red-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        เหลือ {product.current_stock} {product.unit_type === 'kg' ? 'กก.' : 'ชิ้น'}
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="my-1.5 sm:my-2">
                      <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {product.name}
                      </h4>
                      <span className="text-xs text-slate-500 font-semibold">
                        หมวด: {product.category}
                      </span>
                    </div>

                    {/* Price Banner */}
                    <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-slate-200 flex items-baseline justify-between">
                      <div>
                        <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700">
                          ฿{product.price_per_unit}
                        </span>
                        <span className="text-xs text-slate-600 font-bold ml-1">
                          /{product.unit_type === 'kg' ? 'กก.' : 'ชิ้น'}
                        </span>
                      </div>

                      <span className="py-1 px-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center gap-1">
                        {product.unit_type === 'kg' ? <Scale className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        <span>ชั่ง</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right: Cart Panel (Desktop Only - Side by side) */}
        <div className="hidden lg:flex w-96 xl:w-[420px] flex-col bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-md h-[calc(100vh-8.5rem)] sticky top-24">
          
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">ตะกร้าบิลนี้</h3>
                <p className="text-xs font-bold text-slate-500">{cart.length} รายการที่เลือก</p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="py-1.5 px-3 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
              >
                ล้างตะกร้า
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="p-4 rounded-full bg-slate-50 mb-3">
                  <ShoppingCart className="h-12 w-12 stroke-1 text-slate-300" />
                </div>
                <p className="text-lg font-bold text-slate-700">ยังไม่มีรายการ</p>
                <p className="text-sm mt-1 text-slate-400">แตะที่รูปผลไม้ด้านซ้ายเพื่อชั่งน้ำหนัก</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-bold text-slate-900 truncate">{item.product_name}</h5>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">
                      {item.quantity_or_weight} {item.unit_type === 'kg' ? 'กก.' : 'ชิ้น'} × ฿{item.unit_price}
                    </div>
                    {item.notes && (
                      <div className="text-[11px] text-amber-700 italic mt-0.5 truncate">
                        {item.notes}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <span className="text-base font-black font-mono text-emerald-700">
                      ฿{item.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => handleRemoveFromCart(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="ลบรายการนี้"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Bottom Summary & Giant Checkout Button */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-base font-bold text-slate-700">ยอดเงินรวม:</span>
              <span className="font-mono text-3xl font-black text-emerald-700">
                ฿{cartSubtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
              className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl shadow-lg shadow-emerald-600/30 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-between px-6 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 stroke-[2.5]" />
                <span>คิดเงิน (ชำระเงิน)</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-2xl">
                <span>฿{cartSubtotal.toLocaleString()}</span>
                <ArrowRight className="h-5 w-5 ml-1" />
              </div>
            </button>
          </div>

        </div>

      </div>

      {/* Mobile Floating Bottom Bar (Appears when cart has items on screens < lg) */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30 animate-in slide-in-from-bottom duration-200">
          <div 
            onClick={() => setIsMobileCartOpen(true)}
            className="p-4 rounded-3xl bg-slate-900 text-white shadow-2xl flex items-center justify-between cursor-pointer border-2 border-slate-800 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-2xl bg-emerald-600 text-white">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  {cart.length}
                </span>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold">
                  {cartTotalWeight > 0 ? `หนัก ${cartTotalWeight} กก.` : `${cart.length} รายการ`}
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  ฿{cartSubtotal.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCheckoutOpen(true);
              }}
              className="py-3 px-5 rounded-2xl bg-emerald-600 text-white font-black text-base flex items-center gap-2 shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <span>คิดเงิน</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Cart Drawer Modal (< lg) */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-h-[85vh] bg-white rounded-t-3xl p-6 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200 border-t border-slate-200">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">ตะกร้าสินค้า ({cart.length} รายการ)</h3>
                  <p className="text-xs font-bold text-slate-500">ตรวจสอบและกดคิดเงิน</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearCart}
                  className="py-1.5 px-3 text-xs font-bold text-red-600 bg-red-50 rounded-xl"
                >
                  ล้างหมด
                </button>
                <button
                  onClick={() => setIsMobileCartOpen(false)}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600"
                  aria-label="ปิด"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[45vh]">
              {cart.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-bold text-slate-900 truncate">{item.product_name}</h5>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">
                      {item.quantity_or_weight} {item.unit_type === 'kg' ? 'กก.' : 'ชิ้น'} × ฿{item.unit_price}
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <span className="text-base font-black font-mono text-emerald-700">
                      ฿{item.subtotal.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleRemoveFromCart(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Bottom Checkout */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-base font-bold text-slate-700">ยอดรวมทั้งหมด:</span>
                <span className="font-mono text-3xl font-black text-emerald-700">
                  ฿{cartSubtotal.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsMobileCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full h-15 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <CreditCard className="h-6 w-6 stroke-[2.5]" />
                <span>ไปหน้าชำระเงิน (฿{cartSubtotal.toLocaleString()})</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Weighing Modal */}
      <WeighingModal
        product={weighingProduct}
        isOpen={isWeighingOpen}
        onClose={() => {
          setIsWeighingOpen(false);
          setWeighingProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        subtotal={cartSubtotal}
        settings={settings}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Thermal Receipt Modal */}
      <ReceiptModal
        order={completedOrder}
        settings={settings}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

    </div>
  );
}

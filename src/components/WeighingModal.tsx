'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types/pos';
import { X, Scale, Delete, Check } from 'lucide-react';

interface WeighingModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: {
    product: Product;
    quantityOrWeight: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
  }) => void;
}

export default function WeighingModal({
  product,
  isOpen,
  onClose,
  onAddToCart
}: WeighingModalProps) {
  const [inputValue, setInputValue] = useState<string>('1.0');
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [itemNote, setItemNote] = useState<string>('');

  useEffect(() => {
    if (product) {
      setCustomPrice(product.price_per_unit);
      setInputValue(product.unit_type === 'kg' ? '2.5' : '1');
      setItemNote('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const currentQty = parseFloat(inputValue) || 0;
  const subtotal = Math.round((currentQty * customPrice) * 100) / 100;

  const handleNumpad = (char: string) => {
    if (char === 'C') {
      setInputValue('0');
      return;
    }
    if (char === 'DEL') {
      setInputValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      return;
    }
    if (char === '.') {
      if (!inputValue.includes('.')) {
        setInputValue(prev => prev + '.');
      }
      return;
    }
    setInputValue(prev => {
      if (prev === '0') return char;
      if (prev.includes('.') && prev.split('.')[1].length >= 2) return prev;
      return prev + char;
    });
  };

  const handleQuickAdd = (addValue: number) => {
    const val = (parseFloat(inputValue) || 0) + addValue;
    setInputValue((Math.round(val * 100) / 100).toString());
  };

  const handleConfirm = () => {
    if (currentQty <= 0) return;
    onAddToCart({
      product,
      quantityOrWeight: currentQty,
      unitPrice: customPrice,
      subtotal,
      notes: itemNote.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-5 sm:p-8 shadow-2xl text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-4xl sm:text-5xl p-2 sm:p-2.5 rounded-2xl bg-amber-50 border border-amber-200/60">
              {product.image_emoji}
            </span>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{product.name}</h3>
              <p className="text-base text-slate-600 font-semibold mt-0.5">
                ราคา: <span className="text-emerald-700 font-bold">฿{product.price_per_unit}</span> / {product.unit_type === 'kg' ? 'กิโลกรัม' : 'ชิ้น/กล่อง'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="ปิด"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        {/* Digital Scale Display - Giant numbers */}
        <div className="my-5 p-5 sm:p-6 rounded-3xl bg-slate-50 border-2 border-emerald-500/40 text-center relative shadow-xs">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 mb-1">
            <Scale className="h-4 w-4 text-emerald-600" />
            <span>{product.unit_type === 'kg' ? 'น้ำหนักที่ชั่งได้' : 'จำนวนสินค้า'}</span>
          </div>
          
          <div className="text-6xl sm:text-7xl font-black font-mono text-slate-900 tracking-tight my-1">
            {inputValue || '0'} <span className="text-3xl text-emerald-600 font-sans font-bold">{product.unit_type === 'kg' ? 'กก.' : 'ชิ้น'}</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-center gap-3 text-lg">
            <span className="text-slate-600 font-medium">รวมเป็นเงิน:</span>
            <span className="text-3xl font-black font-mono text-emerald-600">
              ฿{subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Quick Weight Adjust Buttons (Big, easy for elderly to click) */}
        {product.unit_type === 'kg' && (
          <div className="mb-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              ปุ่มลัดเพิ่มน้ำหนักด่วน:
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {[0.5, 1.0, 2.0, 3.0].map((add) => (
                <button
                  key={add}
                  onClick={() => handleQuickAdd(add)}
                  className="py-3 px-2 text-base sm:text-lg font-black rounded-2xl bg-amber-50 border-2 border-amber-200 hover:bg-amber-100 text-amber-900 active:scale-95 transition-all shadow-xs"
                >
                  +{add} กก.
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Large Numpad Controls - Generous touch targets */}
        <div className="grid grid-cols-4 gap-2.5">
          {['7', '8', '9', 'C', '4', '5', '6', 'DEL', '1', '2', '3', '0', '.', '00'].map((btn) => {
            if (btn === 'C') {
              return (
                <button
                  key={btn}
                  onClick={() => handleNumpad('C')}
                  className="py-4 text-lg font-black rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 hover:bg-red-100 active:scale-95 transition-all shadow-xs"
                >
                  ล้าง (C)
                </button>
              );
            }
            if (btn === 'DEL') {
              return (
                <button
                  key={btn}
                  onClick={() => handleNumpad('DEL')}
                  className="py-4 text-lg font-bold rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-700 hover:bg-slate-200 flex items-center justify-center active:scale-95 transition-all shadow-xs"
                  aria-label="ลบตัวเลขตัวหลัง"
                >
                  <Delete className="h-6 w-6" />
                </button>
              );
            }
            return (
              <button
                key={btn}
                onClick={() => handleNumpad(btn)}
                className="py-4 text-2xl font-black font-mono rounded-2xl bg-white border-2 border-slate-200 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 active:scale-95 transition-all shadow-xs"
              >
                {btn}
              </button>
            );
          })}

          {/* Action Confirm Button spanning 2 cols - Giant Emerald button */}
          <button
            onClick={handleConfirm}
            disabled={currentQty <= 0}
            className="col-span-2 py-4 text-xl font-black rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Check className="h-7 w-7 stroke-[3]" />
            <span>ใส่ตะกร้า (฿{subtotal.toLocaleString()})</span>
          </button>
        </div>

      </div>
    </div>
  );
}

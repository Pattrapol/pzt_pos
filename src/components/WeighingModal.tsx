'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types/pos';
import { X, Scale, Delete, Check, Box } from 'lucide-react';
import { playBeep } from '@/lib/audio';

interface WeighingModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: {
    product: Product;
    quantityOrWeight: number;
    gross_weight?: number;
    tare_weight?: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
  }) => void;
}

const TARE_PRESETS = [
  { label: 'ไม่หัก (0g)', value: 0 },
  { label: 'ถาดโฟม (-30g)', value: 0.03 },
  { label: 'กล่องใส (-50g)', value: 0.05 },
  { label: 'กล่องหนา (-100g)', value: 0.10 },
];

export default function WeighingModal({
  product,
  isOpen,
  onClose,
  onAddToCart
}: WeighingModalProps) {
  const [inputValue, setInputValue] = useState<string>('1.0');
  const [tareWeight, setTareWeight] = useState<number>(0);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [itemNote, setItemNote] = useState<string>('');

  useEffect(() => {
    if (product) {
      setCustomPrice(product.price_per_unit);
      setInputValue(product.unit_type === 'kg' ? '2.5' : '1');
      setTareWeight(0);
      setItemNote('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const isKg = product.unit_type === 'kg';
  const grossWeight = parseFloat(inputValue) || 0;
  // Net weight is gross minus tare, minimum 0
  const netWeight = isKg 
    ? Math.max(0, Math.round((grossWeight - tareWeight) * 100) / 100)
    : grossWeight;
  const subtotal = Math.round((netWeight * customPrice) * 100) / 100;

  const handleNumpad = (char: string) => {
    playBeep(650, 0.05);
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
    playBeep(700, 0.06);
    const val = (parseFloat(inputValue) || 0) + addValue;
    setInputValue((Math.round(val * 100) / 100).toString());
  };

  const handleSelectTare = (tareVal: number) => {
    playBeep(600, 0.06);
    setTareWeight(tareVal);
  };

  const handleConfirm = () => {
    if (netWeight <= 0) return;
    playBeep(850, 0.1);
    onAddToCart({
      product,
      quantityOrWeight: netWeight,
      gross_weight: isKg && tareWeight > 0 ? grossWeight : undefined,
      tare_weight: isKg && tareWeight > 0 ? tareWeight : undefined,
      unitPrice: customPrice,
      subtotal,
      notes: [
        tareWeight > 0 ? `หักกล่อง ${tareWeight * 1000}g` : null,
        itemNote.trim() || null
      ].filter(Boolean).join(' • ') || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[94vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-2xl text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-4xl sm:text-5xl p-2 sm:p-2.5 rounded-2xl bg-amber-50 border border-amber-200/60">
              {product.image_emoji}
            </span>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{product.name}</h3>
              <p className="text-base text-slate-600 font-semibold mt-0.5">
                ราคา: <span className="text-emerald-700 font-bold">฿{product.price_per_unit}</span> / {isKg ? 'กิโลกรัม' : 'ชิ้น/กล่อง'}
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
        <div className="my-4 p-4 sm:p-5 rounded-3xl bg-slate-50 border-2 border-emerald-500/40 text-center relative shadow-xs">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 mb-1">
            <Scale className="h-4 w-4 text-emerald-600" />
            <span>{isKg ? (tareWeight > 0 ? 'น้ำหนักสุทธิ (หักภาชนะแล้ว)' : 'น้ำหนักที่ชั่งได้') : 'จำนวนสินค้า'}</span>
          </div>
          
          <div className="text-5xl sm:text-7xl font-black font-mono text-slate-900 tracking-tight my-1">
            {netWeight.toFixed(2)} <span className="text-2xl sm:text-3xl text-emerald-600 font-sans font-bold">{isKg ? 'กก.' : 'ชิ้น'}</span>
          </div>

          {/* Tare breakdown if tare applied */}
          {isKg && tareWeight > 0 && (
            <div className="flex items-center justify-center gap-3 mt-1.5 py-1 px-3 rounded-xl bg-amber-100/70 text-amber-900 text-xs sm:text-sm font-bold w-fit mx-auto">
              <span>ชั่งรวม: {grossWeight.toFixed(2)} กก.</span>
              <span>-</span>
              <span>หักภาชนะ: {(tareWeight * 1000).toFixed(0)} กรัม</span>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-center gap-3 text-lg">
            <span className="text-slate-600 font-medium">รวมเป็นเงิน:</span>
            <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-600">
              ฿{subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Tare Weight Selection for Kg items */}
        {isKg && (
          <div className="mb-3.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-bold text-amber-900 flex items-center gap-1.5">
                <Box className="h-4 w-4 text-amber-700" />
                <span>หักน้ำหนักภาชนะ / กล่องโฟม (Tare):</span>
              </span>
              {tareWeight > 0 && (
                <span className="text-xs font-black text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  หัก {(tareWeight * 1000).toFixed(0)} กรัม
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TARE_PRESETS.map((preset) => {
                const isSelected = tareWeight === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectTare(preset.value)}
                    className={`py-2 px-2 text-xs sm:text-sm font-bold rounded-xl border-2 transition-all active:scale-95 text-center ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Weight Adjust Buttons (Big, easy for elderly to click) */}
        {isKg && (
          <div className="mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              ปุ่มลัดเพิ่มน้ำหนักตาชั่ง:
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1.0, 2.0, 3.0].map((add) => (
                <button
                  key={add}
                  type="button"
                  onClick={() => handleQuickAdd(add)}
                  className="py-2.5 px-2 text-sm sm:text-base font-black rounded-2xl bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100 text-emerald-900 active:scale-95 transition-all shadow-xs"
                >
                  +{add} กก.
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Large Numpad Controls - Generous touch targets */}
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {['7', '8', '9', 'C', '4', '5', '6', 'DEL', '1', '2', '3', '0', '.', '00'].map((btn) => {
            if (btn === 'C') {
              return (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleNumpad('C')}
                  className="py-3 sm:py-4 text-base sm:text-lg font-black rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 hover:bg-red-100 active:scale-95 transition-all shadow-xs"
                >
                  ล้าง (C)
                </button>
              );
            }
            if (btn === 'DEL') {
              return (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleNumpad('DEL')}
                  className="py-3 sm:py-4 text-base sm:text-lg font-bold rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-700 hover:bg-slate-200 flex items-center justify-center active:scale-95 transition-all shadow-xs"
                  aria-label="ลบตัวเลขตัวหลัง"
                >
                  <Delete className="h-6 w-6" />
                </button>
              );
            }
            return (
              <button
                key={btn}
                type="button"
                onClick={() => handleNumpad(btn)}
                className="py-3 sm:py-4 text-xl sm:text-2xl font-black font-mono rounded-2xl bg-white border-2 border-slate-200 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 active:scale-95 transition-all shadow-xs"
              >
                {btn}
              </button>
            );
          })}

          {/* Action Confirm Button spanning 2 cols - Giant Emerald button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={netWeight <= 0}
            className="col-span-2 py-3 sm:py-4 text-lg sm:text-xl font-black rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Check className="h-6 w-6 sm:h-7 sm:w-7 stroke-[3]" />
            <span>ใส่ตะกร้า (฿{subtotal.toLocaleString()})</span>
          </button>
        </div>

      </div>
    </div>
  );
}

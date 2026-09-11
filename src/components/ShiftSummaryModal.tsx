'use client';

import React from 'react';
import { Order, Expense } from '@/types/pos';
import { storage } from '@/lib/storage';
import { playBeep } from '@/lib/audio';
import { 
  X, 
  Printer, 
  Banknote, 
  QrCode, 
  Clock, 
  Calendar, 
  Layers, 
  Scale, 
  CheckCircle,
  TrendingDown,
  Wallet
} from 'lucide-react';

interface ShiftSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShiftSummaryModal({ isOpen, onClose }: ShiftSummaryModalProps) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const orders: Order[] = storage.getOrders().filter(o => o.created_at.startsWith(todayStr));
  const expenses: Expense[] = storage.getExpenses().filter(e => e.expense_date === todayStr);
  const settings = storage.getSettings();

  // Calculations
  const totalSales = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const cashSales = orders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + o.total_amount, 0);
  const promptpaySales = orders.filter(o => o.payment_method === 'promptpay').reduce((sum, o) => sum + o.total_amount, 0);
  const creditSales = orders.filter(o => o.payment_method === 'credit').reduce((sum, o) => sum + o.total_amount, 0);
  const totalExpensesToday = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Net cash that should be in the drawer
  const expectedCashInDrawer = Math.max(0, cashSales - totalExpensesToday);

  // Total weights
  let totalKgSold = 0;
  let totalPiecesSold = 0;
  orders.forEach(o => {
    o.items?.forEach(item => {
      if (item.unit_type === 'kg') {
        totalKgSold += item.quantity_or_weight;
      } else {
        totalPiecesSold += item.quantity_or_weight;
      }
    });
  });

  const handlePrint = () => {
    playBeep(750, 0.08);
    window.print();
  };

  const todayThaiDate = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[94vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-2xl text-slate-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">สรุปยอดปิดร้านประจำวัน (Z-Report)</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">{todayThaiDate}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="ปิด"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Printable Shift Slip Area */}
        <div id="shift-report" className="my-4 p-5 sm:p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 font-mono text-slate-800 print:border-none print:p-0 print:m-0 print:bg-white">
          
          {/* Slip Header */}
          <div className="text-center pb-4 border-b-2 border-dashed border-slate-300">
            <h3 className="font-sans font-black text-xl text-slate-900">{settings.store_name || 'ร้านทุเรียน & ผลไม้ PZT'}</h3>
            <p className="font-sans text-xs text-slate-500">{settings.branch || 'สาขาหลัก'} {settings.phone && `• โทร ${settings.phone}`}</p>
            <p className="font-sans text-xs font-bold text-emerald-700 mt-1 uppercase tracking-wider bg-emerald-100/60 py-0.5 px-3 rounded-full inline-block">
              ใบสรุปปิดกะ / ปิดรอบวัน
            </p>
            <p className="text-xs text-slate-500 mt-1">พิมพ์เมื่อ: {new Date().toLocaleTimeString('th-TH')}</p>
          </div>

          {/* Core KPI: Cash in drawer */}
          <div className="my-4 p-4 rounded-2xl bg-emerald-600 text-white text-center shadow-md print:bg-slate-100 print:text-black">
            <span className="font-sans text-xs uppercase tracking-wider text-emerald-100 font-bold block print:text-slate-600">
              💵 ยอดเงินสดที่ต้องมีในลิ้นชัก (Cash in Drawer)
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
              ฿{expectedCashInDrawer.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="font-sans text-xs text-emerald-200 mt-1 block print:text-slate-500">
              (ขายเงินสด ฿{cashSales.toLocaleString()} - หักค่าใช้จ่าย ฿{totalExpensesToday.toLocaleString()})
            </span>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-2 py-3 border-b-2 border-dashed border-slate-300 text-sm">
            <div className="flex justify-between items-center font-sans font-bold text-slate-700 mb-1">
              <span>สรุปยอดขายตามช่องทาง:</span>
              <span className="text-xs font-semibold bg-slate-200 px-2 py-0.5 rounded-full">{orders.length} บิล</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="flex items-center gap-1.5 font-sans text-slate-600">
                <Banknote className="h-4 w-4 text-emerald-600 inline" /> เงินสด (Cash):
              </span>
              <span className="font-black text-slate-900">฿{cashSales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="flex items-center gap-1.5 font-sans text-slate-600">
                <QrCode className="h-4 w-4 text-emerald-600 inline" /> โอน PromptPay:
              </span>
              <span className="font-black text-slate-900">฿{promptpaySales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="flex items-center gap-1.5 font-sans text-slate-600">
                <Clock className="h-4 w-4 text-amber-600 inline" /> ค้างชำระ (Credit):
              </span>
              <span className="font-black text-amber-700">฿{creditSales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-base font-black text-slate-900">
              <span className="font-sans">ยอดขายรวมทั้งหมด:</span>
              <span className="text-emerald-700">฿{totalSales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Fruit Weight Breakdown */}
          <div className="space-y-1.5 py-3 border-b-2 border-dashed border-slate-300 text-sm">
            <div className="flex justify-between items-center font-sans font-bold text-slate-700 mb-1">
              <span>ปริมาณสินค้าที่ขายได้:</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans text-slate-600">น้ำหนักผลไม้รวม (กก.):</span>
              <span className="font-bold text-slate-900">{totalKgSold.toFixed(2)} กิโลกรัม</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans text-slate-600">สินค้าชิ้น/กล่อง:</span>
              <span className="font-bold text-slate-900">{totalPiecesSold} ชิ้น/กล่อง</span>
            </div>
          </div>

          {/* Expenses today */}
          <div className="space-y-1.5 pt-3 text-sm">
            <div className="flex justify-between items-center font-sans font-bold text-slate-700 mb-1">
              <span>ค่าใช้จ่ายวันนี้ ({expenses.length} รายการ):</span>
              <span className="font-black text-red-600">฿{totalExpensesToday.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
            {expenses.slice(0, 3).map(exp => (
              <div key={exp.id} className="flex justify-between text-xs text-slate-500">
                <span className="truncate max-w-[200px] font-sans">• {exp.title}</span>
                <span>-฿{exp.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="text-center pt-5 text-xs text-slate-400 font-sans">
            *** สิ้นสุดรายงานปิดกะ ***
          </div>

        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3 pt-2 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3.5 px-4 text-base font-bold rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            ปิด
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-2/3 py-3.5 px-4 text-lg font-black rounded-2xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <Printer className="h-5 w-5" />
            <span>พิมพ์สลิปปิดกะ (Print)</span>
          </button>
        </div>

      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { 
  DollarSign, 
  Truck, 
  AlertOctagon, 
  Scale, 
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  PieChart
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [summary, setSummary] = useState<ReturnType<typeof storage.getFinancialSummary> | null>(null);
  const [orders, setOrders] = useState(storage.getOrders());

  useEffect(() => {
    setSummary(storage.getFinancialSummary());
    setOrders(storage.getOrders());
  }, []);

  if (!summary) return null;

  const isProfit = summary.netProfit >= 0;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <span>📊 สรุปยอดขาย & กำไรสุทธิ (ดูง่าย สบายตา)</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
            คำนวณยอดขายจริง หักลบต้นทุนการรับซื้อ ค่าใช้จ่ายดำเนินงาน และความสูญเสียตลอดฤดูกาล
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-base hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
        >
          <ShoppingBag className="h-5 w-5" />
          <span>ไปหน้าขายหน้าร้าน (POS)</span>
        </Link>
      </div>

      {/* Main KPI Financial Cards - Clean White Minimalist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* 1. Total Revenue */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between text-slate-600 text-sm font-bold">
            <span>ยอดขายรวมทั้งหมด</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900">
              ฿{summary.totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs font-bold flex justify-between text-slate-500 pt-2 border-t border-slate-100">
            <span>รับเงินแล้ว: ฿{summary.paidRevenue.toLocaleString()}</span>
            {summary.pendingRevenue > 0 && (
              <span className="text-amber-700 font-bold">ค้างชำระ: ฿{summary.pendingRevenue.toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* 2. Total Fruit Cost (Purchases) */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between text-slate-600 text-sm font-bold">
            <span>ต้นทุนรับซื้อผลไม้</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black font-mono text-amber-700">
              ฿{summary.totalLotCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
            รับเข้าสะสม: {summary.totalLotWeightKg.toLocaleString()} กก.
          </div>
        </div>

        {/* 3. Operational Expenses & Waste */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs hover:border-red-400 transition-all">
          <div className="flex items-center justify-between text-slate-600 text-sm font-bold">
            <span>ค่าใช้จ่ายเสริม + ของเสีย</span>
            <div className="p-2.5 rounded-2xl bg-red-50 text-red-600">
              <AlertOctagon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black font-mono text-red-600">
              ฿{(summary.totalExpenses + summary.totalWasteLoss).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs font-bold flex justify-between text-slate-500 pt-2 border-t border-slate-100">
            <span>ค่าใช้จ่าย: ฿{summary.totalExpenses.toLocaleString()}</span>
            <span>ของเสีย: ฿{summary.totalWasteLoss.toLocaleString()}</span>
          </div>
        </div>

        {/* 4. NET PROFIT (HERO CARD) - Big Emerald Highlights */}
        <div className={`p-6 rounded-3xl border-2 shadow-sm transition-all ${
          isProfit 
            ? 'bg-emerald-50/80 border-emerald-400' 
            : 'bg-red-50/80 border-red-300'
        }`}>
          <div className="flex items-center justify-between text-slate-800 text-sm font-black">
            <span>กำไรสุทธิ (Net Profit)</span>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${
              isProfit ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}>
              กำไร {summary.profitMargin}%
            </span>
          </div>
          <div className="mt-3">
            <span className={`text-4xl sm:text-5xl font-black font-mono ${
              isProfit ? 'text-emerald-800' : 'text-red-700'
            }`}>
              ฿{summary.netProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs font-bold text-slate-600 pt-2 border-t border-emerald-200/80 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>คำนวณจากยอดขายจริงลบต้นทุนทั้งหมด</span>
          </div>
        </div>

      </div>

      {/* Yield & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Yield Analytics */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Scale className="h-5 w-5 text-emerald-600" />
              <span>ประสิทธิภาพผลผลิต (Yield)</span>
            </h3>
            <span className="text-sm font-mono px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              {summary.yieldPercentage}% Yield
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            อัตราส่วนเนื้อหรือผลไม้ที่ขายได้เทียบกับความสูญเสียจากผลแตก/เน่าเสีย/ตกเกรด
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">ขายได้จริง:</span>
                <span className="font-mono text-emerald-700 font-black">{summary.totalFruitSoldKg} กก.</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, summary.yieldPercentage)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">สูญเสีย/ของเสีย:</span>
                <span className="font-mono text-red-600 font-black">{summary.totalWasteKg} กก.</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-red-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, 100 - summary.yieldPercentage)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border-2 border-slate-200 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
              <PieChart className="h-5 w-5 text-amber-600" />
              <span>เมนูด่วนสำหรับเจ้าของสวน</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              เข้าถึงการบันทึกล็อตเหมาสวน ค่าใช้จ่ายแฝง และการติดตามลูกหนี้
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <Link
              href="/lots"
              className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 hover:bg-white transition-all group"
            >
              <span className="text-xs font-bold text-slate-500">บันทึกล็อตผลไม้</span>
              <div className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors mt-1">
                ล็อตรับซื้อเข้า
              </div>
              <span className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1">
                คำนวณต้นทุน/กก. <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              href="/expenses"
              className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 hover:bg-white transition-all group"
            >
              <span className="text-xs font-bold text-slate-500">บันทึกค่าใช้จ่าย</span>
              <div className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors mt-1">
                ค่าคนงาน & ขนส่ง
              </div>
              <span className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1">
                และบันทึกของเสีย <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              href="/orders"
              className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-amber-500 hover:bg-white transition-all group"
            >
              <span className="text-xs font-bold text-slate-500">ระบบติดตามหนี้</span>
              <div className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors mt-1">
                {summary.unpaidOrdersCount} บิลค้างชำระ
              </div>
              <span className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1">
                รับชำระย้อนหลัง <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          <div className="text-xs font-bold text-slate-500 flex items-center justify-between border-t border-slate-100 pt-3">
            <span>บิลขายทั้งหมด: <strong className="text-slate-900">{summary.ordersCount}</strong> บิล</span>
            <span>สถานะระบบ: <span className="text-emerald-700 font-black">พร้อมใช้งาน 100%</span></span>
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900">รายการขายล่าสุด</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">ประวัติการออกบิลและช่องทางการชำระเงิน</p>
          </div>
          <Link
            href="/orders"
            className="text-sm font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            ดูทั้งหมด ({orders.length}) <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto pt-3">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="pb-3">เลขที่บิล</th>
                <th className="pb-3">ลูกค้า</th>
                <th className="pb-3">รายการสินค้า</th>
                <th className="pb-3">ยอดสุทธิ</th>
                <th className="pb-3">วิธีชำระ</th>
                <th className="pb-3">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-slate-900">{order.order_number}</td>
                  <td className="py-3.5 font-semibold text-slate-800">{order.customer_name}</td>
                  <td className="py-3.5 text-slate-600">
                    {order.items.map(i => `${i.product_name} (${i.quantity_or_weight} ${i.unit_type === 'kg' ? 'กก.' : 'ชิ้น'})`).join(', ')}
                  </td>
                  <td className="py-3.5 font-mono font-black text-emerald-700 text-base">
                    ฿{order.total_amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 uppercase font-semibold text-slate-600">{order.payment_method}</td>
                  <td className="py-3.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.payment_status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {order.payment_status === 'paid' ? 'ชำระแล้ว' : 'ค้างชำระ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

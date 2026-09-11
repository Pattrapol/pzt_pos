'use client';

import React, { useState, useEffect } from 'react';
import { Order, StoreSettings, PaymentMethod } from '@/types/pos';
import { storage } from '@/lib/storage';
import ReceiptModal from '@/components/ReceiptModal';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  Printer
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState<StoreSettings>(storage.getSettings());

  // Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Settle Debt Modal
  const [settleOrder, setSettleOrder] = useState<Order | null>(null);
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>('promptpay');

  const loadOrders = () => {
    setOrders(storage.getOrders());
    setSettings(storage.getSettings());
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filterStatus === 'all' ? true : o.payment_status === filterStatus;
    const matchSearch = 
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_phone && o.customer_phone.includes(search));
    return matchStatus && matchSearch;
  });

  const totalSales = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalPendingCredit = orders
    .filter(o => o.payment_status === 'pending')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleOrder) return;

    storage.updateOrderStatus(settleOrder.id, 'paid', settleMethod);
    setSettleOrder(null);
    loadOrders();
    alert('บันทึกรับชำระเงินเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <span>📑 บิลขาย & บัญชีลูกหนี้ (ค้างชำระ)</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
            ตรวจสอบรายการบิลทั้งหมด พิมพ์ใบเสร็จย้อนหลัง และติดตามยอดค้างชำระของลูกค้า
          </p>
        </div>
      </div>

      {/* KPI Cards - Minimal White */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">จำนวนบิลทั้งหมด</span>
          <div className="text-3xl font-black font-mono text-slate-900 mt-2">
            {orders.length} <span className="text-base text-slate-500 font-sans">บิล</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">ยอดขายรวมทั้งหมด</span>
          <div className="text-3xl font-black font-mono text-emerald-700 mt-2">
            ฿{totalSales.toLocaleString()}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-amber-50/70 border-2 border-amber-300 shadow-xs">
          <span className="text-xs text-amber-900 flex items-center gap-1 font-black uppercase">
            <Clock className="h-4 w-4" /> ยอดค้างชำระ (รอเก็บเงิน)
          </span>
          <div className="text-3xl font-black font-mono text-amber-900 mt-2">
            ฿{totalPendingCredit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขบิล, ชื่อลูกค้า, เบอร์โทร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'paid', label: 'ชำระแล้ว' },
            { id: 'pending', label: 'ค้างชำระ (ลงบัญชี)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-5 py-2.5 text-sm font-bold rounded-2xl whitespace-nowrap transition-all active:scale-95 ${
                filterStatus === tab.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="pb-3">เลขที่บิล</th>
                <th className="pb-3">วันและเวลา</th>
                <th className="pb-3">ลูกค้า</th>
                <th className="pb-3">รายการสินค้า</th>
                <th className="pb-3">ยอดสุทธิ</th>
                <th className="pb-3">วิธีชำระ</th>
                <th className="pb-3">สถานะ</th>
                <th className="pb-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    ไม่พบบิลการขายที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPending = order.payment_status === 'pending';
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-mono font-bold text-slate-900">
                        {order.order_number}
                      </td>
                      <td className="py-4 text-slate-500">
                        {new Date(order.created_at).toLocaleString('th-TH')}
                      </td>
                      <td className="py-4">
                        <div className="font-bold text-slate-900">{order.customer_name}</div>
                        {order.customer_phone && (
                          <div className="text-xs text-slate-500">{order.customer_phone}</div>
                        )}
                      </td>
                      <td className="py-4 text-slate-600 max-w-[240px] truncate">
                        {order.items.map(i => `${i.product_name} (${i.quantity_or_weight} ${i.unit_type === 'kg' ? 'กก.' : 'ชิ้น'})`).join(', ')}
                      </td>
                      <td className="py-4 font-mono font-black text-emerald-700 text-base">
                        ฿{order.total_amount.toLocaleString()}
                      </td>
                      <td className="py-4 uppercase font-semibold text-slate-600">
                        {order.payment_method === 'promptpay' ? 'QR พร้อมเพย์' :
                         order.payment_method === 'cash' ? 'เงินสด' :
                         order.payment_method === 'credit' ? 'ค้างชำระ' : 'โอนเงิน'}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          isPending 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {isPending ? 'ค้างชำระ' : 'ชำระแล้ว'}
                        </span>
                        {isPending && order.due_date && (
                          <div className="text-xs text-amber-800 font-bold mt-1">
                            นัด: {order.due_date}
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-right space-x-2">
                        {isPending && (
                          <button
                            onClick={() => setSettleOrder(order)}
                            className="px-4 py-2 text-xs font-black rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-xs"
                          >
                            รับเงินปิดบิล
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsReceiptOpen(true);
                          }}
                          className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1.5"
                          title="ดูและพิมพ์สลิป"
                        >
                          <Printer className="h-4 w-4 text-emerald-600" />
                          <span>พิมพ์สลิป</span>
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

      {/* Settle Debt Modal */}
      {settleOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white border-2 border-slate-200 p-6 sm:p-7 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-amber-600 stroke-[2.5]" />
              <span>บันทึกรับชำระบิลค้างจ่าย</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>เลขที่บิล:</span>
                <span className="font-mono text-slate-900 font-bold">{settleOrder.order_number}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ลูกค้า:</span>
                <span className="text-slate-900 font-bold">{settleOrder.customer_name}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                <span>ยอดเงินที่ต้องรับ:</span>
                <span className="text-2xl font-black font-mono text-emerald-700">
                  ฿{settleOrder.total_amount.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">
                  ช่องทางรับเงิน
                </label>
                <select
                  value={settleMethod}
                  onChange={(e) => setSettleMethod(e.target.value as PaymentMethod)}
                  className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="promptpay">สแกน PromptPay QR</option>
                  <option value="cash">เงินสด (Cash)</option>
                  <option value="transfer">โอนเข้าบัญชีธนาคาร</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSettleOrder(null)}
                  className="px-5 py-3 text-sm font-bold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-base font-black rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 active:scale-95"
                >
                  ยืนยันรับเงินและปิดบิล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        order={selectedOrder}
        settings={settings}
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedOrder(null);
        }}
      />

    </div>
  );
}

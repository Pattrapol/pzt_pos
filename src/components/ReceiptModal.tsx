'use client';

import React from 'react';
import { Order, StoreSettings } from '@/types/pos';
import { X, Printer, Copy, Check, CheckCircle } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptModal({
  order,
  settings,
  isOpen,
  onClose,
}: ReceiptModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      `=== ${settings.store_name} ===`,
      `${settings.branch}`,
      `โทร: ${settings.phone}`,
      `เลขที่บิล: ${order.order_number}`,
      `วันที่: ${new Date(order.created_at).toLocaleString('th-TH')}`,
      `ลูกค้า: ${order.customer_name}`,
      `--------------------------------`,
      ...order.items.map(item => 
        `${item.product_name} x ${item.quantity_or_weight} ${item.unit_type === 'kg' ? 'กก.' : 'ชิ้น'} = ฿${item.subtotal.toLocaleString()}`
      ),
      `--------------------------------`,
      `ยอดรวม: ฿${order.subtotal.toLocaleString()}`,
      order.discount > 0 ? `ส่วนลด: -฿${order.discount.toLocaleString()}` : null,
      `ยอดสุทธิ: ฿${order.total_amount.toLocaleString()}`,
      `ชำระโดย: ${order.payment_method.toUpperCase()}`,
      order.cash_received ? `รับเงิน: ฿${order.cash_received.toLocaleString()}` : null,
      order.change_given ? `เงินทอน: ฿${order.change_given.toLocaleString()}` : null,
      `--------------------------------`,
      settings.receipt_footer
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md max-h-[95vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl text-slate-900">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2 text-emerald-700 font-black text-lg">
            <CheckCircle className="h-6 w-6 text-emerald-600 stroke-[2.5]" />
            <span>คิดเงินเรียบร้อยแล้ว!</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="ปิด"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Real-world Thermal Receipt Preview */}
        <div 
          id="thermal-receipt" 
          className="my-5 mx-auto p-6 rounded-3xl bg-slate-50 text-slate-900 font-mono text-xs shadow-inner border border-slate-200"
          style={{ maxWidth: '340px' }}
        >
          {/* Receipt Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <div className="text-base font-black tracking-tight">{settings.store_name}</div>
            <div className="text-[12px] text-slate-600">{settings.branch}</div>
            <div className="text-[12px] text-slate-600">โทร: {settings.phone}</div>
            {settings.tax_id && (
              <div className="text-[11px] text-slate-500">เลขประจำตัวผู้เสียภาษี: {settings.tax_id}</div>
            )}
          </div>

          {/* Bill Info */}
          <div className="py-2.5 space-y-1 border-b border-dashed border-slate-300 text-[12px]">
            <div className="flex justify-between">
              <span className="text-slate-500">เลขที่บิล:</span>
              <span className="font-bold">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">วันที่:</span>
              <span>{new Date(order.created_at).toLocaleString('th-TH')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ลูกค้า:</span>
              <span className="font-bold">{order.customer_name}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
            <div className="flex justify-between font-bold text-[12px] pb-1 border-b border-slate-200">
              <span>รายการผลไม้</span>
              <span>จำนวนเงิน</span>
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-[12px]">
                  <span className="truncate max-w-[200px]">{item.product_name}</span>
                  <span>฿{item.subtotal.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>
                    {item.quantity_or_weight} {item.unit_type === 'kg' ? 'กก.' : 'ชิ้น'} @ ฿{item.unit_price}
                  </span>
                  {item.notes && <span className="italic text-slate-400">({item.notes})</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="py-2.5 space-y-1 border-b border-dashed border-slate-300 text-[12px]">
            <div className="flex justify-between">
              <span className="text-slate-600">รวมเป็นเงิน:</span>
              <span>฿{order.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>ส่วนลด:</span>
                <span>-฿{order.discount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-black pt-1 border-t border-slate-200 text-emerald-800">
              <span>ยอดสุทธิ (Total):</span>
              <span className="text-lg">฿{order.total_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="py-2.5 space-y-1 border-b border-dashed border-slate-300 text-[12px]">
            <div className="flex justify-between">
              <span className="text-slate-500">วิธีชำระ:</span>
              <span className="font-bold">
                {order.payment_method === 'promptpay' ? 'พร้อมเพย์ QR' :
                 order.payment_method === 'cash' ? 'เงินสด' :
                 order.payment_method === 'credit' ? 'ค้างชำระ (ลงบัญชี)' : 'โอนธนาคาร'}
              </span>
            </div>

            {order.payment_method === 'cash' && order.cash_received && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">รับเงินมา:</span>
                  <span>฿{order.cash_received.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>เงินทอน:</span>
                  <span>฿{(order.change_given || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            {order.payment_method === 'credit' && order.due_date && (
              <div className="flex justify-between text-amber-800 font-bold">
                <span>นัดชำระวันที่:</span>
                <span>{order.due_date}</span>
              </div>
            )}
          </div>

          {/* Receipt Footer */}
          <div className="pt-3 text-center text-[11px] text-slate-500 leading-tight">
            {settings.receipt_footer}
            <div className="mt-2 text-[10px] text-slate-400">Powered by PZT FRUIT POS</div>
          </div>
        </div>

        {/* Modal Action Buttons - Big buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2 no-print">
          <button
            type="button"
            onClick={handleCopyText}
            className="py-3.5 px-3 text-sm font-bold rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
            <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความสลิป'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-3.5 px-3 text-base font-black rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Printer className="h-5 w-5" />
            <span>พิมพ์สลิป</span>
          </button>
        </div>

        <div className="mt-4 text-center no-print">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
          >
            ปิดหน้าต่าง และเริ่มบิลถัดไป
          </button>
        </div>

      </div>
    </div>
  );
}

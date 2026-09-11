'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  Order, 
  OrderItem, 
  PaymentMethod, 
  CustomerType, 
  StoreSettings 
} from '@/types/pos';
import { generatePromptPayPayload } from '@/lib/promptpay';
import { 
  X, 
  Banknote, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  User,
  Phone
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  subtotal: number;
  settings: StoreSettings;
  onOrderCompleted: (order: Order) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  subtotal,
  settings,
  onOrderCompleted,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay');
  const [discount, setDiscount] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('ลูกค้าหน้าร้าน');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const totalAmount = Math.max(0, subtotal - discount);
  const numCashReceived = parseFloat(cashReceived) || 0;
  const changeGiven = Math.max(0, numCashReceived - totalAmount);

  // Generate Dynamic PromptPay QR Code
  useEffect(() => {
    if (paymentMethod === 'promptpay' && totalAmount > 0 && settings.promptpay_id) {
      try {
        const payload = generatePromptPayPayload(settings.promptpay_id, totalAmount);
        QRCode.toDataURL(payload, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 280,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        }).then((url) => {
          setQrCodeDataUrl(url);
        });
      } catch (err) {
        console.error('Failed to generate PromptPay QR', err);
      }
    }
  }, [paymentMethod, totalAmount, settings.promptpay_id]);

  if (!isOpen) return null;

  const handleCashPreset = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const handleCompleteOrder = () => {
    if (paymentMethod === 'cash' && numCashReceived < totalAmount) {
      alert('จำนวนเงินสดที่รับมาต้องไม่น้อยกว่ายอดชำระครับ');
      return;
    }

    setIsProcessing(true);

    const newOrder: Omit<Order, 'id' | 'order_number' | 'created_at'> = {
      customer_name: customerName.trim() || 'ลูกค้าหน้าร้าน',
      customer_phone: customerPhone.trim() || undefined,
      customer_type: 'retail',
      subtotal,
      discount,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'credit' ? 'pending' : 'paid',
      cash_received: paymentMethod === 'cash' ? numCashReceived : undefined,
      change_given: paymentMethod === 'cash' ? changeGiven : undefined,
      due_date: paymentMethod === 'credit' ? dueDate : null,
      items: items
    };

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    const createdOrder: Order = {
      ...newOrder,
      id: 'ord-' + Date.now(),
      order_number: 'POS-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900),
      created_at: new Date().toISOString()
    };

    setIsProcessing(false);
    onOrderCompleted(createdOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl text-slate-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
              <span>💳 คิดเงิน & ชำระเงิน</span>
              <span className="text-sm px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {items.length} รายการ
              </span>
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">เลือกวิธีรับเงิน และตรวจสอบยอดเงิน</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="ปิด"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        {/* Amount Summary Card - Giant Legible Display */}
        <div className="my-5 p-6 rounded-3xl bg-emerald-50/70 border-2 border-emerald-500/40 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-sm font-bold text-slate-600 block">ยอดที่ต้องชำระ (บาท):</span>
            <div className="text-4xl sm:text-5xl font-black text-emerald-700 font-mono mt-1">
              ฿{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {discount > 0 && (
              <span className="text-xs text-red-500 font-semibold mt-1 block">
                หักส่วนลด ฿{discount.toLocaleString()} จากเดิม ฿{subtotal.toLocaleString()}
              </span>
            )}
          </div>

          {/* Discount Button/Input */}
          <div className="text-right">
            <label className="text-xs font-bold text-slate-600 block mb-1">ให้ส่วนลด (บาท):</label>
            <input
              type="number"
              min="0"
              value={discount || ''}
              onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0"
              className="w-28 px-3 py-2 text-lg font-bold rounded-2xl bg-white border-2 border-slate-200 text-slate-900 text-right focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>
        </div>

        {/* Payment Method Selector Tabs - Responsive Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
          <button
            type="button"
            onClick={() => setPaymentMethod('promptpay')}
            className={`p-2.5 sm:p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1.5 sm:gap-2 active:scale-95 ${
              paymentMethod === 'promptpay'
                ? 'bg-emerald-600 text-white font-black border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <QrCode className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="text-xs sm:text-base font-bold">สแกน QR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentMethod('cash');
              if (!cashReceived) setCashReceived(totalAmount.toString());
            }}
            className={`p-2.5 sm:p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1.5 sm:gap-2 active:scale-95 ${
              paymentMethod === 'cash'
                ? 'bg-emerald-600 text-white font-black border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Banknote className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="text-xs sm:text-base font-bold">รับเงินสด</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('credit')}
            className={`p-2.5 sm:p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1.5 sm:gap-2 active:scale-95 ${
              paymentMethod === 'credit'
                ? 'bg-amber-500 text-slate-950 font-black border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="text-xs sm:text-base font-bold">ค้างจ่าย</span>
          </button>
        </div>

        {/* Dynamic Payment Details Area */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 mb-5">
          
          {/* 1. PromptPay View - Responsive QR */}
          {paymentMethod === 'promptpay' && (
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 sm:p-4 bg-white rounded-3xl shadow-md border border-slate-200 inline-block">
                {qrCodeDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeDataUrl}
                    alt="PromptPay QR Code"
                    className="w-48 h-48 sm:w-60 sm:h-60 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center text-slate-400 text-sm">
                    กำลังสร้าง QR Code...
                  </div>
                )}
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 block">
                  พร้อมเพย์: <span className="text-emerald-700 font-black font-mono">{settings.promptpay_id}</span>
                </span>
                <p className="text-sm text-slate-600 mt-0.5">
                  ลูกค้าเปิดแอปธนาคารสแกนได้ทันที ยอดเงินระบุไว้พอดี <strong>฿{totalAmount.toLocaleString()}</strong>
                </p>
              </div>
            </div>
          )}

          {/* 2. Cash View */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">
                    รับเงินสดจากลูกค้ามา (บาท):
                  </label>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 text-2xl font-black font-mono rounded-2xl bg-white border-2 border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex flex-col justify-center">
                  <span className="text-sm font-bold text-slate-600">เงินทอนให้ลูกค้า:</span>
                  <span className={`text-3xl font-black font-mono ${changeGiven >= 0 && numCashReceived >= totalAmount ? 'text-emerald-600' : 'text-red-500'}`}>
                    ฿{changeGiven.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {numCashReceived < totalAmount && (
                    <span className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="h-4 w-4" /> ยังขาดอีก ฿{(totalAmount - numCashReceived).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Cash Buttons for Seniors */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  ปุ่มลัดธนบัตรที่รับมา:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCashPreset(totalAmount)}
                    className="py-2.5 px-4 text-sm font-black rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 active:scale-95 transition-all shadow-xs"
                  >
                    รับมาพอดี (฿{totalAmount.toLocaleString()})
                  </button>
                  {[100, 500, 1000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleCashPreset(val)}
                      className="py-2.5 px-4 text-base font-black rounded-xl bg-white text-slate-800 border-2 border-slate-200 hover:border-emerald-500 active:scale-95 transition-all shadow-xs"
                    >
                      แบงก์ ฿{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Credit / Pay Later View */}
          {paymentMethod === 'credit' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 font-medium">
                บิลนี้จะถูกลงเป็น <strong>&quot;ค้างชำระ (ลงบัญชี)&quot;</strong> สามารถเปิดดูยอดและกดรับเงินย้อนหลังได้ในเมนู &quot;บิลขาย & ลูกหนี้&quot;
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">
                  กำหนดวันนัดชำระเงิน:
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 text-base rounded-2xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

        </div>

        {/* Customer Information Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-1">
              <User className="h-3.5 w-3.5" /> ชื่อลูกค้า (ถ้าต้องการระบุ):
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="ลูกค้าหน้าร้าน"
              className="w-full px-4 py-2.5 text-sm rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-1">
              <Phone className="h-3.5 w-3.5" /> เบอร์โทรศัพท์ลูกค้า (ถ้ามี):
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="08X-XXX-XXXX"
              className="w-full px-4 py-2.5 text-sm rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Action Buttons - Giant confirmation button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-4 px-4 text-base font-bold rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            ย้อนกลับ
          </button>

          <button
            type="button"
            onClick={handleCompleteOrder}
            disabled={isProcessing || (paymentMethod === 'cash' && numCashReceived < totalAmount)}
            className={`w-2/3 py-4 px-4 text-xl font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
              paymentMethod === 'credit'
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
            }`}
          >
            <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
            <span>
              {paymentMethod === 'credit' ? 'บันทึกบิลค้างชำระ' : `ยืนยันรับเงิน (฿${totalAmount.toLocaleString()})`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}

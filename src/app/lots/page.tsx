'use client';

import React, { useState, useEffect } from 'react';
import { InboundLot } from '@/types/pos';
import { storage } from '@/lib/storage';
import { 
  Truck, 
  Plus, 
  Trash2
} from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';

export default function LotsPage() {
  const [lots, setLots] = useState<InboundLot[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [sourceName, setSourceName] = useState('');
  const [variety, setVariety] = useState('หมอนทอง');
  const [grade, setGrade] = useState('เกรด A');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [weightKg, setWeightKg] = useState<string>('');
  const [costTotal, setCostTotal] = useState<string>('');
  const [notes, setNotes] = useState('');

  const loadLots = () => {
    setLots(storage.getLots());
  };

  useEffect(() => {
    loadLots();
  }, []);

  const numWeight = parseFloat(weightKg) || 0;
  const numCost = parseFloat(costTotal) || 0;
  const calculatedCostPerKg = numWeight > 0 ? Math.round((numCost / numWeight) * 100) / 100 : 0;

  const handleAddLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName || numWeight <= 0 || numCost <= 0) {
      alert('กรุณากรอกข้อมูลสวน น้ำหนัก และต้นทุนรวมให้ครบถ้วน');
      return;
    }

    const nextSeq = (lots.length + 1).toString().padStart(3, '0');
    const lotNumber = `LOT-${new Date().getFullYear()}-${nextSeq}`;

    storage.addLot({
      lot_number: lotNumber,
      source_name: sourceName.trim(),
      purchase_date: purchaseDate,
      variety,
      grade,
      initial_weight_kg: numWeight,
      cost_total: numCost,
      notes: notes.trim() || undefined
    });

    setSourceName('');
    setWeightKg('');
    setCostTotal('');
    setNotes('');
    setShowAddForm(false);
    loadLots();
  };

  const handleDelete = (id: string) => {
    if (confirm('ยืนยันลบล็อตการรับซื้อนี้?')) {
      storage.deleteLot(id);
      loadLots();
    }
  };

  const totalLotWeight = lots.reduce((sum, l) => sum + l.initial_weight_kg, 0);
  const totalLotCost = lots.reduce((sum, l) => sum + l.cost_total, 0);
  const averageCostPerKg = totalLotWeight > 0 ? Math.round((totalLotCost / totalLotWeight) * 100) / 100 : 0;

  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <span>📦 บันทึกล็อตการรับซื้อผลไม้ & ควบคุมต้นทุน</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
            บันทึกประวัติการเหมาสวน/รับซื้อทุเรียน คำนวณต้นทุนต่อกิโลกรัม และอัปเดตสต็อกอัตโนมัติ
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-base hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
          <span>{showAddForm ? 'ปิดแบบฟอร์ม' : 'บันทึกล็อตใหม่'}</span>
        </button>
      </div>

      {/* Summary KPI Cards - Minimal White */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">น้ำหนักผลไม้ที่รับเข้าทั้งหมด</span>
          <div className="text-3xl font-black font-mono text-slate-900 mt-2">
            {totalLotWeight.toLocaleString()} <span className="text-base text-slate-500 font-sans">กก.</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">มูลค่าต้นทุนการรับซื้อรวม</span>
          <div className="text-3xl font-black font-mono text-amber-700 mt-2">
            ฿{totalLotCost.toLocaleString()}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">ต้นทุนเฉลี่ยต่อกิโลกรัม</span>
          <div className="text-3xl font-black font-mono text-emerald-700 mt-2">
            ฿{averageCostPerKg} <span className="text-base text-slate-500 font-sans">/กก.</span>
          </div>
        </div>
      </div>

      {/* Add New Lot Form */}
      {showAddForm && (
        <form onSubmit={handleAddLot} className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-500/50 shadow-xl space-y-5 animate-in fade-in duration-150">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Truck className="h-6 w-6 text-emerald-600" />
            <span>ฟอร์มบันทึกการรับซื้อผลไม้เข้า (Inbound Lot)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">
                ชื่อสวน / แหล่งที่มารับซื้อ *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น สวนลุงสมชาย จันทบุรี (แปลง 2)"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">
                สายพันธุ์ *
              </label>
              <select
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
              >
                <option value="หมอนทอง">หมอนทอง</option>
                <option value="ก้านยาว">ก้านยาว</option>
                <option value="ชะนี">ชะนี</option>
                <option value="พวงมณี">พวงมณี</option>
                <option value="นกกระจิบ">นกกระจิบ</option>
                <option value="มังคุด">มังคุด</option>
                <option value="เงาะ">เงาะ</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">
                เกรดสินค้า
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
              >
                <option value="เกรด A">เกรด A (พรีเมียม ส่งออก)</option>
                <option value="เกรด B">เกรด B (สวยมาตรฐาน)</option>
                <option value="เหมาสวน">เหมาสวนคละเกรด</option>
                <option value="ตกไซส์">ตกไซส์ / เบอร์เล็ก</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">
                วันที่รับซื้อเข้า
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">
                น้ำหนักชั่งเข้า (กก.) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                placeholder="เช่น 500"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">
                ต้นทุนรวมทั้งล็อต (บาท) *
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="เช่น 60000"
                value={costTotal}
                onChange={(e) => setCostTotal(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Auto calculated cost indicator */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">ระบบคำนวณต้นทุนต่อ กก. ให้อัตโนมัติ:</span>
            <span className="text-2xl font-black font-mono text-emerald-800">
              ฿{calculatedCostPerKg} บาท / กก.
            </span>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1">
              หมายเหตุ / รายละเอียดเพิ่มเติม
            </label>
            <input
              type="text"
              placeholder="เช่น ทุเรียนตัด 85% ขนด้วยรถกระบะ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 text-sm font-bold rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-7 py-3 text-base font-black rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
            >
              บันทึกล็อตและเพิ่มสต็อก
            </button>
          </div>
        </form>
      )}

      {/* Lots List Table - Clean Minimal */}
      <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
        <h3 className="text-xl font-black text-slate-900 mb-4">รายการล็อตรับซื้อทั้งหมด ({lots.length} ล็อต)</h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="pb-3">รหัสล็อต</th>
                <th className="pb-3">วันที่</th>
                <th className="pb-3">แหล่งที่มา/สวน</th>
                <th className="pb-3">สายพันธุ์</th>
                <th className="pb-3">เกรด</th>
                <th className="pb-3">น้ำหนักเข้า</th>
                <th className="pb-3">ต้นทุนรวม</th>
                <th className="pb-3">ต้นทุน/กก.</th>
                <th className="pb-3">หมายเหตุ</th>
                <th className="pb-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-mono font-bold text-slate-900">{lot.lot_number}</td>
                  <td className="py-4 text-slate-500">{lot.purchase_date}</td>
                  <td className="py-4 font-bold text-slate-900">{lot.source_name}</td>
                  <td className="py-4 font-semibold text-slate-700">{lot.variety}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      {lot.grade}
                    </span>
                  </td>
                  <td className="py-4 font-mono font-bold text-slate-900">
                    {lot.initial_weight_kg.toLocaleString()} กก.
                  </td>
                  <td className="py-4 font-mono font-bold text-amber-700">
                    ฿{lot.cost_total.toLocaleString()}
                  </td>
                  <td className="py-4 font-mono font-black text-emerald-700 text-base">
                    ฿{lot.cost_per_kg}
                  </td>
                  <td className="py-4 text-slate-500 max-w-[200px] truncate">{lot.notes || '-'}</td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleDelete(lot.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="ลบล็อตนี้"
                      aria-label="ลบ"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </RoleGuard>
);
}

'use client';

import React, { useState, useEffect } from 'react';
import { Expense, WasteRecord, ExpenseCategory, WasteType } from '@/types/pos';
import { storage } from '@/lib/storage';
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Truck, 
  Users, 
  Box, 
  Store, 
  Layers, 
  HelpCircle 
} from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'waste'>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);

  // Expense form
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('labor');
  const [expAmount, setExpAmount] = useState<string>('');
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expNotes, setExpNotes] = useState('');

  // Waste form
  const [wasteVariety, setWasteVariety] = useState('หมอนทอง');
  const [wasteType, setWasteType] = useState<WasteType>('spoilage');
  const [wasteWeight, setWasteWeight] = useState<string>('');
  const [wasteLossValue, setWasteLossValue] = useState<string>('');
  const [wasteReason, setWasteReason] = useState('');

  const loadData = () => {
    setExpenses(storage.getExpenses());
    setWasteRecords(storage.getWasteRecords());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expAmount) || 0;
    if (!expTitle || amount <= 0) {
      alert('กรุณากรอกรายการและจำนวนเงินให้ถูกต้อง');
      return;
    }

    storage.addExpense({
      title: expTitle.trim(),
      category: expCategory,
      amount,
      expense_date: expDate,
      notes: expNotes.trim() || undefined
    });

    setExpTitle('');
    setExpAmount('');
    setExpNotes('');
    loadData();
  };

  const handleAddWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(wasteWeight) || 0;
    const lossVal = parseFloat(wasteLossValue) || 0;
    if (weight <= 0) {
      alert('กรุณาระบุน้ำหนักของเสีย');
      return;
    }

    storage.addWasteRecord({
      variety: wasteVariety,
      waste_type: wasteType,
      weight_kg: weight,
      estimated_loss_value: lossVal,
      reason: wasteReason.trim() || 'คัดทิ้งหน้าร้าน'
    });

    setWasteWeight('');
    setWasteLossValue('');
    setWasteReason('');
    loadData();
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('ลบรายการค่าใช้จ่ายนี้?')) {
      storage.deleteExpense(id);
      loadData();
    }
  };

  const handleDeleteWaste = (id: string) => {
    if (confirm('ลบรายการของเสียนี้?')) {
      storage.deleteWasteRecord(id);
      loadData();
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalWasteLoss = wasteRecords.reduce((sum, w) => sum + w.estimated_loss_value, 0);
  const totalWasteWeight = wasteRecords.reduce((sum, w) => sum + w.weight_kg, 0);

  const categoryLabels: Record<ExpenseCategory, { label: string; icon: any }> = {
    labor: { label: 'ค่าแรง/คนงาน', icon: Users },
    transport: { label: 'ค่าขนส่ง/น้ำมัน', icon: Truck },
    packaging: { label: 'ค่ากล่อง/ถุง/โฟม', icon: Box },
    stall_rent: { label: 'ค่าเช่าแผง/ที่', icon: Store },
    utilities: { label: 'ค่าน้ำ/ค่าไฟ', icon: Layers },
    other: { label: 'อื่นๆ', icon: HelpCircle }
  };

  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
          <span>💸 บันทึกค่าใช้จ่ายแฝง & ความสูญเสีย (Waste)</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
          ติดตามต้นทุนดำเนินงานทั้งหมด เช่น ค่าจ้างคนงานตัด ค่าน้ำมันขนส่ง กล่องบรรจุภัณฑ์ และผลไม้ตกเกรด/เน่าเสีย
        </p>
      </div>

      {/* KPI Cards - Minimal White */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">ค่าใช้จ่ายดำเนินงานรวม</span>
          <div className="text-3xl font-black font-mono text-red-600 mt-2">
            ฿{totalExpenseAmount.toLocaleString()}
          </div>
          <span className="text-xs font-bold text-slate-400 mt-1 block">{expenses.length} รายการ</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">น้ำหนักผลไม้สูญเสีย/ตกเกรด</span>
          <div className="text-3xl font-black font-mono text-amber-700 mt-2">
            {totalWasteWeight.toLocaleString()} <span className="text-base text-slate-500 font-sans">กก.</span>
          </div>
          <span className="text-xs font-bold text-slate-400 mt-1 block">{wasteRecords.length} บันทึก</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">มูลค่าความเสียหายประเมิน</span>
          <div className="text-3xl font-black font-mono text-slate-900 mt-2">
            ฿{totalWasteLoss.toLocaleString()}
          </div>
          <span className="text-xs font-bold text-slate-400 mt-1 block">กระทบต่อกำไรสุทธิ</span>
        </div>
      </div>

      {/* Big Tabs */}
      <div className="flex gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-6 py-3 rounded-2xl text-base font-black transition-all active:scale-95 ${
            activeTab === 'expenses'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ค่าใช้จ่ายดำเนินงาน ({expenses.length})
        </button>

        <button
          onClick={() => setActiveTab('waste')}
          className={`px-6 py-3 rounded-2xl text-base font-black transition-all active:scale-95 ${
            activeTab === 'waste'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ของเสีย & ตกเกรด ({wasteRecords.length})
        </button>
      </div>

      {/* Tab 1: Expenses */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Expense Form */}
          <form onSubmit={handleAddExpense} className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600 stroke-[2.5]" />
              <span>เพิ่มรายการค่าใช้จ่าย</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ชื่อรายการค่าใช้จ่าย *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ค่าตัดทุเรียน 4 คน, ค่าน้ำมัน..."
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  หมวดหมู่
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="labor">ค่าแรง/คนงาน</option>
                  <option value="transport">ค่าขนส่ง/น้ำมัน</option>
                  <option value="packaging">ค่ากล่อง/ถุง/โฟม</option>
                  <option value="stall_rent">ค่าเช่าแผง/ที่</option>
                  <option value="utilities">ค่าน้ำ/ค่าไฟ</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  จำนวนเงิน (บาท) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="0.00"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                วันที่จ่าย
              </label>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                หมายเหตุเพิ่มเติม
              </label>
              <input
                type="text"
                placeholder="เช่น ใบเสร็จปั๊ม ปตท...."
                value={expNotes}
                onChange={(e) => setExpNotes(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-base hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              บันทึกค่าใช้จ่าย
            </button>
          </form>

          {/* Expenses Table */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
            <h3 className="text-xl font-black text-slate-900 mb-4">รายการค่าใช้จ่ายทั้งหมด</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="pb-3">วันที่</th>
                    <th className="pb-3">รายการ</th>
                    <th className="pb-3">หมวดหมู่</th>
                    <th className="pb-3">จำนวนเงิน</th>
                    <th className="pb-3">หมายเหตุ</th>
                    <th className="pb-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => {
                    const CatInfo = categoryLabels[exp.category] || categoryLabels.other;
                    const Icon = CatInfo.icon;
                    return (
                      <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 text-slate-500">{exp.expense_date}</td>
                        <td className="py-3.5 font-bold text-slate-900">{exp.title}</td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                            <Icon className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{CatInfo.label}</span>
                          </span>
                        </td>
                        <td className="py-3.5 font-mono font-black text-red-600 text-base">
                          ฿{exp.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-slate-500 max-w-[150px] truncate">{exp.notes || '-'}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            aria-label="ลบ"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Waste & Loss */}
      {activeTab === 'waste' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Waste Form */}
          <form onSubmit={handleAddWaste} className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 stroke-[2.5]" />
              <span>บันทึกผลเสีย / ตกเกรด / เปลือกทิ้ง</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                สายพันธุ์
              </label>
              <select
                value={wasteVariety}
                onChange={(e) => setWasteVariety(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
              >
                <option value="หมอนทอง">หมอนทอง</option>
                <option value="ก้านยาว">ก้านยาว</option>
                <option value="ชะนี">ชะนี</option>
                <option value="มังคุด">มังคุด</option>
                <option value="เงาะ">เงาะ</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ประเภท
                </label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value as WasteType)}
                  className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="spoilage">ผลเน่า/สุกเกิน</option>
                  <option value="damaged">หนามหัก/เสียหาย</option>
                  <option value="grade_drop">ตกเกรด/คืนซาก</option>
                  <option value="peel_loss">เปลือกแกะทิ้ง</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  น้ำหนัก (กก.) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="0.1"
                  placeholder="เช่น 5.5"
                  value={wasteWeight}
                  onChange={(e) => setWasteWeight(e.target.value)}
                  className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                มูลค่าความเสียหายประเมิน (บาท)
              </label>
              <input
                type="number"
                placeholder="เช่น 600"
                value={wasteLossValue}
                onChange={(e) => setWasteLossValue(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                สาเหตุ / รายละเอียด
              </label>
              <input
                type="text"
                placeholder="เช่น หนอนเจาะ, ทุเรียนอ่อน..."
                value={wasteReason}
                onChange={(e) => setWasteReason(e.target.value)}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-base hover:bg-amber-400 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              บันทึกและตัดสต็อก
            </button>
          </form>

          {/* Waste Table */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
            <h3 className="text-xl font-black text-slate-900 mb-4">บันทึกของเสียและความสูญเสีย</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="pb-3">วันที่</th>
                    <th className="pb-3">สายพันธุ์</th>
                    <th className="pb-3">ประเภท</th>
                    <th className="pb-3">น้ำหนักสูญเสีย</th>
                    <th className="pb-3">มูลค่าเสียหาย</th>
                    <th className="pb-3">สาเหตุ</th>
                    <th className="pb-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wasteRecords.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 text-slate-500">
                        {new Date(w.recorded_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-3.5 font-bold text-slate-900">{w.variety}</td>
                      <td className="py-3.5">
                        <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                          {w.waste_type}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-amber-800">
                        {w.weight_kg} กก.
                      </td>
                      <td className="py-3.5 font-mono text-slate-700">
                        ฿{w.estimated_loss_value.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-slate-500 max-w-[150px] truncate">{w.reason}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteWaste(w.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
      )}
    </div>
  </RoleGuard>
);
}

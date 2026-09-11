'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings, AppUser } from '@/types/pos';
import { storage, DEFAULT_SETTINGS } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { 
  Store, 
  QrCode, 
  Database, 
  Check, 
  RefreshCw, 
  Download, 
  ExternalLink,
  Users,
  UserPlus,
  Trash2,
  Shield,
  KeyRound
} from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';
import AuthModal from '@/components/AuthModal';

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadData = () => {
    setSettings(storage.getSettings());
    setUsers(storage.getUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`คุณต้องการลบพนักงาน/ผู้ใช้งาน "${name}" หรือไม่?`)) {
      try {
        storage.deleteUser(id);
        loadData();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'ไม่สามารถลบได้');
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDemo = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตัวอย่างหรือไม่?')) {
      storage.resetToDemo();
      setSettings(storage.getSettings());
      alert('รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว');
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const backup = {
      products: storage.getProducts(),
      lots: storage.getLots(),
      expenses: storage.getExpenses(),
      waste: storage.getWasteRecords(),
      orders: storage.getOrders(),
      settings: storage.getSettings(),
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pzt-fruit-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
          <span>⚙️ ตั้งค่าร้านค้า & เบอร์พร้อมเพย์รับเงิน</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
          กำหนดชื่อร้าน เบอร์พร้อมเพย์สำหรับสแกนรับเงิน และคำแนะนำเชื่อมต่อกับ Supabase / Vercel
        </p>
      </div>

      {/* Supabase Status Banner - Minimal & Clear */}
      <div className={`p-6 rounded-3xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
        isSupabaseConfigured
          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
          : 'bg-amber-50 border-amber-300 text-amber-900'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`p-3 rounded-2xl ${isSupabaseConfigured ? 'bg-emerald-200/80 text-emerald-800' : 'bg-amber-200/80 text-amber-800'}`}>
            <Database className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <span>{isSupabaseConfigured ? 'เชื่อมต่อ Supabase Cloud เรียบร้อยแล้ว' : 'สถานะ: กำลังใช้งานโหมด Offline / Local Demo (ในเครื่อง)'}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-medium">
              {isSupabaseConfigured
                ? 'ข้อมูลทั้งหมดกำลังซิงค์กับฐานข้อมูลคลาวด์ Supabase ของคุณอย่างปลอดภัย'
                : 'ข้อมูลกำลังถูกบันทึกในเครื่อง สามารถกดคิดเงิน ชั่งน้ำหนัก และสรุปกำไรได้ทันทีโดยไม่ต้องเปิดฐานข้อมูล'}
            </p>
          </div>
        </div>

        <a
          href="#supabase-guide"
          className="px-5 py-3 text-xs sm:text-sm font-bold rounded-2xl bg-white border-2 border-slate-300 text-slate-800 hover:bg-slate-50 text-center whitespace-nowrap shadow-xs"
        >
          ดูวิธีต่อ Supabase
        </a>
      </div>

      {/* Store & PromptPay Settings Form - Minimal White */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-6">
        
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Store className="h-6 w-6 text-emerald-600" />
            <span>ข้อมูลร้านค้าและหัวบิลใบเสร็จ</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1">
              ชื่อร้านค้า *
            </label>
            <input
              type="text"
              required
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1">
              สาขา / จุดจำหน่าย
            </label>
            <input
              type="text"
              value={settings.branch}
              onChange={(e) => setSettings({ ...settings, branch: e.target.value })}
              className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1">
              เบอร์โทรศัพท์ร้าน
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1">
              เลขประจำตัวผู้เสียภาษี (ถ้ามี)
            </label>
            <input
              type="text"
              value={settings.tax_id || ''}
              onChange={(e) => setSettings({ ...settings, tax_id: e.target.value })}
              placeholder="0105559999888"
              className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700 block mb-1">
            ที่อยู่ร้านค้า
          </label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700 block mb-1">
            ข้อความท้ายใบเสร็จ (Receipt Footer)
          </label>
          <input
            type="text"
            value={settings.receipt_footer}
            onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
            className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* PromptPay Settings */}
        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-4">
            <QrCode className="h-6 w-6 text-emerald-600" />
            <span>ตั้งค่า PromptPay Dynamic QR (สำหรับสแกนรับเงิน)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">
                เบอร์โทรศัพท์ หรือ เลขบัตร ปชช. / เลขนิติบุคคล *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น 0812345678"
                value={settings.promptpay_id}
                onChange={(e) => setSettings({ ...settings, promptpay_id: e.target.value.replace(/[^0-9]/g, '') })}
                className="w-full px-4 py-3 text-xl font-bold font-mono rounded-2xl bg-slate-50 border-2 border-slate-200 text-emerald-700 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-500 mt-1 block">
                ระบบจะสร้าง QR Code พร้อมยอดเงินเป๊ะๆ ให้ลูกค้าสแกนจ่ายได้ทันที
              </span>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">
                ประเภทพร้อมเพย์
              </label>
              <select
                value={settings.promptpay_type}
                onChange={(e) => setSettings({ ...settings, promptpay_type: e.target.value as any })}
                className="w-full px-4 py-3 text-base rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
              >
                <option value="mobile">เบอร์โทรศัพท์มือถือ (Mobile)</option>
                <option value="national_id">เลขประจำตัวประชาชน / นิติบุคคล (13 หลัก)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {savedSuccess ? (
            <span className="text-sm font-black text-emerald-600 flex items-center gap-2">
              <Check className="h-5 w-5 stroke-[3]" /> บันทึกข้อมูลเรียบร้อยแล้ว!
            </span>
          ) : <div />}

          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-base hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            บันทึกการตั้งค่า
          </button>
        </div>

      </form>

      {/* Supabase & Vercel Guide Card */}
      <div id="supabase-guide" className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-5">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Database className="h-6 w-6 text-emerald-600" />
          <span>ขั้นตอนการเชื่อมต่อ Supabase & Deploy บน Vercel</span>
        </h2>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-medium">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-black text-emerald-800 text-base">ขั้นตอนที่ 1: สร้างฐานข้อมูลบน Supabase</span>
            <p>
              1. สมัคร/เข้าสู่ระบบที่ <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-bold inline-flex items-center gap-1">supabase.com <ExternalLink className="h-3.5 w-3.5" /></a> แล้วกด &quot;New Project&quot;
            </p>
            <p>
              2. ไปที่เมนู <strong>SQL Editor</strong> ด้านซ้าย แล้วนำคำสั่งจากไฟล์ในโปรเจกต์นี้ไปรัน:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 pl-2">
              <li><code className="text-emerald-700 font-bold">supabase/schema.sql</code> (สร้างตารางและสิทธิ์ RLS ครบถ้วน)</li>
              <li><code className="text-emerald-700 font-bold">supabase/seed.sql</code> (ใส่ข้อมูลเริ่มต้นของสายพันธุ์ทุเรียนและสวน)</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-black text-emerald-800 text-base">ขั้นตอนที่ 2: นำ Environment Variables ไปใส่ใน Vercel</span>
            <p>
              ที่หน้าโปรเจกต์ Supabase ไปที่ <strong>Project Settings &gt; API</strong> จากนั้นนำค่า 2 ตัวนี้ไปใส่ใน <strong>Vercel &gt; Environment Variables</strong> หรือไฟล์ <code className="text-emerald-700 font-bold">.env.local</code> ในเครื่อง:
            </p>
            <div className="p-4 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800 space-y-1 shadow-2xs">
              <div>NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff & User Management Area (Super Admin only) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-emerald-600" />
              <span>จัดการรายชื่อพนักงาน & สิทธิ์สมาชิก (ROLE)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              กำหนดสิทธิ์ <strong>คนงาน</strong> (เห็นเฉพาะหน้าขายและบิล) หรือ <strong>super ADMIN</strong> (เห็นข้อมูลการเงินและตั้งค่า)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ เพิ่มพนักงาน / สมัครสมาชิก</span>
          </button>
        </div>

        {/* User List Table / Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {users.map((u) => {
            const isSuper = u.role === 'super_admin';
            return (
              <div
                key={u.id}
                className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-3xl p-2 rounded-2xl bg-white border border-slate-200 shrink-0">
                    {u.avatar_emoji || (isSuper ? '👑' : '👷‍♂️')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-slate-900 text-base truncate flex items-center gap-1.5">
                      <span>{u.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-semibold flex items-center gap-2 mt-0.5">
                      <span>ชื่อล็อกอิน: <strong>{u.username}</strong></span>
                      <span>•</span>
                      <span>PIN: <strong>{u.pin}</strong></span>
                    </div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase mt-1.5 ${
                      isSuper 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {isSuper ? '👑 super ADMIN' : '👷‍♂️ คนงาน (Worker)'}
                    </span>
                  </div>
                </div>

                {/* Delete button (cannot delete if only 1 super_admin left) */}
                <button
                  type="button"
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                  title="ลบพนักงานคนนี้"
                  aria-label="ลบ"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup & Demo Reset Area */}
      <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-black text-slate-900">การสำรองและจัดการข้อมูล</h4>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            ดาวน์โหลดข้อมูลสำรอง (JSON) หรือรีเซ็ตข้อมูลตัวอย่างสำหรับการทดสอบ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-5 py-3 text-sm font-bold rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 transition-colors"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>สำรองข้อมูล (JSON)</span>
          </button>

          <button
            onClick={handleResetDemo}
            className="px-5 py-3 text-sm font-bold rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>รีเซ็ตข้อมูลตัวอย่าง</span>
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          loadData();
        }}
        currentUser={null}
        onUserChanged={() => loadData()}
      />

    </div>
  </RoleGuard>
  );
}

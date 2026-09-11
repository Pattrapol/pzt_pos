'use client';

import React, { useState, useEffect } from 'react';
import { AppUser, UserRole, Order } from '@/types/pos';
import { storage } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { playBeep, playCashChime } from '@/lib/audio';
import RoleGuard from '@/components/RoleGuard';
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  Phone, 
  UserCheck, 
  X, 
  Check, 
  Copy,
  ShieldAlert
} from 'lucide-react';

const EMOJI_OPTIONS = ['👑', '👷‍♂️', '👩‍🌾', '👨‍🌾', '🍈', '🍍', '🥭', '⭐', '🍉', '🍌'];

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminMasterPin, setAdminMasterPin] = useState<string>('1234');
  const [isEditingMasterPin, setIsEditingMasterPin] = useState(false);
  const [newMasterPin, setNewMasterPin] = useState('');
  const [masterPinSuccess, setMasterPinSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Form states (Add user)
  const [addName, setAddName] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addPin, setAddPin] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('worker');
  const [addEmoji, setAddEmoji] = useState('👷‍♂️');
  const [addError, setAddError] = useState('');

  // Form states (Edit user)
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('worker');
  const [editEmoji, setEditEmoji] = useState('👷‍♂️');
  const [editActive, setEditActive] = useState(true);
  const [editError, setEditError] = useState('');

  const loadData = () => {
    setUsers(storage.getUsers());
    setOrders(storage.getOrders());
    const settings = storage.getSettings();
    setAdminMasterPin(settings.admin_master_pin || '1234');
  };

  useEffect(() => {
    loadData();

    const handleUsersChanged = (e: Event) => {
      const customEvent = e as CustomEvent<AppUser[]>;
      setUsers(customEvent.detail || storage.getUsers());
    };

    window.addEventListener('pzt_users_changed', handleUsersChanged);
    return () => window.removeEventListener('pzt_users_changed', handleUsersChanged);
  }, []);

  // Calculate Today's Sales per cashier
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => o.created_at.startsWith(todayStr));

  const getCashierTodayStats = (user: AppUser) => {
    const userOrders = todayOrders.filter(
      o => o.cashier_id === user.id || o.cashier_name === user.name
    );
    const total = userOrders.reduce((sum, o) => sum + o.total_amount, 0);
    return { count: userOrders.length, total };
  };

  // KPIs
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active !== false).length;
  const adminCount = users.filter(u => u.role === 'super_admin').length;
  const totalSalesToday = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // Handlers
  const handleOpenAddModal = () => {
    playBeep(650, 0.04);
    setAddName('');
    setAddUsername('');
    setAddPhone('');
    setAddPin('');
    setAddRole('worker');
    setAddEmoji('👷‍♂️');
    setAddError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: AppUser) => {
    playBeep(650, 0.04);
    setEditingUser(user);
    setEditName(user.name);
    setEditPhone(user.phone || '');
    setEditPin(user.pin);
    setEditRole(user.role);
    setEditEmoji(user.avatar_emoji || (user.role === 'super_admin' ? '👑' : '👷‍♂️'));
    setEditActive(user.is_active !== false);
    setEditError('');
  };

  const handleToggleActive = (user: AppUser) => {
    playBeep(650, 0.04);
    try {
      storage.toggleUserActive(user.id);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    }
  };

  const handleDeleteUser = (user: AppUser) => {
    playBeep(300, 0.1);
    if (confirm(`คุณต้องการลบพนักงาน "${user.name}" ออกจากระบบหรือไม่?`)) {
      try {
        storage.deleteUser(user.id);
        loadData();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'ไม่สามารถลบผู้ใช้งานได้');
      }
    }
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!addName.trim()) {
      setAddError('กรุณากรอกชื่อพนักงาน');
      return;
    }
    if (!addUsername.trim()) {
      setAddError('กรุณากรอกชื่อผู้ใช้สำหรับเข้าระบบ');
      return;
    }
    if (!addPin.trim() || addPin.trim().length < 4) {
      setAddError('กรุณากำหนดรหัส PIN อย่างน้อย 4 หลัก (เช่น 1234)');
      return;
    }

    try {
      storage.createUser({
        name: addName.trim(),
        username: addUsername.trim(),
        phone: addPhone.trim() || undefined,
        pin: addPin.trim(),
        role: addRole,
        avatar_emoji: addEmoji,
        is_active: true
      });

      playCashChime();
      setIsAddModalOpen(false);
      loadData();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');

    if (!editName.trim()) {
      setEditError('กรุณากรอกชื่อพนักงาน');
      return;
    }
    if (!editPin.trim() || editPin.trim().length < 4) {
      setEditError('รหัส PIN ต้องมีอย่างน้อย 4 หลัก');
      return;
    }

    try {
      storage.updateUser(editingUser.id, {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        pin: editPin.trim(),
        role: editRole,
        avatar_emoji: editEmoji,
        is_active: editActive
      });

      playCashChime();
      setEditingUser(null);
      loadData();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    }
  };

  const handleSaveMasterPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterPin.trim() || newMasterPin.trim().length < 4) {
      alert('รหัสลับเจ้าของร้าน (Admin Master PIN) ต้องมีอย่างน้อย 4 หลัก');
      return;
    }

    const settings = storage.getSettings();
    settings.admin_master_pin = newMasterPin.trim();
    storage.saveSettings(settings);
    setAdminMasterPin(newMasterPin.trim());
    setIsEditingMasterPin(false);
    setNewMasterPin('');
    setMasterPinSuccess(true);
    setTimeout(() => setMasterPinSuccess(false), 3000);
    playCashChime();
  };

  const handleManualSync = async () => {
    playBeep(650, 0.04);
    setIsSyncing(true);
    setSyncNotice('');
    try {
      const synced = await storage.syncUsersWithSupabase();
      setUsers(synced);
      setSyncNotice('ซิงค์ข้อมูลกับ Supabase คลาวด์สำเร็จเรียบร้อย');
      setTimeout(() => setSyncNotice(''), 3000);
    } catch (e) {
      setSyncNotice('การเชื่อมต่อขัดข้อง ใช้งานข้อมูลออฟไลน์ในเครื่อง');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <div className="space-y-6 sm:space-y-8 pb-16 max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <span>👥 จัดการพนักงาน & แคชเชียร์ (Staff Management)</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
              กำหนดสิทธิ์ แก้ไขรหัส PIN ดูแลแคชเชียร์ และติดตามยอดขายรายบุคคล
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-2 active:scale-95 transition-all shadow-xs"
              title="ดึง/อัปเดตข้อมูลพนักงานกับคลาวด์"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์คลาวด์'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-emerald-600/20"
            >
              <UserPlus className="h-4 w-4" />
              <span>เพิ่มพนักงานใหม่</span>
            </button>
          </div>
        </div>

        {syncNotice && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase">พนักงานทั้งหมด</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1">
              {totalUsers} <span className="text-xs sm:text-sm text-slate-500 font-sans font-medium">คน</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-700 uppercase">เปิดใช้งานอยู่</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 mt-1">
              {activeUsers} <span className="text-xs sm:text-sm text-slate-500 font-sans font-medium">คน</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
            <span className="text-[11px] sm:text-xs font-bold text-purple-700 uppercase">super ADMIN</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-700 mt-1">
              {adminCount} <span className="text-xs sm:text-sm text-slate-500 font-sans font-medium">คน</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/70 border-2 border-amber-300 shadow-xs">
            <span className="text-[11px] sm:text-xs font-black text-amber-900 uppercase flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> ยอดขายวันนี้รวม
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-900 mt-1">
              ฿{totalSalesToday.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Staff List (Mobile Cards & Desktop Table) */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>รายชื่อพนักงานและแคชเชียร์ ({users.length} คน)</span>
            </h2>
            <span className="text-xs text-slate-400">
              * แตะแก้ไขเพื่อเปลี่ยนรหัส PIN หรือระงับสิทธิ์
            </span>
          </div>

          {/* Mobile Card List (< sm) */}
          <div className="block sm:hidden space-y-3">
            {users.map((u) => {
              const stats = getCashierTodayStats(u);
              const isSuper = u.role === 'super_admin';
              const isActive = u.is_active !== false;

              return (
                <div 
                  key={u.id}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                    isActive 
                      ? 'bg-slate-50/70 border-slate-200' 
                      : 'bg-slate-100/50 border-slate-200 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-1.5 rounded-2xl bg-white border border-slate-200">
                        {u.avatar_emoji || (isSuper ? '👑' : '👷‍♂️')}
                      </span>
                      <div>
                        <div className="font-black text-slate-900 text-base">{u.name}</div>
                        <div className="text-xs text-slate-500 font-mono">@{u.username}</div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                      isSuper ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}>
                      {isSuper ? '👑 ADMIN' : '👷‍♂️ คนงาน'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs border-t border-slate-200">
                    <div>
                      <span className="text-slate-500 block">รหัส PIN:</span>
                      <span className="font-mono font-bold text-slate-800">•••• ({u.pin})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">ยอดขายวันนี้:</span>
                      <span className="font-black font-mono text-emerald-700">
                        ฿{stats.total.toLocaleString()} ({stats.count} บิล)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u)}
                      className={`py-1.5 px-2.5 rounded-xl border text-xs font-bold flex-1 active:scale-95 transition-all ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                    >
                      {isActive ? '✓ เปิดใช้งาน' : '✕ ระงับใช้งาน'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(u)}
                      className="py-1.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 active:scale-95 transition-all"
                    >
                      แก้ไข/เปลี่ยน PIN
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 active:scale-95 transition-all"
                      title="ลบพนักงาน"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table (sm+) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="text-slate-500 border-b border-slate-200 font-bold">
                <tr>
                  <th className="pb-3">พนักงาน</th>
                  <th className="pb-3">ชื่อผู้ใช้ / เบอร์โทร</th>
                  <th className="pb-3">บทบาท (ROLE)</th>
                  <th className="pb-3">รหัส PIN</th>
                  <th className="pb-3">ยอดขายวันนี้</th>
                  <th className="pb-3">สถานะ</th>
                  <th className="pb-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const stats = getCashierTodayStats(u);
                  const isSuper = u.role === 'super_admin';
                  const isActive = u.is_active !== false;

                  return (
                    <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${!isActive ? 'opacity-60 bg-slate-50/50' : ''}`}>
                      <td className="py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1 rounded-xl bg-slate-100 border border-slate-200">
                            {u.avatar_emoji || (isSuper ? '👑' : '👷‍♂️')}
                          </span>
                          <div>
                            <div className="text-sm font-black text-slate-900">{u.name}</div>
                            {u.phone && <div className="text-xs text-slate-500 font-medium">โทร: {u.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-mono font-medium text-slate-600">
                        @{u.username}
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                          isSuper ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {isSuper ? '👑 super ADMIN' : '👷‍♂️ คนงาน'}
                        </span>
                      </td>
                      <td className="py-4 font-mono font-bold text-slate-700">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {u.pin}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="font-mono font-black text-emerald-700 text-sm">
                          ฿{stats.total.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {stats.count} บิลวันนี้
                        </div>
                      </td>
                      <td className="py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          className={`px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 border ${
                            isActive 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                              : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                          }`}
                        >
                          {isActive ? '✓ เปิดใช้งาน' : '✕ ระงับ'}
                        </button>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(u)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                        >
                          แก้ไข / PIN
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all border border-red-200 inline-flex items-center"
                          title="ลบพนักงาน"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Admin Master PIN Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-purple-50/60 border-2 border-purple-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-purple-200 text-purple-900 flex items-center justify-center shrink-0">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-purple-950">
                  รหัสลับเจ้าของร้าน (Admin Master PIN)
                </h3>
                <p className="text-xs sm:text-sm text-purple-800 font-medium">
                  ใช้สำหรับอนุมัติการสร้างหรือยกระดับสิทธิ์เป็น super ADMIN เพื่อความปลอดภัยสูงสุด
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditingMasterPin ? (
                <>
                  <span className="font-mono font-black text-lg text-purple-950 bg-white px-4 py-2 rounded-2xl border border-purple-300">
                    •••• ({adminMasterPin})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playBeep(650, 0.04);
                      setIsEditingMasterPin(true);
                      setNewMasterPin(adminMasterPin);
                    }}
                    className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black active:scale-95 transition-all shadow-xs"
                  >
                    เปลี่ยนรหัสลับ
                  </button>
                </>
              ) : (
                <form onSubmit={handleSaveMasterPin} className="flex items-center gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    value={newMasterPin}
                    onChange={(e) => setNewMasterPin(e.target.value)}
                    placeholder="ตั้งรหัสลับใหม่..."
                    className="w-36 px-3 py-2 text-sm rounded-xl bg-white border-2 border-purple-400 font-mono text-center font-bold text-slate-900 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs"
                  >
                    บันทึก
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingMasterPin(false)}
                    className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    ยกเลิก
                  </button>
                </form>
              )}
            </div>
          </div>

          {masterPinSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>บันทึกรหัสลับเจ้าของร้าน (Admin Master PIN) เรียบร้อยแล้ว</span>
            </div>
          )}
        </div>

        {/* Modal: Add New Staff */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg max-h-[94vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="h-6 w-6 text-emerald-600" />
                  <span>เพิ่มพนักงานใหม่</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdd} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                    ชื่อพนักงาน / ชื่อเรียก *:
                  </label>
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="เช่น ลุงสมหมาย, แคชเชียร์เปิ้ล"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                      ชื่อผู้ใช้เข้าระบบ *:
                    </label>
                    <input
                      type="text"
                      value={addUsername}
                      onChange={(e) => setAddUsername(e.target.value)}
                      placeholder="เช่น ple, sommai"
                      className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                      เบอร์โทรติดต่อ:
                    </label>
                    <input
                      type="tel"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                    รหัส PIN 4 หลัก (สำหรับปลดล็อกและเข้าระบบ) *:
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    value={addPin}
                    onChange={(e) => setAddPin(e.target.value)}
                    placeholder="เช่น 1234, 5678"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-center text-xl font-black focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1.5">
                    เลือกบทบาท (ROLE):
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => {
                        setAddRole('worker');
                        setAddEmoji('👷‍♂️');
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        addRole === 'worker' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <span>👷‍♂️</span>
                        <span>คนงาน</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">ขายหน้าร้าน ชั่งน้ำหนัก (ซ่อนต้นทุนกำไร)</p>
                    </div>

                    <div
                      onClick={() => {
                        setAddRole('super_admin');
                        setAddEmoji('👑');
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        addRole === 'super_admin' ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <span>👑</span>
                        <span>super ADMIN</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">เข้าได้ทุกเมนู ดูกำไรและแก้ไขระบบ</p>
                    </div>
                  </div>
                </div>

                {/* Emoji Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">
                    เลือกรูปไอคอนประจำตัว:
                  </label>
                  <div className="flex items-center gap-2">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setAddEmoji(em)}
                        className={`text-2xl p-2 rounded-xl border transition-all ${
                          addEmoji === em ? 'bg-emerald-100 border-emerald-500 scale-110' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {addError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{addError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>บันทึกพนักงานใหม่</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Staff & Reset PIN */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg max-h-[94vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Edit3 className="h-6 w-6 text-emerald-600" />
                  <span>แก้ไขข้อมูลพนักงาน ({editingUser.name})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                    ชื่อพนักงาน / ชื่อเรียก *:
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                    เบอร์โทรติดต่อ:
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                    รหัส PIN 4 หลัก (เปลี่ยน/รีเซ็ตที่นี่) *:
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-center text-xl font-black focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1.5">
                    เปลี่ยนบทบาท (ROLE):
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setEditRole('worker')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        editRole === 'worker' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <span>👷‍♂️</span>
                        <span>คนงาน</span>
                      </div>
                    </div>

                    <div
                      onClick={() => setEditRole('super_admin')}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        editRole === 'super_admin' ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <span>👑</span>
                        <span>super ADMIN</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-slate-900">สถานะการเข้าใช้งาน</div>
                    <p className="text-xs text-slate-500 font-medium">หากปิด พนักงานจะไม่สามารถล็อกอินเข้าสู่ระบบได้</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditActive(!editActive)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 border ${
                      editActive ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-300 text-slate-700 border-slate-400'
                    }`}
                  >
                    {editActive ? '✓ เปิดใช้งาน' : '✕ ระงับ'}
                  </button>
                </div>

                {/* Emoji Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">
                    รูปไอคอนประจำตัว:
                  </label>
                  <div className="flex items-center gap-2">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEditEmoji(em)}
                        className={`text-2xl p-2 rounded-xl border transition-all ${
                          editEmoji === em ? 'bg-emerald-100 border-emerald-500 scale-110' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {editError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>บันทึกการเปลี่ยนแปลง</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </RoleGuard>
  );
}

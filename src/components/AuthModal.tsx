'use client';

import React, { useState } from 'react';
import { AppUser, UserRole } from '@/types/pos';
import { storage } from '@/lib/storage';
import { playBeep, playCashChime } from '@/lib/audio';
import { 
  X, 
  UserCheck, 
  UserPlus, 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  User, 
  Phone,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onUserChanged: (user: AppUser) => void;
}

const EMOJI_OPTIONS = ['👑', '👷‍♂️', '👩‍🌾', '👨‍🌾', '🍈', '🍍', '🥭', '⭐'];

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onUserChanged
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [loginPin, setLoginPin] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Register form state
  const [regName, setRegName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPin, setRegPin] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('worker');
  const [regEmoji, setRegEmoji] = useState<string>('👷‍♂️');
  const [regError, setRegError] = useState<string>('');

  if (!isOpen) return null;

  const allUsers = storage.getUsers();

  const handleSelectUser = (u: AppUser) => {
    playBeep(650, 0.05);
    setSelectedUser(u);
    setLoginPin('');
    setLoginError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setLoginError('กรุณาเลือกผู้ใช้งานที่ต้องการเข้าสู่ระบบ');
      return;
    }

    if (selectedUser.pin !== loginPin.trim()) {
      playBeep(300, 0.1);
      setLoginError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      return;
    }

    playCashChime();
    storage.setCurrentUser(selectedUser);
    onUserChanged(selectedUser);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('กรุณาระบุชื่อพนักงานหรือชื่อสมาชิก');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('กรุณาระบุชื่อผู้ใช้หรือเบอร์โทรศัพท์สำหรับเข้าสู่ระบบ');
      return;
    }
    if (!regPin.trim() || regPin.trim().length < 4) {
      setRegError('กรุณาตั้งรหัส PIN อย่างน้อย 4 หลัก (เช่น 1234)');
      return;
    }

    try {
      const newUser = storage.createUser({
        name: regName.trim(),
        username: regUsername.trim(),
        pin: regPin.trim(),
        role: regRole,
        avatar_emoji: regEmoji
      });

      playCashChime();
      storage.setCurrentUser(newUser);
      onUserChanged(newUser);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน';
      setRegError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[94vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-2xl text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <span>ระบบสมาชิก & สิทธิ์การใช้งาน (ROLE)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              ปัจจุบัน: <strong>{currentUser ? `${currentUser.avatar_emoji} ${currentUser.name} (${currentUser.role === 'super_admin' ? 'super ADMIN' : 'คนงาน'})` : 'ไม่ได้ระบุ'}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="ปิด"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs: เข้าสู่ระบบ vs สมัครสมาชิกใหม่อย่างง่าย */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl my-4">
          <button
            type="button"
            onClick={() => {
              playBeep(650, 0.04);
              setActiveTab('login');
              setLoginError('');
            }}
            className={`py-2.5 px-4 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>เข้าสู่ระบบ / สลับผู้ใช้</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playBeep(650, 0.04);
              setActiveTab('register');
              setRegError('');
            }}
            className={`py-2.5 px-4 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>สมัครสมาชิกอย่างง่าย</span>
          </button>
        </div>

        {/* Tab 1: Login & Fast Switch */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-2">
                1. แตะเลือกผู้ใช้งานที่ต้องการเข้าสู่ระบบ:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                {allUsers.map((u) => {
                  const isSelected = selectedUser?.id === u.id || (!selectedUser && currentUser?.id === u.id);
                  const isSuper = u.role === 'super_admin';
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 active:scale-98 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-3xl p-1.5 rounded-xl bg-white border border-slate-200 shrink-0">
                        {u.avatar_emoji || (isSuper ? '👑' : '👷‍♂️')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black text-slate-900 truncate">
                          {u.name}
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase mt-0.5 ${
                          isSuper 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isSuper ? '👑 super ADMIN' : '👷‍♂️ คนงาน'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PIN Entry for Selected User */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-emerald-600" />
                  <span>2. กรอกรหัส PIN (กดง่าย):</span>
                </label>
                <span className="text-xs text-slate-400">
                  (ค่าเริ่มต้น: admin=1234, worker=1111)
                </span>
              </div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={loginPin}
                onChange={(e) => {
                  setLoginPin(e.target.value);
                  setLoginError('');
                }}
                placeholder="กรอกรหัส PIN 4 หลัก..."
                className="w-full px-4 py-3 text-2xl font-mono text-center tracking-widest rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs font-black"
                autoFocus
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <CheckCircle2 className="h-6 w-6" />
              <span>ยืนยันเข้าสู่ระบบ</span>
            </button>
          </form>
        )}

        {/* Tab 2: Simple Registration */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 font-medium">
              💡 <strong>สมัครสมาชิกง่ายนิดเดียว:</strong> ไม่ต้องใช้อีเมล ไม่ต้องรอ OTP กรอกชื่อและตั้งรหัส PIN 4 หลัก แล้วเลือกบทบาทได้ทันที!
            </div>

            {/* Name */}
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                ชื่อพนักงาน / ชื่อเรียก (Name):
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="เช่น ลุงสมชาย, พี่ณี แคชเชียร์, เถ้าแก่เปิ้ล"
                className="w-full px-4 py-2.5 text-base rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Username / Phone */}
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                ชื่อผู้ใช้ หรือ เบอร์โทรศัพท์ (Username):
              </label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="เช่น somchai หรือ 0812345678"
                className="w-full px-4 py-2.5 text-base rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* PIN */}
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                รหัส PIN สำหรับเข้าสู่ระบบ (4 หลักขึ้นไป):
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={regPin}
                onChange={(e) => setRegPin(e.target.value)}
                placeholder="เช่น 1234, 5678"
                className="w-full px-4 py-2.5 text-xl font-mono text-center tracking-widest rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1.5">
                เลือกบทบาท (ROLE):
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Worker */}
                <div
                  onClick={() => {
                    playBeep(650, 0.04);
                    setRegRole('worker');
                    setRegEmoji('👷‍♂️');
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    regRole === 'worker'
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">👷‍♂️</span>
                    <span className="text-sm font-black text-slate-900">คนงาน</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    ขายหน้าร้าน (POS), ชั่งน้ำหนัก, บิลขาย (ซ่อนกำไรและต้นทุน)
                  </p>
                </div>

                {/* 2. Super Admin */}
                <div
                  onClick={() => {
                    playBeep(650, 0.04);
                    setRegRole('super_admin');
                    setRegEmoji('👑');
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    regRole === 'super_admin'
                      ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">👑</span>
                    <span className="text-sm font-black text-slate-900">super ADMIN</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    เจ้าของร้าน เข้าได้ทุกเมนู ดูกำไรสุทธิ จัดการต้นทุนและระบบ
                  </p>
                </div>
              </div>
            </div>

            {/* Avatar Emoji Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">
                เลือกรูปไอคอนประจำตัว:
              </label>
              <div className="flex items-center gap-2">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      playBeep(650, 0.03);
                      setRegEmoji(em);
                    }}
                    className={`text-2xl p-2 rounded-xl border transition-all ${
                      regEmoji === em
                        ? 'bg-emerald-100 border-emerald-500 scale-110 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <UserPlus className="h-6 w-6" />
              <span>บันทึกและสมัครสมาชิกทันที</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { playBeep, playCashChime } from '@/lib/audio';
import { UserRole } from '@/types/pos';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Phone,
  KeyRound
} from 'lucide-react';

const EMOJI_OPTIONS = ['👑', '👷‍♂️', '👩‍🌾', '👨‍🌾', '🍈', '🍍', '🥭', '⭐'];

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('worker');
  const [regEmoji, setRegEmoji] = useState('👷‍♂️');
  const [adminMasterPin, setAdminMasterPin] = useState('');
  const [regError, setRegError] = useState('');

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้งาน หรือเบอร์โทรศัพท์');
      playBeep(300, 0.08);
      return;
    }

    if (!password.trim()) {
      setErrorMsg('กรุณากรอกรหัสผ่าน หรือรหัส PIN');
      playBeep(300, 0.08);
      return;
    }

    setIsSubmitting(true);
    playBeep(650, 0.04);

    setTimeout(() => {
      const user = storage.authenticate(username, password);

      if (!user) {
        setIsSubmitting(false);
        setErrorMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        playBeep(300, 0.1);
        return;
      }

      if (user.is_active === false) {
        setIsSubmitting(false);
        setErrorMsg('บัญชีผู้ใช้นี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อเถ้าแก่');
        playBeep(300, 0.1);
        return;
      }

      playCashChime();
      router.replace('/');
    }, 200);
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('กรุณากรอกชื่อ-นามสกุล หรือชื่อเรียกพนักงาน');
      playBeep(300, 0.08);
      return;
    }

    if (!regUsername.trim()) {
      setRegError('กรุณากำหนดชื่อผู้ใช้งาน (Username สำหรับเข้าสู่ระบบ)');
      playBeep(300, 0.08);
      return;
    }

    if (!regPassword.trim() || regPassword.trim().length < 4) {
      setRegError('กรุณากำหนดรหัสผ่านอย่างน้อย 4 ตัวอักษรขึ้นไป (เช่น 1234 หรือรหัสผ่านข้อความ)');
      playBeep(300, 0.08);
      return;
    }

    if (regRole === 'super_admin') {
      if (!adminMasterPin.trim()) {
        setRegError('กรุณากรอกรหัสลับเจ้าของร้าน (Master PIN) เพื่อยืนยันการสร้างสิทธิ์ super ADMIN (ค่าเริ่มต้น: 1234)');
        playBeep(300, 0.08);
        return;
      }
      if (!storage.verifyAdminMasterPin(adminMasterPin)) {
        setRegError('รหัสลับเจ้าของร้าน (Master PIN) ไม่ถูกต้อง ไม่อนุญาตให้สร้างสิทธิ์ super ADMIN');
        playBeep(300, 0.1);
        return;
      }
    }

    setIsSubmitting(true);
    playBeep(650, 0.04);

    try {
      const newUser = storage.createUser({
        name: regName.trim(),
        username: regUsername.trim(),
        phone: regPhone.trim() || undefined,
        pin: regPassword.trim(),
        password: regPassword.trim(),
        role: regRole,
        avatar_emoji: regEmoji
      });

      storage.setCurrentUser(newUser);
      playCashChime();
      router.replace('/');
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลงทะเบียน';
      setRegError(msg);
      playBeep(300, 0.1);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    playBeep(700, 0.03);
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[550px] h-[500px] bg-emerald-300/20 rounded-full blur-3xl -translate-y-24"></div>
        <div className="w-[450px] h-[400px] bg-amber-200/20 rounded-full blur-3xl translate-y-36"></div>
      </div>

      <div className="relative w-full max-w-lg">
        
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/25 mb-4 group hover:scale-105 transition-transform">
            <span className="text-3xl sm:text-4xl">🍈</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            ระบบขายทุเรียน <span className="text-emerald-600 font-extrabold">POS</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            PZT Fruit POS 2026 • ใช้ง่าย สบายตา คิดเงินรวดเร็ว
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          
          {/* Tabs: เข้าสู่ระบบ vs สมัครสมาชิกใหม่ */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                playBeep(650, 0.03);
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`py-2.5 px-4 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>เข้าสู่ระบบ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playBeep(650, 0.03);
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
              <span>สมัครสมาชิกใหม่</span>
            </button>
          </div>

          {/* ================= TAB 1: LOGIN ================= */}
          {activeTab === 'login' ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-900">เข้าสู่ระบบ</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเริ่มการขายหน้าร้าน
                </p>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    ชื่อผู้ใช้งาน หรือ เบอร์โทรศัพท์
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="เช่น admin หรือ 081-234-5678"
                      autoComplete="username"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-900 font-bold placeholder-slate-400 text-sm sm:text-base transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      รหัสผ่าน หรือ รหัส PIN
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่าน หรือ PIN"
                      autoComplete="current-password"
                      className="w-full pl-11 pr-12 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-900 font-bold placeholder-slate-400 text-sm sm:text-base transition-all tracking-wide"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        playBeep(700, 0.02);
                        setShowPassword(!showPassword);
                      }}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Switch to Register link */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>จดจำการเข้าสู่ระบบ</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      playBeep(650, 0.03);
                      setActiveTab('register');
                    }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    สมัครสมาชิกใหม่?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>กำลังตรวจสอบ...</span>
                    </>
                  ) : (
                    <>
                      <span>เข้าสู่ระบบ</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

              </form>

              {/* Quick Demo Fill Accounts for Testing */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    บัญชีทดสอบระบบ (แตะเพื่อกรอกอัตโนมัติ)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin', '1234')}
                    className="p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition-all active:scale-95 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-base">👑</span>
                      <span className="text-xs font-black text-purple-900">เถ้าแก่ (ADMIN)</span>
                    </div>
                    <div className="text-[10px] text-purple-700 font-mono">
                      admin • 1234
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('worker', '1111')}
                    className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-all active:scale-95 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-base">👷‍♂️</span>
                      <span className="text-xs font-black text-amber-900">คนงาน (Worker)</span>
                    </div>
                    <div className="text-[10px] text-amber-700 font-mono">
                      worker • 1111
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ================= TAB 2: REGISTER ================= */
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-emerald-600" />
                  <span>สมัครสมาชิก / ลงทะเบียนพนักงานใหม่</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  สร้างบัญชีพนักงานเพื่อเข้าใช้งานและบันทึกประวัติการขายหน้าร้าน
                </p>
              </div>

              {/* Error Banner */}
              {regError && (
                <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">{regError}</div>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    ชื่อ-นามสกุล หรือชื่อเรียกพนักงาน <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="เช่น สมหมาย แคชเชียร์ 2"
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-900 font-bold placeholder-slate-400 text-sm sm:text-base transition-all"
                    />
                  </div>
                </div>

                {/* Username & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      ชื่อผู้ใช้ (Username) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="เช่น sommai"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-900 font-bold placeholder-slate-400 text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      เบอร์โทรศัพท์ (ถ้ามี)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="08X-XXX-XXXX"
                        className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-900 font-bold placeholder-slate-400 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Password / PIN */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    รหัสผ่าน หรือ PIN (อย่างน้อย 4 ตัวอักษร) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="เช่น 1234 หรือรหัสผ่านข้อความ"
                      className="w-full pl-11 pr-12 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-900 font-bold placeholder-slate-400 text-sm sm:text-base transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        playBeep(700, 0.02);
                        setShowRegPassword(!showRegPassword);
                      }}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {showRegPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    เลือกระดับสิทธิ์การใช้งาน (Role) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div
                      onClick={() => {
                        playBeep(650, 0.03);
                        setRegRole('worker');
                        setRegEmoji('👷‍♂️');
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        regRole === 'worker'
                          ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👷‍♂️</span>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-amber-950">สิทธิ์คนงาน (Worker)</div>
                          <p className="text-[10px] text-amber-800 line-clamp-1">ขายหน้าร้าน, ชั่งน้ำหนัก, บิล</p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        playBeep(650, 0.03);
                        setRegRole('super_admin');
                        setRegEmoji('👑');
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        regRole === 'super_admin'
                          ? 'border-purple-500 bg-purple-50/70 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👑</span>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-purple-950">super ADMIN</div>
                          <p className="text-[10px] text-purple-800 line-clamp-1">เข้าถึงได้ทุกเมนูและต้นทุน</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Master PIN requirement if super_admin is selected */}
                {regRole === 'super_admin' && (
                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5 animate-in fade-in duration-150">
                    <label className="block text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <KeyRound className="h-4 w-4 text-purple-700" />
                      <span>รหัสลับเจ้าของร้าน (Admin Master PIN) <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="password"
                      value={adminMasterPin}
                      onChange={(e) => setAdminMasterPin(e.target.value)}
                      placeholder="ใส่รหัส Master PIN ของเถ้าแก่ (เริ่มต้น: 1234)"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-300 focus:border-purple-600 focus:outline-none text-slate-900 font-bold text-sm"
                    />
                    <p className="text-[11px] text-purple-700">
                      ต้องใช้รหัสลับของเจ้าของร้านเพื่อป้องกันไม่ให้ผู้อื่นสวมสิทธิ์แอดมิน (ค่าเริ่มต้นคือ 1234)
                    </p>
                  </div>
                )}

                {/* Avatar Emoji Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    เลือกไอคอนประจำตัว (Avatar)
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        type="button"
                        key={em}
                        onClick={() => {
                          playBeep(700, 0.02);
                          setRegEmoji(em);
                        }}
                        className={`h-11 w-11 rounded-2xl text-xl flex items-center justify-center transition-all shrink-0 ${
                          regEmoji === em
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-110'
                            : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:pointer-events-none mt-4 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>กำลังสร้างบัญชี...</span>
                    </>
                  ) : (
                    <>
                      <span>ลงทะเบียนและเข้าสู่ระบบทันที</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                {/* Switch back to login link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playBeep(650, 0.03);
                      setActiveTab('login');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-emerald-700 hover:underline"
                  >
                    มีบัญชีผู้ใช้งานอยู่แล้ว? เข้าสู่ระบบที่นี่
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

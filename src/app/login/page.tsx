'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { playBeep, playCashChime } from '@/lib/audio';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
        <div className="w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-3xl -translate-y-24"></div>
        <div className="w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-3xl translate-y-36"></div>
      </div>

      <div className="relative w-full max-w-md">
        
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

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          
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

          <form onSubmit={handleSubmit} className="space-y-4">
            
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

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>จดจำการเข้าสู่ระบบไว้ในเครื่องนี้</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
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
                className="p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition-all active:scale-95 group"
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
                className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-all active:scale-95 group"
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

      </div>
    </div>
  );
}

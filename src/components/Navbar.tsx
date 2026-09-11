'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  BarChart3, 
  Truck, 
  ReceiptText, 
  Settings, 
  Layers, 
  Menu, 
  X,
  Database,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  CalendarCheck,
  UserCheck,
  KeyRound
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isSoundEnabled, setSoundEnabled, playBeep } from '@/lib/audio';
import { storage } from '@/lib/storage';
import { AppUser } from '@/types/pos';
import ShiftSummaryModal from './ShiftSummaryModal';
import AuthModal from './AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [largeFont, setLargeFont] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    const storedFont = localStorage.getItem('pzt_large_font') === 'true';
    setLargeFont(storedFont);
    if (storedFont) {
      document.documentElement.classList.add('large-text-mode');
    }

    // Load initial user
    setCurrentUser(storage.getCurrentUser());

    // Listen to real-time auth changes
    const handleAuthChanged = (e: Event) => {
      const customEvent = e as CustomEvent<AppUser>;
      setCurrentUser(customEvent.detail || storage.getCurrentUser());
    };

    window.addEventListener('pzt_auth_changed', handleAuthChanged);
    return () => window.removeEventListener('pzt_auth_changed', handleAuthChanged);
  }, []);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playBeep(800, 0.08);
  };

  const handleToggleFont = () => {
    const next = !largeFont;
    setLargeFont(next);
    localStorage.setItem('pzt_large_font', next ? 'true' : 'false');
    if (next) {
      document.documentElement.classList.add('large-text-mode');
    } else {
      document.documentElement.classList.remove('large-text-mode');
    }
    playBeep(700, 0.06);
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Master nav items
  const allNavItems = [
    { label: 'ขายหน้าร้าน', href: '/', icon: ShoppingBag, roles: ['worker', 'super_admin'] },
    { label: 'กำไร-ขาดทุน', href: '/dashboard', icon: BarChart3, roles: ['super_admin'] },
    { label: 'ล็อต & ต้นทุน', href: '/lots', icon: Truck, roles: ['super_admin'] },
    { label: 'รายจ่าย & ของเสีย', href: '/expenses', icon: Layers, roles: ['super_admin'] },
    { label: 'บิลขาย & ลูกหนี้', href: '/orders', icon: ReceiptText, roles: ['worker', 'super_admin'] },
    { label: 'ตั้งค่าร้าน', href: '/settings', icon: Settings, roles: ['super_admin'] },
  ];

  // Filtered by current user's role:
  // - Worker sees: ขายหน้าร้าน, บิลขาย
  // - Super Admin sees: ALL
  const visibleNavItems = allNavItems.filter(item => {
    const role = currentUser?.role || 'worker';
    return item.roles.includes(role);
  });

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-2 sm:gap-3">
          
          {/* Brand Logo - Fixed size, NEVER wraps or squeezes */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <span className="text-2xl">🍈</span>
              </div>
              <div className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    ระบบขายทุเรียน <span className="text-emerald-600 font-extrabold">POS</span>
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                    2026
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  ใช้ง่าย สบายตา คิดเงินรวดเร็ว
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links - Filtered by role, no text wrap */}
          <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Tools: Role Pill, Shift, Sound, Font */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* User Profile / Role Pill Button */}
            <button
              type="button"
              onClick={() => {
                playBeep(650, 0.04);
                setIsAuthModalOpen(true);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 shrink-0 shadow-2xs ${
                isSuperAdmin
                  ? 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
              title="แตะเพื่อสลับผู้ใช้งานหรือสมัครสมาชิกใหม่"
            >
              <span className="text-base sm:text-lg">{currentUser?.avatar_emoji || (isSuperAdmin ? '👑' : '👷‍♂️')}</span>
              <span className="font-black max-w-[80px] sm:max-w-[110px] truncate text-slate-900">
                {currentUser?.name || 'เข้าสู่ระบบ'}
              </span>
              <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                isSuperAdmin ? 'bg-purple-200 text-purple-900' : 'bg-amber-200 text-amber-900'
              }`}>
                {isSuperAdmin ? 'ADMIN' : 'คนงาน'}
              </span>
            </button>

            {/* Quick Shift Report Trigger Button */}
            <button
              type="button"
              onClick={() => {
                playBeep(700, 0.05);
                setIsShiftModalOpen(true);
              }}
              title="สรุปยอดปิดร้านวันนี้ (Z-Report)"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold border border-slate-200 hover:border-emerald-300 transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <CalendarCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="hidden md:inline">สรุปกะ</span>
            </button>

            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={handleToggleSound}
              title={soundOn ? 'ปิดเสียง' : 'เปิดเสียง'}
              className={`p-2 sm:p-2.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 shrink-0 ${
                soundOn
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {soundOn ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>

            {/* Font Size Toggle for Elderly */}
            <button
              type="button"
              onClick={handleToggleFont}
              title={largeFont ? 'ตัวอักษรปกติ' : 'ขยายตัวหนังสือใหญ่พิเศษ'}
              className={`p-2 sm:p-2.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 shrink-0 ${
                largeFont
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {largeFont ? <ZoomOut className="h-4 w-4 text-amber-700" /> : <ZoomIn className="h-4 w-4 text-slate-500" />}
            </button>

            {/* Mobile / Tablet Menu Button (< lg) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all shrink-0"
              aria-label="เปิดเมนู"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Drawer Menu (< lg) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2.5 shadow-xl animate-in slide-in-from-top-2 duration-150">
            
            {/* Mobile User Profile Info & Switch Button */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{currentUser?.avatar_emoji || (isSuperAdmin ? '👑' : '👷‍♂️')}</span>
                <div>
                  <div className="text-sm font-black text-slate-900">{currentUser?.name}</div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    isSuperAdmin ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {isSuperAdmin ? '👑 super ADMIN' : '👷‍♂️ สิทธิ์คนงาน'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="py-1.5 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95"
              >
                สลับผู้ใช้
              </button>
            </div>

            {/* Shift Report Quick Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsShiftModalOpen(true);
              }}
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold bg-amber-50 text-amber-900 border border-amber-200 active:scale-95 transition-all"
            >
              <CalendarCheck className="h-5 w-5 text-amber-700" />
              <span>สรุปยอดปิดร้านประจำวัน (Z-Report)</span>
            </button>

            {/* Role Filtered Nav links */}
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-base font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Shift Summary Modal */}
      <ShiftSummaryModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
      />

      {/* Auth & Role Switching Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={(u) => setCurrentUser(u)}
      />
    </>
  );
}

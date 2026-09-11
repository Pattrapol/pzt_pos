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
  CalendarCheck
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isSoundEnabled, setSoundEnabled, playBeep } from '@/lib/audio';
import ShiftSummaryModal from './ShiftSummaryModal';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [largeFont, setLargeFont] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    const storedFont = localStorage.getItem('pzt_large_font') === 'true';
    setLargeFont(storedFont);
    if (storedFont) {
      document.documentElement.classList.add('large-text-mode');
    }
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

  const navItems = [
    { label: 'ขายหน้าร้าน', href: '/', icon: ShoppingBag },
    { label: 'กำไร-ขาดทุน', href: '/dashboard', icon: BarChart3 },
    { label: 'ล็อต & ต้นทุน', href: '/lots', icon: Truck },
    { label: 'รายจ่าย & ของเสีย', href: '/expenses', icon: Layers },
    { label: 'บิลขาย & ลูกหนี้', href: '/orders', icon: ReceiptText },
    { label: 'ตั้งค่าร้าน', href: '/settings', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
          
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

          {/* Desktop Navigation Links - Shown on xl screens (1280px+) with no wrapping */}
          <nav className="hidden xl:flex items-center gap-1.5 shrink-0">
            {navItems.map((item) => {
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

          {/* Quick Helper Tools - Compact Icon-Based, Zero Overflow */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Quick Shift Report Trigger Button */}
            <button
              type="button"
              onClick={() => {
                playBeep(700, 0.05);
                setIsShiftModalOpen(true);
              }}
              title="สรุปยอดปิดร้านวันนี้ (Z-Report)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <CalendarCheck className="h-4 w-4 text-amber-700 shrink-0" />
              <span className="hidden md:inline">สรุปปิดกะ</span>
            </button>

            {/* Sound Toggle Button - Icon only on desktop, ultra clean */}
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

            {/* Font Size Toggle for Elderly - Icon only on desktop */}
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

            {/* Supabase Status Pill */}
            <Link
              href="/settings"
              title={isSupabaseConfigured ? 'เชื่อมต่อ Supabase แล้ว' : 'โหมดในเครื่อง'}
              className={`hidden 2xl:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-all shrink-0 ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <span className={`h-2 w-2 rounded-full animate-pulse ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <Database className="h-3.5 w-3.5" />
              <span>{isSupabaseConfigured ? 'คลาวด์' : 'เครื่อง'}</span>
            </Link>

            {/* Mobile / Tablet Menu Button (shown on screens < xl) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all shrink-0"
              aria-label="เปิดเมนู"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Drawer Menu (< xl) */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
            <div className="py-2.5 px-4 mb-2 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">สถานะฐานข้อมูล:</span>
              <span className={isSupabaseConfigured ? 'text-emerald-600 font-bold' : 'text-amber-700 font-bold'}>
                {isSupabaseConfigured ? '● Supabase Cloud เชื่อมต่อแล้ว' : '● พร้อมใช้งานในเครื่อง (Local)'}
              </span>
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

            {/* Nav links */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 text-base font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
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
    </>
  );
}

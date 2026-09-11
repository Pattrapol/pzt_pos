'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  BarChart3, 
  Truck, 
  ReceiptText, 
  Settings, 
  Layers, 
  Boxes,
  Users,
  Lock,
  Menu, 
  X,
  Database,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  CalendarCheck,
  UserCheck,
  KeyRound,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isSoundEnabled, setSoundEnabled, playBeep } from '@/lib/audio';
import { storage } from '@/lib/storage';
import { AppUser } from '@/types/pos';
import ShiftSummaryModal from './ShiftSummaryModal';
import AuthModal from './AuthModal';
import ScreenLockModal from './ScreenLockModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [largeFont, setLargeFont] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const manageMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    const storedFont = localStorage.getItem('pzt_large_font') === 'true';
    setLargeFont(storedFont);
    if (storedFont) {
      document.documentElement.classList.add('large-text-mode');
    }

    // Load initial user & lock state
    setCurrentUser(storage.getCurrentUser());
    setIsLocked(storage.isScreenLocked());

    // Listen to real-time auth changes
    const handleAuthChanged = (e: Event) => {
      const customEvent = e as CustomEvent<AppUser | null>;
      setCurrentUser(customEvent.detail || storage.getCurrentUser());
    };

    // Listen to screen lock events
    const handleScreenLocked = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setIsLocked(customEvent.detail);
    };

    // Listen to click outside to close dropdowns
    const handleClickOutside = (e: MouseEvent) => {
      if (manageMenuRef.current && !manageMenuRef.current.contains(e.target as Node)) {
        setIsManageMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    window.addEventListener('pzt_auth_changed', handleAuthChanged);
    window.addEventListener('pzt_screen_locked', handleScreenLocked);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('pzt_auth_changed', handleAuthChanged);
      window.removeEventListener('pzt_screen_locked', handleScreenLocked);
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  // Master nav items (Full list for mobile drawer)
  const allNavItems = [
    { label: 'ขายหน้าร้าน', href: '/', icon: ShoppingBag, roles: ['worker', 'super_admin'] },
    { label: 'สินค้า & SKU', href: '/products', icon: Boxes, roles: ['super_admin'] },
    { label: 'พนักงาน & สิทธิ์', href: '/users', icon: Users, roles: ['super_admin'] },
    { label: 'กำไร-ขาดทุน', href: '/dashboard', icon: BarChart3, roles: ['super_admin'] },
    { label: 'ล็อต & ต้นทุน', href: '/lots', icon: Truck, roles: ['super_admin'] },
    { label: 'รายจ่าย & ของเสีย', href: '/expenses', icon: Layers, roles: ['super_admin'] },
    { label: 'บิลขาย & ลูกหนี้', href: '/orders', icon: ReceiptText, roles: ['worker', 'super_admin'] },
    { label: 'ตั้งค่าร้าน', href: '/settings', icon: Settings, roles: ['super_admin'] },
  ];

  // Desktop primary items shown directly on top navbar
  const primaryDesktopNav = [
    { label: 'ขายหน้าร้าน', href: '/', icon: ShoppingBag, roles: ['worker', 'super_admin'] },
    { label: 'สินค้า & SKU', href: '/products', icon: Boxes, roles: ['super_admin'] },
    { label: 'บิลขาย & ลูกหนี้', href: '/orders', icon: ReceiptText, roles: ['worker', 'super_admin'] },
    { label: 'กำไร-ขาดทุน', href: '/dashboard', icon: BarChart3, roles: ['super_admin'] },
  ].filter(item => item.roles.includes(currentUser?.role || 'worker'));

  // Desktop back-office management items grouped under dropdown for super_admin
  const manageDropdownItems = [
    { label: 'พนักงาน & สิทธิ์', href: '/users', icon: Users, desc: 'พนักงาน, สิทธิ์การใช้งาน & PIN' },
    { label: 'ล็อต & ต้นทุน', href: '/lots', icon: Truck, desc: 'รับเข้าผลไม้ & คำนวณต้นทุนเฉลี่ย' },
    { label: 'รายจ่าย & ของเสีย', href: '/expenses', icon: Layers, desc: 'ค่าน้ำมัน, ค่าใช้จ่าย, ทุเรียนเน่า' },
    { label: 'ตั้งค่าร้าน', href: '/settings', icon: Settings, desc: 'ข้อมูลร้าน & สำรองข้อมูล Cloud' },
  ];

  const isManageActive = manageDropdownItems.some(item => pathname === item.href);

  // Filtered by current user's role for mobile drawer:
  const visibleNavItems = allNavItems.filter(item => {
    const role = currentUser?.role || 'worker';
    return item.roles.includes(role);
  });

  // If on login page or no user is logged in, hide navbar
  if (pathname === '/login' || !currentUser) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-16 sm:h-20 max-w-[1600px] 2xl:max-w-[1800px] items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
          
          {/* Brand Logo - Responsive size */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <span className="text-xl sm:text-2xl">🍈</span>
              </div>
              <div className="whitespace-nowrap">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-2xl font-black tracking-tight text-slate-900">
                    <span className="hidden sm:inline">ระบบขายทุเรียน </span>
                    <span className="sm:hidden">ทุเรียน </span>
                    <span className="text-emerald-600 font-extrabold">POS</span>
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-700 border border-emerald-200">
                    2026
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  ใช้ง่าย สบายตา คิดเงินรวดเร็ว
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links - Compact, Responsive & Elegant */}
          <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
            {primaryDesktopNav.map((item) => {
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

            {/* Management Dropdown Menu for super_admin */}
            {isSuperAdmin && (
              <div className="relative" ref={manageMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    playBeep(650, 0.03);
                    setIsManageMenuOpen(!isManageMenuOpen);
                  }}
                  className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                    isManageActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : isManageMenuOpen
                      ? 'bg-slate-100 text-slate-900 ring-2 ring-emerald-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Settings className={`h-4 w-4 ${isManageActive ? 'text-white' : 'text-emerald-600'}`} />
                  <span>จัดการร้าน</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isManageMenuOpen ? 'rotate-180' : ''} ${isManageActive ? 'text-white' : 'text-slate-400'}`} />
                </button>

                {/* Dropdown Floating Menu */}
                {isManageMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 rounded-3xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                      <span>ระบบจัดการหลังร้าน</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-black">ADMIN</span>
                    </div>
                    <div className="pt-1.5 space-y-1">
                      {manageDropdownItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                              playBeep(650, 0.03);
                              setIsManageMenuOpen(false);
                            }}
                            className={`flex items-start gap-3 rounded-2xl p-2.5 transition-all ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 font-bold'
                                : 'hover:bg-slate-50 text-slate-700 font-medium'
                            }`}
                          >
                            <div className={`p-2 rounded-xl mt-0.5 shrink-0 transition-colors ${
                              isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`text-sm font-black ${isActive ? 'text-emerald-800' : 'text-slate-900'}`}>
                                {item.label}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                                {item.desc}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right Action Tools: Role Pill, Shift, Sound, Font */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* User Profile / Role Pill Button with Dropdown */}
            <div className="relative shrink-0" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => {
                  playBeep(650, 0.04);
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 shrink-0 shadow-2xs ${
                  isSuperAdmin
                    ? 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                    : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                }`}
                title="แตะเพื่อดูข้อมูลผู้ใช้ หรือออกจากระบบ"
              >
                <span className="text-base sm:text-lg">{currentUser?.avatar_emoji || (isSuperAdmin ? '👑' : '👷‍♂️')}</span>
                <span className="font-black max-w-[80px] sm:max-w-[120px] truncate text-slate-900">
                  {currentUser?.name || 'เข้าสู่ระบบ'}
                </span>
                <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                  isSuperAdmin ? 'bg-purple-200 text-purple-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {isSuperAdmin ? 'ADMIN' : 'คนงาน'}
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 rounded-3xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 mb-2">
                    <span className="text-3xl">{currentUser?.avatar_emoji || (isSuperAdmin ? '👑' : '👷‍♂️')}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-black text-slate-900 truncate">{currentUser?.name}</div>
                      <div className="text-xs text-slate-500 font-medium truncate">@{currentUser?.username}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isSuperAdmin ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {isSuperAdmin ? '👑 super ADMIN' : '👷‍♂️ สิทธิ์คนงาน'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-left"
                    >
                      <UserCheck className="h-4 w-4 text-emerald-600" />
                      <span>สลับผู้ใช้งาน / เพิ่มสมาชิก</span>
                    </button>

                    {isSuperAdmin && (
                      <Link
                        href="/users"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-left"
                      >
                        <Users className="h-4 w-4 text-purple-600" />
                        <span>จัดการพนักงาน & สิทธิ์ (Users)</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (confirm('คุณต้องการออกจากระบบ (Logout) หรือไม่?')) {
                          playBeep(450, 0.08);
                          storage.logout();
                          router.replace('/login');
                        }
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-red-50 text-red-600 text-xs font-bold transition-all text-left mt-1 border-t border-slate-100"
                    >
                      <LogOut className="h-4 w-4 text-red-600" />
                      <span>ออกจากระบบ (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Screen Lock Button */}
            <button
              type="button"
              onClick={() => {
                playBeep(600, 0.05);
                storage.setScreenLocked(true);
                setIsLocked(true);
              }}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-600 border border-slate-200 transition-all active:scale-95 shrink-0"
              title="ล็อกหน้าจอชั่วคราว (Screen Lock)"
            >
              <Lock className="h-4 w-4" />
            </button>

            {/* Quick Shift Report Trigger Button (hidden on small phone header, available in drawer & bottom nav) */}
            <button
              type="button"
              onClick={() => {
                playBeep(700, 0.05);
                setIsShiftModalOpen(true);
              }}
              title="สรุปยอดปิดร้านวันนี้ (Z-Report)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold border border-slate-200 hover:border-emerald-300 transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <CalendarCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="hidden md:inline">สรุปกะ</span>
            </button>

            {/* Sound Toggle Button (hidden on small phone header, accessible in drawer) */}
            <button
              type="button"
              onClick={handleToggleSound}
              title={soundOn ? 'ปิดเสียง' : 'เปิดเสียง'}
              className={`hidden sm:flex p-2 sm:p-2.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 shrink-0 ${
                soundOn
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {soundOn ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>

            {/* Font Size Toggle for Elderly (hidden on small phone header, accessible in drawer) */}
            <button
              type="button"
              onClick={handleToggleFont}
              title={largeFont ? 'ตัวอักษรปกติ' : 'ขยายตัวหนังสือใหญ่พิเศษ'}
              className={`hidden sm:flex p-2 sm:p-2.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 shrink-0 ${
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
              className="lg:hidden flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all shrink-0"
              aria-label="เปิดเมนู"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
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

            {/* Mobile Logout Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (confirm('คุณต้องการออกจากระบบ (Logout) หรือไม่?')) {
                  playBeep(450, 0.08);
                  storage.logout();
                  router.replace('/login');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold active:scale-95 transition-all"
            >
              <LogOut className="h-4 w-4 text-red-600" />
              <span>ออกจากระบบ (Logout)</span>
            </button>

            {/* Quick Sound & Font Toggles for Mobile */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleToggleSound}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  soundOn ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {soundOn ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
                <span>{soundOn ? 'เปิดเสียงอยู่' : 'ปิดเสียงอยู่'}</span>
              </button>
              <button
                type="button"
                onClick={handleToggleFont}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  largeFont ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {largeFont ? <ZoomOut className="h-4 w-4 text-amber-700" /> : <ZoomIn className="h-4 w-4 text-slate-500" />}
                <span>{largeFont ? 'ลดขนาดตัวอักษร' : 'ขยายตัวหนังสือ'}</span>
              </button>
            </div>

            {/* Quick Lock Screen for Mobile */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                playBeep(600, 0.05);
                storage.setScreenLocked(true);
                setIsLocked(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-amber-50 text-slate-700 border border-slate-200 text-xs font-bold active:scale-95 transition-all"
            >
              <Lock className="h-4 w-4 text-amber-600" />
              <span>ล็อกหน้าจอชั่วคราว (Screen Lock)</span>
            </button>

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

      {/* Mobile Bottom App Navigation Bar (Only on mobile/tablet < lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1.5 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {!isSuperAdmin ? (
            /* Worker Bottom Nav: POS, Orders, Shift, User */
            <>
              <Link
                href="/"
                onClick={() => playBeep(650, 0.03)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[64px] transition-all active:scale-95 ${
                  pathname === '/' ? 'text-emerald-700 font-black' : 'text-slate-500 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl ${pathname === '/' ? 'bg-emerald-100' : ''}`}>
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <span className="text-[11px] mt-0.5">ขายหน้าร้าน</span>
              </Link>

              <Link
                href="/orders"
                onClick={() => playBeep(650, 0.03)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[64px] transition-all active:scale-95 ${
                  pathname === '/orders' ? 'text-emerald-700 font-black' : 'text-slate-500 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl ${pathname === '/orders' ? 'bg-emerald-100' : ''}`}>
                  <ReceiptText className="h-5 w-5" />
                </div>
                <span className="text-[11px] mt-0.5">บิลขาย</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  playBeep(700, 0.04);
                  setIsShiftModalOpen(true);
                }}
                className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[64px] text-slate-500 font-medium active:scale-95 transition-all"
              >
                <div className="p-1 rounded-xl">
                  <CalendarCheck className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-[11px] mt-0.5">สรุปกะ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playBeep(650, 0.04);
                  setIsAuthModalOpen(true);
                }}
                className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[64px] text-slate-500 font-medium active:scale-95 transition-all"
              >
                <div className="p-1 rounded-xl text-base leading-none">
                  {currentUser?.avatar_emoji || '👷‍♂️'}
                </div>
                <span className="text-[11px] mt-0.5">สลับผู้ใช้</span>
              </button>
            </>
          ) : (
            /* Super Admin Bottom Nav: POS, Dashboard, Lots, Orders, More */
            <>
              <Link
                href="/"
                onClick={() => playBeep(650, 0.03)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl min-w-[54px] transition-all active:scale-95 ${
                  pathname === '/' ? 'text-emerald-700 font-black' : 'text-slate-500 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl ${pathname === '/' ? 'bg-emerald-100' : ''}`}>
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <span className="text-[11px] mt-0.5">ขาย</span>
              </Link>

              <Link
                href="/dashboard"
                onClick={() => playBeep(650, 0.03)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl min-w-[54px] transition-all active:scale-95 ${
                  pathname === '/dashboard' ? 'text-emerald-700 font-black' : 'text-slate-500 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl ${pathname === '/dashboard' ? 'bg-emerald-100' : ''}`}>
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="text-[11px] mt-0.5">กำไร</span>
              </Link>

              <Link
                href="/lots"
                onClick={() => playBeep(650, 0.03)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl min-w-[54px] transition-all active:scale-95 ${
                  pathname === '/lots' ? 'text-emerald-700 font-black' : 'text-slate-500 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl ${pathname === '/lots' ? 'bg-emerald-100' : ''}`}>
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-[11px] mt-0.5">ล็อต</span>
              </Link>

              <Link
                href="/orders"
                onClick={() => playBeep(650, 0.03)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl min-w-[54px] transition-all active:scale-95 ${
                  pathname === '/orders' ? 'text-emerald-700 font-black' : 'text-slate-500 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl ${pathname === '/orders' ? 'bg-emerald-100' : ''}`}>
                  <ReceiptText className="h-5 w-5" />
                </div>
                <span className="text-[11px] mt-0.5">บิลขาย</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  playBeep(650, 0.03);
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl min-w-[54px] transition-all active:scale-95 ${
                  mobileMenuOpen || pathname === '/expenses' || pathname === '/settings' || pathname === '/products' || pathname === '/users'
                    ? 'text-emerald-700 font-black'
                    : 'text-slate-500 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl ${mobileMenuOpen ? 'bg-emerald-100' : ''}`}>
                  <Menu className="h-5 w-5" />
                </div>
                <span className="text-[11px] mt-0.5">เมนูอื่น</span>
              </button>
            </>
          )}
        </div>
      </div>

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

      {/* Full-Screen Lock Overlay */}
      <ScreenLockModal
        isLocked={isLocked}
        onUnlocked={(u) => {
          setIsLocked(false);
          setCurrentUser(u);
        }}
      />
    </>
  );
}

'use client';

import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'ขายหน้าร้าน (POS)', href: '/', icon: ShoppingBag },
    { label: 'สรุปกำไร-ขาดทุน', href: '/dashboard', icon: BarChart3 },
    { label: 'ล็อตรับซื้อ & ต้นทุน', href: '/lots', icon: Truck },
    { label: 'ค่าใช้จ่าย & ของเสีย', href: '/expenses', icon: Layers },
    { label: 'บิลขาย & ลูกหนี้', href: '/orders', icon: ReceiptText },
    { label: 'ตั้งค่าร้าน', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo with Large Legible Name */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-2xl">🍈</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  ระบบขายทุเรียน <span className="text-emerald-600 font-extrabold">POS</span>
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  ฤดูกาล 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                ใช้ง่าย สบายตา คิดเงินรวดเร็ว บันทึกต้นทุนและกำไร
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-base font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status Indicator & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Supabase Status Pill */}
          <Link
            href="/settings"
            title={isSupabaseConfigured ? 'เชื่อมต่อ Supabase แล้ว' : 'โหมดจำลองในเครื่อง (พร้อมใช้งาน)'}
            className={`hidden sm:flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all ${
              isSupabaseConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <Database className="h-3.5 w-3.5" />
            <span>{isSupabaseConfigured ? 'เชื่อมคลาวด์แล้ว' : 'โหมดใช้งานในเครื่อง'}</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            aria-label="เปิดเมนู"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-2 shadow-lg">
          <div className="py-2.5 px-4 mb-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">สถานะระบบ:</span>
            <span className={isSupabaseConfigured ? 'text-emerald-600 font-bold' : 'text-amber-700 font-bold'}>
              {isSupabaseConfigured ? '● ต่อ Supabase Cloud แล้ว' : '● พร้อมใช้งานในเครื่อง (Local)'}
            </span>
          </div>
          {navItems.map((item) => {
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
  );
}

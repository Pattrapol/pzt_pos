'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { AppUser } from '@/types/pos';
import { playBeep } from '@/lib/audio';
import { ShieldAlert, ShoppingBag, KeyRound, Lock } from 'lucide-react';
import AuthModal from './AuthModal';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('worker' | 'super_admin')[];
}

export default function RoleGuard({
  children,
  allowedRoles = ['super_admin']
}: RoleGuardProps) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkUser = () => {
    const user = storage.getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  };

  useEffect(() => {
    checkUser();

    const handleAuthChanged = (e: Event) => {
      const customEvent = e as CustomEvent<AppUser>;
      setCurrentUser(customEvent.detail || storage.getCurrentUser());
    };

    window.addEventListener('pzt_auth_changed', handleAuthChanged);
    return () => window.removeEventListener('pzt_auth_changed', handleAuthChanged);
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-r-transparent"></div>
        <p className="mt-2 text-sm text-slate-500 font-bold">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  const isAllowed = currentUser && allowedRoles.includes(currentUser.role);

  if (!isAllowed) {
    return (
      <>
        <div className="max-w-xl mx-auto my-12 p-6 sm:p-8 rounded-3xl bg-white border-2 border-red-200 shadow-xl text-center">
          <div className="inline-flex p-4 rounded-3xl bg-red-100 text-red-700 mb-4 shadow-xs">
            <ShieldAlert className="h-12 w-12 stroke-[2.2]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            หน้านี้สำหรับ super ADMIN เท่านั้น
          </h2>

          <div className="my-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-sm text-slate-700">
            <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-amber-700" />
              <span>ข้อมูลบทบาทปัจจุบันของคุณ:</span>
            </div>
            <p>
              ชื่อผู้ใช้: <strong>{currentUser?.name || 'คนงาน'}</strong> ({currentUser?.avatar_emoji} สิทธิ์คนงาน)
            </p>
            <p className="text-xs text-slate-500 mt-1">
              * ข้อมูลสรุปต้นทุน กำไร-ขาดทุน และการตั้งค่าร้าน สงวนไว้เฉพาะเจ้าของร้านหรือผู้ดูแลระบบระดับ super ADMIN
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                playBeep(700, 0.05);
                setIsAuthModalOpen(true);
              }}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
            >
              <KeyRound className="h-5 w-5" />
              <span>สลับบัญชีเป็น super ADMIN</span>
            </button>

            <Link
              href="/"
              className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>กลับหน้าขายหน้าร้าน (POS)</span>
            </Link>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onUserChanged={(u) => setCurrentUser(u)}
        />
      </>
    );
  }

  return <>{children}</>;
}

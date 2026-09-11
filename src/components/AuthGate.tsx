'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { AppUser } from '@/types/pos';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initial check
    const user = storage.getCurrentUser();
    setCurrentUser(user);
    setIsReady(true);

    // Listen to real-time auth changes
    const handleAuthChanged = (e: Event) => {
      const customEvent = e as CustomEvent<AppUser | null>;
      setCurrentUser(customEvent.detail || null);
    };

    window.addEventListener('pzt_auth_changed', handleAuthChanged);
    return () => window.removeEventListener('pzt_auth_changed', handleAuthChanged);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!currentUser) {
      // Not logged in -> send to /login if not already there
      if (pathname !== '/login') {
        router.replace('/login');
      }
    } else {
      // Logged in -> if on /login, send to home
      if (pathname === '/login') {
        router.replace('/');
      }
    }
  }, [currentUser, isReady, pathname, router]);

  // If loading session, show clean splash
  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-700">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 animate-pulse">
          <span className="text-3xl">🍈</span>
        </div>
        <p className="mt-4 text-sm font-bold text-slate-500">กำลังตรวจสอบสิทธิ์เข้าใช้งาน...</p>
      </div>
    );
  }

  // If not logged in and not on /login yet, hold rendering while redirecting
  if (!currentUser && pathname !== '/login') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-700">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-lg animate-spin">
          <span className="text-2xl">🍈</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

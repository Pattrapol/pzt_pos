'use client';

import React, { useState, useEffect } from 'react';
import { AppUser } from '@/types/pos';
import { storage } from '@/lib/storage';
import { playBeep, playCashChime } from '@/lib/audio';
import { Lock, Unlock, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';

interface ScreenLockModalProps {
  isLocked: boolean;
  onUnlocked: (user: AppUser) => void;
}

export default function ScreenLockModal({ isLocked, onUnlocked }: ScreenLockModalProps) {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (isLocked) {
      const activeUsers = storage.getActiveUsers();
      setUsers(activeUsers);
      const cur = storage.getCurrentUser();
      setSelectedUser(cur || activeUsers[0] || null);
      setPin('');
      setErrorMsg('');
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const handleKeyPress = (digit: string) => {
    playBeep(700, 0.04);
    if (pin.length < 8) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');
      
      // Auto submit if 4 digits and user selected
      if (nextPin.length === 4 && selectedUser) {
        attemptUnlock(nextPin, selectedUser.id);
      }
    }
  };

  const handleBackspace = () => {
    playBeep(600, 0.04);
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    playBeep(500, 0.04);
    setPin('');
    setErrorMsg('');
  };

  const attemptUnlock = (pinToTest: string, userId?: string) => {
    const result = storage.unlockScreen(pinToTest, userId);
    if (result.success && result.user) {
      playCashChime();
      onUnlocked(result.user);
    } else {
      playBeep(250, 0.12);
      setErrorMsg('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setPin('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setErrorMsg('กรุณากรอกรหัส PIN เพื่อปลดล็อก');
      return;
    }
    attemptUnlock(pin, selectedUser?.id);
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-white animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">หน้าจอถูกล็อกชั่วคราว</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              แตะเลือกผู้ใช้งาน แล้วกดรหัส PIN 4 หลักเพื่อปลดล็อก
            </p>
          </div>
        </div>

        {/* User Selection Horizontal Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
          {users.map((u) => {
            const isSelected = selectedUser?.id === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  playBeep(650, 0.04);
                  setSelectedUser(u);
                  setPin('');
                  setErrorMsg('');
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/40'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span className="text-lg">{u.avatar_emoji || '👤'}</span>
                <span className="max-w-[100px] truncate">{u.name}</span>
              </button>
            );
          })}
        </div>

        {/* PIN Display (Dots) */}
        <div className="py-2">
          <div className="flex justify-center items-center gap-3">
            {[0, 1, 2, 3].map((idx) => {
              const hasDigit = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`h-5 w-5 rounded-full transition-all duration-150 ${
                    hasDigit
                      ? 'bg-emerald-400 scale-110 shadow-md shadow-emerald-400/50'
                      : 'border-2 border-slate-700 bg-slate-800/50'
                  }`}
                />
              );
            })}
          </div>
          {errorMsg && (
            <div className="mt-3 p-2.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Big Touch Numpad */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-2xl font-black text-white border border-slate-700/80 shadow-xs active:scale-95 transition-all"
              >
                {digit}
              </button>
            ))}
            
            <button
              type="button"
              onClick={handleClear}
              className="h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-xs font-bold text-slate-400 border border-slate-700/60 active:scale-95 transition-all flex items-center justify-center"
            >
              ล้าง
            </button>
            
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-2xl font-black text-white border border-slate-700/80 shadow-xs active:scale-95 transition-all"
            >
              0
            </button>
            
            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-sm font-bold text-slate-400 border border-slate-700/60 active:scale-95 transition-all flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Unlock className="h-5 w-5" />
            <span>ปลดล็อกหน้าจอ</span>
          </button>
        </form>

      </div>
    </div>
  );
}

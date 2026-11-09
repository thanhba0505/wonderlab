'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, X, Loader2, ArrowRight } from 'lucide-react';

export interface DevAccount {
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  badge: string;
  avatarBg: string;
  avatarText: string;
}

const PRESET_ACCOUNTS: DevAccount[] = [
  {
    name: 'Quản trị viên Hệ thống',
    email: 'admin@wonderlab.local',
    role: 'ADMIN',
    badge: 'ADMIN',
    avatarBg: 'bg-indigo-600',
    avatarText: 'AD',
  },
  {
    name: 'Nhà nghiên cứu Wonderlab',
    email: 'researcher@wonderlab.local',
    role: 'USER',
    badge: 'RESEARCHER',
    avatarBg: 'bg-emerald-600',
    avatarText: 'RS',
  },
  {
    name: 'Sinh viên Thực nghiệm',
    email: 'student@wonderlab.local',
    role: 'USER',
    badge: 'STUDENT',
    avatarBg: 'bg-blue-600',
    avatarText: 'ST',
  },
];

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { email: string; name: string }) => Promise<void> | void;
  appName?: string;
}

export function GoogleAccountChooserModal({
  isOpen,
  onClose,
  onSelectAccount,
  appName = 'Wonderlab',
}: GoogleAccountChooserModalProps) {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectingEmail, setSelectingEmail] = useState<string | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<DevAccount[]>([]);

  // Load custom accounts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wonderlab_dev_accounts');
      if (stored) {
        const parsed = JSON.parse(stored) as DevAccount[];
        setSavedAccounts(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  const handleSelect = async (account: { email: string; name: string }) => {
    setSelectingEmail(account.email);
    try {
      await onSelectAccount(account);
    } finally {
      setSelectingEmail(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    const email = customEmail.trim().toLowerCase();
    const name = customName.trim() || (email.split('@')[0] ?? 'User');

    const isPreset = PRESET_ACCOUNTS.some(p => p.email === email);
    if (!isPreset && !savedAccounts.some(s => s.email === email)) {
      const newAcc: DevAccount = {
        name,
        email,
        role: 'USER',
        badge: 'CUSTOM',
        avatarBg: 'bg-amber-600',
        avatarText: (name.slice(0, 2) || 'US').toUpperCase(),
      };
      const updated = [newAcc, ...savedAccounts].slice(0, 5);
      setSavedAccounts(updated);
      try {
        localStorage.setItem('wonderlab_dev_accounts', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    await handleSelect({ email, name });
  };

  const allAccounts = [
    ...PRESET_ACCOUNTS,
    ...savedAccounts.filter(s => !PRESET_ACCOUNTS.some(p => p.email === s.email)),
  ];

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white border border-slate-300/85 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.25)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/90 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900 leading-none">
                Đăng nhập bằng Google
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chọn tài khoản để tiếp tục tới {appName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Account List */}
        <div className="p-6 space-y-2.5 max-h-[380px] overflow-y-auto">
          {allAccounts.map(acc => (
            <button
              key={acc.email}
              type="button"
              disabled={selectingEmail !== null}
              onClick={() => handleSelect({ email: acc.email, name: acc.name })}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/90 hover:border-slate-300 transition-all text-left group active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-xs ${acc.avatarBg} shrink-0 shadow-2xs`}
                >
                  {acc.avatarText}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm truncate">
                      {acc.name}
                    </span>
                    {acc.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/70">
                        <ShieldCheck className="h-3 w-3 text-amber-600" />
                        ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200/70">
                        {acc.badge}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-slate-500 truncate">{acc.email}</p>
                </div>
              </div>
              <div className="shrink-0 pl-2">
                {selectingEmail === acc.email ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                )}
              </div>
            </button>
          ))}

          {/* Custom Account Toggle / Form */}
          {!showCustomInput ? (
            <button
              type="button"
              disabled={selectingEmail !== null}
              onClick={() => setShowCustomInput(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 text-left hover:bg-slate-50/80 hover:border-slate-400 text-slate-600 transition-all cursor-pointer"
            >
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Sử dụng một tài khoản khác...
              </span>
            </button>
          ) : (
            <form
              onSubmit={handleCustomSubmit}
              className="space-y-2.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Tài khoản kiểm thử tùy chỉnh:
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
              <input
                type="email"
                required
                placeholder="Email Google (ví dụ: member@wonderlab.local)"
                value={customEmail}
                onChange={e => setCustomEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden"
              />
              <input
                type="text"
                placeholder="Tên hiển thị (Tùy chọn)"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={selectingEmail !== null || !customEmail.trim()}
                className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {selectingEmail ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  'Đăng nhập với email này'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-center">
          <p className="text-xs text-slate-400">
            Môi trường phát triển cục bộ • Tự động đồng bộ với Central Gateway
          </p>
        </div>
      </div>
    </div>
  );
}

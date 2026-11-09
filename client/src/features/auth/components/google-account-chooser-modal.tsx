'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  X,
  Loader2,
  ArrowRight,
  UserCheck,
  Database,
  RefreshCw,
} from 'lucide-react';

export interface DevDbUser {
  id: string;
  username: string;
  email: string | null;
  role: 'ADMIN' | 'USER';
  avatarUrl?: string | null;
}

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: {
    username: string;
    email: string;
    name: string;
  }) => Promise<void> | void;
  appName?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4101/api/v1';

export function GoogleAccountChooserModal({
  isOpen,
  onClose,
  onSelectAccount,
  appName = 'Wonderlab',
}: GoogleAccountChooserModalProps) {
  const [users, setUsers] = useState<DevDbUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectingUsername, setSelectingUsername] = useState<string | null>(null);

  // Fetch users from database on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`${API_BASE_URL}/auth/dev/users`)
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          // Fallback to default local admin if fetch fails
          setUsers([
            {
              id: 'admin-fallback',
              username: 'admin',
              email: 'admin@wonderlab.local',
              role: 'ADMIN',
            },
          ]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = async (account: { username: string; email: string; name: string }) => {
    setSelectingUsername(account.username);
    try {
      await onSelectAccount(account);
    } finally {
      setSelectingUsername(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUsername.trim()) return;

    const uname = customUsername.trim();
    await handleSelect({ username: uname, email: `${uname}@wonderlab.local`, name: uname });
  };

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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/70">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading text-sm font-bold text-slate-900 leading-none">
                  Tài khoản trong CSDL (Local Dev)
                </h3>
                <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[10px] font-mono font-bold text-amber-800">
                  DEV BYPASS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Bấm vào tài khoản bất kỳ để đăng nhập nhanh vào {appName}
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-xs">Đang tải danh sách tài khoản từ DB...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <p className="text-xs">Chưa tìm thấy tài khoản nào trong CSDL.</p>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  fetch(`${API_BASE_URL}/auth/dev/users`)
                    .then(res => (res.ok ? res.json() : []))
                    .then(data => setUsers(Array.isArray(data) ? data : []))
                    .finally(() => setIsLoading(false));
                }}
                className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" /> Thử tải lại
              </button>
            </div>
          ) : (
            users.map(acc => {
              const initials = (acc.username.slice(0, 2) || 'US').toUpperCase();
              const isAdmin = acc.role === 'ADMIN';

              return (
                <button
                  key={acc.id || acc.username}
                  type="button"
                  disabled={selectingUsername !== null}
                  onClick={() =>
                    handleSelect({
                      username: acc.username,
                      email: acc.email || '',
                      name: acc.username,
                    })
                  }
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/90 hover:border-slate-300 transition-all text-left group active:scale-[0.99] cursor-pointer disabled:opacity-60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                        isAdmin ? 'bg-amber-600' : 'bg-slate-700'
                      } shrink-0 shadow-2xs font-mono`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm truncate font-mono">
                          {acc.username}
                        </span>
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/70">
                            <ShieldCheck className="h-3 w-3 text-amber-600" />
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200/70">
                            <UserCheck className="h-3 w-3 text-slate-500" />
                            USER
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-slate-500 truncate">
                        {acc.email || `${acc.username}@wonderlab.local`}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 pl-2">
                    {selectingUsername === acc.username ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </button>
              );
            })
          )}

          {/* Custom Username Login Form */}
          {!showCustomInput ? (
            <button
              type="button"
              disabled={selectingUsername !== null}
              onClick={() => setShowCustomInput(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 text-left hover:bg-slate-50/80 hover:border-slate-400 text-slate-600 transition-all cursor-pointer"
            >
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Nhập tên đăng nhập khác trong DB...
              </span>
            </button>
          ) : (
            <form
              onSubmit={handleCustomSubmit}
              className="space-y-2.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Tên đăng nhập tùy chỉnh:
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
                type="text"
                required
                placeholder="Nhập username (VD: admin, researcher)..."
                value={customUsername}
                onChange={e => setCustomUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden font-mono"
              />
              <button
                type="submit"
                disabled={selectingUsername !== null || !customUsername.trim()}
                className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {selectingUsername ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  'Đăng nhập với tài khoản này'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-center">
          <p className="text-xs text-slate-400">
            Dùng API đăng nhập đầy đủ (`/auth/login`) • Bỏ qua bước kiểm tra mật khẩu trên Local
          </p>
        </div>
      </div>
    </div>
  );
}

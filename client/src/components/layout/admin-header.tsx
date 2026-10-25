'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, LogOut } from 'lucide-react';
import { AppButton, AppTag, BrandLogo } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

export function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-300/80 bg-white shadow-2xs">
      <div className="w-full max-w-[1680px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <BrandLogo
              variant="badge"
              className="h-9 w-9 rounded-xl shadow-sm shadow-blue-500/20"
            />
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-extrabold tracking-tight text-slate-900">
                WONDER<span className="text-blue-600">LAB</span>
              </span>
              <span className="text-slate-300">/</span>
              <AppTag variant="blue" size="sm" className="font-bold uppercase tracking-wider">
                Admin Console
              </AppTag>
            </div>
          </Link>
        </div>

        {/* Right Side: Back to site & Profile */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <AppButton
              variant="outline"
              size="sm"
              className="text-xs text-slate-700 hover:text-slate-900 border-slate-300 bg-white shadow-2xs font-medium"
              leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            >
              Về Trang chủ Lab
            </AppButton>
          </Link>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-mono font-bold text-slate-800">{user.username}</span>
                <AppTag variant="blue" size="sm">
                  {user.role}
                </AppTag>
              </div>

              <AppButton
                variant="ghost"
                size="icon-sm"
                onClick={() => logout()}
                className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="h-3.5 w-3.5" />
              </AppButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';

export function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-300/80 bg-white shadow-2xs">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-extrabold tracking-tight text-slate-900">
                WONDER<span className="text-blue-600">LAB</span>
              </span>
              <span className="text-slate-300">/</span>
              <Badge
                variant="outline"
                className="text-xs font-mono border-blue-200 bg-blue-50/80 text-blue-700 font-bold uppercase tracking-wider"
              >
                Admin Console
              </Badge>
            </div>
          </Link>
        </div>

        {/* Right Side: Back to site & Profile */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-slate-700 hover:text-slate-900 border-slate-300 bg-white shadow-2xs font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Về Trang chủ Lab
            </Button>
          </Link>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-mono font-bold text-slate-800">{user.username}</span>
                <span className="text-xs font-mono px-1 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  {user.role}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                title="Đăng xuất"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

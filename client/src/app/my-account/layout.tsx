'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Loader2, User } from 'lucide-react';
import { AdminSidebar } from '../admin/components/admin-sidebar';
import { AppButton } from '@/components/ui';

export default function MyAccountLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading, openAuthModal } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-xs font-mono text-slate-500">Đang đồng bộ phiên bảo mật...</span>
      </div>
    );
  }

  // Unauthenticated visitors
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="rounded-2xl border border-slate-300/85 bg-white p-8 sm:p-10 text-center shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] max-w-md w-full">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 mb-4 shadow-2xs">
            <User className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-lg font-bold text-slate-900 tracking-tight">
            Yêu cầu Đăng nhập
          </h1>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Vui lòng đăng nhập để truy cập không gian bảng điều khiển cá nhân và xem tiến trình thực
            nghiệm của bạn.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <AppButton variant="primary" size="sm" onClick={() => openAuthModal('login')}>
              Đăng nhập ngay
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 h-full flex flex-col lg:flex-row gap-5 overflow-hidden">
      {/* Shared Console Sidebar */}
      <AdminSidebar user={user} onLogout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full overflow-y-auto min-w-0 pb-4 lg:pb-0">{children}</main>
    </div>
  );
}

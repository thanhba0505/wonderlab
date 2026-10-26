'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';
import { AdminSidebar } from './components/admin-sidebar';
import { AdminLoginCard } from './components/admin-login-card';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-xs font-mono text-slate-500">Đang đồng bộ phiên bảo mật...</span>
      </div>
    );
  }

  // Unauthenticated or not an ADMIN
  if (!user || user.role !== 'ADMIN') {
    return <AdminLoginCard />;
  }

  return (
    <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 h-full flex flex-col lg:flex-row gap-5 overflow-hidden">
      {/* Sidebar Navigation */}
      <AdminSidebar user={user} onLogout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full overflow-y-auto min-w-0 pb-4 lg:pb-0">{children}</main>
    </div>
  );
}

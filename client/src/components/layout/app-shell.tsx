'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { AdminHeader } from './admin-header';
import { Footer } from './footer';
import { AuthModal } from '@/features/auth/components/auth-modal';
import { UserProfileModal } from '@/features/auth/components/user-profile-modal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f1f5f9] text-slate-800">
        <AdminHeader />
        <main className="flex-1">{children}</main>
        {/* Admin route has NO footer as requested */}
        <UserProfileModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9] text-slate-800">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AuthModal />
      <UserProfileModal />
    </div>
  );
}

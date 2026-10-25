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
  const isConsoleRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/my-account');

  if (isConsoleRoute) {
    return (
      <div className="h-screen max-h-screen flex flex-col bg-[#f1f5f9] text-slate-800 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        {/* Console routes have NO footer as requested */}
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

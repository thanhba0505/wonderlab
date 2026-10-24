'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Menu,
  X,
  Compass,
  FlaskConical,
  BookOpen,
  ShieldAlert,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { LoginDialog } from '@/components/auth/login-dialog';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-300/80 bg-white/95 backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 font-bold tracking-tight text-slate-900 transition hover:opacity-95 group"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 shadow-sm shadow-blue-500/25 ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl font-extrabold tracking-tight text-slate-900">
                WONDER<span className="text-blue-600">LAB</span>
              </span>
              <span className="hidden sm:inline-flex rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-blue-700">
                LAB 2026
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link
            href="#featured"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100"
          >
            <FlaskConical className="h-4 w-4 text-blue-600" />
            Thí nghiệm
          </Link>
          <Link
            href="#explore"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100"
          >
            <Compass className="h-4 w-4 text-violet-600" />
            Khám phá
          </Link>
          <Link
            href="#curated"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            Tuyển chọn
          </Link>
          <Link
            href="#editorial"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100"
          >
            <BookOpen className="h-4 w-4 text-emerald-600" />
            Góc tư duy
          </Link>
        </nav>

        {/* Header Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-blue-900 border-blue-200 bg-blue-50/80 hover:bg-blue-100 font-medium"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
                  <span className="font-mono">{user.username}</span>
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-blue-600 text-white rounded font-mono font-bold">
                    {user.role}
                  </span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-2 h-8"
                title="Đăng xuất"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLoginDialogOpen(true)}
              className="text-xs text-slate-700 hover:text-slate-900 border-slate-300 bg-white"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600 mr-1.5" />
              Admin
            </Button>
          )}

          <a href="#featured">
            <Button size="sm" className="font-semibold shadow-sm">
              Bắt đầu trải nghiệm
            </Button>
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden animate-in fade-in slide-in-from-top-2 shadow-lg">
          <nav className="flex flex-col gap-2 text-sm font-medium">
            <Link
              href="#featured"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              <FlaskConical className="h-4 w-4 text-blue-600" />
              Thí nghiệm Monty Hall
            </Link>
            <Link
              href="#explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              <Compass className="h-4 w-4 text-violet-600" />
              Khám phá chủ đề
            </Link>
            <Link
              href="#curated"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              <Sparkles className="h-4 w-4 text-amber-600" />
              Tuyển chọn thực nghiệm
            </Link>
            <Link
              href="#editorial"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              <BookOpen className="h-4 w-4 text-emerald-600" />
              Góc tư duy
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-amber-800 hover:bg-amber-50 border border-amber-200"
            >
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Khu vực Admin
            </Link>
            <div className="pt-2">
              <a href="#featured" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                <Button className="w-full font-bold">Bắt đầu trải nghiệm</Button>
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* Security Login Dialog Modal */}
      <LoginDialog isOpen={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)} />
    </header>
  );
}

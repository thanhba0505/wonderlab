'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, Compass, FlaskConical, BookOpen, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, logout, openAuthModal, openProfileModal } = useAuth();

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
              <span className="hidden sm:inline-flex rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-xs font-mono font-semibold text-blue-700">
                LAB 2026
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link
            href="/simulations"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100 font-semibold text-blue-700"
          >
            <FlaskConical className="h-4 w-4 text-blue-600" />
            Phòng Lab
          </Link>
          <Link
            href="/#explore"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100"
          >
            <Compass className="h-4 w-4 text-violet-600" />
            Khám phá
          </Link>
          <Link
            href="/#curated"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            Tuyển chọn
          </Link>
          <Link
            href="/#editorial"
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
              <button
                type="button"
                onClick={() => openProfileModal()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition shadow-2xs group"
                title="Quản lý tài khoản"
              >
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-mono font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-mono text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {user.username}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs font-mono px-1.5 py-0.5 font-bold uppercase ${
                    user.role === 'ADMIN'
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : 'border-blue-200 bg-blue-50 text-blue-700'
                  }`}
                >
                  {user.role}
                </Badge>
              </button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 h-9 w-9"
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => openAuthModal('login')}
              className="font-semibold shadow-xs flex items-center gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </Button>
          )}
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
              href="/simulations"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-blue-700 font-semibold hover:bg-blue-50"
            >
              <FlaskConical className="h-4 w-4 text-blue-600" />
              Phòng Thí nghiệm
            </Link>
            <Link
              href="/#explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              <Compass className="h-4 w-4 text-violet-600" />
              Khám phá chủ đề
            </Link>
            <Link
              href="/#curated"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              <Sparkles className="h-4 w-4 text-amber-600" />
              Tuyển chọn thực nghiệm
            </Link>
            <Link
              href="/#editorial"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              <BookOpen className="h-4 w-4 text-emerald-600" />
              Góc tư duy
            </Link>

            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openProfileModal();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-mono font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-mono font-bold text-slate-800">{user.username}</span>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono">
                      {user.role}
                    </Badge>
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1.5" />
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full font-bold flex items-center justify-center gap-1.5"
                >
                  <LogIn className="h-4 w-4" />
                  Đăng nhập tài khoản
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

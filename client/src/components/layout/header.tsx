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
  LogOut,
  LogIn,
  User,
  ShieldCheck,
  ChevronDown,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import {
  AppDropdown,
  AppDropdownItem,
  AppDropdownSeparator,
  AppDropdownHeader,
  AppDropdownGroup,
  AppTag,
  LanguageSwitcher,
} from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, logout, openAuthModal } = useAuth();
  const { dict } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-300/80 bg-white/95 backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]">
      <div className="container mx-auto flex h-16 max-w-7xl xl:max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 font-bold tracking-tight text-slate-900 transition hover:opacity-95 group"
        >
          <BrandLogo
            variant="badge"
            className="h-10 w-10 rounded-xl shadow-sm shadow-blue-500/25 ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-heading text-xl font-extrabold tracking-tight text-slate-900">
            WONDER<span className="text-blue-600">LAB</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link
            href="/simulations"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100 font-semibold text-blue-700"
          >
            <FlaskConical className="h-4 w-4 text-blue-600" />
            {dict.nav.simulations}
          </Link>
          <Link
            href="/#explore"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100"
          >
            <Compass className="h-4 w-4 text-violet-600" />
            {dict.nav.explore}
          </Link>
          <Link
            href="/#curated"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            {dict.nav.explore}
          </Link>
          <Link
            href="/#editorial"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100"
          >
            <BookOpen className="h-4 w-4 text-emerald-600" />
            {dict.nav.essays}
          </Link>
          <Link
            href="/requests"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-100"
          >
            <Lightbulb className="h-4 w-4 text-cyan-600" />
            {dict.nav.requests}
          </Link>
        </nav>

        {/* Header Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />

          {user ? (
            <AppDropdown
              align="end"
              width="md"
              trigger={({ isOpen }) => (
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white transition shadow-2xs group cursor-pointer select-none',
                    isOpen
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30'
                      : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400',
                  )}
                  title="Menu tài khoản"
                  aria-expanded={isOpen}
                >
                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">
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
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-slate-400 transition-transform duration-200',
                      isOpen && 'rotate-180 text-blue-600',
                    )}
                  />
                </button>
              )}
            >
              {/* Header profile info */}
              <AppDropdownHeader>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-mono font-bold shadow-2xs shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900 truncate">
                        {user.username}
                      </span>
                      <AppTag
                        variant={user.role === 'ADMIN' ? 'amber' : 'blue'}
                        size="sm"
                        className="font-mono text-xs uppercase"
                      >
                        {user.role}
                      </AppTag>
                    </div>
                    {user.email ? (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                    ) : (
                      <p className="text-xs text-slate-400 italic truncate mt-0.5">
                        Chưa liên kết email
                      </p>
                    )}
                  </div>
                </div>
              </AppDropdownHeader>

              {/* Navigation Items */}
              <AppDropdownGroup>
                <AppDropdownItem href="/my-account" icon={<User className="h-4 w-4" />}>
                  {dict.nav.my_account}
                </AppDropdownItem>

                {user.role === 'ADMIN' && (
                  <AppDropdownItem
                    href="/admin"
                    icon={<ShieldCheck className="h-4 w-4 text-amber-600" />}
                    rightElement={
                      <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                        ADMIN
                      </span>
                    }
                  >
                    {dict.nav.admin}
                  </AppDropdownItem>
                )}
              </AppDropdownGroup>

              <AppDropdownSeparator />

              {/* Logout Item */}
              <AppDropdownGroup>
                <AppDropdownItem
                  variant="danger"
                  icon={<LogOut className="h-4 w-4" />}
                  onClick={() => logout()}
                >
                  {dict.nav.logout}
                </AppDropdownItem>
              </AppDropdownGroup>
            </AppDropdown>
          ) : (
            <Button
              size="sm"
              onClick={() => openAuthModal('login')}
              className="font-semibold shadow-xs flex items-center gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              {dict.auth.sign_in_btn}
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
            {/* Language Switcher in Mobile Drawer */}
            <div className="flex items-center justify-between pb-3 mb-1 border-b border-slate-100">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                {dict.header.language}
              </span>
              <LanguageSwitcher variant="toggle" />
            </div>

            <Link
              href="/simulations"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-blue-700 font-semibold hover:bg-blue-50"
            >
              <FlaskConical className="h-4 w-4 text-blue-600" />
              {dict.nav.simulations}
            </Link>
            <Link
              href="/#explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              <Compass className="h-4 w-4 text-violet-600" />
              {dict.nav.explore}
            </Link>
            <Link
              href="/#curated"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              <Sparkles className="h-4 w-4 text-amber-600" />
              {dict.nav.explore}
            </Link>
            <Link
              href="/#editorial"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              <BookOpen className="h-4 w-4 text-emerald-600" />
              {dict.nav.essays}
            </Link>
            <Link
              href="/requests"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
            >
              <Lightbulb className="h-4 w-4 text-cyan-600" />
              {dict.nav.requests}
            </Link>

            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-mono font-bold shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-mono font-bold text-slate-800 block truncate">
                          {user.username}
                        </span>
                        {user.email && (
                          <span className="text-slate-500 text-xs block truncate">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                      {user.role}
                    </Badge>
                  </div>

                  <Link
                    href="/my-account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <User className="h-4 w-4 text-slate-500" />
                    {dict.nav.my_account}
                  </Link>

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50/70 hover:bg-amber-100/60 border border-amber-200"
                    >
                      <ShieldCheck className="h-4 w-4 text-amber-600" />
                      {dict.nav.admin}
                    </Link>
                  )}

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
                    {dict.nav.logout}
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
                  {dict.auth.sign_in_btn}
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

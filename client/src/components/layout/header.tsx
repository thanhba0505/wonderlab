'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, Compass, FlaskConical, BookOpen, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-white transition hover:opacity-90"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 via-violet-600 to-indigo-700 shadow-md shadow-cyan-500/20">
            <Sparkles className="h-5 w-5 text-slate-950" />
            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            WONDER<span className="text-cyan-400">LAB</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link
            href="#explore"
            className="flex items-center gap-1.5 transition-colors hover:text-cyan-400"
          >
            <Compass className="h-4 w-4" />
            Khám phá
          </Link>
          <Link
            href="#featured"
            className="flex items-center gap-1.5 transition-colors hover:text-cyan-400"
          >
            <FlaskConical className="h-4 w-4" />
            Thí nghiệm
          </Link>
          <Link
            href="#editorial"
            className="flex items-center gap-1.5 transition-colors hover:text-cyan-400"
          >
            <BookOpen className="h-4 w-4" />
            Góc tư duy
          </Link>
        </nav>

        {/* Header Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400 hover:text-slate-200 border border-slate-800"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400 mr-1" />
              Admin
            </Button>
          </Link>

          <a href="#featured">
            <Button size="sm" className="shadow-lg shadow-cyan-500/20 font-semibold">
              Khám phá ngay
            </Button>
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-300 hover:bg-slate-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 py-4 md:hidden animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <Link
              href="#explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-200 hover:bg-slate-900"
            >
              <Compass className="h-4 w-4 text-cyan-400" />
              Khám phá
            </Link>
            <Link
              href="#featured"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-200 hover:bg-slate-900"
            >
              <FlaskConical className="h-4 w-4 text-violet-400" />
              Thí nghiệm
            </Link>
            <Link
              href="#editorial"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-200 hover:bg-slate-900"
            >
              <BookOpen className="h-4 w-4 text-emerald-400" />
              Góc tư duy
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-amber-300 hover:bg-slate-900 border border-amber-900/40"
            >
              <ShieldAlert className="h-4 w-4" />
              Khu vực Admin (Placeholder)
            </Link>
            <div className="pt-2">
              <a href="#featured" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                <Button className="w-full font-semibold">Khám phá ngay</Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

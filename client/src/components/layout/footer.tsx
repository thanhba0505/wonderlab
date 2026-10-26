'use client';

import * as React from 'react';
import Link from 'next/link';
import { Github, ArrowUpRight, Scale, Shield } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/i18n';

export function Footer() {
  const { user } = useAuth();
  const { dict, locale } = useTranslation();

  return (
    <footer className="border-t border-slate-300/80 bg-slate-200/40 py-12 text-slate-600">
      <div className="container mx-auto max-w-7xl xl:max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <BrandLogo
                variant="badge"
                className="h-8 w-8 rounded-lg shadow-sm shadow-blue-500/20 ring-1 ring-black/5"
              />
              <span className="text-xl font-heading font-black text-slate-900 tracking-tight">
                WONDER<span className="text-blue-600">LAB</span>
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-600 font-sans">
              {dict.footer.about_text}
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
              {dict.footer.quick_links}
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link
                  href="/simulations"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {dict.footer.lab_experiments}
                </Link>
              </li>
              <li>
                <Link
                  href="/simulations/monty-hall"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {locale === 'en' ? 'Monty Hall Problem' : 'Nghịch lý Monty Hall'}
                </Link>
              </li>
              <li>
                <Link
                  href="/simulations/birthday-paradox"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {locale === 'en' ? 'Birthday Paradox' : 'Nghịch lý Ngày sinh'}
                </Link>
              </li>
              <li>
                <Link
                  href="/simulations/double-slit"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {locale === 'en' ? 'Double-Slit Experiment' : 'Thí nghiệm Hai khe Young'}
                </Link>
              </li>
              <li>
                <Link
                  href="/simulations/prisoners-dilemma"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {locale === 'en' ? "Prisoner's Dilemma" : 'Thế lưỡng nan Người tù'}
                </Link>
              </li>
              <li>
                <Link
                  href="/simulations/zeno-paradox"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {locale === 'en' ? "Zeno's Paradox" : 'Nghịch lý Zeno'}
                </Link>
              </li>
              <li>
                <Link
                  href="/simulations/prisoners-hats"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Bài toán Đội mũ &amp; Bit Chẵn lẻ
                </Link>
              </li>
              <li>
                <Link
                  href="/essays"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {dict.footer.essays_journal}
                </Link>
              </li>
              <li>
                <Link
                  href="/requests"
                  className="text-slate-600 hover:text-slate-900 transition-colors font-medium flex items-center gap-1.5"
                >
                  <span>{dict.footer.submit_request}</span>
                  <span className="text-xs font-mono bg-blue-100 text-blue-700 px-1 py-0.2 rounded font-semibold">
                    {locale === 'en' ? 'New' : 'Mới'}
                  </span>
                </Link>
              </li>

              {/* Chỉ hiển thị link Admin khi đã đăng nhập tài khoản ADMIN */}
              {user?.role === 'ADMIN' && (
                <li className="pt-1">
                  <Link
                    href="/admin"
                    className="text-blue-700 hover:text-blue-800 transition-colors font-medium flex items-center gap-1.5"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>{dict.footer.admin_portal}</span>
                    <span className="text-xs font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-bold">
                      ADMIN
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Open source & Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
              {dict.footer.community}
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <a
                  href="https://github.com/thanhba0505/wonderlab"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Github className="h-4 w-4" />
                  GitHub Repository
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Scale className="h-4 w-4" />
                  MIT License
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Wonderlab. {locale === 'en' ? 'Open scientific laboratory platform.' : 'Nền tảng thí nghiệm khoa học mở.'}</p>
          <p className="mt-2 sm:mt-0 font-sans text-slate-500">
            {locale === 'en' ? 'Experimental Science & Liberal Education' : 'Khoa học thực nghiệm & Giáo dục khai phóng'}
          </p>
        </div>
      </div>
    </footer>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  BookOpen,
  ShieldCheck,
  Settings,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AppButton, AppTag } from '@/components/ui';
import { SIMULATIONS_REGISTRY } from '@/features/simulations/registry';
import { ESSAYS } from '@/features/editorial/essays-data';
import { useTranslation } from '@/i18n';

export default function MyAccountPage() {
  const { user } = useAuth();
  const { locale, dict } = useTranslation();
  const isEn = locale === 'en';

  if (!user) return null;

  const recentSimulations = SIMULATIONS_REGISTRY.slice(0, 3);
  const recentEssays = ESSAYS.slice(0, 2);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Wonderlab
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Console</span>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{dict.account.overview_title}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {dict.account.overview_title}
            </h1>
            <p className="text-xs text-slate-600 mt-1">{dict.account.overview_subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/my-account/profile">
              <AppButton
                variant="outline"
                size="sm"
                leftIcon={<Settings className="h-3.5 w-3.5" />}
                className="text-xs"
              >
                {dict.account.profile_btn}
              </AppButton>
            </Link>

            {user.role === 'ADMIN' && (
              <Link href="/admin">
                <AppButton
                  variant="primary"
                  size="sm"
                  leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}
                  className="bg-amber-600 hover:bg-amber-700 text-white border-amber-700 text-xs shadow-xs"
                >
                  {dict.account.admin_btn}
                </AppButton>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Admin Quick Banner (if Admin) */}
      {user.role === 'ADMIN' && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600 text-white shadow-2xs shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950 font-mono uppercase tracking-wider">
                {isEn
                  ? 'Administrator Privileges (Admin Console)'
                  : 'Đặc quyền Quản trị viên (Admin Console)'}
              </div>
              <p className="text-xs text-amber-900 mt-0.5">
                {isEn
                  ? 'You are logged in with administrative privileges. You can access the system management portal.'
                  : 'Bạn đang đăng nhập với quyền Quản trị tối cao. Bạn có thể truy cập trang Quản trị toàn sàn.'}
              </p>
            </div>
          </div>
          <Link href="/admin" className="shrink-0">
            <AppButton
              variant="outline"
              size="sm"
              className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold"
            >
              {isEn ? 'Open Admin Console' : 'Mở Admin Console'}
            </AppButton>
          </Link>
        </div>
      )}

      {/* Profile Summary Card */}
      <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white font-mono text-2xl font-bold shadow-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg font-bold text-slate-900">{user.username}</h2>
                <AppTag
                  variant={user.role === 'ADMIN' ? 'amber' : 'blue'}
                  size="sm"
                  className="font-mono text-xs uppercase"
                >
                  {user.role}
                </AppTag>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {user.email ||
                  (isEn ? 'No personal email provided' : 'Chưa cung cấp email cá nhân')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:border-slate-200 sm:pl-6">
            <div className="text-left">
              <span className="text-xs font-mono text-slate-500 block uppercase tracking-wider">
                {dict.account.status_label}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 mt-0.5 font-mono">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                {dict.account.status_active}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid: 2 Columns */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Recent Simulations (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-blue-600" />
                <h2 className="font-heading text-base font-bold text-slate-900">
                  {dict.account.experiments_history}
                </h2>
              </div>
              <Link
                href="/simulations"
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                {dict.account.all_labs}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentSimulations.map(sim => (
                <div
                  key={sim.slug}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase text-blue-600">
                        {sim.category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3" /> ~{sim.estimatedMinutes}{' '}
                        {isEn ? 'min' : 'phút'}
                      </span>
                    </div>
                    <Link
                      href={`/simulations/${sim.slug}`}
                      className="font-heading text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors mt-1 block truncate"
                    >
                      {sim.title}
                    </Link>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{sim.summary}</p>
                  </div>

                  <Link href={`/simulations/${sim.slug}`} className="shrink-0">
                    <AppButton
                      variant="outline"
                      size="sm"
                      className="text-xs text-slate-700 hover:text-blue-600 group-hover:border-blue-300"
                    >
                      {isEn ? 'Experiment' : 'Thực nghiệm'}
                    </AppButton>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Thoughts & Bookmarks */}
          <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                <h2 className="font-heading text-base font-bold text-slate-900">
                  {dict.account.essays_history}
                </h2>
              </div>
              <Link
                href="/essays"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                {dict.account.all_essays}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentEssays.map(essay => (
                <div
                  key={essay.slug}
                  className="rounded-lg border border-slate-200/90 bg-slate-50/60 p-4 hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold uppercase">
                    <span>{essay.categoryLabel}</span>
                    <span className="text-slate-300">•</span>
                    <span>
                      {essay.readTimeMinutes} {isEn ? 'min read' : 'phút đọc'}
                    </span>
                  </div>
                  <Link
                    href={`/essays/${essay.slug}`}
                    className="font-heading text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors mt-1.5 block"
                  >
                    {essay.title}
                  </Link>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {essay.teaser}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Account Stats & Shortcuts (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Metrics */}
          <div className="rounded-xl border border-slate-300/85 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <h2 className="font-heading text-sm font-bold text-slate-900">
                {dict.account.metrics_title}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                <span className="text-xs font-mono text-slate-500 uppercase">
                  {dict.account.metrics_experiments}
                </span>
                <div className="text-xl font-heading font-extrabold text-blue-700 mt-1 font-mono tabular-nums">
                  {recentSimulations.length}
                </div>
                <span className="text-xs text-slate-500">{dict.account.metrics_participated}</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                <span className="text-xs font-mono text-slate-500 uppercase">
                  {dict.account.metrics_essays}
                </span>
                <div className="text-xl font-heading font-extrabold text-emerald-700 mt-1 font-mono tabular-nums">
                  {recentEssays.length}
                </div>
                <span className="text-xs text-slate-500">{dict.account.metrics_read}</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-xl border border-slate-300/85 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] space-y-3">
            <h2 className="font-heading text-sm font-bold text-slate-900 border-b border-slate-200/80 pb-3">
              {dict.account.management_title}
            </h2>

            <div className="space-y-2">
              <Link
                href="/my-account/profile"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-slate-100/70 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {dict.account.change_password_title}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {dict.account.change_password_desc}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700" />
              </Link>

              <Link
                href="/simulations"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-slate-100/70 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {dict.account.explore_paradoxes_title}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {dict.account.explore_paradoxes_desc}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, LogOut, User, LayoutDashboard, ChevronDown, KeyRound } from 'lucide-react';
import {
  AppButton,
  AppTag,
  BrandLogo,
  AppDropdown,
  AppDropdownHeader,
  AppDropdownItem,
  AppDropdownSeparator,
  AppDropdownGroup,
} from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export function AdminHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdminView = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-300/80 bg-white shadow-2xs">
      <div className="w-full max-w-[1680px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href={user?.role === 'ADMIN' ? '/admin' : '/my-account'}
            className="flex items-center gap-2.5 group"
          >
            <BrandLogo
              variant="badge"
              className="h-9 w-9 rounded-xl shadow-sm shadow-blue-500/20"
            />
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-extrabold tracking-tight text-slate-900">
                WONDER<span className="text-blue-600">LAB</span>
              </span>
              <span className="text-slate-300">/</span>
              <AppTag
                variant={isAdminView ? 'amber' : 'blue'}
                size="sm"
                className="font-bold uppercase tracking-wider font-mono text-xs"
              >
                {isAdminView ? 'Admin Console' : 'Console'}
              </AppTag>
            </div>
          </Link>
        </div>

        {/* Right Side: Back to site & Profile */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <AppButton
              variant="outline"
              size="sm"
              className="text-xs text-slate-700 hover:text-slate-900 border-slate-300 bg-white shadow-2xs font-medium"
              leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            >
              Về Trang chủ Lab
            </AppButton>
          </Link>

          {user && (
            <div className="pl-2 border-l border-slate-200">
              <AppDropdown
                align="end"
                width="md"
                trigger={({ isOpen }) => (
                  <button
                    type="button"
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-1 rounded-lg border bg-slate-50 transition shadow-2xs group cursor-pointer select-none text-xs',
                      isOpen
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40'
                        : 'border-slate-200 hover:bg-slate-100 hover:border-slate-300',
                    )}
                    title="Menu tài khoản Quản trị"
                    aria-expanded={isOpen}
                  >
                    <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-mono font-bold text-slate-800">{user.username}</span>
                    <AppTag variant="amber" size="sm" className="font-mono text-xs uppercase">
                      {user.role}
                    </AppTag>
                    <ChevronDown
                      className={cn(
                        'h-3 w-3 text-slate-400 transition-transform duration-200',
                        isOpen && 'rotate-180 text-blue-600',
                      )}
                    />
                  </button>
                )}
              >
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
                        <AppTag variant="amber" size="sm" className="font-mono text-xs uppercase">
                          ADMIN
                        </AppTag>
                      </div>
                      {user.email ? (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      ) : (
                        <p className="text-xs text-slate-400 italic truncate mt-0.5">
                          Tài khoản Quản trị
                        </p>
                      )}
                    </div>
                  </div>
                </AppDropdownHeader>

                <AppDropdownGroup>
                  <AppDropdownItem href="/my-account" icon={<User className="h-4 w-4" />}>
                    Tổng quan Cá nhân
                  </AppDropdownItem>
                  <AppDropdownItem
                    href="/my-account/profile"
                    icon={<KeyRound className="h-4 w-4" />}
                  >
                    Hồ sơ & Bảo mật
                  </AppDropdownItem>
                  {user.role === 'ADMIN' && (
                    <AppDropdownItem
                      href="/admin"
                      icon={<LayoutDashboard className="h-4 w-4 text-amber-600" />}
                    >
                      Tổng quan Quản trị
                    </AppDropdownItem>
                  )}
                  <AppDropdownItem href="/" icon={<ArrowLeft className="h-4 w-4" />}>
                    Về Trang chủ Lab
                  </AppDropdownItem>
                </AppDropdownGroup>

                <AppDropdownSeparator />

                <AppDropdownGroup>
                  <AppDropdownItem
                    variant="danger"
                    icon={<LogOut className="h-4 w-4" />}
                    onClick={() => logout()}
                  >
                    Đăng xuất khỏi hệ thống
                  </AppDropdownItem>
                </AppDropdownGroup>
              </AppDropdown>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

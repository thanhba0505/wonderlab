'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ArrowLeft,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import { AuthUser } from '@/types';

export type AdminViewType = 'dashboard' | 'simulations' | 'users' | 'comments' | 'settings';

interface AdminSidebarProps {
  currentView: AdminViewType;
  onSelectView: (view: AdminViewType) => void;
  user: AuthUser;
  onLogout: () => void;
  commentCount?: number;
  userCount?: number;
}

export function AdminSidebar({
  currentView,
  onSelectView,
  user,
  onLogout,
  commentCount,
  userCount,
}: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const navItems = [
    {
      id: 'dashboard' as AdminViewType,
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'simulations' as AdminViewType,
      label: 'Cài đặt Thí nghiệm',
      icon: FlaskConical,
      badge: '5 lab',
    },
    {
      id: 'users' as AdminViewType,
      label: 'Quản lý Người dùng',
      icon: Users,
      badge: userCount !== undefined ? `${userCount}` : null,
    },
    {
      id: 'comments' as AdminViewType,
      label: 'Kiểm duyệt Bình luận',
      icon: MessageSquare,
      badge: commentCount !== undefined ? `${commentCount}` : null,
    },
    {
      id: 'settings' as AdminViewType,
      label: 'Cài đặt Nền tảng',
      icon: Settings,
      badge: null,
    },
  ];

  const handleSelect = (view: AdminViewType) => {
    onSelectView(view);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200">
      {/* Brand & Console Header */}
      <div>
        <div className="flex items-center justify-between p-5 border-b border-slate-200/80">
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandLogo
              variant="badge"
              className="h-9 w-9 rounded-xl shadow-sm shadow-blue-500/20"
            />
            <div>
              <div className="font-heading text-base font-extrabold tracking-tight text-slate-900 leading-none">
                WONDER<span className="text-blue-600">LAB</span>
              </div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
                Admin Console
              </div>
            </div>
          </Link>
          <Badge
            variant="outline"
            className="text-xs font-mono border-blue-200 bg-blue-50/60 text-blue-700"
          >
            v0.3
          </Badge>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Quản trị Vận hành
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Actions */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        {/* User Card */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="font-mono text-xs font-bold text-slate-900 truncate">
                {user.username}
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-slate-500">
                <Shield className="h-3 w-3 text-blue-600" />
                <span>{user.role}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
            title="Đăng xuất"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Back to site button */}
        <Link href="/" className="block">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs text-slate-600 hover:text-slate-900 border-slate-200 bg-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Về Trang chủ Lab
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Bar Toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <BrandLogo variant="badge" className="h-8 w-8 rounded-lg" />
          <span className="font-heading font-extrabold text-sm text-slate-900">
            WONDERLAB ADMIN
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="h-9 w-9 p-0"
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex">
          <div className="w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>
    </>
  );
}

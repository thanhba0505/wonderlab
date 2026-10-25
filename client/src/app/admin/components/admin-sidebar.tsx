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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function AdminSidebar({ currentView, onSelectView, user, onLogout }: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [hoveredTooltip, setHoveredTooltip] = React.useState<{
    text: string;
    top: number;
    left: number;
  } | null>(null);

  const asideRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('wonderlab_admin_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // Ignored
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('wonderlab_admin_sidebar_collapsed', String(next));
      } catch {
        // Ignored
      }
      return next;
    });
    setHoveredTooltip(null);
  };

  const navItems = [
    {
      id: 'dashboard' as AdminViewType,
      label: 'Tổng quan',
      icon: LayoutDashboard,
    },
    {
      id: 'simulations' as AdminViewType,
      label: 'Cài đặt Thí nghiệm',
      icon: FlaskConical,
    },
    {
      id: 'users' as AdminViewType,
      label: 'Quản lý Người dùng',
      icon: Users,
    },
    {
      id: 'comments' as AdminViewType,
      label: 'Kiểm duyệt Bình luận',
      icon: MessageSquare,
    },
    {
      id: 'settings' as AdminViewType,
      label: 'Cài đặt Nền tảng',
      icon: Settings,
    },
  ];

  const handleSelect = (view: AdminViewType) => {
    onSelectView(view);
    setIsMobileOpen(false);
    setHoveredTooltip(null);
  };

  const handleItemHover = (e: React.MouseEvent<HTMLElement>, text: string) => {
    if (!isCollapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const asideRect = asideRef.current?.getBoundingClientRect();
    const left = asideRect ? asideRect.right + 10 : rect.right + 10;
    setHoveredTooltip({
      text,
      top: rect.top + rect.height / 2,
      left,
    });
  };

  const handleItemLeave = () => {
    setHoveredTooltip(null);
  };

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
          aria-label="Toggle navigation"
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex">
          <div className="w-72 max-w-[85vw] h-full shadow-2xl bg-white flex flex-col animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="h-14 flex items-center justify-between border-b border-slate-200/80 px-4 shrink-0">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700">
                Menu Quản Trị
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
                className="h-8 w-8 p-0"
                aria-label="Đóng menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Nav */}
            <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/70'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-slate-200 space-y-3 shrink-0">
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
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside
        ref={asideRef}
        className={`hidden lg:flex flex-col shrink-0 h-full bg-white rounded-2xl border border-slate-300/85 shadow-2xs transition-[width] duration-300 ease-in-out relative ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {/* Header: Toggle Collapse/Expand Button */}
        {isCollapsed ? (
          <div className="h-14 flex items-center justify-center border-b border-slate-200/80 px-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              onMouseEnter={e => handleItemHover(e, 'Mở rộng thanh điều hướng')}
              onMouseLeave={handleItemLeave}
              className="h-10 w-10 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Mở rộng thanh điều hướng"
            >
              <PanelLeftOpen className="h-5 w-5 text-slate-600" />
            </Button>
          </div>
        ) : (
          <div className="h-14 flex items-center justify-between border-b border-slate-200/80 px-4 shrink-0">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
              Điều Hướng
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Thu gọn thanh điều hướng"
              title="Thu gọn thanh điều hướng"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Nav Items (Only this list scrolls if there are many tabs) */}
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                onMouseEnter={e => handleItemHover(e, item.label)}
                onMouseLeave={handleItemLeave}
                className={`group relative flex items-center h-11 w-full rounded-xl text-xs font-semibold transition-colors duration-150 px-2 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold border border-blue-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {/* Fixed Icon Container */}
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                </div>

                {/* Tab Title Label - Smoothly reveals when expanded */}
                <span
                  className={`ml-2 text-xs truncate whitespace-nowrap transition-all duration-300 ${
                    isCollapsed
                      ? 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                      : 'opacity-100 max-w-[160px] translate-x-0'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer: User Profile & Actions */}
        {isCollapsed ? (
          <div className="p-2 border-t border-slate-200/80 flex flex-col items-center gap-2 shrink-0">
            <div
              onMouseEnter={e => handleItemHover(e, `${user.username} (${user.role})`)}
              onMouseLeave={handleItemLeave}
              className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold font-mono shrink-0 cursor-default"
            >
              {user.username.charAt(0).toUpperCase()}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              onMouseEnter={e => handleItemHover(e, 'Đăng xuất')}
              onMouseLeave={handleItemLeave}
              className="h-9 w-9 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
              aria-label="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            <Link href="/" className="block">
              <Button
                variant="outline"
                size="sm"
                onMouseEnter={e => handleItemHover(e, 'Về Trang chủ Lab')}
                onMouseLeave={handleItemLeave}
                className="h-9 w-9 p-0 text-slate-600 hover:text-slate-900 border-slate-200 bg-white rounded-xl"
                aria-label="Về Trang chủ Lab"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="p-3 border-t border-slate-200/80 space-y-2 shrink-0">
            {/* User Card */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70">
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
        )}
      </aside>

      {/* Floating Tooltip When Collapsed */}
      {isCollapsed && hoveredTooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold shadow-lg whitespace-nowrap -translate-y-1/2 animate-in fade-in-0 zoom-in-95 duration-150 flex items-center gap-1.5 border border-slate-700/60"
          style={{
            top: hoveredTooltip.top,
            left: hoveredTooltip.left,
          }}
        >
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-700/60 rotate-45" />
          <span>{hoveredTooltip.text}</span>
        </div>
      )}
    </>
  );
}

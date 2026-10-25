'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  PanelLeft,
  Sliders,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { AppButton } from '@/components/ui';
import { BrandLogo } from '@/components/ui/brand-logo';
import { AuthUser } from '@/types';

export type AdminViewType = 'dashboard' | 'simulations' | 'users' | 'comments' | 'settings';

interface AdminSidebarProps {
  currentView?: AdminViewType;
  onSelectView?: (view: AdminViewType) => void;
  user: AuthUser;
  onLogout: () => void;
  commentCount?: number;
  userCount?: number;
}

interface NavItem {
  id: AdminViewType;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

export function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
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

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      id: 'simulations',
      label: 'Cài đặt Thí nghiệm',
      href: '/admin/simulations',
      icon: FlaskConical,
    },
    {
      id: 'users',
      label: 'Quản lý Người dùng',
      href: '/admin/users',
      icon: Users,
    },
    {
      id: 'comments',
      label: 'Kiểm duyệt Bình luận',
      href: '/admin/comments',
      icon: MessageSquare,
    },
    {
      id: 'settings',
      label: 'Cài đặt Nền tảng',
      href: '/admin/settings',
      icon: Settings,
      subItems: [
        { label: 'Cài đặt Chung', href: '/admin/settings', icon: Sliders },
        { label: 'Quyền Truy cập', href: '/admin/settings/access', icon: ShieldCheck },
        { label: 'Sao lưu & Dữ liệu', href: '/admin/settings/backup', icon: Database },
      ],
    },
  ];

  const isRouteActive = (itemHref: string) => {
    if (itemHref === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname.startsWith(itemHref);
  };

  const isSubRouteActive = (subHref: string) => {
    if (subHref === '/admin/settings') {
      return pathname === '/admin/settings';
    }
    return pathname === subHref;
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
        <AppButton
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="h-9 w-9 p-0"
          aria-label="Toggle navigation"
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </AppButton>
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
              <AppButton
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
                className="h-8 w-8 p-0"
                aria-label="Đóng menu"
              >
                <X className="h-4 w-4" />
              </AppButton>
            </div>

            {/* Mobile Nav */}
            <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = isRouteActive(item.href);

                return (
                  <div key={item.id} className="space-y-1">
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/70'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                      />
                      <span>{item.label}</span>
                    </Link>

                    {/* Mobile Sub-items */}
                    {item.subItems && isActive && (
                      <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-blue-100 ml-4">
                        {item.subItems.map(sub => {
                          const SubIcon = sub.icon;
                          const isSubActive = isSubRouteActive(sub.href);
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                isSubActive
                                  ? 'bg-blue-100/60 text-blue-800 font-bold'
                                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                              }`}
                            >
                              <SubIcon className="h-3.5 w-3.5" />
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
                <AppButton
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                  title="Đăng xuất"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </AppButton>
              </div>

              <Link href="/" className="block">
                <AppButton
                  variant="outline"
                  size="sm"
                  className="w-full text-xs text-slate-600 hover:text-slate-900 border-slate-200 bg-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  Về Trang chủ Lab
                </AppButton>
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
        <div className="h-14 p-2 flex items-center border-b border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={toggleSidebar}
            onMouseEnter={e =>
              handleItemHover(
                e,
                isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng',
              )
            }
            onMouseLeave={handleItemLeave}
            className="group relative flex items-center h-10 w-full rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150 px-2"
            aria-label={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
          >
            {/* Fixed Icon */}
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <PanelLeft className="h-4 w-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
            </div>

            {/* Label */}
            <span
              className={`ml-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 truncate whitespace-nowrap transition-all duration-300 ${
                isCollapsed
                  ? 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                  : 'opacity-100 max-w-[160px] translate-x-0'
              }`}
            >
              Thu gọn menu
            </span>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = isRouteActive(item.href);

            return (
              <div key={item.id} className="space-y-1">
                <Link
                  href={item.href}
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

                  {/* Tab Title Label */}
                  <span
                    className={`ml-2 text-xs truncate whitespace-nowrap transition-all duration-300 ${
                      isCollapsed
                        ? 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                        : 'opacity-100 max-w-[160px] translate-x-0'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>

                {/* Sub-items in expanded sidebar */}
                {item.subItems && isActive && !isCollapsed && (
                  <div className="ml-5 pl-4 py-1 space-y-1 border-l-2 border-blue-100">
                    {item.subItems.map(sub => {
                      const SubIcon = sub.icon;
                      const isSubActive = isSubRouteActive(sub.href);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                            isSubActive
                              ? 'bg-blue-100/70 text-blue-800 font-bold'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                          }`}
                        >
                          <SubIcon
                            className={`h-3.5 w-3.5 ${isSubActive ? 'text-blue-600' : 'text-slate-400'}`}
                          />
                          <span className="truncate">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer: User Profile & Actions */}
        <div className="p-2 border-t border-slate-200/80 space-y-1.5 shrink-0">
          {/* User Profile Card */}
          <div
            onMouseEnter={e => handleItemHover(e, `${user.username} (${user.role})`)}
            onMouseLeave={handleItemLeave}
            className="flex items-center h-11 w-full rounded-xl bg-slate-50 border border-slate-200/70 px-2 overflow-hidden"
          >
            <Link
              href="/admin/my-account"
              className="flex items-center min-w-0 flex-1 hover:opacity-85 transition group"
              title="Quản lý tài khoản Quản trị"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono group-hover:ring-2 group-hover:ring-blue-400">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div
                className={`ml-2 min-w-0 flex-1 transition-all duration-300 ${
                  isCollapsed
                    ? 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                    : 'opacity-100 max-w-[125px] translate-x-0'
                }`}
              >
                <div className="font-mono text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                  {user.username}
                </div>
                <div className="flex items-center gap-1 text-xs font-mono text-slate-500">
                  <Shield className="h-3 w-3 text-blue-600 shrink-0" />
                  <span className="truncate">{user.role}</span>
                </div>
              </div>
            </Link>

            <div
              className={`transition-all duration-300 ${
                isCollapsed
                  ? 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                  : 'opacity-100 translate-x-0'
              }`}
            >
              <AppButton
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                title="Đăng xuất"
              >
                <LogOut className="h-3.5 w-3.5" />
              </AppButton>
            </div>
          </div>

          {/* When collapsed: Dedicated logout icon button */}
          {isCollapsed && (
            <button
              type="button"
              onClick={onLogout}
              onMouseEnter={e => handleItemHover(e, 'Đăng xuất')}
              onMouseLeave={handleItemLeave}
              className="flex items-center h-10 w-full rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors px-2"
              aria-label="Đăng xuất"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <LogOut className="h-4 w-4" />
              </div>
            </button>
          )}

          {/* Back to site row */}
          <Link href="/" className="block">
            <button
              type="button"
              onMouseEnter={e => handleItemHover(e, 'Về Trang chủ Lab')}
              onMouseLeave={handleItemLeave}
              className="group flex items-center h-10 w-full rounded-xl text-xs text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 transition-colors px-2 overflow-hidden"
              aria-label="Về Trang chủ Lab"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <ArrowLeft className="h-4 w-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
              </div>
              <span
                className={`ml-2 text-xs truncate whitespace-nowrap transition-all duration-300 ${
                  isCollapsed
                    ? 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                    : 'opacity-100 max-w-[150px] translate-x-0'
                }`}
              >
                Về Trang chủ Lab
              </span>
            </button>
          </Link>
        </div>
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

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Lock, Loader2, AlertCircle } from 'lucide-react';
import { AdminOverviewData, fetchAdminOverview } from '@/lib/admin-api';
import { AdminSidebar, AdminViewType } from './components/admin-sidebar';
import { DashboardView } from './components/dashboard-view';
import { SimulationsView } from './components/simulations-view';
import { UsersView } from './components/users-view';
import { CommentsView } from './components/comments-view';
import { SettingsView } from './components/settings-view';

export default function AdminPortalPage() {
  const { user, login, logout, isLoading } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Active view
  const [currentView, setCurrentView] = React.useState<AdminViewType>('dashboard');

  // Overview data
  const [overview, setOverview] = React.useState<AdminOverviewData | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = React.useState<boolean>(false);

  const loadOverview = React.useCallback(async () => {
    setIsLoadingOverview(true);
    try {
      const data = await fetchAdminOverview();
      setOverview(data);
    } catch {
      // Ignored
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      loadOverview();
    }
  }, [user, loadOverview]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setLoginError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }
    setLoginError(null);
    setIsSubmitting(true);
    const result = await login(username.trim(), password);
    setIsSubmitting(false);
    if (!result.success) {
      setLoginError(result.error || 'Tên đăng nhập hoặc mật khẩu không chính xác');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-xs font-mono text-slate-500">Đang đồng bộ phiên bảo mật...</span>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: Unauthenticated -> Clean, Focused Login Console
  // =========================================================================
  if (!user) {
    return (
      <div className="h-full overflow-y-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 my-auto">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-slate-300 text-slate-700 bg-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Về Trang chủ
              </Button>
            </Link>
            <span className="text-xs font-mono text-slate-500">Wonderlab Portal / Auth</span>
          </div>

          <Card className="border-slate-300/85 bg-white shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50/70 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Lock className="h-3 w-3" />
                XÁC THỰC QUẢN TRỊ
              </div>
              <h1 className="font-heading text-xl font-bold text-slate-900">
                Đăng nhập Admin Console
              </h1>
              <p className="text-xs text-slate-500 font-sans">
                Khu vực dành cho quản trị viên vận hành hệ thống Wonderlab.
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4">
              {loginError && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="admin-username"
                  className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700"
                >
                  Tên đăng nhập
                </label>
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-sans"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="admin-password"
                  className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700"
                >
                  Mật khẩu
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-sans"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 mt-2 shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang xác thực...
                  </>
                ) : (
                  'Đăng nhập vào Hệ thống'
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: Authenticated -> Professional Sidebar Admin Portal
  // =========================================================================
  return (
    <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 h-full flex flex-col lg:flex-row gap-5 overflow-hidden">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        user={user}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full overflow-y-auto min-w-0 pr-1 pb-6">
        {currentView === 'dashboard' && (
          <DashboardView
            overview={overview}
            isLoading={isLoadingOverview}
            onRefresh={loadOverview}
            onNavigateTo={setCurrentView}
          />
        )}

        {currentView === 'simulations' && (
          <SimulationsView simulationStats={overview?.bySimulation} />
        )}

        {currentView === 'users' && <UsersView currentAdminUsername={user.username} />}

        {currentView === 'comments' && <CommentsView />}

        {currentView === 'settings' && <SettingsView overview={overview} />}
      </main>
    </div>
  );
}

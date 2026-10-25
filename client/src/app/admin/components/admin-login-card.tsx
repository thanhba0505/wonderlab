'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Lock, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

export function AdminLoginCard() {
  const { user, login, logout } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  // Case 1: Authenticated but not an ADMIN
  if (user && user.role !== 'ADMIN') {
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
            <div className="p-6 border-b border-slate-200 bg-rose-50/50 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <ShieldAlert className="h-3 w-3" />
                TRUY CẬP BỊ TỪ CHỐI
              </div>
              <h1 className="font-heading text-xl font-bold text-slate-900">
                Không đủ quyền quản trị
              </h1>
              <p className="text-xs text-slate-500 font-sans">
                Tài khoản hiện tại không có quyền truy cập vào Wonderlab Admin Console.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono">Tài khoản hiện tại:</span>
                  <span className="font-mono font-bold text-slate-900">{user.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono">Vai trò tài khoản:</span>
                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {user.role}
                  </span>
                </div>
                <div className="pt-2 text-xs text-slate-600 border-t border-slate-200">
                  Vui lòng đăng xuất và đăng nhập lại bằng tài khoản được cấp quyền Quản trị viên
                  (ADMIN) để tiếp tục.
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="w-full text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
                >
                  Đăng xuất tài khoản này
                </Button>
                <Link href="/" className="w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-slate-600 hover:text-slate-900"
                  >
                    Quay lại Trang chủ Lab
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Case 2: Not authenticated
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

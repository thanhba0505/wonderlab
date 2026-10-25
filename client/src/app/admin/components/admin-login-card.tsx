'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { AppButton, AppInput, AppTag, Card } from '@/components/ui';
import { ArrowLeft, Lock, AlertCircle, ShieldAlert } from 'lucide-react';

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
      <div className="h-full overflow-y-auto px-4 py-12 flex items-center justify-center font-sans">
        <div className="w-full max-w-md space-y-6 my-auto">
          <div className="flex items-center justify-between">
            <Link href="/">
              <AppButton
                variant="outline"
                size="sm"
                className="gap-2 border-slate-300 text-slate-700 bg-white"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Về Trang chủ
              </AppButton>
            </Link>
            <span className="text-xs font-mono text-slate-500">Wonderlab Portal / Auth</span>
          </div>

          <Card className="border-slate-300/85 bg-white shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-rose-50/50 space-y-1">
              <div className="mb-2">
                <AppTag variant="red" size="md" icon={<ShieldAlert className="h-3 w-3 mr-1" />}>
                  TRUY CẬP BỊ TỪ CHỐI
                </AppTag>
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
                  <AppTag variant="amber" size="sm">
                    {user.role}
                  </AppTag>
                </div>
                <div className="pt-2 text-xs text-slate-600 border-t border-slate-200">
                  Vui lòng đăng xuất và đăng nhập lại bằng tài khoản được cấp quyền Quản trị viên
                  (ADMIN) để tiếp tục.
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <AppButton
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={() => logout()}
                  className="font-semibold"
                >
                  Đăng xuất tài khoản này
                </AppButton>
                <Link href="/" className="w-full">
                  <AppButton
                    variant="ghost"
                    size="sm"
                    fullWidth
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    Quay lại Trang chủ Lab
                  </AppButton>
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
    <div className="h-full overflow-y-auto px-4 py-12 flex items-center justify-center font-sans">
      <div className="w-full max-w-md space-y-6 my-auto">
        <div className="flex items-center justify-between">
          <Link href="/">
            <AppButton
              variant="outline"
              size="sm"
              className="gap-2 border-slate-300 text-slate-700 bg-white"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Về Trang chủ
            </AppButton>
          </Link>
          <span className="text-xs font-mono text-slate-500">Wonderlab Portal / Auth</span>
        </div>

        <Card className="border-slate-300/85 bg-white shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/70 space-y-1">
            <div className="mb-2">
              <AppTag variant="blue" size="md" icon={<Lock className="h-3 w-3 mr-1" />}>
                XÁC THỰC QUẢN TRỊ
              </AppTag>
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

            <AppInput
              id="admin-username"
              type="text"
              label="TÊN ĐĂNG NHẬP"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
              disabled={isSubmitting}
            />

            <AppInput
              id="admin-password"
              type="password"
              label="MẬT KHẨU"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            <div className="pt-2">
              <AppButton
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isSubmitting}
                loadingText="Đang xác thực..."
                className="py-2.5"
              >
                Đăng nhập vào Hệ thống
              </AppButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

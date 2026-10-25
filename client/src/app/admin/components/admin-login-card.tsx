'use client';

import * as React from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import {
  AppButton,
  AppForm,
  AppFormField,
  AppFormSubmit,
  AppTag,
  type AppFormHelpers,
} from '@/components/ui';

export function AdminLoginCard() {
  const { user, login, logout } = useAuth();

  const handleLogin = async (
    values: Record<string, unknown>,
    helpers: AppFormHelpers<Record<string, unknown>>,
  ) => {
    const valUser = String(values.username || '').trim();
    const valPass = String(values.password || '');
    const result = await login(valUser, valPass);
    if (!result.success) {
      if (result.errors) {
        helpers.setErrors(result.errors);
      } else {
        helpers.setFieldError(
          'password',
          result.error || 'Tên đăng nhập hoặc mật khẩu không chính xác',
        );
      }
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
                className="gap-2 border-slate-300 text-slate-700 bg-white cursor-pointer"
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
                  className="font-semibold cursor-pointer"
                >
                  Đăng xuất tài khoản này
                </AppButton>
                <Link href="/" className="w-full">
                  <AppButton
                    variant="ghost"
                    size="sm"
                    fullWidth
                    className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
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

  // Case 2: Guest / Unauthenticated -> Show Admin Login Form
  return (
    <div className="h-full overflow-y-auto px-4 py-12 flex items-center justify-center font-sans">
      <div className="w-full max-w-md space-y-6 my-auto">
        <div className="flex items-center justify-between">
          <Link href="/">
            <AppButton
              variant="outline"
              size="sm"
              className="gap-2 border-slate-300 text-slate-700 bg-white cursor-pointer"
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

          <AppForm
            initialValues={{ username: '', password: '' }}
            onSubmit={handleLogin}
            className="p-6 space-y-4"
          >
            <AppFormField
              name="username"
              label="TÊN ĐĂNG NHẬP"
              required="Vui lòng nhập tên đăng nhập"
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
            />

            <AppFormField
              name="password"
              type="password"
              showPasswordToggle
              label="MẬT KHẨU"
              required="Vui lòng nhập mật khẩu"
              placeholder="••••••••••••"
              autoComplete="current-password"
            />

            <div className="pt-2">
              <AppFormSubmit
                variant="primary"
                fullWidth
                loadingText="Đang xác thực..."
                className="py-2.5"
              >
                Đăng nhập vào Hệ thống
              </AppFormSubmit>
            </div>
          </AppForm>
        </Card>
      </div>
    </div>
  );
}

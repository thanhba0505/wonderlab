'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Shield,
  KeyRound,
  CheckCircle2,
  Lock,
  Mail,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  AppButton,
  AppForm,
  AppFormField,
  AppFormSubmit,
  AppTag,
  type AppFormHelpers,
} from '@/components/ui';

export default function AdminMyAccountPage() {
  const { user, changePassword, setPassword } = useAuth();
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  if (!user) return null;

  const handleChangePasswordSubmit = async (
    values: Record<string, unknown>,
    helpers: AppFormHelpers<Record<string, unknown>>,
  ) => {
    setSuccessMessage(null);
    const currPass = String(values.currentPassword || '');
    const newPass = String(values.newPassword || '');
    const confPass = String(values.confirmPassword || '');

    if (newPass !== confPass) {
      helpers.setFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPass.length < 8) {
      helpers.setFieldError('newPassword', 'Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    const result = await changePassword(currPass, newPass);

    if (result.success) {
      setSuccessMessage('Đổi mật khẩu tài khoản quản trị thành công!');
      helpers.resetForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      if (result.errors) {
        helpers.setErrors(result.errors);
      } else {
        helpers.setFieldError('currentPassword', result.error || 'Đổi mật khẩu thất bại.');
      }
    }
  };

  const handleSetPasswordSubmit = async (
    values: Record<string, unknown>,
    helpers: AppFormHelpers<Record<string, unknown>>,
  ) => {
    setSuccessMessage(null);
    const newPass = String(values.newPassword || '');
    const confPass = String(values.confirmPassword || '');

    if (newPass !== confPass) {
      helpers.setFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPass.length < 8) {
      helpers.setFieldError('newPassword', 'Mật khẩu phải có tối thiểu 8 ký tự.');
      return;
    }

    const result = await setPassword(newPass);

    if (result.success) {
      setSuccessMessage('Thiết lập mật khẩu quản trị thành công!');
      helpers.resetForm({ newPassword: '', confirmPassword: '' });
    } else {
      if (result.errors) {
        helpers.setErrors(result.errors);
      } else {
        helpers.setFieldError('newPassword', result.error || 'Thiết lập mật khẩu thất bại.');
      }
    }
  };

  const hasExistingPassword = user.hasPassword !== false;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header with return button */}
      <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Admin Console
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Tài khoản Quản trị</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-slate-900">
              Hồ sơ & Bảo mật Quản trị
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Quản lý định danh tài khoản vận hành hệ thống Wonderlab.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <AppButton
                variant="outline"
                size="sm"
                leftIcon={<LayoutDashboard className="h-3.5 w-3.5" />}
                className="text-xs"
              >
                Về Console
              </AppButton>
            </Link>
            <Link href="/">
              <AppButton
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
                className="text-xs"
              >
                Về Trang chủ
              </AppButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <Shield className="h-4 w-4 text-amber-600" />
          <h2 className="font-heading text-sm font-bold text-slate-900">
            Thông tin Tài khoản Quản trị
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="text-xs font-mono text-slate-500 block uppercase">Tên đăng nhập</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-bold text-slate-900">{user.username}</span>
              <AppTag variant="amber" size="sm">
                ADMIN
              </AppTag>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="text-xs font-mono text-slate-500 block uppercase">Địa chỉ Email</span>
            <div className="flex items-center gap-1.5 mt-1 text-sm font-mono text-slate-800">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{user.email || 'Chưa cung cấp email'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between p-3">
            <span className="text-slate-600 font-medium">Quyền hạn hệ thống</span>
            <span className="font-mono font-semibold text-amber-700">Toàn quyền Quản trị</span>
          </div>
          <div className="flex items-center justify-between p-3">
            <span className="text-slate-600 font-medium">Trạng thái bảo mật</span>
            <div className="font-mono">
              {hasExistingPassword ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Đã thiết lập mật khẩu
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">Chưa thiết lập mật khẩu</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Password Change Form */}
      <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <KeyRound className="h-4 w-4 text-blue-600" />
          <h2 className="font-heading text-sm font-bold text-slate-900">
            {hasExistingPassword ? 'Đổi Mật khẩu Quản trị' : 'Thiết lập Mật khẩu'}
          </h2>
        </div>

        {successMessage && (
          <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="font-medium leading-relaxed">{successMessage}</div>
          </div>
        )}

        <AppForm
          initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
          onSubmit={hasExistingPassword ? handleChangePasswordSubmit : handleSetPasswordSubmit}
          className="space-y-4 max-w-md"
        >
          {hasExistingPassword && (
            <AppFormField
              name="currentPassword"
              label="Mật khẩu hiện tại"
              type="password"
              showPasswordToggle
              placeholder="Nhập mật khẩu hiện tại"
              required="Vui lòng nhập mật khẩu hiện tại"
            />
          )}

          <AppFormField
            name="newPassword"
            label="Mật khẩu mới"
            type="password"
            showPasswordToggle
            placeholder="Tối thiểu 8 ký tự"
            required="Vui lòng nhập mật khẩu mới"
            rules={[{ minLength: 8, message: 'Mật khẩu mới phải có tối thiểu 8 ký tự' }]}
          />

          <AppFormField
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            type="password"
            showPasswordToggle
            placeholder="Nhập lại mật khẩu mới"
            required="Vui lòng xác nhận mật khẩu mới"
          />

          <div className="pt-2">
            <AppFormSubmit
              variant="primary"
              size="sm"
              leftIcon={<Lock className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              Cập nhật mật khẩu quản trị
            </AppFormSubmit>
          </div>
        </AppForm>
      </div>
    </div>
  );
}

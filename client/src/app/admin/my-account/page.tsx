'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AppButton, AppInput, AppTag } from '@/components/ui';

export default function AdminMyAccountPage() {
  const { user, changePassword, setPassword } = useAuth();

  const [currentPassword, setCurrentPassword] = React.useState<string>('');
  const [newPassword, setNewPassword] = React.useState<string>('');
  const [confirmPassword, setConfirmPassword] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  if (!user) return null;

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    setIsSubmitting(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Đổi mật khẩu tài khoản quản trị thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrorMessage(result.error || 'Đổi mật khẩu thất bại.');
    }
  };

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Mật khẩu phải có tối thiểu 8 ký tự.');
      return;
    }

    setIsSubmitting(true);
    const result = await setPassword(newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Thiết lập mật khẩu quản trị thành công!');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrorMessage(result.error || 'Thiết lập mật khẩu thất bại.');
    }
  };

  const hasExistingPassword = user.hasPassword !== false;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">
              Admin Console
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Tài khoản Quản trị</span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Thông tin Tài khoản Quản trị
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Quản lý thông tin định danh và bảo mật cho tài khoản cấp quyền cao nhất.
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
              Về Dashboard
            </AppButton>
          </Link>
          <Link href="/">
            <AppButton
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              Về Trang chủ Lab
            </AppButton>
          </Link>
        </div>
      </div>

      {/* Admin Identity Card */}
      <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-600" />
            <h2 className="font-heading text-sm font-bold text-slate-900">
              Định danh Quản trị viên
            </h2>
          </div>
          <AppTag variant="amber" size="sm" className="font-mono text-xs uppercase font-bold">
            Full Privileges
          </AppTag>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="text-xs font-mono text-slate-500 block uppercase">
              Tên tài khoản (Username)
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-bold text-slate-900">{user.username}</span>
              <AppTag variant="amber" size="sm">
                ADMIN
              </AppTag>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="text-xs font-mono text-slate-500 block uppercase">Email liên hệ</span>
            <div className="flex items-center gap-1.5 mt-1 text-sm font-mono text-slate-800">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{user.email || 'Chưa thiết lập email riêng'}</span>
            </div>
          </div>
        </div>

        {/* Security Checklist */}
        <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between p-3">
            <span className="text-slate-600 font-medium">Quyền hạn truy cập</span>
            <span className="text-amber-800 font-mono font-bold">Toàn quyền hệ thống</span>
          </div>

          <div className="flex items-center justify-between p-3">
            <span className="text-slate-600 font-medium">Phiên bảo mật HttpOnly</span>
            <div className="flex items-center gap-1 text-emerald-700 font-mono font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Đang bảo vệ
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

        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="font-medium leading-relaxed">{successMessage}</div>
          </div>
        )}

        <form
          onSubmit={hasExistingPassword ? handleChangePasswordSubmit : handleSetPasswordSubmit}
          className="space-y-4 max-w-md"
        >
          {hasExistingPassword && (
            <AppInput
              label="Mật khẩu hiện tại"
              type="password"
              showPasswordToggle
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              required
            />
          )}

          <AppInput
            label="Mật khẩu mới"
            type="password"
            showPasswordToggle
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Tối thiểu 8 ký tự"
            required
          />

          <AppInput
            label="Xác nhận mật khẩu mới"
            type="password"
            showPasswordToggle
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            required
          />

          <div className="pt-2">
            <AppButton
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Lock className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              Cập nhật mật khẩu quản trị
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
}

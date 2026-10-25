'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AppButton, AppInput, AppTag } from '@/components/ui';

export default function MyAccountProfilePage() {
  const { user, changePassword, setPassword } = useAuth();

  const [currentPassword, setCurrentPassword] = React.useState<string>('');
  const [newPassword, setNewPassword] = React.useState<string>('');
  const [confirmPassword, setConfirmPassword] = React.useState<string>('');
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
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
      setSuccessMessage('Đổi mật khẩu thành công!');
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
      setSuccessMessage('Thiết lập mật khẩu thành công!');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrorMessage(result.error || 'Thiết lập mật khẩu thất bại.');
    }
  };

  const hasExistingPassword = user.hasPassword !== false;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Wonderlab
          </Link>
          <span>/</span>
          <Link href="/my-account" className="hover:text-blue-600 transition-colors">
            Console
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Hồ sơ & Bảo mật</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Quản lý Hồ sơ & Bảo mật
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Kiểm tra thông tin định danh và cập nhật phương thức xác thực của bạn.
            </p>
          </div>

          <Link href="/my-account">
            <AppButton
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              Về Tổng quan
            </AppButton>
          </Link>
        </div>
      </div>

      {/* Account Info Box */}
      <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <User className="h-4 w-4 text-blue-600" />
          <h2 className="font-heading text-base font-bold text-slate-900">Thông tin Tài khoản</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="text-xs font-mono text-slate-500 block uppercase">Tên đăng nhập</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-bold text-slate-900">{user.username}</span>
              <AppTag variant={user.role === 'ADMIN' ? 'amber' : 'blue'} size="sm">
                {user.role}
              </AppTag>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="text-xs font-mono text-slate-500 block uppercase">Địa chỉ Email</span>
            <div className="flex items-center gap-1.5 mt-1 text-sm font-mono text-slate-800">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{user.email || 'Chưa cung cấp email'}</span>
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between p-3">
            <span className="text-slate-600 font-medium">Đăng nhập bằng Google</span>
            <div className="font-mono">
              {user.isGoogleLinked ? (
                <span className="text-blue-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Đã liên kết
                </span>
              ) : (
                <span className="text-slate-400">Chưa liên kết</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3">
            <span className="text-slate-600 font-medium">Trạng thái Mật khẩu</span>
            <div className="font-mono">
              {hasExistingPassword ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Đã thiết lập
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">Chưa có (Dùng Google OAuth)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Management Form */}
      <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <KeyRound className="h-4 w-4 text-blue-600" />
          <h2 className="font-heading text-base font-bold text-slate-900">
            {hasExistingPassword ? 'Thay đổi Mật khẩu' : 'Thiết lập Mật khẩu Mới'}
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <AppInput
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              {hasExistingPassword ? 'Mật khẩu mới' : 'Mật khẩu muốn đặt'}
            </label>
            <div className="relative">
              <AppInput
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                required
              />
              {!hasExistingPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Xác nhận mật khẩu mới
            </label>
            <AppInput
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          <div className="pt-2">
            <AppButton
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Lock className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              {hasExistingPassword ? 'Lưu mật khẩu mới' : 'Thiết lập mật khẩu'}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
}

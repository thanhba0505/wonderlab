'use client';

import * as React from 'react';
import Link from 'next/link';
import { User, Mail, KeyRound, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  AppButton,
  AppForm,
  AppFormField,
  AppFormSubmit,
  AppTag,
  type AppFormHelpers,
} from '@/components/ui';
import { useTranslation } from '@/i18n';

export default function MyAccountProfilePage() {
  const { user, changePassword, setPassword } = useAuth();
  const { locale, dict } = useTranslation();
  const isEn = locale === 'en';
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
      helpers.setFieldError(
        'confirmPassword',
        isEn ? 'Password confirmation does not match.' : 'Mật khẩu xác nhận không khớp.',
      );
      return;
    }

    if (newPass.length < 8) {
      helpers.setFieldError(
        'newPassword',
        isEn
          ? 'New password must have at least 8 characters.'
          : 'Mật khẩu mới phải có tối thiểu 8 ký tự.',
      );
      return;
    }

    const result = await changePassword(currPass, newPass);

    if (result.success) {
      setSuccessMessage(isEn ? 'Password changed successfully!' : 'Đổi mật khẩu thành công!');
      helpers.resetForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      if (result.errors) {
        helpers.setErrors(result.errors);
      } else {
        helpers.setFieldError(
          'currentPassword',
          result.error || (isEn ? 'Failed to change password.' : 'Đổi mật khẩu thất bại.'),
        );
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
      helpers.setFieldError(
        'confirmPassword',
        isEn ? 'Password confirmation does not match.' : 'Mật khẩu xác nhận không khớp.',
      );
      return;
    }

    if (newPass.length < 8) {
      helpers.setFieldError(
        'newPassword',
        isEn
          ? 'New password must have at least 8 characters.'
          : 'Mật khẩu mới phải có tối thiểu 8 ký tự.',
      );
      return;
    }

    const result = await setPassword(newPass);

    if (result.success) {
      setSuccessMessage(isEn ? 'Password set successfully!' : 'Thiết lập mật khẩu thành công!');
      helpers.resetForm({ newPassword: '', confirmPassword: '' });
    } else {
      if (result.errors) {
        helpers.setErrors(result.errors);
      } else {
        helpers.setFieldError(
          'newPassword',
          result.error || (isEn ? 'Failed to set password.' : 'Thiết lập mật khẩu thất bại.'),
        );
      }
    }
  };

  const hasExistingPassword = user.hasPassword !== false;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            {dict.essays.home_link}
          </Link>
          <span>/</span>
          <Link href="/my-account" className="hover:text-blue-600 transition-colors">
            {dict.account.overview_title}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{dict.account.profile_btn}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-slate-900">
              {isEn ? 'Personal Profile & Security' : 'Hồ sơ Cá nhân'}
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              {isEn
                ? 'Manage your identity information and account security credentials.'
                : 'Quản lý thông tin định danh và bảo mật tài khoản cá nhân.'}
            </p>
          </div>
          <Link href="/my-account">
            <AppButton
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              {isEn ? 'Back to Overview' : 'Về Tổng quan'}
            </AppButton>
          </Link>
        </div>
      </div>

      {/* Account Info Box */}
      <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <User className="h-4 w-4 text-blue-600" />
          <h2 className="font-heading text-base font-bold text-slate-900">
            {isEn ? 'Account Information' : 'Thông tin Tài khoản'}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="text-xs font-mono text-slate-500 block uppercase">
              {dict.auth.username_label}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-bold text-slate-900">{user.username}</span>
              <AppTag variant={user.role === 'ADMIN' ? 'amber' : 'blue'} size="sm">
                {user.role}
              </AppTag>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
            <span className="text-xs font-mono text-slate-500 block uppercase">
              {dict.auth.email_label}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-sm font-mono text-slate-800">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{user.email || (isEn ? 'No email provided' : 'Chưa cung cấp email')}</span>
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between p-3">
            <span className="text-slate-600 font-medium">
              {isEn ? 'Google Sign-in Link' : 'Đăng nhập bằng Google'}
            </span>
            <div className="font-mono">
              {user.isGoogleLinked ? (
                <span className="text-blue-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />{' '}
                  {isEn ? 'Linked' : 'Đã liên kết'}
                </span>
              ) : (
                <span className="text-slate-400">{isEn ? 'Not linked' : 'Chưa liên kết'}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3">
            <span className="text-slate-600 font-medium">
              {isEn ? 'Password Credential' : 'Trạng thái Mật khẩu'}
            </span>
            <div className="font-mono">
              {hasExistingPassword ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />{' '}
                  {isEn ? 'Configured' : 'Đã thiết lập'}
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">
                  {isEn ? 'None (Google OAuth only)' : 'Chưa có (Dùng Google OAuth)'}
                </span>
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
            {hasExistingPassword
              ? isEn
                ? 'Change Account Password'
                : 'Thay đổi Mật khẩu'
              : isEn
                ? 'Set New Password'
                : 'Thiết lập Mật khẩu Mới'}
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
              label={dict.auth.current_password_label}
              type="password"
              showPasswordToggle
              placeholder={isEn ? 'Enter current password' : 'Nhập mật khẩu hiện tại'}
              required={isEn ? 'Current password is required' : 'Vui lòng nhập mật khẩu hiện tại'}
            />
          )}

          <AppFormField
            name="newPassword"
            label={dict.auth.new_password_label}
            type="password"
            showPasswordToggle
            placeholder={isEn ? 'At least 8 characters' : 'Tối thiểu 8 ký tự'}
            required={isEn ? 'New password is required' : 'Vui lòng nhập mật khẩu mới'}
            rules={[
              {
                minLength: 8,
                message: isEn
                  ? 'Password must have at least 8 characters'
                  : 'Mật khẩu phải có tối thiểu 8 ký tự',
              },
            ]}
          />

          <AppFormField
            name="confirmPassword"
            label={dict.auth.confirm_password_label}
            type="password"
            showPasswordToggle
            placeholder={isEn ? 'Re-enter new password' : 'Nhập lại mật khẩu mới'}
            required={isEn ? 'Please confirm your new password' : 'Vui lòng xác nhận mật khẩu mới'}
          />

          <div className="pt-2">
            <AppFormSubmit
              variant="primary"
              size="sm"
              leftIcon={<Lock className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              {hasExistingPassword
                ? isEn
                  ? 'Save New Password'
                  : 'Lưu mật khẩu mới'
                : isEn
                  ? 'Set Password'
                  : 'Thiết lập mật khẩu'}
            </AppFormSubmit>
          </div>
        </AppForm>
      </div>
    </div>
  );
}

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
  const { dict } = useTranslation();
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
      helpers.setFieldError('confirmPassword', dict.profile.passwords_mismatch);
      return;
    }

    if (newPass.length < 8) {
      helpers.setFieldError('newPassword', dict.profile.password_min_length);
      return;
    }

    const result = await changePassword(currPass, newPass);

    if (result.success) {
      setSuccessMessage(dict.profile.password_changed_success);
      helpers.resetForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      if (result.errors) {
        helpers.setErrors(result.errors);
      } else {
        helpers.setFieldError(
          'currentPassword',
          result.error || dict.profile.password_change_failed,
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
      helpers.setFieldError('confirmPassword', dict.profile.passwords_mismatch);
      return;
    }

    if (newPass.length < 8) {
      helpers.setFieldError('newPassword', dict.profile.password_min_length);
      return;
    }

    const result = await setPassword(newPass);

    if (result.success) {
      setSuccessMessage(dict.profile.password_set_success);
      helpers.resetForm({ newPassword: '', confirmPassword: '' });
    } else {
      if (result.errors) {
        helpers.setErrors(result.errors);
      } else {
        helpers.setFieldError('newPassword', result.error || dict.profile.password_set_failed);
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
            <h1 className="font-heading text-xl font-bold text-slate-900">{dict.profile.title}</h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">{dict.profile.subtitle}</p>
          </div>
          <Link href="/my-account">
            <AppButton
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              {dict.profile.back_to_overview}
            </AppButton>
          </Link>
        </div>
      </div>

      {/* Account Info Box */}
      <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <User className="h-4 w-4 text-blue-600" />
          <h2 className="font-heading text-base font-bold text-slate-900">
            {dict.profile.account_info}
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
              <span>{user.email || dict.profile.no_email}</span>
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between p-3">
            <span className="text-slate-600 font-medium">{dict.profile.google_signin}</span>
            <div className="font-mono">
              {user.isGoogleLinked ? (
                <span className="text-blue-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />{' '}
                  {dict.profile.google_linked}
                </span>
              ) : (
                <span className="text-slate-400">{dict.profile.google_not_linked}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3">
            <span className="text-slate-600 font-medium">{dict.profile.password_status}</span>
            <div className="font-mono">
              {hasExistingPassword ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />{' '}
                  {dict.profile.password_configured}
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">{dict.profile.password_none}</span>
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
              ? dict.profile.change_password_title
              : dict.profile.set_password_title}
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
              placeholder={dict.profile.curr_pass_placeholder}
              required={dict.profile.curr_pass_required}
            />
          )}

          <AppFormField
            name="newPassword"
            label={dict.auth.new_password_label}
            type="password"
            showPasswordToggle
            placeholder={dict.profile.new_pass_placeholder}
            required={dict.profile.new_pass_required}
            rules={[
              {
                minLength: 8,
                message: dict.profile.password_min_length,
              },
            ]}
          />

          <AppFormField
            name="confirmPassword"
            label={dict.auth.confirm_password_label}
            type="password"
            showPasswordToggle
            placeholder={dict.profile.conf_pass_placeholder}
            required={dict.profile.conf_pass_required}
          />

          <div className="pt-2">
            <AppFormSubmit
              variant="primary"
              size="sm"
              leftIcon={<Lock className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              {hasExistingPassword ? dict.profile.submit_change : dict.profile.submit_set}
            </AppFormSubmit>
          </div>
        </AppForm>
      </div>
    </div>
  );
}

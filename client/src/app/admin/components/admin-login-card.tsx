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
import { useTranslation } from '@/i18n';

export function AdminLoginCard() {
  const { user, login, logout } = useAuth();
  const { dict } = useTranslation();

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
        helpers.setFieldError('password', result.error || dict.auth.login_failed_credential);
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
                {dict.admin_nav.return_to_app}
              </AppButton>
            </Link>
            <span className="text-xs font-mono text-slate-500">Wonderlab Portal / Auth</span>
          </div>

          <Card className="border-slate-300/85 bg-white shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-rose-50/50 space-y-1">
              <div className="mb-2">
                <AppTag variant="red" size="md" icon={<ShieldAlert className="h-3 w-3 mr-1" />}>
                  {dict.admin_nav.access_denied_badge}
                </AppTag>
              </div>
              <h1 className="font-heading text-xl font-bold text-slate-900">
                {dict.admin_nav.access_denied_title}
              </h1>
              <p className="text-xs text-slate-500 font-sans">
                {dict.admin_nav.access_denied_desc}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono">
                    {dict.admin_nav.current_account_label}
                  </span>
                  <span className="font-mono font-bold text-slate-900">{user.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono">
                    {dict.admin_nav.account_role_label}
                  </span>
                  <AppTag variant="amber" size="sm">
                    {user.role}
                  </AppTag>
                </div>
                <div className="pt-2 text-xs text-slate-600 border-t border-slate-200">
                  {dict.admin_nav.access_denied_relogin_instruction}
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
                  {dict.admin_nav.logout_this_account_btn}
                </AppButton>
                <Link href="/" className="w-full">
                  <AppButton
                    variant="ghost"
                    size="sm"
                    fullWidth
                    className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {dict.admin_nav.return_to_app}
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
              {dict.admin_nav.return_to_app}
            </AppButton>
          </Link>
          <span className="text-xs font-mono text-slate-500">Wonderlab Portal / Auth</span>
        </div>

        <Card className="border-slate-300/85 bg-white shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/70 space-y-1">
            <div className="mb-2">
              <AppTag variant="blue" size="md" icon={<Lock className="h-3 w-3 mr-1" />}>
                {dict.admin_nav.admin_auth_badge}
              </AppTag>
            </div>
            <h1 className="font-heading text-xl font-bold text-slate-900">
              {dict.admin_nav.admin_login_title}
            </h1>
            <p className="text-xs text-slate-500 font-sans">{dict.admin_nav.admin_login_desc}</p>
          </div>

          <AppForm
            initialValues={{ username: '', password: '' }}
            onSubmit={handleLogin}
            className="p-6 space-y-4"
          >
            <AppFormField
              name="username"
              label={dict.admin_nav.admin_username_label}
              required={dict.auth.register_username_required}
              placeholder={dict.auth.username_placeholder}
              autoComplete="username"
            />

            <AppFormField
              name="password"
              type="password"
              showPasswordToggle
              label={dict.admin_nav.admin_password_label}
              required={dict.auth.password_required}
              placeholder={dict.auth.password_placeholder}
              autoComplete="current-password"
            />

            <div className="pt-2">
              <AppFormSubmit
                variant="primary"
                fullWidth
                loadingText={dict.admin_nav.admin_login_authenticating}
                className="py-2.5"
              >
                {dict.admin_nav.admin_login_submit}
              </AppFormSubmit>
            </div>
          </AppForm>
        </Card>
      </div>
    </div>
  );
}

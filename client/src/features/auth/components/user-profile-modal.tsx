'use client';

import * as React from 'react';
import { X, User, Mail, KeyRound, LogOut, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import { AppForm, AppFormField, AppFormSubmit, type AppFormHelpers } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/i18n';

export function UserProfileModal() {
  const { user, isProfileModalOpen, closeProfileModal, changePassword, setPassword, logout } =
    useAuth();
  const { dict } = useTranslation();

  const [activeTab, setActiveTab] = React.useState<'overview' | 'security'>('overview');
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSuccessMessage(null);
  }, [isProfileModalOpen, activeTab]);

  if (!isProfileModalOpen || !user) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white border border-slate-300/85 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/90 px-6 py-4 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <BrandLogo variant="badge" className="h-7 w-7 rounded-lg shadow-2xs" />
            <span className="font-heading text-base font-bold text-slate-900">
              {dict.profile.researcher_profile}
            </span>
          </div>

          <button
            onClick={closeProfileModal}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            aria-label={dict.auth.close_modal}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/30">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition -mb-px flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            {dict.profile.account_info}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition -mb-px flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            {dict.profile.security_tab}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-mono text-xl font-bold shadow-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-base font-bold text-slate-900 truncate">
                      {user.username}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-xs font-mono font-bold ${
                        user.role === 'ADMIN'
                          ? 'border-amber-300 bg-amber-50 text-amber-800'
                          : 'border-blue-200 bg-blue-50 text-blue-700'
                      }`}
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{user.email || dict.profile.no_email}</span>
                  </div>
                </div>
              </div>

              {/* Status List */}
              <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 text-xs">
                <div className="flex items-center justify-between p-3">
                  <span className="text-slate-600 font-medium">
                    {dict.profile.email_verified_status}
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold font-mono">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {dict.profile.activated}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3">
                  <span className="text-slate-600 font-medium">{dict.profile.google_signin}</span>
                  <div className="flex items-center gap-1.5 font-mono">
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
                    {user.hasPassword ? (
                      <span className="text-emerald-700 font-semibold">
                        {dict.profile.password_configured}
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold">
                        {dict.profile.password_none}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await logout();
                    closeProfileModal();
                  }}
                  className="w-full text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-rose-600 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  {dict.profile.logout_btn}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              {user.hasPassword === false ? (
                /* Google account without password: SET PASSWORD */
                <AppForm
                  initialValues={{ newPassword: '', confirmPassword: '' }}
                  onSubmit={handleSetPasswordSubmit}
                  className="space-y-4"
                >
                  <div className="rounded-lg bg-blue-50/80 border border-blue-200 p-3 text-xs text-blue-900 leading-relaxed">
                    {dict.profile.set_password_google_notice}
                  </div>

                  <AppFormField
                    name="newPassword"
                    label={dict.profile.new_pass_label}
                    type="password"
                    showPasswordToggle
                    leftIcon={<Lock className="h-4 w-4" />}
                    required={dict.profile.new_pass_required}
                    placeholder={dict.profile.new_pass_placeholder}
                    rules={[{ minLength: 8, message: dict.profile.password_min_length }]}
                  />

                  <AppFormField
                    name="confirmPassword"
                    label={dict.profile.conf_pass_label}
                    type="password"
                    showPasswordToggle
                    leftIcon={<KeyRound className="h-4 w-4" />}
                    required={dict.profile.conf_pass_required}
                    placeholder={dict.profile.conf_pass_placeholder}
                  />

                  <AppFormSubmit className="w-full font-semibold shadow-xs">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {dict.profile.set_password_btn}
                  </AppFormSubmit>
                </AppForm>
              ) : (
                /* Regular account: CHANGE PASSWORD */
                <AppForm
                  initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
                  onSubmit={handleChangePasswordSubmit}
                  className="space-y-4"
                >
                  <AppFormField
                    name="currentPassword"
                    label={dict.profile.curr_pass_label}
                    type="password"
                    showPasswordToggle
                    leftIcon={<Lock className="h-4 w-4" />}
                    required={dict.profile.curr_pass_required}
                    placeholder={dict.profile.curr_pass_placeholder}
                  />

                  <AppFormField
                    name="newPassword"
                    label={dict.profile.new_pass_label}
                    type="password"
                    showPasswordToggle
                    leftIcon={<KeyRound className="h-4 w-4" />}
                    required={dict.profile.new_pass_required}
                    placeholder={dict.profile.new_pass_placeholder}
                    rules={[{ minLength: 8, message: dict.profile.password_min_length }]}
                  />

                  <AppFormField
                    name="confirmPassword"
                    label={dict.profile.conf_pass_label}
                    type="password"
                    showPasswordToggle
                    leftIcon={<KeyRound className="h-4 w-4" />}
                    required={dict.profile.conf_pass_required}
                    placeholder={dict.profile.conf_pass_placeholder}
                  />

                  <AppFormSubmit className="w-full font-semibold shadow-xs">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {dict.profile.change_password_btn}
                  </AppFormSubmit>
                </AppForm>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

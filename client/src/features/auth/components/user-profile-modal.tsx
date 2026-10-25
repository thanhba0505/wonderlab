'use client';

import * as React from 'react';
import { X, User, Mail, KeyRound, LogOut, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import { AppForm, AppFormField, AppFormSubmit, type AppFormHelpers } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

export function UserProfileModal() {
  const { user, isProfileModalOpen, closeProfileModal, changePassword, setPassword, logout } =
    useAuth();

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
      helpers.setFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPass.length < 8) {
      helpers.setFieldError('newPassword', 'Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    const result = await changePassword(currPass, newPass);

    if (result.success) {
      setSuccessMessage('Đổi mật khẩu thành công!');
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
      setSuccessMessage('Thiết lập mật khẩu thành công! Giờ bạn có thể đăng nhập bằng email.');
      helpers.resetForm({ newPassword: '', confirmPassword: '' });
    } else {
      if (result.errors) {
        helpers.setErrors(result.errors);
      } else {
        helpers.setFieldError('newPassword', result.error || 'Thiết lập mật khẩu thất bại.');
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
              Hồ sơ Nhà nghiên cứu
            </span>
          </div>

          <button
            onClick={closeProfileModal}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            aria-label="Đóng cửa sổ"
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
            Thông tin tài khoản
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
            Bảo mật & Mật khẩu
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
                    <span className="truncate">{user.email || 'Chưa cung cấp email'}</span>
                  </div>
                </div>
              </div>

              {/* Status List */}
              <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 text-xs">
                <div className="flex items-center justify-between p-3">
                  <span className="text-slate-600 font-medium">Trạng thái xác thực email</span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold font-mono">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Đã kích hoạt
                  </div>
                </div>

                <div className="flex items-center justify-between p-3">
                  <span className="text-slate-600 font-medium">Đăng nhập bằng Google</span>
                  <div className="flex items-center gap-1.5 font-mono">
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
                  <span className="text-slate-600 font-medium">Mật khẩu cá nhân</span>
                  <div className="font-mono">
                    {user.hasPassword ? (
                      <span className="text-emerald-700 font-semibold">Đã thiết lập</span>
                    ) : (
                      <span className="text-amber-700 font-semibold">Chưa thiết lập</span>
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
                  Đăng xuất tài khoản
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
                    Tài khoản của bạn hiện đang đăng nhập qua Google. Bạn có thể thiết lập mật khẩu
                    để đăng nhập trực tiếp bằng email mà không cần thông qua Google.
                  </div>

                  <AppFormField
                    name="newPassword"
                    label="Mật khẩu mới (Tối thiểu 8 ký tự)"
                    type="password"
                    showPasswordToggle
                    leftIcon={<Lock className="h-4 w-4" />}
                    required="Vui lòng nhập mật khẩu mới"
                    placeholder="Mật khẩu mới..."
                    rules={[{ minLength: 8, message: 'Mật khẩu phải có tối thiểu 8 ký tự' }]}
                  />

                  <AppFormField
                    name="confirmPassword"
                    label="Xác nhận lại mật khẩu mới"
                    type="password"
                    showPasswordToggle
                    leftIcon={<KeyRound className="h-4 w-4" />}
                    required="Vui lòng xác nhận mật khẩu mới"
                    placeholder="Gõ lại mật khẩu mới..."
                  />

                  <AppFormSubmit className="w-full font-semibold shadow-xs">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Thiết lập mật khẩu cá nhân
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
                    label="Mật khẩu hiện tại"
                    type="password"
                    showPasswordToggle
                    leftIcon={<Lock className="h-4 w-4" />}
                    required="Vui lòng nhập mật khẩu hiện tại"
                    placeholder="Nhập mật khẩu hiện tại..."
                  />

                  <AppFormField
                    name="newPassword"
                    label="Mật khẩu mới (Tối thiểu 8 ký tự)"
                    type="password"
                    showPasswordToggle
                    leftIcon={<KeyRound className="h-4 w-4" />}
                    required="Vui lòng nhập mật khẩu mới"
                    placeholder="Nhập mật khẩu mới..."
                    rules={[{ minLength: 8, message: 'Mật khẩu mới phải có tối thiểu 8 ký tự' }]}
                  />

                  <AppFormField
                    name="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    showPasswordToggle
                    leftIcon={<KeyRound className="h-4 w-4" />}
                    required="Vui lòng xác nhận mật khẩu mới"
                    placeholder="Gõ lại mật khẩu mới..."
                  />

                  <AppFormSubmit className="w-full font-semibold shadow-xs">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Cập nhật mật khẩu mới
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

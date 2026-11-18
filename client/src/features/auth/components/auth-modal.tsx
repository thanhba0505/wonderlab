'use client';

import * as React from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Database,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { AppForm, AppFormField, AppFormSubmit, type AppFormHelpers } from '@/components/ui';
import { useAuth, AuthModalView } from '@/lib/auth-context';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import { GoogleAccountChooserModal } from './google-account-chooser-modal';
import { GoogleSignInButton } from './google-sign-in-button';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    pendingEmail,
    login,
    register,
    verifyEmail,
    resendOtp,
    loginWithGoogle,
  } = useAuth();
  const { dict, locale } = useTranslation();

  const [mode, setMode] = React.useState<AuthModalView>(authModalMode);
  const [email, setEmail] = React.useState<string>('');
  const [otpCode, setOtpCode] = React.useState<string[]>(['', '', '', '', '', '']);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = React.useState<boolean>(false);
  const [cooldown, setCooldown] = React.useState<number>(0);
  const isDev = process.env.NODE_ENV !== 'production';

  const [isClientDev, setIsClientDev] = React.useState(false);
  React.useEffect(() => {
    setIsClientDev(
      process.env.NODE_ENV !== 'production' &&
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.endsWith('.local')),
    );
  }, []);

  // Sync mode with context
  React.useEffect(() => {
    setMode(authModalMode);
    if (pendingEmail) setEmail(pendingEmail);
    setSuccessMessage(null);
    setGeneralError(null);
  }, [authModalMode, pendingEmail, isAuthModalOpen]);

  // OTP Cooldown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus trap / escape key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  if (!isAuthModalOpen) return null;

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const nextOtp = [...otpCode];
      nextOtp[index] = '';
      setOtpCode(nextOtp);
      return;
    }

    if (cleaned.length > 1) {
      // Pasted full code or multiple digits
      const digits = cleaned.slice(0, 6).split('');
      const nextOtp = [...otpCode];
      digits.forEach((d, i) => {
        if (index + i < 6) nextOtp[index + i] = d;
      });
      setOtpCode(nextOtp);
      const nextFocus = Math.min(5, index + digits.length);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const nextOtp = [...otpCode];
    nextOtp[index] = cleaned;
    setOtpCode(nextOtp);

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 1. Submit Login
  const handleLoginSubmit = async (
    values: Record<string, unknown>,
    helpers: AppFormHelpers<Record<string, unknown>>,
  ) => {
    setSuccessMessage(null);
    const loginUser = String(values.username || '').trim();
    const loginPass = String(values.password || '');
    setIsSubmitting(true);

    const result = await login(loginUser, loginPass);
    setIsSubmitting(false);

    if (!result.success) {
      if (result.requireOtp && result.email) {
        setEmail(result.email);
        setMode('otp');
        setCooldown(60);
      } else if (result.errors) {
        helpers.setErrors(result.errors);
      } else {
        helpers.setFieldError('password', result.error || dict.auth.login_failed_credential);
      }
    }
  };

  // 2. Submit Register
  const handleRegisterSubmit = async (
    values: Record<string, unknown>,
    helpers: AppFormHelpers<Record<string, unknown>>,
  ) => {
    setSuccessMessage(null);
    const regUsername = String(values.username || '').trim();
    const regEmail = String(values.email || '').trim();
    const regPassword = String(values.password || '');
    const regConfirm = String(values.confirmPassword || '');

    if (!isDev && regPassword !== regConfirm) {
      helpers.setFieldError('confirmPassword', dict.auth.passwords_mismatch);
      return;
    }

    if (isDev && regConfirm && regPassword !== regConfirm) {
      helpers.setFieldError('confirmPassword', dict.auth.passwords_mismatch);
      return;
    }

    if (!isDev && regPassword.length < 8) {
      helpers.setFieldError('password', dict.auth.password_min_length);
      return;
    }

    setIsSubmitting(true);
    const result = await register(regUsername, regEmail, regPassword);
    setIsSubmitting(false);

    if (!result.success) {
      if (result.errors) {
        helpers.setErrors(result.errors);
      } else {
        helpers.setFieldError('username', result.error || dict.auth.register_failed);
      }
    } else {
      setMode('login');
      setSuccessMessage(dict.auth.register_success);
    }
  };

  // 3. Submit OTP Verify
  const handleVerifyOtpSubmit = async (
    _values: Record<string, unknown>,
    helpers: AppFormHelpers<Record<string, unknown>>,
  ) => {
    setSuccessMessage(null);
    const fullCode = otpCode.join('');

    if (fullCode.length !== 6) {
      helpers.setFieldError('code', dict.auth.otp_enter_all_digits);
      return;
    }

    setIsSubmitting(true);
    const result = await verifyEmail(email, fullCode);
    setIsSubmitting(false);

    if (!result.success) {
      if (result.errors) {
        helpers.setErrors(result.errors);
      } else {
        helpers.setFieldError('code', result.error || dict.auth.otp_invalid_or_expired);
      }
    }
  };

  // 4. Resend OTP
  const handleResendOtp = async (
    type: 'REGISTER_VERIFY' | 'RESET_PASSWORD' = 'REGISTER_VERIFY',
  ) => {
    if (cooldown > 0) return;
    const result = await resendOtp(email, type);
    if (result.success) {
      setCooldown(60);
      setSuccessMessage(dict.auth.otp_sent_success);
    }
  };

  // 5. Google OAuth Login
  const handleGoogleSuccess = async (credential: string) => {
    setIsSubmitting(true);
    setGeneralError(null);
    try {
      const res = await loginWithGoogle({ credential });
      if (res.success) {
        closeAuthModal();
      } else {
        setGeneralError(res.error || dict.auth.google_failed);
      }
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : dict.auth.google_failed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountSelect = async (account: {
    username: string;
    email: string;
    name: string;
  }) => {
    setIsSubmitting(true);
    try {
      const res = await login(account.username, '', { devBypass: true });
      if (res.success) {
        setIsGoogleChooserOpen(false);
      } else {
        await loginWithGoogle({
          email: account.email,
          name: account.name,
          googleId: `google_${Date.now()}`,
        });
        setIsGoogleChooserOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white border border-slate-300/85 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/90 px-6 py-4 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <BrandLogo variant="badge" className="h-7 w-7 rounded-lg shadow-2xs" />
            <span className="font-heading text-base font-bold text-slate-900">
              {mode === 'login' && dict.auth.login_title}
              {mode === 'register' && dict.auth.register_title}
              {mode === 'otp' && dict.auth.otp_title}
              {mode === 'forgot' && dict.auth.forgot_password_title}
              {mode === 'reset' && dict.auth.reset_password_title}
            </span>
          </div>

          <button
            onClick={closeAuthModal}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            aria-label={dict.auth.close_modal}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* General Error Notification Message */}
          {generalError && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="font-medium leading-relaxed">{generalError}</div>
            </div>
          )}

          {/* Success Notification Message */}
          {successMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* VIEW: LOGIN */}
          {mode === 'login' && (
            <AppForm
              initialValues={{
                username: '',
                password: '',
              }}
              onSubmit={handleLoginSubmit}
              className="space-y-4"
            >
              {/* Local Dev: Quick Login from DB */}
              {isClientDev && (
                <button
                  type="button"
                  onClick={() => setIsGoogleChooserOpen(true)}
                  disabled={isSubmitting}
                  className="w-full mb-2 flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50/70 px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 hover:border-amber-400 transition shadow-2xs cursor-pointer"
                >
                  <Database className="h-3.5 w-3.5 text-amber-700" />
                  {dict.auth.dev_db_test_account}
                </button>
              )}

              <AppFormField
                name="username"
                label={dict.auth.username_label}
                required={dict.auth.username_required}
                placeholder={dict.auth.username_placeholder}
                leftIcon={<User className="h-4 w-4" />}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">
                    {dict.auth.password_label} *
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                  >
                    {dict.auth.forgot_password_link}
                  </button>
                </div>
                <AppFormField
                  name="password"
                  type="password"
                  showPasswordToggle
                  required={dict.auth.password_required}
                  placeholder={dict.auth.password_placeholder}
                  leftIcon={<Lock className="h-4 w-4" />}
                />
              </div>

              <AppFormSubmit className="w-full font-semibold shadow-xs">
                <ArrowRight className="h-4 w-4 mr-2" />
                {dict.auth.sign_in_btn}
              </AppFormSubmit>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-2 text-xs font-mono uppercase text-slate-400">
                  {dict.auth.or_continue_with}
                </span>
              </div>

              {/* Google Button */}
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={err => setGeneralError(err)}
                disabled={isSubmitting}
                locale={locale}
                isClientDev={isClientDev}
                onDevChooserClick={() => setIsGoogleChooserOpen(true)}
              />

              <div className="pt-2 text-center text-xs text-slate-500">
                {dict.auth.no_account}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  {dict.auth.create_account_link}
                </button>
              </div>
            </AppForm>
          )}

          {/* VIEW: REGISTER */}
          {mode === 'register' && (
            <AppForm
              initialValues={{
                username: '',
                email: email || '',
                password: '',
                confirmPassword: '',
              }}
              onSubmit={handleRegisterSubmit}
              className="space-y-3.5"
            >
              <AppFormField
                name="username"
                label={dict.auth.username_label}
                required={dict.auth.register_username_required}
                placeholder={dict.auth.register_username_placeholder}
                leftIcon={<User className="h-4 w-4" />}
                rules={
                  !isDev
                    ? [
                        { minLength: 3, message: dict.auth.register_username_min },
                        { maxLength: 30, message: dict.auth.register_username_max },
                      ]
                    : undefined
                }
              />

              <AppFormField
                name="email"
                label={dict.auth.email_label}
                type={isDev ? 'text' : 'email'}
                required={dict.auth.email_required}
                placeholder={dict.auth.email_placeholder}
                leftIcon={<Mail className="h-4 w-4" />}
                rules={!isDev ? [{ email: true, message: dict.auth.email_invalid }] : undefined}
              />

              <AppFormField
                name="password"
                label={dict.auth.password_label}
                type="password"
                showPasswordToggle
                required={dict.auth.password_required}
                placeholder={dict.auth.password_placeholder}
                leftIcon={<Lock className="h-4 w-4" />}
                rules={
                  !isDev ? [{ minLength: 8, message: dict.auth.password_min_length }] : undefined
                }
              />

              <AppFormField
                name="confirmPassword"
                label={dict.auth.confirm_password_label}
                type="password"
                showPasswordToggle
                required={!isDev ? dict.auth.confirm_password_required : false}
                placeholder={dict.auth.confirm_password_placeholder}
                leftIcon={<KeyRound className="h-4 w-4" />}
                rules={[
                  {
                    validate: (val, formValues) => {
                      if (!isDev && val !== formValues.password) {
                        return dict.auth.passwords_mismatch;
                      }
                      if (isDev && val && val !== formValues.password) {
                        return dict.auth.passwords_mismatch;
                      }
                      return null;
                    },
                  },
                ]}
              />

              <AppFormSubmit className="w-full font-semibold shadow-xs mt-2">
                <ArrowRight className="h-4 w-4 mr-2" />
                {dict.auth.register_submit_btn}
              </AppFormSubmit>

              <div className="relative my-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-2 text-xs font-mono uppercase text-slate-400">
                  {dict.auth.or_separator}
                </span>
              </div>

              {/* Google Button */}
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={err => setGeneralError(err)}
                disabled={isSubmitting}
                locale={locale}
                isClientDev={isClientDev}
                onDevChooserClick={() => setIsGoogleChooserOpen(true)}
              />

              <div className="pt-2 text-center text-xs text-slate-500">
                {dict.auth.has_account}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  {dict.auth.sign_in_link}
                </button>
              </div>
            </AppForm>
          )}

          {/* VIEW: OTP 6 DIGITS */}
          {mode === 'otp' && (
            <AppForm
              initialValues={{ code: otpCode.join('') }}
              onSubmit={handleVerifyOtpSubmit}
              className="space-y-4"
            >
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-2">
                  <Mail className="h-6 w-6" />
                </div>
                <p className="text-xs text-slate-600">{dict.auth.otp_description}</p>
                <div className="mt-1 font-mono font-bold text-slate-800 text-sm">{email}</div>
              </div>

              {/* 6 Digit Inputs wrapped in AppFormField for error list display */}
              <AppFormField name="code">
                {({ hasError }) => (
                  <div className="flex justify-center gap-2 pt-2">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        className={cn(
                          'h-12 w-11 rounded-lg border-2 text-center font-mono text-xl font-bold text-slate-900 focus:outline-none transition-colors',
                          hasError
                            ? 'border-red-500 focus:border-red-600'
                            : 'border-slate-300 focus:border-blue-600 focus:bg-blue-50/20',
                        )}
                      />
                    ))}
                  </div>
                )}
              </AppFormField>

              <AppFormSubmit
                disabled={otpCode.join('').length !== 6}
                className="w-full font-semibold shadow-xs mt-2"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {dict.auth.otp_verify_btn}
              </AppFormSubmit>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setSuccessMessage(null);
                  }}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" /> {dict.nav.back}
                </button>

                <button
                  type="button"
                  disabled={cooldown > 0}
                  onClick={() => handleResendOtp('REGISTER_VERIFY')}
                  className={`font-semibold cursor-pointer ${
                    cooldown > 0
                      ? 'text-slate-400 cursor-not-allowed font-mono'
                      : 'text-blue-600 hover:text-blue-700 hover:underline'
                  }`}
                >
                  {cooldown > 0
                    ? dict.auth.resend_wait.replace('{seconds}', String(cooldown))
                    : dict.auth.otp_resend_btn}
                </button>
              </div>
            </AppForm>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {dict.auth.forgot_password_desc}
              </p>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 font-mono">
                {dict.auth.forgot_password_support_email}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setSuccessMessage(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" /> {dict.auth.back_to_login}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Local Dev Google Account Chooser Popup */}
      {isClientDev && (
        <GoogleAccountChooserModal
          isOpen={isGoogleChooserOpen}
          onClose={() => setIsGoogleChooserOpen(false)}
          onSelectAccount={handleAccountSelect}
          appName="Wonderlab"
        />
      )}
    </div>
  );
}

'use client';

import * as React from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/ui/brand-logo';
import { useAuth, AuthModalView } from '@/lib/auth-context';

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
    forgotPassword,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = React.useState<AuthModalView>(authModalMode);
  const [email, setEmail] = React.useState<string>('');
  const [username, setUsername] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [confirmPassword, setConfirmPassword] = React.useState<string>('');
  const [otpCode, setOtpCode] = React.useState<string[]>(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [cooldown, setCooldown] = React.useState<number>(0);

  // Sync mode with context
  React.useEffect(() => {
    setMode(authModalMode);
    if (pendingEmail) setEmail(pendingEmail);
    setErrorMessage(null);
    setSuccessMessage(null);
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
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await login(username, password);
    setIsSubmitting(false);

    if (!result.success) {
      if (result.requireOtp && result.email) {
        setEmail(result.email);
        setMode('otp');
        setCooldown(60);
        setErrorMessage('Tài khoản chưa kích hoạt. Mã OTP đã được gửi đến email.');
      } else {
        setErrorMessage(result.error || 'Đăng nhập không thành công.');
      }
    }
  };

  // 2. Submit Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Mật khẩu phải có độ dài tối thiểu 8 ký tự.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(username, email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Đăng ký tài khoản thất bại.');
    } else {
      setMode('otp');
      setCooldown(60);
      setSuccessMessage('Đăng ký thành công! Vui lòng nhập mã OTP 6 số để kích hoạt.');
    }
  };

  // 3. Submit OTP Verify
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const fullCode = otpCode.join('');

    if (fullCode.length !== 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã xác thực.');
      return;
    }

    setIsSubmitting(true);
    const result = await verifyEmail(email, fullCode);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
    }
  };

  // 4. Resend OTP
  const handleResendOtp = async (
    type: 'REGISTER_VERIFY' | 'RESET_PASSWORD' = 'REGISTER_VERIFY',
  ) => {
    if (cooldown > 0) return;
    setErrorMessage(null);
    const result = await resendOtp(email, type);
    if (result.success) {
      setCooldown(60);
      setSuccessMessage('Mã xác thực mới đã được gửi đến hộp thư của bạn.');
    } else {
      setErrorMessage(result.error || 'Không thể gửi lại mã OTP lúc này.');
    }
  };

  // 5. Submit Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email) {
      setErrorMessage('Vui lòng nhập địa chỉ email.');
      return;
    }

    setIsSubmitting(true);
    const result = await forgotPassword(email);
    setIsSubmitting(false);

    if (result.success) {
      setMode('reset');
      setCooldown(60);
      setSuccessMessage('Nếu email tồn tại, mã xác thực 6 số đã được gửi đến hộp thư.');
    } else {
      setErrorMessage(result.error || 'Có lỗi xảy ra khi xử lý yêu cầu.');
    }
  };

  // 6. Submit Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const fullCode = otpCode.join('');

    if (fullCode.length !== 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(email, fullCode, password);
    setIsSubmitting(false);

    if (result.success) {
      setMode('login');
      setSuccessMessage('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
    } else {
      setErrorMessage(result.error || 'Đặt lại mật khẩu thất bại.');
    }
  };

  // 7. Google OAuth Login Trigger
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    // Prompt user for local dev simulation or real email
    const simulatedEmail = window.prompt(
      'Mô phỏng Đăng nhập Google: Nhập email Google của bạn (hoặc giữ nguyên để dùng tài khoản nghiên cứu):',
      email || 'researcher@gmail.com',
    );

    if (!simulatedEmail) {
      setIsSubmitting(false);
      return;
    }

    const name = simulatedEmail.split('@')[0];
    const googleId = `google_${Math.abs(simulatedEmail.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0))}`;

    const result = await loginWithGoogle({
      email: simulatedEmail,
      name,
      googleId,
    });

    setIsSubmitting(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Đăng nhập Google không thành công.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white border border-slate-300/85 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/90 px-6 py-4 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <BrandLogo variant="badge" className="h-7 w-7 rounded-lg shadow-2xs" />
            <span className="font-heading text-base font-bold text-slate-900">
              {mode === 'login' && 'Đăng nhập Wonderlab'}
              {mode === 'register' && 'Đăng ký tài khoản'}
              {mode === 'otp' && 'Xác thực mã OTP 6 số'}
              {mode === 'forgot' && 'Khôi phục mật khẩu'}
              {mode === 'reset' && 'Đặt lại mật khẩu mới'}
            </span>
          </div>

          <button
            onClick={closeAuthModal}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            aria-label="Đóng cửa sổ"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Notification Messages */}
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* VIEW: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên đăng nhập hoặc Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="VD: admin hoặc user@domain.com"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-semibold shadow-xs"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Đăng nhập
              </Button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-2 text-xs font-mono uppercase text-slate-400">
                  Hoặc tiếp tục với
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition shadow-2xs"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Đăng nhập bằng tài khoản Google
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Chưa có tài khoản Wonderlab?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Đăng ký ngay
                </button>
              </div>
            </form>
          )}

          {/* VIEW: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên đăng nhập (Username)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="VD: galileo_2026"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="VD: researcher@gmail.com"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu (Tối thiểu 8 ký tự)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu an toàn..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Xác nhận lại mật khẩu
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Gõ lại mật khẩu vừa nhập..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-semibold shadow-xs mt-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Tạo tài khoản & Nhận mã OTP
              </Button>

              <div className="relative my-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-2 text-xs font-mono uppercase text-slate-400">
                  Hoặc
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Đăng ký bằng Google (Tự động kích hoạt)
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </form>
          )}

          {/* VIEW: OTP 6 DIGITS */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-2">
                  <Mail className="h-6 w-6" />
                </div>
                <p className="text-xs text-slate-600">
                  Mã xác thực 6 chữ số đã được gửi tới email:
                </p>
                <div className="mt-1 font-mono font-bold text-slate-800 text-sm">{email}</div>
              </div>

              {/* 6 Digit Inputs */}
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
                    className="h-12 w-11 rounded-lg border-2 border-slate-300 text-center font-mono text-xl font-bold text-slate-900 focus:border-blue-600 focus:bg-blue-50/20 focus:outline-none transition-colors"
                  />
                ))}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || otpCode.join('').length !== 6}
                className="w-full font-semibold shadow-xs mt-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Xác thực & Vào phòng Lab
              </Button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium"
                >
                  <ArrowLeft className="h-3 w-3" /> Quay lại
                </button>

                <button
                  type="button"
                  disabled={cooldown > 0}
                  onClick={() => handleResendOtp('REGISTER_VERIFY')}
                  className={`font-semibold ${
                    cooldown > 0
                      ? 'text-slate-400 cursor-not-allowed font-mono'
                      : 'text-blue-600 hover:text-blue-700 hover:underline'
                  }`}
                >
                  {cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : 'Gửi lại mã OTP'}
                </button>
              </div>
            </form>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Nhập địa chỉ email đăng ký của bạn. Wonderlab sẽ gửi mã OTP 6 số để bạn tiến hành
                khôi phục mật khẩu một cách an toàn.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ Email tài khoản
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="VD: researcher@gmail.com"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-semibold shadow-xs"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Gửi mã xác thực 6 số
              </Button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  <ArrowLeft className="h-3 w-3" /> Quay lại Đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* VIEW: RESET PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-3.5">
              <div className="text-center">
                <p className="text-xs text-slate-600">Nhập mã OTP 6 số đã gửi tới:</p>
                <div className="font-mono font-bold text-slate-800 text-xs mt-0.5">{email}</div>
              </div>

              <div className="flex justify-center gap-2 pt-1">
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
                    className="h-10 w-10 rounded-lg border-2 border-slate-300 text-center font-mono text-lg font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu mới (Tối thiểu 8 ký tự)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mật khẩu mới..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Xác nhận lại mật khẩu mới
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Gõ lại mật khẩu mới..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || otpCode.join('').length !== 6}
                className="w-full font-semibold shadow-xs"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Cập nhật mật khẩu & Đăng nhập
              </Button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium"
                >
                  <ArrowLeft className="h-3 w-3" /> Quay lại
                </button>

                <button
                  type="button"
                  disabled={cooldown > 0}
                  onClick={() => handleResendOtp('RESET_PASSWORD')}
                  className={`font-semibold ${
                    cooldown > 0
                      ? 'text-slate-400 cursor-not-allowed font-mono'
                      : 'text-blue-600 hover:text-blue-700 hover:underline'
                  }`}
                >
                  {cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : 'Gửi lại mã OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

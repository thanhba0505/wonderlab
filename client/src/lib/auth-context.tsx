'use client';

import * as React from 'react';
import { AuthUser } from '@/types';
import { getActiveLocale } from '@/i18n';

export type AuthModalView = 'login' | 'register' | 'otp' | 'forgot' | 'reset';

export interface AuthActionResult {
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
  email?: string;
  devOtpCode?: string;
  requireOtp?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  // Modal states
  isAuthModalOpen: boolean;
  authModalMode: AuthModalView;
  pendingEmail: string;
  isProfileModalOpen: boolean;
  openAuthModal: (mode?: AuthModalView, email?: string) => void;
  closeAuthModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  // Actions
  login: (username: string, password: string) => Promise<AuthActionResult>;
  register: (username: string, email: string, password: string) => Promise<AuthActionResult>;
  verifyEmail: (email: string, code: string) => Promise<AuthActionResult>;
  resendOtp: (
    email: string,
    type?: 'REGISTER_VERIFY' | 'RESET_PASSWORD',
  ) => Promise<AuthActionResult>;
  loginWithGoogle: (payload: {
    email?: string;
    name?: string;
    googleId?: string;
    credential?: string;
  }) => Promise<AuthActionResult>;
  forgotPassword: (email: string) => Promise<AuthActionResult>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<AuthActionResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthActionResult>;
  setPassword: (newPassword: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4101/api/v1';

async function parseAuthResponse<T = Record<string, unknown>>(
  response: Response,
): Promise<{
  ok: boolean;
  status: number;
  data: T;
  error?: string;
  errors?: Record<string, string[]>;
}> {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  const status = response.status;
  const ok = response.ok;

  if (ok) {
    return { ok: true, status, data: data as T };
  }

  let errorMessage = 'Yêu cầu không thành công.';
  if (typeof data.message === 'string') {
    errorMessage = data.message;
  } else if (Array.isArray(data.message) && data.message.length > 0) {
    errorMessage = String(data.message[0]);
  } else if (typeof data.error === 'string') {
    errorMessage = data.error;
  }

  const errors: Record<string, string[]> = {};
  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    for (const [key, val] of Object.entries(data.errors as Record<string, unknown>)) {
      if (Array.isArray(val)) {
        errors[key] = val.map(String);
      } else if (typeof val === 'string') {
        errors[key] = [val];
      }
    }
  }

  return {
    ok: false,
    status,
    data: data as T,
    error: errorMessage,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

function getJsonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': getActiveLocale(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Modal controls
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = React.useState<AuthModalView>('login');
  const [pendingEmail, setPendingEmail] = React.useState<string>('');
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState<boolean>(false);

  const openAuthModal = React.useCallback((mode: AuthModalView = 'login', email: string = '') => {
    setAuthModalMode(mode);
    if (email) setPendingEmail(email);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = React.useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const openProfileModal = React.useCallback(() => {
    setIsProfileModalOpen(true);
  }, []);

  const closeProfileModal = React.useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

  const refreshUser = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: { Accept: 'application/json', 'Accept-Language': getActiveLocale() },
        credentials: 'include',
      });

      if (response.ok) {
        const userData: AuthUser = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username: string, password: string): Promise<AuthActionResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const parsed = await parseAuthResponse<{ user: AuthUser }>(response);

      if (!parsed.ok) {
        const message = parsed.error || 'Tên đăng nhập hoặc mật khẩu không chính xác';
        if (message.includes('chưa được xác thực') && username.includes('@')) {
          return {
            success: false,
            error: message,
            errors: parsed.errors,
            requireOtp: true,
            email: username,
          };
        }
        return { success: false, error: message, errors: parsed.errors };
      }

      setUser(parsed.data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Không thể kết nối đến máy chủ bảo mật. Vui lòng thử lại sau.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ): Promise<AuthActionResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      const parsed = await parseAuthResponse<{ devOtpCode?: string }>(response);

      if (!parsed.ok) {
        return {
          success: false,
          error: parsed.error || 'Đăng ký tài khoản không thành công.',
          errors: parsed.errors,
        };
      }

      setPendingEmail(email);
      setAuthModalMode('otp');
      return { success: true, email, devOtpCode: parsed.data.devOtpCode };
    } catch {
      return {
        success: false,
        error: 'Lỗi kết nối mạng khi tạo tài khoản.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<AuthActionResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      });

      const parsed = await parseAuthResponse<{ user: AuthUser }>(response);

      if (!parsed.ok) {
        return {
          success: false,
          error: parsed.error || 'Mã xác thực không hợp lệ hoặc đã hết hạn.',
          errors: parsed.errors,
        };
      }

      setUser(parsed.data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Lỗi kết nối khi xác thực OTP.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (
    email: string,
    type: 'REGISTER_VERIFY' | 'RESET_PASSWORD' = 'REGISTER_VERIFY',
  ): Promise<AuthActionResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
        body: JSON.stringify({ email, type }),
      });

      const parsed = await parseAuthResponse(response);
      if (!parsed.ok) {
        return {
          success: false,
          error: parsed.error || 'Không thể gửi lại mã xác thực lúc này.',
          errors: parsed.errors,
        };
      }

      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Lỗi kết nối mạng.',
      };
    }
  };

  const loginWithGoogle = async (payload: {
    email?: string;
    name?: string;
    googleId?: string;
    credential?: string;
  }): Promise<AuthActionResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const parsed = await parseAuthResponse<{ user: AuthUser }>(response);

      if (!parsed.ok) {
        return {
          success: false,
          error: parsed.error || 'Đăng nhập bằng Google thất bại.',
          errors: parsed.errors,
        };
      }

      setUser(parsed.data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Lỗi kết nối máy chủ khi đăng nhập Google.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<AuthActionResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const parsed = await parseAuthResponse(response);
      if (!parsed.ok) {
        return {
          success: false,
          error: parsed.error || 'Không thể xử lý yêu cầu quên mật khẩu.',
          errors: parsed.errors,
        };
      }

      setPendingEmail(email);
      setAuthModalMode('reset');
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Lỗi kết nối khi gửi yêu cầu quên mật khẩu.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string,
  ): Promise<AuthActionResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
        body: JSON.stringify({ email, code, newPassword }),
      });

      const parsed = await parseAuthResponse(response);
      if (!parsed.ok) {
        return {
          success: false,
          error: parsed.error || 'Đặt lại mật khẩu không thành công.',
          errors: parsed.errors,
        };
      }

      setAuthModalMode('login');
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Lỗi kết nối khi đặt lại mật khẩu.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<AuthActionResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const parsed = await parseAuthResponse(response);
      if (!parsed.ok) {
        return {
          success: false,
          error: parsed.error || 'Đổi mật khẩu thất bại.',
          errors: parsed.errors,
        };
      }

      await refreshUser();
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Lỗi kết nối khi đổi mật khẩu.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const setPassword = async (newPassword: string): Promise<AuthActionResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
        method: 'POST',
        headers: getJsonHeaders(),
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      });

      const parsed = await parseAuthResponse(response);
      if (!parsed.ok) {
        return {
          success: false,
          error: parsed.error || 'Thiết lập mật khẩu thất bại.',
          errors: parsed.errors,
        };
      }

      await refreshUser();
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Lỗi kết nối khi thiết lập mật khẩu.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Accept-Language': getActiveLocale() },
        credentials: 'include',
      });
    } catch {
      // Ignored
    } finally {
      setUser(null);
      setIsLoading(false);
      setIsProfileModalOpen(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        pendingEmail,
        isProfileModalOpen,
        openAuthModal,
        closeAuthModal,
        openProfileModal,
        closeProfileModal,
        login,
        register,
        verifyEmail,
        resendOtp,
        loginWithGoogle,
        forgotPassword,
        resetPassword,
        changePassword,
        setPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

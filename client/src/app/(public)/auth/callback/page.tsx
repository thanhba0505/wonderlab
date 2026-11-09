'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function SsoCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const code = searchParams.get('code');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    let mounted = true;

    async function handleExchange() {
      if (!code) {
        if (mounted) {
          setError('Không tìm thấy mã xác thực SSO (authorization code).');
          setStatus('failed');
        }
        return;
      }

      const verifier =
        sessionStorage.getItem('sso_code_verifier') ||
        'wonderlab-default-pkce-verifier-client-side-auth';

      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4101/api/v1';
        const res = await fetch(`${apiBase}/auth/sso/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            code,
            code_verifier: verifier,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || 'Xác thực Single Sign-On thất bại.');
        }

        if (mounted) {
          sessionStorage.removeItem('sso_code_verifier');
          setStatus('success');
          await refreshUser();
          setTimeout(() => {
            router.push('/');
          }, 800);
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xác thực SSO.');
          setStatus('failed');
        }
      }
    }

    handleExchange();

    return () => {
      mounted = false;
    };
  }, [code, refreshUser, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]">
        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-600" />
            <h2 className="text-lg font-bold text-slate-900">Đang đồng bộ phiên đăng nhập...</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Wonderlab đang xác thực danh tính của bạn thông qua Central Gateway SSO Hub.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900">Đăng nhập thành công!</h2>
            <p className="text-xs text-slate-500">Đang chuyển bạn về trang chính Wonderlab...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900">Xác thực SSO thất bại</h2>
            <p className="text-xs text-rose-600 font-medium">{error}</p>
            <div className="pt-2">
              <button
                onClick={() => router.push('/')}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition active:scale-[0.98]"
              >
                Quay về trang chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SsoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <SsoCallbackHandler />
    </Suspense>
  );
}

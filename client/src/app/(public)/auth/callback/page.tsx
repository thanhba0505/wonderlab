'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/i18n';

function SsoCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, loginWithGoogle } = useAuth();
  const { dict } = useTranslation();

  const code = searchParams.get('code');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    let mounted = true;

    async function handleExchange() {
      // 1. Check for Google OAuth id_token in URL hash (#id_token=...)
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
      const idToken = hashParams.get('id_token');
      const hashError = hashParams.get('error') || searchParams.get('error');

      if (hashError) {
        if (typeof window !== 'undefined' && window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_ERROR', error: hashError },
            window.location.origin,
          );
          window.close();
          return;
        }
        if (mounted) {
          setError(hashError);
          setStatus('failed');
        }
        return;
      }

      if (idToken) {
        if (typeof window !== 'undefined' && window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_SUCCESS', credential: idToken },
            window.location.origin,
          );
          window.close();
          return;
        }

        const res = await loginWithGoogle({ credential: idToken });
        if (mounted) {
          if (res.success) {
            setStatus('success');
            setTimeout(() => {
              router.push('/');
            }, 600);
          } else {
            setError(res.error || dict.auth.google_failed);
            setStatus('failed');
          }
        }
        return;
      }

      // 2. Check for SSO authorization code
      if (!code) {
        if (mounted) {
          setError(dict.auth.sso_failed_title);
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
          throw new Error(data.message || dict.auth.sso_failed_title);
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
          setError(err instanceof Error ? err.message : dict.auth.sso_failed_title);
          setStatus('failed');
        }
      }
    }

    handleExchange();

    return () => {
      mounted = false;
    };
  }, [
    code,
    refreshUser,
    loginWithGoogle,
    router,
    searchParams,
    dict.auth.sso_failed_title,
    dict.auth.google_failed,
  ]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]">
        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2
              className="mx-auto h-10 w-10 animate-spin text-purple-600"
              aria-hidden="true"
            />
            <h2 className="text-lg font-bold text-slate-900">{dict.auth.sso_syncing_title}</h2>
            <p className="text-xs text-slate-500 leading-relaxed">{dict.auth.sso_syncing_desc}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-900">{dict.auth.sso_success_title}</h2>
            <p className="text-xs text-slate-500">{dict.auth.sso_success_desc}</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-900">{dict.auth.sso_failed_title}</h2>
            <p className="text-xs text-rose-600 font-medium">{error}</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition active:scale-[0.98] cursor-pointer"
              >
                {dict.auth.sso_return_home}
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
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" aria-hidden="true" />
        </div>
      }
    >
      <SsoCallbackHandler />
    </Suspense>
  );
}

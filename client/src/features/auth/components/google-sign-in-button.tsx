'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';
import { Loader2 } from 'lucide-react';
import { GoogleCredentialResponse } from '@/types/google';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => Promise<void> | void;
  onError?: (error: string) => void;
  disabled?: boolean;
  locale?: string;
  onDevChooserClick?: () => void;
  isClientDev?: boolean;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
  locale = 'vi',
  onDevChooserClick,
  isClientDev = false,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        onError?.(
          locale === 'vi'
            ? 'Không nhận được mã xác thực từ Google'
            : 'No credential received from Google',
        );
        return;
      }

      setIsProcessing(true);
      try {
        await onSuccess(response.credential);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : locale === 'vi'
              ? 'Đăng nhập Google thất bại'
              : 'Google login failed';
        onError?.(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [onSuccess, onError, locale],
  );

  useEffect(() => {
    if (!isScriptLoaded || !clientId || !containerRef.current) return;

    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear container before rendering
      containerRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 384,
        logo_alignment: 'left',
        locale: locale === 'vi' ? 'vi' : 'en',
      });
    }
  }, [isScriptLoaded, clientId, handleCredentialResponse, locale]);

  if (!clientId) {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        {isClientDev && onDevChooserClick ? (
          <button
            type="button"
            onClick={onDevChooserClick}
            disabled={disabled || isProcessing}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-300/85 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] disabled:opacity-50"
          >
            <span>
              {locale === 'vi'
                ? 'Đăng nhập Google (Giả lập Dev)'
                : 'Continue with Google (Dev Mock)'}
            </span>
          </button>
        ) : (
          <p className="text-xs text-amber-600 text-center font-medium">
            {locale === 'vi' ? 'Chưa cấu hình Google Client ID' : 'Google Client ID not configured'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />

      <div className="relative w-full flex items-center justify-center min-h-[44px]">
        {isProcessing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-xs">
            <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
          </div>
        )}
        <div
          ref={containerRef}
          className={`flex justify-center w-full transition-opacity ${
            disabled || isProcessing ? 'opacity-50 pointer-events-none' : 'opacity-100'
          }`}
        />
      </div>

      {isClientDev && onDevChooserClick && (
        <button
          type="button"
          onClick={onDevChooserClick}
          className="text-xs text-slate-500 hover:text-slate-800 transition-colors underline decoration-dotted mt-0.5"
        >
          {locale === 'vi' ? 'Chọn tài khoản Dev (Bypass)' : 'Dev Account Chooser (Bypass)'}
        </button>
      )}
    </div>
  );
}

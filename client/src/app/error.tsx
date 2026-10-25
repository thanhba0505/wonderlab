'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError = React.useMemo(() => {
    return (
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      (typeof window !== 'undefined' && error?.message?.includes('_next/static/chunks'))
    );
  }, [error]);

  React.useEffect(() => {
    console.error('Wonderlab Client Application Error:', error);

    // Auto-reload on ChunkLoadError with 10s debounce to seamlessly synchronize new assets
    if (isChunkError && typeof window !== 'undefined') {
      const CHUNK_RELOAD_KEY = 'wl_chunk_auto_reload_ts';
      const lastReload = sessionStorage.getItem(CHUNK_RELOAD_KEY);
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
        window.location.reload();
      }
    }
  }, [error, isChunkError]);

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div
      className="container mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-4 text-center"
      style={{
        minHeight: '65vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        textAlign: 'center',
        fontFamily:
          'var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-2xs"
        style={{
          width: '3.5rem',
          height: '3.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '1rem',
          border: '1px solid #fecdd3',
          backgroundColor: '#fff1f2',
          color: '#e11d48',
          marginBottom: '1rem',
        }}
      >
        <AlertCircle className="h-7 w-7" style={{ width: '1.75rem', height: '1.75rem' }} />
      </div>

      <span
        className="text-xs font-mono font-bold tracking-widest text-rose-600 uppercase"
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#e11d48',
        }}
      >
        {isChunkError ? 'Phiên bản mới khả dụng' : 'Sự cố kết xuất'}
      </span>

      <h1
        className="mt-2 text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight"
        style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#0f172a',
          marginTop: '0.5rem',
          lineHeight: 1.25,
        }}
      >
        {isChunkError
          ? 'Hệ thống vừa cập nhật phiên bản mới'
          : 'Đã xảy ra gián đoạn trong mô phỏng'}
      </h1>

      <p
        className="mt-3 text-sm text-slate-600 max-w-md font-sans leading-relaxed"
        style={{
          fontSize: '0.875rem',
          color: '#475569',
          maxWidth: '28rem',
          marginTop: '0.75rem',
          lineHeight: 1.6,
        }}
      >
        {isChunkError
          ? 'Một số tài nguyên vừa được cập nhật mã nguồn mới. Vui lòng tải lại trang để đồng bộ dữ liệu giao diện.'
          : 'Một lỗi không mong muốn đã xảy ra trong quá trình kết xuất giao diện. Hãy thử tải lại trang hoặc khởi động lại mô phỏng.'}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3" style={{ marginTop: '1.5rem' }}>
        <Button
          onClick={handleRetry}
          className="gap-2 font-semibold shadow-sm text-xs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isChunkError ? (
            <RefreshCw className="h-3.5 w-3.5" style={{ width: '0.875rem', height: '0.875rem' }} />
          ) : (
            <RotateCcw className="h-3.5 w-3.5" style={{ width: '0.875rem', height: '0.875rem' }} />
          )}
          {isChunkError ? 'Tải lại trang ngay' : 'Tải lại mô phỏng'}
        </Button>
      </div>
    </div>
  );
}

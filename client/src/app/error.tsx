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
  }, [error]);

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="container mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-2xs">
        <AlertCircle className="h-7 w-7" />
      </div>

      <span className="text-xs font-mono font-bold tracking-widest text-rose-600 uppercase">
        {isChunkError ? 'Phiên bản mới khả dụng' : 'Sự cố kết xuất'}
      </span>

      <h1 className="mt-2 text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
        {isChunkError
          ? 'Hệ thống vừa cập nhật phiên bản mới'
          : 'Đã xảy ra gián đoạn trong mô phỏng'}
      </h1>

      <p className="mt-3 text-sm text-slate-600 max-w-md font-sans leading-relaxed">
        {isChunkError
          ? 'Một số tài nguyên vừa được cập nhật mã nguồn mới. Vui lòng tải lại trang để đồng bộ dữ liệu giao diện.'
          : 'Một lỗi không mong muốn đã xảy ra trong quá trình kết xuất giao diện. Hãy thử tải lại trang hoặc khởi động lại mô phỏng.'}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={handleRetry} className="gap-2 font-semibold shadow-sm text-xs">
          {isChunkError ? (
            <RefreshCw className="h-3.5 w-3.5" />
          ) : (
            <RotateCcw className="h-3.5 w-3.5" />
          )}
          {isChunkError ? 'Tải lại trang ngay' : 'Tải lại mô phỏng'}
        </Button>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Report or log error safely in client
    console.error('Wonderlab Client Application Error:', error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/20 text-red-400">
        <AlertCircle className="h-8 w-8" />
      </div>

      <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
        Sự cố hệ thống
      </span>

      <h1 className="mt-2 text-3xl font-extrabold text-white">
        Đã xảy ra gián đoạn trong mô phỏng
      </h1>

      <p className="mt-3 text-sm text-slate-400 max-w-md">
        Một lỗi không mong muốn đã xảy ra trong quá trình kết xuất giao diện. Hãy thử khởi động lại
        mô phỏng.
      </p>

      <div className="mt-6 flex gap-3">
        <Button onClick={() => reset()} className="gap-2 font-semibold">
          <RotateCcw className="h-4 w-4" />
          Thử lại
        </Button>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <html lang="vi">
      <body className="min-h-screen flex items-center justify-center bg-[#f1f5f9] text-slate-800 p-4 font-sans">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-white border border-slate-300 shadow-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-rose-600 uppercase block">
            Lỗi Hệ Thống Cốt Lõi
          </span>
          <h2 className="text-xl font-heading font-extrabold text-slate-900">
            Sự cố tại tầng khung ứng dụng
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Đã xảy ra xung đột trong quá trình khởi tạo cấu trúc HTML gốc. Hãy tải lại toàn bộ trang
            để khôi phục phiên làm việc.
          </p>
          <div className="pt-2">
            <Button onClick={handleReload} className="gap-2 font-semibold text-xs shadow-sm">
              <RotateCcw className="h-3.5 w-3.5" />
              Khởi động lại toàn bộ
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}

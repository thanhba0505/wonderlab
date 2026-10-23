'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen flex items-center justify-center bg-[#080c14] text-slate-100 p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-400">Lỗi Hệ thống Cốt lõi</h2>
          <p className="text-sm text-slate-400">
            Ứng dụng gặp sự cố nghiêm trọng tại tầng HTML shell.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-md hover:bg-cyan-400"
          >
            Khởi động lại toàn bộ
          </button>
        </div>
      </body>
    </html>
  );
}

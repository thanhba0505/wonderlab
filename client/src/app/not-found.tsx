import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/20 text-cyan-400">
        <Compass className="h-8 w-8 animate-spin" style={{ animationDuration: '8s' }} />
      </div>

      <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
        Lỗi 404 • Không tìm thấy tọa độ
      </span>

      <h1 className="mt-2 text-3xl font-extrabold text-white">Trang này dường như không tồn tại</h1>

      <p className="mt-3 text-sm text-slate-400 max-w-md">
        Khái niệm hoặc đường dẫn bạn đang tìm kiếm có thể đã bị di dời hoặc chưa được khởi tạo trong
        phòng thí nghiệm Wonderlab.
      </p>

      <div className="mt-6">
        <Link href="/">
          <Button className="font-semibold gap-2">
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ khám phá
          </Button>
        </Link>
      </div>
    </div>
  );
}

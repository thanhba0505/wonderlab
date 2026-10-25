import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function EssayNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="p-4 rounded-full bg-slate-100 text-slate-500 mb-4">
        <BookOpen className="h-8 w-8" />
      </div>
      <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
        Không tìm thấy bài tiểu luận
      </h1>
      <p className="text-sm text-slate-600 max-w-md mb-6 font-sans">
        Bài tiểu luận bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật đường dẫn mới.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/essays">
          <Button variant="outline" className="text-xs">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Tất cả tiểu luận
          </Button>
        </Link>
        <Link href="/">
          <Button className="text-xs bg-blue-600 hover:bg-blue-700 text-white">Về Trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}

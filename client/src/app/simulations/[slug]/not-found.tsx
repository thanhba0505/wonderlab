import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Compass } from 'lucide-react';

export default function SimulationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4 border border-slate-200">
        <Compass className="h-8 w-8" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-slate-900">
        Không tìm thấy Phòng Thí nghiệm
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Chủ đề mô phỏng này hiện không tồn tại hoặc đã được di chuyển trong hệ thống Wonderlab.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/simulations">
          <Button variant="outline" className="border-slate-300">
            Xem danh mục phòng lab
          </Button>
        </Link>
        <Link href="/">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Về Trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}

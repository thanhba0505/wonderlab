import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RequestListView } from '@/features/simulation-requests/components/request-list-view';

export const metadata: Metadata = {
  title: 'Đề xuất Bài toán & Lộ trình Thí nghiệm',
  description:
    'Gửi ý tưởng bài toán hoặc nghịch lý khoa học bạn muốn Wonderlab mô phỏng trực quan. Bình chọn những thí nghiệm yêu thích để định hình lộ trình phát triển của phòng Lab.',
  alternates: {
    canonical: '/requests',
  },
  openGraph: {
    title: 'Đề xuất Bài toán & Lộ trình Thí nghiệm',
    description:
      'Gửi ý tưởng bài toán hoặc nghịch lý khoa học bạn muốn Wonderlab mô phỏng trực quan. Bình chọn những thí nghiệm yêu thích để định hình lộ trình phát triển của phòng Lab.',
    url: '/requests',
  },
};

export default function SimulationRequestsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
        <Link href="/" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Trang chủ</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Đề xuất thí nghiệm</span>
      </div>

      <RequestListView />
    </div>
  );
}

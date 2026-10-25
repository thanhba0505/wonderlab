import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllSimulations } from '@/features/simulations/registry';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, FlaskConical, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Danh mục Phòng Thí nghiệm — Wonderlab',
  description:
    'Khám phá các nghịch lý toán học, xác suất thống kê, cơ học lượng tử và lý thuyết trò chơi qua các mô phỏng tương tác.',
};

export default function SimulationsIndexPage() {
  const simulations = getAllSimulations();

  return (
    <div className="flex flex-col gap-8">
      {/* Header chỉ mục */}
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 font-mono text-xs text-blue-600 font-semibold uppercase tracking-wider">
          <FlaskConical className="h-4 w-4" />
          <span>Thư viện Thực nghiệm</span>
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Phòng Thí nghiệm Khoa học Tương tác
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 leading-relaxed">
          Nơi các định lý toán học, nghịch lý xác suất và hiện tượng vật lý lượng tử được biến đổi
          thành những mô hình trực quan sống động mà bạn có thể trực tiếp tương tác và kiểm chứng.
        </p>
      </div>

      {/* Lưới danh sách mô phỏng */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {simulations.map(sim => {
          const isActive = sim.status === 'active';

          return (
            <div
              key={sim.slug}
              className="lab-card lab-card-hover flex flex-col justify-between rounded-xl p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-500 uppercase">
                    {sim.category}
                  </span>
                  {isActive ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Sẵn sàng
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 border-slate-300">
                      Đang chuẩn bị
                    </Badge>
                  )}
                </div>

                <Link href={`/simulations/${sim.slug}`} className="block">
                  <h3 className="font-heading mt-3 text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    {sim.title}
                  </h3>
                </Link>
                <p className="mt-1 text-xs text-slate-600 line-clamp-2">{sim.subtitle}</p>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed">{sim.summary}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1 font-mono text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>~{sim.estimatedMinutes} phút</span>
                </div>

                <Link href={`/simulations/${sim.slug}`}>
                  <Button
                    size="sm"
                    variant={isActive ? 'default' : 'outline'}
                    className={
                      isActive
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'border-slate-300 text-slate-600'
                    }
                  >
                    <span>{isActive ? 'Vào phòng lab' : 'Xem chi tiết'}</span>
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Khối kêu gọi đề xuất bài toán mới */}
      <div className="mt-4 rounded-2xl border border-slate-300/85 bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-700 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Đề xuất từ cộng đồng</span>
          </div>
          <h2 className="font-heading mt-1 text-lg font-bold text-slate-900">
            Chưa tìm thấy bài toán bạn muốn thử nghiệm?
          </h2>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Hãy gửi ý tưởng nghịch lý hoặc hiện tượng bạn quan tâm. Cộng đồng Wonderlab sẽ bình chọn
            để đội ngũ ưu tiên xây dựng mô phỏng tiếp theo.
          </p>
        </div>
        <Link href="/requests">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            <span>Đề xuất & Bình chọn</span>
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

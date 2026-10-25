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

                <h3 className="font-heading mt-3 text-lg font-bold text-slate-900 group-hover:text-blue-600">
                  {sim.title}
                </h3>
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
    </div>
  );
}

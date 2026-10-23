import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  Construction,
  FlaskConical,
  Puzzle,
  Settings,
  AlertTriangle,
} from 'lucide-react';

export default function AdminPlaceholderPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 space-y-8">
      {/* Top Bar with Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2 border-slate-800 text-slate-300">
              <ArrowLeft className="h-4 w-4" />
              Quay lại Trang chủ
            </Button>
          </Link>
          <span className="text-xs font-mono text-slate-400">Wonderlab Portal / Admin</span>
        </div>

        <Badge variant="amber" className="gap-1.5 px-3 py-1 text-xs">
          <Construction className="h-3.5 w-3.5" />
          Khu vực Đang Phát Triển (Placeholder)
        </Badge>
      </div>

      {/* Main Notice Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-amber-200">
              Khu vực Quản trị Wonderlab (Admin Console)
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Trang này là cấu trúc placeholder kỹ thuật nhằm định hình trước bố cục điều hành cho
              các giai đoạn tiếp theo. Hiện tại hệ thống{' '}
              <strong>chưa tích hợp Authentication</strong> và{' '}
              <strong>không có API nghiệp vụ quản trị</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Future Structure Showcase (Non-functional Preview) */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400">
          Sơ đồ chức năng dự kiến (Future Modules)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-800 bg-slate-900/30">
            <CardHeader className="space-y-2">
              <FlaskConical className="h-5 w-5 text-cyan-400" />
              <CardTitle className="text-base text-slate-200">Quản lý Thí nghiệm</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Thêm, sửa đổi các tham số vật lý, bài toán xác suất và mô phỏng trực quan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-[10px]">
                Chưa kích hoạt
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/30">
            <CardHeader className="space-y-2">
              <Puzzle className="h-5 w-5 text-violet-400" />
              <CardTitle className="text-base text-slate-200">Quản lý Câu đố Logic</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Biên soạn kịch bản câu đố, luật phân chia và đáp án nghịch lý.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-[10px]">
                Chưa kích hoạt
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/30">
            <CardHeader className="space-y-2">
              <Settings className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-base text-slate-200">Cấu hình Hệ thống</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Thiết lập cache, rate limit và giám sát kết nối cơ sở dữ liệu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-[10px]">
                Chưa kích hoạt
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Return Action */}
      <div className="pt-6 flex justify-center">
        <Link href="/">
          <Button size="lg" className="font-semibold gap-2">
            <ArrowLeft className="h-4 w-4" />
            Về lại trang chủ khám phá
          </Button>
        </Link>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ChevronRight, Compass, Sparkles, FlaskConical, ArrowRight } from 'lucide-react';
import { CuratedExperience } from '@/types';

export const CURATED_LIST: CuratedExperience[] = [
  {
    id: 'birthday-paradox',
    title: 'Nghịch lý Ngày Sinh (Birthday Paradox)',
    summary:
      'Chỉ cần 23 người ngẫu nhiên trong một phòng, xác suất để có ít nhất 2 người cùng ngày sinh đã vượt quá 50%. Khám phá mô phỏng tổ hợp phản trực giác.',
    category: 'probability',
    estimatedMinutes: 4,
    highlightTag: 'Toán học xác suất',
    concept: 'P(A) = 1 - (365! / ((365-n)! · 365^n))',
    href: '/simulations/birthday-paradox',
  },
  {
    id: 'zeno-paradox',
    title: 'Nghịch lý Zeno: Achilles & Con Rùa (Zeno Paradox)',
    summary:
      'Chiến binh Achilles dẫu chạy nhanh gấp 10 lần con rùa nhưng theo Zeno sẽ không bao giờ đuổi kịp vì khoảng cách liên tục bị chia đôi vô tận.',
    category: 'paradox',
    estimatedMinutes: 5,
    highlightTag: 'Triết học & Giải tích',
    concept: '\\sum_{n=1}^{\\infty} (1/2)^n = 1',
    href: '/simulations/zeno-paradox',
  },
  {
    id: 'prisoners-dilemma',
    title: 'Song đề Tù nhân & Hợp tác Tiến hóa',
    summary:
      'Tại sao hai người hoàn toàn duy lý lại đưa ra kết quả bất lợi cho cả hai? Khám phá Cân bằng Nash và chiến lược hợp tác đối ứng Tit-for-Tat.',
    category: 'mind-games',
    estimatedMinutes: 5,
    highlightTag: 'Lý thuyết trò chơi',
    concept: 'Cân bằng Nash: ui(si*, s-i*) ≥ ui(si, s-i*)',
    href: '/simulations/prisoners-dilemma',
  },
  {
    id: 'double-slit',
    title: 'Thí nghiệm Khe đôi Young & Cơ học Lượng tử',
    summary:
      'Quan sát tính chất lưỡng tính sóng - hạt của ánh sáng và sự sụp đổ hàm sóng kỳ bí khi có sự can thiệp của thiết bị đo lường.',
    category: 'science',
    estimatedMinutes: 6,
    highlightTag: 'Vật lý lượng tử',
    concept: 'Lưỡng tính sóng - hạt |ψ⟩ = c1|1⟩ + c2|2⟩',
    href: '/simulations/double-slit',
  },
  {
    id: 'art-gallery',
    title: 'Bài toán Người gác Phòng trưng bày (Art Gallery Problem)',
    summary:
      'Trong căn phòng đa giác bất kỳ n đỉnh, cần bao nhiêu người để quan sát trọn vẹn mọi ngóc ngách? Khám phá định lý Chvátal và chứng minh Steve Fisk.',
    category: 'mind-games',
    estimatedMinutes: 5,
    highlightTag: 'Hình học & Logic',
    concept: 'g(n) = \\lfloor n/3 \\rfloor',
    href: '/simulations/art-gallery',
  },
  {
    id: 'prisoners-hats',
    title: 'Bài toán Đội mũ & Bit Chẵn lẻ (Prisoners Hat Puzzle)',
    summary:
      'Làm thế nào để 10 người đội mũ 2 màu ngẫu nhiên chắc chắn đoán đúng màu mũ của ít nhất 9 người? Khám phá chiến thuật Parity Checksum và lý thuyết thông tin.',
    category: 'mind-games',
    estimatedMinutes: 4,
    highlightTag: 'Lý thuyết thông tin & Logic',
    concept: 'P \\ge (n-1)/n, \\quad c_k = (p - \\sum c_{j}) \\pmod K',
    href: '/simulations/prisoners-hats',
  },
];

export function CuratedList() {
  const getBadgeVariant = (category: string) => {
    switch (category) {
      case 'probability':
        return 'amber';
      case 'paradox':
        return 'violet';
      case 'mind-games':
        return 'emerald';
      case 'science':
      default:
        return 'cyan';
    }
  };

  return (
    <div className="space-y-4">
      {CURATED_LIST.map((item, index) => {
        const targetHref = item.href || `/simulations/${item.id}`;

        return (
          <Card
            key={item.id}
            className="relative border-slate-300/85 bg-white hover:border-slate-400 hover:shadow-md transition-all duration-200 p-6 shadow-xs"
          >
            <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-500">#0{index + 1}</span>
                  <Badge variant={getBadgeVariant(item.category)} className="text-xs">
                    {item.highlightTag}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>~{item.estimatedMinutes} phút tương tác</span>
                  </div>
                </div>

                <h4 className="text-lg font-heading font-extrabold text-slate-900">{item.title}</h4>

                <p className="text-sm text-slate-600 leading-relaxed font-sans">{item.summary}</p>

                <div className="flex items-center gap-2 pt-1">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="text-xs font-mono font-medium text-blue-900 bg-slate-100 px-2.5 py-1 rounded-md">
                    {item.concept}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                <Link
                  href={targetHref}
                  className="group/btn inline-flex items-center justify-center font-bold text-xs gap-1.5 h-9 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-700 shadow-xs hover:border-blue-600 hover:bg-blue-600 hover:text-white active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
                >
                  <Compass className="h-4 w-4 text-blue-600 group-hover/btn:text-white transition-colors" />
                  <span>Vào phòng lab</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Hành động điều hướng tới danh mục toàn bộ phòng lab */}
      <div className="pt-2 flex justify-center">
        <Link
          href="/simulations"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-700 text-xs font-mono font-bold transition shadow-xs group"
        >
          <FlaskConical className="h-4 w-4 text-blue-600" />
          <span>Khám phá toàn bộ Thư viện Thực nghiệm</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

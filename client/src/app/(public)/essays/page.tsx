import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllEssays } from '@/features/editorial/essays-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Atom, Quote, ArrowUpRight, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Góc Tiểu luận & Suy ngẫm',
  description:
    'Góc nhìn chuyên sâu kết nối triết học, toán học và các ranh giới nhận thức của con người.',
  alternates: {
    canonical: '/essays',
  },
  openGraph: {
    title: 'Góc Tiểu luận & Suy ngẫm',
    description:
      'Góc nhìn chuyên sâu kết nối triết học, toán học và các ranh giới nhận thức của con người.',
    url: '/essays',
  },
};

export default function EssaysArchivePage() {
  const essays = getAllEssays();

  return (
    <div className="flex flex-col gap-8 xl:gap-10 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 border-b border-slate-200 pb-4">
        <Link href="/" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Trang chủ
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Góc tiểu luận & suy ngẫm</span>
      </div>

      {/* Header Section matching Homepage & Screenshot */}
      <div className="space-y-3 max-w-3xl xl:max-w-4xl">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          <h1 className="text-xs font-mono font-bold tracking-widest text-emerald-700 uppercase">
            Góc tiểu luận & suy ngẫm
          </h1>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[40px] font-heading font-extrabold text-slate-900 tracking-tight leading-tight">
          Những câu hỏi mở về tự nhiên và nhận thức
        </h2>
        <p className="text-sm sm:text-base xl:text-lg text-slate-600 font-sans leading-relaxed">
          Góc nhìn chuyên sâu kết nối triết học, toán học và các ranh giới nhận thức của con người.
          Mỗi bài viết mở ra một hành trình tư duy và kết nối trực tiếp với các mô hình thực nghiệm
          tại Wonderlab.
        </p>
      </div>

      {/* Grid of Essay Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 pt-2">
        {essays.map((article, idx) => {
          const href = `/essays/${article.slug || article.id}`;

          return (
            <Link
              key={article.id}
              href={href}
              className="block group rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-[0.99] transition-transform"
            >
              <Card className="h-full relative border-slate-300/85 bg-white flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition-all duration-300 p-6 xl:p-7 overflow-hidden shadow-xs cursor-pointer">
                {/* Subtle watermark background number */}
                <div className="absolute top-2 right-4 text-7xl font-mono font-black text-slate-100 select-none pointer-events-none group-hover:text-blue-50 transition-colors">
                  0{idx + 1}
                </div>

                <CardHeader className="p-0 space-y-3 relative z-10">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-mono text-blue-700 font-bold">
                      <Atom className="h-3.5 w-3.5" />
                      Tiểu luận #{article.issueNumber || `0${idx + 1}`}
                    </span>
                    <span className="font-mono text-slate-400">
                      {article.readTimeMinutes} phút đọc
                    </span>
                  </div>

                  <div>
                    <CardTitle className="text-lg font-heading font-extrabold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                      {article.title}
                    </CardTitle>
                    <p className="text-xs font-mono text-blue-700/80 mt-1.5 font-medium">
                      {article.subtitle}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-0 pt-4 space-y-4 flex-1 flex flex-col justify-between relative z-10">
                  <p className="text-sm text-slate-600 leading-relaxed font-sans line-clamp-4">
                    {article.teaser}
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-lg bg-blue-50/80 p-3.5 border-l-2 border-blue-600 text-xs italic text-slate-800 flex items-start gap-2.5">
                      <Quote className="h-4 w-4 shrink-0 text-blue-600 opacity-80 mt-0.5" />
                      <span className="leading-relaxed">&ldquo;{article.quote}&rdquo;</span>
                    </div>

                    <div className="flex items-center text-xs font-bold text-slate-600 group-hover:text-blue-700 transition-colors">
                      <span>Đọc toàn bộ tiểu luận</span>
                      <ArrowUpRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { HeroVisual } from '@/features/hero/hero-visual';
import { MontyHallSimulation } from '@/features/monty-hall/monty-hall-simulation';
import { CategoryGrid } from '@/features/explore/category-grid';
import { CuratedList } from '@/features/curated/curated-list';
import { EditorialSection } from '@/features/editorial/editorial-section';
import { Sparkles, FlaskConical, Compass, BookOpen, Atom } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20 pb-24">
      {/* ==================================================================== */}
      {/* HERO SECTION */}
      {/* ==================================================================== */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Editorial Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-3 py-1 text-xs font-mono text-cyan-300">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Không gian Thử nghiệm Trực quan • Wonderlab 2026</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Nơi những nghịch lý biến thành{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                  trải nghiệm trực giác.
                </span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
                Tại sao xác suất lại đánh lừa bộ não? Điều gì xảy ra khi ánh sáng đi qua hai khe
                hẹp? Wonderlab biến các câu hỏi toán học, khoa học và tư duy logic trừu tượng thành
                các mô hình tương tác sống động để bạn tự tay thử nghiệm.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href="#featured">
                  <Button size="lg" className="shadow-lg shadow-cyan-500/25 font-bold">
                    <FlaskConical className="h-4 w-4 mr-2" />
                    Thử nghiệm Monty Hall
                  </Button>
                </a>
                <a href="#explore">
                  <Button variant="secondary" size="lg" className="border-slate-800">
                    <Compass className="h-4 w-4 mr-2 text-cyan-400" />
                    Duyệt các chủ đề
                  </Button>
                </a>
              </div>

              {/* Core virtues pills */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Mô phỏng Monte Carlo trực tiếp
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  Không số liệu giả
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Khoa học chính xác
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Constellation Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FEATURED EXPERIENCE (MONTY HALL INTERACTIVE) */}
      {/* ==================================================================== */}
      <section id="featured" className="scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                Trải nghiệm tiêu biểu
              </h2>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Thực hành trực tiếp với nghịch lý toán học
            </h3>
          </div>

          <MontyHallSimulation />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* EXPLORE CATEGORIES */}
      {/* ==================================================================== */}
      <section id="explore" className="scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-violet-400" />
              <h2 className="text-xs font-mono font-bold tracking-widest text-violet-400 uppercase">
                Phân loại tri thức
              </h2>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Khám phá các miền tư duy tại Wonderlab
            </h3>
            <p className="text-sm text-slate-400 max-w-2xl">
              Từ lượng tử, xác suất cho đến lý thuyết trò chơi và các câu đố phân nhánh nhận thức.
            </p>
          </div>

          <CategoryGrid />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* CURATED EXPERIENCES */}
      {/* ==================================================================== */}
      <section className="scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-2">
              <Atom className="h-5 w-5 text-amber-400" />
              <h2 className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                Danh mục tuyển chọn
              </h2>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Các bài học & thí nghiệm trực quan đáng chú ý
            </h3>
          </div>

          <CuratedList />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* EDITORIAL SECTION */}
      {/* ==================================================================== */}
      <section id="editorial" className="scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
                Góc tiểu luận & suy ngẫm
              </h2>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Những câu hỏi mở về tự nhiên và nhận thức
            </h3>
          </div>

          <EditorialSection />
        </div>
      </section>
    </div>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Atom,
  Dice5,
  Binary,
  Infinity as InfinityIcon,
  Gamepad2,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export function CategoryGrid() {
  // Mini interactive state for Tile 1: Double-slit mode
  const [slitsMode, setSlitsMode] = React.useState<'single' | 'double'>('double');

  // Mini interactive state for Tile 2: Dice roll
  const [diceRoll, setDiceRoll] = React.useState<{ d1: number; d2: number; sum: number }>({
    d1: 3,
    d2: 4,
    sum: 7,
  });

  // Mini interactive state for Tile 4: Prisoner's dilemma choice
  const [prisonerChoice, setPrisonerChoice] = React.useState<'cooperate' | 'defect'>('cooperate');

  const handleRollDice = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDiceRoll({ d1, d2, sum: d1 + d2 });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* ==================================================================== */}
      {/* TILE 1: Khoa học Thực nghiệm (Bento Span 2 cols) */}
      {/* ==================================================================== */}
      <Card className="lg:col-span-2 group relative overflow-hidden border-slate-300/85 bg-white hover:border-blue-500 hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Atom className="h-48 w-48 text-blue-600" />
        </div>

        <CardHeader className="space-y-3 pb-3 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                <Atom className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-heading font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Khoa học Thực nghiệm & Quang học
                </CardTitle>
                <p className="text-xs font-mono text-blue-700/80 mt-0.5 font-medium">
                  Vật lý lượng tử, sóng & dao động
                </p>
              </div>
            </div>
            <Badge variant="cyan">4 THÍ NGHIỆM TRỰC QUAN</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 relative z-10">
          <CardDescription className="text-sm text-slate-600 leading-relaxed max-w-2xl font-sans">
            Quan sát tính chất lưỡng tính sóng - hạt của photon, hiện tượng khúc xạ ánh sáng và giao
            thoa lượng tử khi có hoặc không có người quan sát.
          </CardDescription>

          {/* Micro Interactive: Double Slit Wave Visualizer - Borderless grouping container */}
          <div className="rounded-xl bg-slate-100/70 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-800 flex items-center gap-1.5 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Mô hình Giao thoa Khe đôi (Young Experiment):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSlitsMode('single')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded ${
                    slitsMode === 'single'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  1 Khe hẹp
                </button>
                <button
                  type="button"
                  onClick={() => setSlitsMode('double')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded ${
                    slitsMode === 'double'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  2 Khe (Giao thoa)
                </button>
              </div>
            </div>

            {/* Wave Pattern Bars */}
            <div className="h-16 flex items-end justify-between gap-1 px-2 pt-2 border-b border-slate-200 bg-white rounded-lg">
              {Array.from({ length: 25 }).map((_, i) => {
                const center = 12;
                const dist = Math.abs(i - center);
                const heightPercent =
                  slitsMode === 'double'
                    ? Math.max(
                        10,
                        Math.round(
                          100 * Math.cos((dist * Math.PI) / 4) ** 2 * Math.exp(-dist * 0.12),
                        ),
                      )
                    : Math.max(8, Math.round(100 * Math.exp(-dist * 0.3)));

                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-700 to-sky-400 rounded-t transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Nguồn Laser λ = 532nm</span>
              <span className="text-blue-700 font-semibold">
                {slitsMode === 'double'
                  ? 'Vân giao thoa sáng/tối rõ nét (Tính chất Sóng)'
                  : 'Vệt phân bố hạt đơn trục'}
              </span>
            </div>
          </div>

          <Link
            href="/simulations/double-slit"
            className="flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700 transition-colors"
          >
            <span>Khám phá phòng thí nghiệm quang học</span>
            <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </CardContent>
      </Card>

      {/* ==================================================================== */}
      {/* TILE 2: Xác suất & Thống kê (Span 1 col) */}
      {/* ==================================================================== */}
      <Card className="group relative overflow-hidden border-slate-300/85 bg-white hover:border-amber-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
        <div>
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                <Dice5 className="h-6 w-6" />
              </div>
              <Badge variant="amber">5 MÔ PHỎNG</Badge>
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
                Xác suất & Thống kê
              </CardTitle>
              <p className="text-xs font-mono text-amber-700 mt-0.5 font-medium">
                Nơi trực giác dễ bị đánh lừa
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <CardDescription className="text-sm text-slate-600 leading-relaxed font-sans">
              Nghịch lý ngày sinh nhật, tung xúc xắc và định lý giới hạn trung tâm qua mô phỏng
              Monte Carlo sống động.
            </CardDescription>

            {/* Micro Interactive: Dice Roller - Borderless grouping container */}
            <div className="rounded-xl bg-slate-100/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-800 font-semibold">
                  Tung 2 Xúc xắc:
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRollDice}
                  className="h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Tung ngay
                </Button>
              </div>

              <div className="flex items-center justify-center gap-3 py-1">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-mono font-black text-xl text-amber-800 shadow-2xs">
                  {diceRoll.d1}
                </div>
                <span className="text-slate-400 font-mono text-sm">+</span>
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-mono font-black text-xl text-amber-800 shadow-2xs">
                  {diceRoll.d2}
                </div>
                <span className="text-slate-400 font-mono text-sm">=</span>
                <div className="w-12 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center font-mono font-black text-xl shadow-xs">
                  {diceRoll.sum}
                </div>
              </div>

              <div className="text-[11px] font-mono text-center text-slate-500">
                Tổng 7 có xác suất xuất hiện cao nhất:{' '}
                <span className="text-amber-700 font-bold">16.67% (6/36)</span>
              </div>
            </div>
          </CardContent>
        </div>

        <div className="p-6 pt-0">
          <Link
            href="/simulations/birthday-paradox"
            className="flex items-center text-xs font-bold text-amber-700 group-hover:text-amber-800 transition-colors"
          >
            <span>Trải nghiệm Nghịch lý Ngày sinh</span>
            <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Card>

      {/* ==================================================================== */}
      {/* TILE 3: Nghịch lý Tư duy (Span 1 col) */}
      {/* ==================================================================== */}
      <Card className="group relative overflow-hidden border-slate-300/85 bg-white hover:border-violet-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
        <div>
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-700">
                <InfinityIcon className="h-6 w-6" />
              </div>
              <Badge variant="violet">6 NGHỊCH LÝ</Badge>
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-extrabold text-slate-900 group-hover:text-violet-700 transition-colors">
                Nghịch lý Tư duy
              </CardTitle>
              <p className="text-xs font-mono text-violet-700 mt-0.5 font-medium">
                Những hiện tượng phản trực giác
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <CardDescription className="text-sm text-slate-600 leading-relaxed font-sans">
              Khám phá con tàu Theseus về bản sắc, Nghịch lý Zeno về bước chân vô tận của Achilles,
              và nghịch lý Fermi về sự im lặng của vũ trụ.
            </CardDescription>

            <div className="rounded-xl bg-slate-100/70 border-l-4 border-l-violet-600 p-3.5 text-xs font-mono space-y-1.5">
              <div className="text-violet-800 font-bold">Achilles & Con Rùa (Zeno):</div>
              <div className="text-slate-600 text-[11px] leading-relaxed">
                Khoảng cách: 100m → 50m → 25m → ...
                <br />
                Chuỗi vô hạn: Σ (1/2)^n = 1 (Hội tụ hữu hạn)
              </div>
            </div>
          </CardContent>
        </div>

        <div className="p-6 pt-0">
          <Link
            href="/simulations/zeno-paradox"
            className="flex items-center text-xs font-bold text-violet-700 group-hover:text-violet-800 transition-colors"
          >
            <span>Đi sâu vào các nghịch lý</span>
            <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Card>

      {/* ==================================================================== */}
      {/* TILE 4: Lý thuyết Trò chơi (Bento Span 2 cols) */}
      {/* ==================================================================== */}
      <Card className="lg:col-span-2 group relative overflow-hidden border-slate-300/85 bg-white hover:border-emerald-500 hover:shadow-md transition-all duration-300">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                <Gamepad2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-heading font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Lý thuyết Trò chơi & Nhận thức
                </CardTitle>
                <p className="text-xs font-mono text-emerald-700 mt-0.5 font-medium">
                  Cân bằng Nash, Song đề Tù nhân & Chiến lược tiến hóa
                </p>
              </div>
            </div>
            <Badge variant="emerald">3 TÌNH HUỐNG TƯƠNG TÁC</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <CardDescription className="text-sm text-slate-600 leading-relaxed max-w-2xl font-sans">
            Tại sao hai người duy lý lại đưa ra kết quả tồi tệ cho cả hai? Khám phá ma trận trả giá
            (payoff matrix) và cách chiến lược &ldquo;Ăn miếng trả miếng&rdquo; (Tit for Tat) tạo
            dựng sự hợp tác.
          </CardDescription>

          {/* Micro Interactive: Prisoner's Dilemma - Borderless container with left-accent outcome cards */}
          <div className="rounded-xl bg-slate-100/70 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-mono text-slate-800 font-bold">
                Chọn nước đi của bạn trong Song đề Tù nhân:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPrisonerChoice('cooperate')}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded ${
                    prisonerChoice === 'cooperate'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Hợp tác (Cooperate)
                </button>
                <button
                  type="button"
                  onClick={() => setPrisonerChoice('defect')}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded ${
                    prisonerChoice === 'defect'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Phản bội (Defect)
                </button>
              </div>
            </div>

            {/* Payoff Result View - Clean Left Accent without nested 4-sided borders */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div
                className={`p-3 rounded-lg bg-white shadow-2xs transition-all ${
                  prisonerChoice === 'cooperate'
                    ? 'border-l-4 border-l-emerald-600'
                    : 'border-l-4 border-l-slate-300 opacity-80'
                }`}
              >
                <div className="font-bold text-slate-900">Nếu đối phương cũng Hợp tác:</div>
                <div
                  className={`mt-1 font-semibold ${
                    prisonerChoice === 'cooperate' ? 'text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  {prisonerChoice === 'cooperate'
                    ? 'Mỗi người ngồi tù 1 năm (Tối ưu chung)'
                    : 'Bạn được tha bổng, đối phương 5 năm!'}
                </div>
              </div>

              <div
                className={`p-3 rounded-lg bg-white shadow-2xs transition-all ${
                  prisonerChoice === 'defect'
                    ? 'border-l-4 border-l-red-500'
                    : 'border-l-4 border-l-slate-300 opacity-80'
                }`}
              >
                <div className="font-bold text-slate-900">Nếu đối phương Phản bội:</div>
                <div
                  className={`mt-1 font-semibold ${
                    prisonerChoice === 'defect' ? 'text-red-700' : 'text-slate-600'
                  }`}
                >
                  {prisonerChoice === 'defect'
                    ? 'Mỗi người 3 năm tù (Điểm Cân bằng Nash)'
                    : 'Bạn lãnh đủ 5 năm, đối phương được tha!'}
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/simulations/prisoners-dilemma"
            className="flex items-center text-xs font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors"
          >
            <span>Khám phá các thế cờ lý thuyết trò chơi</span>
            <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </CardContent>
      </Card>

      {/* ==================================================================== */}
      {/* TILE 5: Logic Học (Span 1 col) */}
      {/* ==================================================================== */}
      <Card className="group relative overflow-hidden border-slate-300/85 bg-white hover:border-blue-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
        <div>
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                <Binary className="h-6 w-6" />
              </div>
              <Badge variant="cyan">3 CÂU ĐỐ</Badge>
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                Logic Học & Mệnh đề
              </CardTitle>
              <p className="text-xs font-mono text-blue-700 mt-0.5 font-medium">
                Chân trị, suy luận & mệnh đề
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <CardDescription className="text-sm text-slate-600 leading-relaxed font-sans">
              Khám phá nghịch lý người cạo râu Russell, định lý bất toàn Gödel và giải quyết các câu
              đố hòn đảo hiệp sĩ & kẻ nói dối.
            </CardDescription>

            <div className="rounded-xl bg-slate-100/70 border-l-4 border-l-blue-600 p-3.5 text-xs font-mono space-y-1">
              <span className="text-blue-800 font-bold">Nghịch lý Russell:</span>
              <p className="text-slate-600 text-[11px]">
                R = &#123; x | x ∉ x &#125; ⇒ R ∈ R ⟺ R ∉ R
              </p>
            </div>
          </CardContent>
        </div>

        <div className="p-6 pt-0">
          <Link
            href="/simulations"
            className="flex items-center text-xs font-bold text-blue-700 group-hover:text-blue-800 transition-colors"
          >
            <span>Khám phá toàn bộ phòng lab</span>
            <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Card>
    </div>
  );
}

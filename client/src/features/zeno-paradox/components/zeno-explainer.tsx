'use client';

import * as React from 'react';
import { BookOpen, Infinity as InfinityIcon, Atom, Sparkles, Scale } from 'lucide-react';
import { SimulationFormulaBox } from '@/features/simulations/components';

export function ZenoExplainer() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
          <BookOpen className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-heading text-base font-bold text-slate-900">
            Giải Mã Nghịch Lý: Từ Triết Học Hy Lạp Đến Vi Tích Phân & Vật Lý Lượng Tử
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            Khám phá cách một nghịch lý cổ xưa đã định hình lại nền tảng của toán học hiện đại và
            vật lý không thời gian
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cột 1: Bẫy tư duy của Zeno */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
          <div className="flex items-center gap-2 text-violet-700">
            <Scale className="h-4 w-4" />
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
              1. Bẫy Tư duy Zeno
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            Zeno thành Elea đưa ra nghịch lý: Nếu không gian và thời gian có thể chia nhỏ vô tận,
            thì để đi từ A đến B bạn phải đi qua vô số điểm trung gian. Não bộ con người khi ấy lầm
            tưởng rằng &ldquo;vô số bước&rdquo; bắt buộc phải mất &ldquo;vô hạn thời gian&rdquo;.
          </p>
        </div>

        {/* Cột 2: Vi tích phân & Chuỗi hội tụ */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-700">
            <InfinityIcon className="h-4 w-4" />
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
              2. Đột phá Vi Tích Phân
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            Newton, Leibniz và Cauchy giải quyết triệt để: Tổng của vô số đại lượng nhỏ dần theo cấp
            số nhân với công bội |r| &lt; 1 là một số thực hữu hạn. Toàn bộ vô hạn khoảng thời gian
            10s + 1s + 0.1s + ... khép lại chính xác tại thời điểm 11.111... giây.
          </p>
        </div>

        {/* Cột 3: Ranh giới Lượng tử Planck */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <Atom className="h-4 w-4" />
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
              3. Giới hạn Planck
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            Vật lý lượng tử chỉ ra rằng giả thiết của Zeno về không gian liên tục bị chặn ở quy mô
            hạ nguyên tử: Độ dài Planck (&ell;<sub>P</sub> &asymp; 1.6 &times; 10<sup>-35</sup> m)
            là khoảng cách nhỏ nhất có ý nghĩa vật lý. Không gian có tính rời rạc!
          </p>
        </div>
      </div>

      {/* 2 Khối công thức toán học cấp số nhân & thời gian hội tụ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SimulationFormulaBox title="Tổng chuỗi cấp số nhân lùi vô hạn (Geometric Series):">
          <div className="flex items-center flex-wrap gap-2 text-sm text-slate-900">
            <span className="font-bold">
              S = &sum; a &times; r<sup>k</sup>
            </span>
            <span>=</span>
            <span className="font-bold text-blue-700">a / (1 &minus; r)</span>
            <span className="text-xs text-slate-500 font-sans">(với |r| &lt; 1)</span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Khi công bội r = v<sub>T</sub> / v<sub>A</sub> &lt; 1, chuỗi các khoảng thời gian vô hạn
            bước hội tụ hoàn hảo về một giới hạn hữu hạn xác định.
          </p>
        </SimulationFormulaBox>

        <SimulationFormulaBox title="Thời điểm bắt kịp chính xác (Analytical Overtake):">
          <div className="flex items-center flex-wrap gap-2 text-sm text-slate-900">
            <span className="font-bold">T*</span>
            <span>=</span>
            <span className="font-bold text-violet-700">
              d<sub>0</sub> / (v<sub>A</sub> &minus; v<sub>T</sub>)
            </span>
            <span className="text-slate-400">,</span>
            <span className="font-bold">
              X* = v<sub>A</sub> &times; T*
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Với d<sub>0</sub> là khoảng cách nhường trước (m), v<sub>A</sub> là vận tốc Achilles, v
            <sub>T</sub> là vận tốc Rùa. Sau thời điểm T*, Achilles vượt lên dẫn trước hoàn toàn.
          </p>
        </SimulationFormulaBox>
      </div>

      {/* Quote callout */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs italic text-slate-600">
        <Sparkles className="h-4 w-4 shrink-0 text-amber-500 mt-0.5 not-italic" />
        <p className="font-sans leading-relaxed">
          &ldquo;Nghịch lý của Zeno không phải là một sự ngớ ngẩn của người xưa; nó là một nhát búa
          thúc đẩy toàn bộ nền văn minh phương Tây phải phát minh ra khái niệm Giới hạn (Limit),
          giải tích vô hạn nhỏ và nền tảng của Cơ học lượng tử hiện đại.&rdquo;
        </p>
      </div>
    </div>
  );
}

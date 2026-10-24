'use client';

import * as React from 'react';
import { BookOpen, Sparkles, HelpCircle, Eye, GitBranch } from 'lucide-react';
import { SimulationFormulaBox } from '@/features/simulations/components';

export function QuantumExplainer() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
          <BookOpen className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-heading text-base font-bold text-slate-900">
            Giải mã Nghịch lý: Tại sao &quot;Chỉ Nhìn&quot; lại Thay đổi Thực tại?
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            Khám phá bí ẩn cốt lõi của vật lý lượng tử qua lăng kính toán học & triết học tự nhiên
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Lưỡng tính Sóng - Hạt */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-700">
            <Sparkles className="h-4 w-4" />
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
              1. Lưỡng tính Sóng - Hạt
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            Trong thế giới vĩ mô, một vật hoặc là hạt (viên bi) hoặc là sóng (sóng nước). Nhưng ở
            quy mô vi mô, photon hay electron đều tồn tại dưới dạng <strong>sóng xác suất</strong>{' '}
            trước khi chạm vào màn hứng.
          </p>
        </div>

        {/* Card 2: Tự giao thoa với chính mình */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
          <div className="flex items-center gap-2 text-violet-700">
            <GitBranch className="h-4 w-4" />
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
              2. Tự giao thoa một mình
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            Khi bắn từng hạt đơn lẻ cách nhau cả tiếng đồng hồ, không có hạt nào khác để va chạm.
            Tuy nhiên, hàm sóng của hạt đi qua <strong>đồng thời cả 2 khe</strong> và tự triệt tiêu
            hoặc khuếch đại chính mình, tạo nên vân sáng tối!
          </p>
        </div>

        {/* Card 3: Sự sụp đổ hàm sóng */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-700">
            <Eye className="h-4 w-4" />
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
              3. Sụp đổ Hàm sóng
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            Chỉ cần đặt một máy dò tại khe để biết thông tin &quot;Hạt đi qua khe nào&quot;, sự can
            thiệp đo lường lập tức triệt tiêu trạng thái chồng chập lượng tử. Hàm sóng sụp đổ, và
            hạt buộc phải hành xử như hạt vật chất cổ điển.
          </p>
        </div>
      </div>

      {/* 2 Khối công thức toán học giao thoa & chồng chập lượng tử */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SimulationFormulaBox title="Khoảng vân giao thoa (Interference Fringe):">
          <div className="flex items-center flex-wrap gap-2 text-sm text-slate-900">
            <span className="font-bold">i = &Delta;y</span>
            <span>=</span>
            <span>(&lambda; &times; D) / d</span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Vị trí vân sáng thứ m: y<sub>m</sub> = m &times; (&lambda; &times; D / d), với &lambda;
            là bước sóng, D là khoảng cách tới màn hứng, d là bề rộng 2 khe.
          </p>
        </SimulationFormulaBox>

        <SimulationFormulaBox title="Trạng thái chồng chập lượng tử (Superposition):">
          <div className="flex items-center flex-wrap gap-2 text-sm text-slate-900">
            <span className="font-bold">|&Psi;&rang;</span>
            <span>=</span>
            <span>(1 / &radic;2) &times; (|Khe 1&rang; + |Khe 2&rang;)</span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Khi có máy quan sát (Observer ON), hàm sóng sụp đổ về duy nhất một trạng thái:
            |&Psi;&rang; &rarr; |Khe 1&rang; hoặc |Khe 2&rang;.
          </p>
        </SimulationFormulaBox>
      </div>

      {/* Feynman Quote Banner */}
      <div className="rounded-xl border border-slate-200 bg-slate-100/60 p-4 font-mono text-xs text-slate-700">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
          <div>
            <blockquote className="italic leading-relaxed text-slate-800">
              &ldquo;Thí nghiệm hai khe chứa đựng trái tim của cơ học lượng tử. Trên thực tế, nó
              chứa đựng bí ẩn duy nhất. Hãy quan sát cách nó vận hành, bạn sẽ thấy toàn bộ cơ học
              lượng tử là gì.&rdquo;
            </blockquote>
            <p className="mt-1 text-xs text-slate-500 font-bold">
              — Richard Feynman (Nobel Vật lý 1965)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

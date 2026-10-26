'use client';

import * as React from 'react';
import { FiskProofResult } from '../art-gallery-math';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles } from 'lucide-react';

export interface FiskStepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  fiskProof: FiskProofResult;
  numVertices: number;
}

interface StepInfo {
  title: string;
  subtitle: string;
  description: string;
}

const STEPS: StepInfo[] = [
  {
    title: 'Bước 0: Khảo sát căn phòng ban đầu',
    subtitle: 'Đa giác đơn n đỉnh với các góc lồi và lõm',
    description:
      'Căn phòng có thể ngoằn ngoèo với nhiều góc khuất. Định lý Chvátal khẳng định ta không bao giờ cần quá ⌊n/3⌋ người gác đặt tại các đỉnh.',
  },
  {
    title: 'Bước 1: Tam giác hóa (Ear Clipping Triangulation)',
    subtitle: 'Phân rã đa giác thành n - 2 tam giác',
    description:
      'Nối các đỉnh bằng các đường chéo nằm trọn bên trong phòng để chia phòng thành các tam giác con. Mỗi tam giác là một hình lồi.',
  },
  {
    title: 'Bước 2: Tô 3 màu các đỉnh (Steve Fisk 3-Coloring)',
    subtitle: 'Đồ thị đối ngẫu là cây -> Luôn tô được bằng 3 màu',
    description:
      'Tô tất cả các đỉnh bằng 3 màu (Hổ phách, Ngọc bích, Tím lam) sao cho mọi tam giác con đều chứa đủ 3 đỉnh mang 3 màu khác biệt.',
  },
  {
    title: 'Bước 3: Nguyên lý Dirichlet & Bố trí lính gác',
    subtitle: 'Chọn nhóm màu có số đỉnh ít nhất (≤ ⌊n/3⌋)',
    description:
      'Theo nguyên lý lồng chim (Pigeonhole), trong 3 màu luôn có ít nhất một màu xuất hiện không quá ⌊n/3⌋ lần. Đặt lính gác vào các đỉnh này!',
  },
  {
    title: 'Bước 4: Kiểm chứng tầm nhìn toàn diện 100%',
    subtitle: 'Mỗi tam giác được bao quát bởi ít nhất 1 lính gác',
    description:
      'Vì mọi tam giác đều có 1 đỉnh thuộc màu được chọn, và tam giác là hình lồi, người gác nhìn thấy trọn vẹn tam giác đó -> 100% căn phòng sáng rực!',
  },
];

export const FiskStepper: React.FC<FiskStepperProps> = ({
  currentStep,
  onStepChange,
  fiskProof,
  numVertices,
}) => {
  const chvatalBound = Math.floor(numVertices / 3);
  const activeStep = STEPS[currentStep] ?? STEPS[0]!;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-300/85 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
              Trình Diễn Chứng Minh Steve Fisk (1978)
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Lời giải hình học đẹp nhất trong cuốn sách kinh điển &quot;Proofs from THE BOOK&quot;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="font-bold text-slate-800">Bước {currentStep + 1}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500">{STEPS.length}</span>
        </div>
      </div>

      {/* Step Indicators Bar */}
      <div className="grid grid-cols-5 gap-1.5">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <button
              key={`step-btn-${idx}`}
              onClick={() => onStepChange(idx)}
              className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-md text-center transition-all ${
                isCurrent
                  ? 'bg-blue-50 border border-blue-400 text-blue-900 font-bold'
                  : isDone
                    ? 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono text-xs">{idx}</span>
              <span className="text-[12px] font-sans truncate max-w-full hidden sm:inline">
                {idx === 0
                  ? 'Khảo sát'
                  : idx === 1
                    ? 'Tam giác'
                    : idx === 2
                      ? 'Tô 3 màu'
                      : idx === 3
                        ? 'Dirichlet'
                        : 'Bao quát'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Step Content */}
      <div className="rounded-lg bg-slate-50/80 border border-slate-200/80 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-heading text-xs sm:text-sm font-bold text-slate-900">
            {activeStep.title}
          </h4>
          {currentStep === 4 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded">
              <CheckCircle2 className="h-3.5 w-3.5" />
              100% Bao Phủ
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 font-sans leading-relaxed">{activeStep.description}</p>

        {/* Step-specific Extra Metrics */}
        {currentStep === 1 && (
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-600 border-t border-slate-200/60">
            <span>
              Số tam giác: <strong>{fiskProof.triangles.length}</strong> (n - 2 = {numVertices - 2})
            </span>
            <span>&bull;</span>
            <span>
              Đường chéo nội vi: <strong>{fiskProof.diagonals.length}</strong> (n - 3 ={' '}
              {numVertices - 3})
            </span>
          </div>
        )}

        {currentStep === 2 && (
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-600 border-t border-slate-200/60">
            <span>
              Màu A: <strong>{fiskProof.colorCounts[0]}</strong> đỉnh
            </span>
            <span>&bull;</span>
            <span>
              Màu B: <strong>{fiskProof.colorCounts[1]}</strong> đỉnh
            </span>
            <span>&bull;</span>
            <span>
              Màu C: <strong>{fiskProof.colorCounts[2]}</strong> đỉnh
            </span>
          </div>
        )}

        {currentStep === 3 && (
          <div className="pt-2 flex flex-wrap gap-3 text-xs font-sans text-slate-700 border-t border-slate-200/60">
            <span>
              Màu tối ưu được chọn có{' '}
              <strong className="font-mono text-emerald-700">
                {fiskProof.guardVertexIndices.length}
              </strong>{' '}
              lính gác &le; cận Chvátal &lfloor;{numVertices}/3&rfloor; ={' '}
              <strong className="font-mono">{chvatalBound}</strong> lính.
            </span>
          </div>
        )}
      </div>

      {/* Stepper Navigation Buttons */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="outline"
          disabled={currentStep === 0}
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          className="border-slate-300 text-xs flex items-center gap-1 active:scale-[0.98]"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Bước trước</span>
        </Button>

        <Button
          disabled={currentStep === STEPS.length - 1}
          onClick={() => onStepChange(Math.min(STEPS.length - 1, currentStep + 1))}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1 active:scale-[0.98]"
        >
          <span>Bước kế tiếp</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

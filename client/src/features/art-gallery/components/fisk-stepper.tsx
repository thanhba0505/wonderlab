'use client';

import * as React from 'react';
import { FiskProofResult } from '../art-gallery-math';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n';

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

const STEPS_VI: StepInfo[] = [
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

const STEPS_EN: StepInfo[] = [
  {
    title: 'Step 0: Initial Room Survey',
    subtitle: 'Simple n-gon polygon with convex and reflex vertices',
    description:
      'The room may be intricate with many occluded alcoves. Chvátal’s Theorem guarantees that at most ⌊n/3⌋ vertex guards are ever required.',
  },
  {
    title: 'Step 1: Triangulation (Ear Clipping)',
    subtitle: 'Decomposing polygon into n - 2 triangles',
    description:
      'Connect vertices with non-crossing internal diagonals to partition the gallery into triangles. Every triangle is a convex set.',
  },
  {
    title: 'Step 2: 3-Coloring Vertices (Steve Fisk)',
    subtitle: 'Dual graph is a tree -> Always 3-colorable',
    description:
      'Assign 3 colors (Amber, Emerald, Indigo) to all vertices so that every triangle has vertices of 3 distinct colors.',
  },
  {
    title: 'Step 3: Pigeonhole Principle & Guard Placement',
    subtitle: 'Pick the least frequent color class (≤ ⌊n/3⌋)',
    description:
      'By the Pigeonhole Principle, at least one color appears at most ⌊n/3⌋ times. Place guards at all vertices of this color!',
  },
  {
    title: 'Step 4: 100% Comprehensive Coverage Verification',
    subtitle: 'Every triangle is covered by at least 1 guard',
    description:
      'Because every triangle contains one vertex of the selected color and triangles are convex, every triangle is fully illuminated -> 100% of the room is covered!',
  },
];

export const FiskStepper: React.FC<FiskStepperProps> = ({
  currentStep,
  onStepChange,
  fiskProof,
  numVertices,
}) => {
  const { locale } = useTranslation();
  const isEn = locale === 'en';
  const steps = isEn ? STEPS_EN : STEPS_VI;
  const chvatalBound = Math.floor(numVertices / 3);
  const activeStep = steps[currentStep] ?? steps[0]!;

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
              {isEn
                ? 'Steve Fisk Proof Demonstration (1978)'
                : 'Trình Diễn Chứng Minh Steve Fisk (1978)'}
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              {isEn
                ? 'The most beautiful geometric proof in "Proofs from THE BOOK"'
                : 'Lời giải hình học đẹp nhất trong cuốn sách kinh điển "Proofs from THE BOOK"'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="font-bold text-slate-800">
            {isEn ? `Step ${currentStep + 1}` : `Bước ${currentStep + 1}`}
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500">{steps.length}</span>
        </div>
      </div>

      {/* Step Indicators Bar */}
      <div className="grid grid-cols-5 gap-1.5">
        {steps.map((step, idx) => {
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
                  ? isEn
                    ? 'Survey'
                    : 'Khảo sát'
                  : idx === 1
                    ? isEn
                      ? 'Triangles'
                      : 'Tam giác'
                    : idx === 2
                      ? isEn
                        ? '3-Color'
                        : 'Tô 3 màu'
                      : idx === 3
                        ? 'Dirichlet'
                        : isEn
                          ? 'Covered'
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
              {isEn ? '100% Coverage' : '100% Bao Phủ'}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 font-sans leading-relaxed">{activeStep.description}</p>

        {/* Step-specific Extra Metrics */}
        {currentStep === 1 && (
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-600 border-t border-slate-200/60">
            <span>
              {isEn ? 'Triangles: ' : 'Số tam giác: '}
              <strong>{fiskProof.triangles.length}</strong> (n - 2 = {numVertices - 2})
            </span>
            <span>&bull;</span>
            <span>
              {isEn ? 'Internal diagonals: ' : 'Đường chéo nội vi: '}
              <strong>{fiskProof.diagonals.length}</strong> (n - 3 = {numVertices - 3})
            </span>
          </div>
        )}

        {currentStep === 2 && (
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-600 border-t border-slate-200/60">
            <span>
              {isEn ? 'Color A: ' : 'Màu A: '}
              <strong>{fiskProof.colorCounts[0]}</strong> {isEn ? 'vertices' : 'đỉnh'}
            </span>
            <span>&bull;</span>
            <span>
              {isEn ? 'Color B: ' : 'Màu B: '}
              <strong>{fiskProof.colorCounts[1]}</strong> {isEn ? 'vertices' : 'đỉnh'}
            </span>
            <span>&bull;</span>
            <span>
              {isEn ? 'Color C: ' : 'Màu C: '}
              <strong>{fiskProof.colorCounts[2]}</strong> {isEn ? 'vertices' : 'đỉnh'}
            </span>
          </div>
        )}

        {currentStep === 3 && (
          <div className="pt-2 flex flex-wrap gap-3 text-xs font-sans text-slate-700 border-t border-slate-200/60">
            <span>
              {isEn ? (
                <>
                  Selected optimal color has{' '}
                  <strong className="font-mono text-emerald-700">
                    {fiskProof.guardVertexIndices.length}
                  </strong>{' '}
                  guards &le; Chvátal bound &lfloor;{numVertices}/3&rfloor; ={' '}
                  <strong className="font-mono">{chvatalBound}</strong> guards.
                </>
              ) : (
                <>
                  Màu tối ưu được chọn có{' '}
                  <strong className="font-mono text-emerald-700">
                    {fiskProof.guardVertexIndices.length}
                  </strong>{' '}
                  lính gác &le; cận Chvátal &lfloor;{numVertices}/3&rfloor; ={' '}
                  <strong className="font-mono">{chvatalBound}</strong> lính.
                </>
              )}
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
          <span>{isEn ? 'Previous step' : 'Bước trước'}</span>
        </Button>

        <Button
          disabled={currentStep === steps.length - 1}
          onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1 active:scale-[0.98]"
        >
          <span>{isEn ? 'Next step' : 'Bước kế tiếp'}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

'use client';

import * as React from 'react';
import {
  Brain,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Award,
  CheckCircle2,
  FastForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationHypothesisChallenge, HypothesisOption } from '../types';
import { calculateIntuitionGap, getIntuitionRating } from '../utils/intuition-math';

interface IntuitionChallengeCardProps {
  challenge: SimulationHypothesisChallenge;
  simulationSlug: string;
  onPredictionSelected?: (option: HypothesisOption, gap: number) => void;
  onStatusChange?: (isResolved: boolean) => void;
  className?: string;
}

export function IntuitionChallengeCard({
  challenge,
  simulationSlug,
  onPredictionSelected,
  onStatusChange,
  className = '',
}: IntuitionChallengeCardProps) {
  const [selectedOption, setSelectedOption] = React.useState<HypothesisOption | null>(null);
  const [hasSubmitted, setHasSubmitted] = React.useState<boolean>(false);
  const [isSkipped, setIsSkipped] = React.useState<boolean>(false);

  // Restore previous choice from localStorage if available
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(`wonderlab_guess_${simulationSlug}`);
      if (saved === 'skipped') {
        setIsSkipped(true);
        onStatusChange?.(true);
      } else if (saved) {
        const found = challenge.options.find(opt => opt.id === saved);
        if (found) {
          setSelectedOption(found);
          setHasSubmitted(true);
          onStatusChange?.(true);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [challenge.options, simulationSlug, onStatusChange]);

  const handleSelectOption = (option: HypothesisOption) => {
    setSelectedOption(option);
    setHasSubmitted(true);
    setIsSkipped(false);
    const gap = Math.abs(option.value - challenge.theoreticalTruth);

    try {
      localStorage.setItem(`wonderlab_guess_${simulationSlug}`, option.id);
    } catch {
      // Ignore storage errors
    }

    if (onPredictionSelected) {
      onPredictionSelected(option, gap);
    }
    if (onStatusChange) {
      onStatusChange(true);
    }
  };

  const handleSkip = () => {
    setIsSkipped(true);
    setHasSubmitted(false);
    setSelectedOption(null);
    try {
      localStorage.setItem(`wonderlab_guess_${simulationSlug}`, 'skipped');
    } catch {
      // Ignore storage errors
    }
    if (onStatusChange) {
      onStatusChange(true);
    }
  };

  const handleResetGuess = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setIsSkipped(false);
    try {
      localStorage.removeItem(`wonderlab_guess_${simulationSlug}`);
    } catch {
      // Ignore storage errors
    }
    if (onStatusChange) {
      onStatusChange(false);
    }
  };

  const gap = selectedOption
    ? calculateIntuitionGap(selectedOption.value, challenge.theoreticalTruth)
    : 0;
  const gapPercentage = gap * 100;
  const rating = getIntuitionRating(gap);

  const isCardActive = !hasSubmitted && !isSkipped;

  return (
    <div
      className={`rounded-xl border transition-all ${
        isCardActive
          ? 'border-amber-300/85 bg-gradient-to-b from-amber-50/50 via-white to-white shadow-xs'
          : isSkipped
            ? 'border-slate-200 bg-slate-50/50'
            : 'border-slate-300/85 bg-white shadow-xs'
      } p-5 ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isCardActive ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'
            }`}
          >
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              Thử thách Dự đoán Trực giác (Intuition Challenge)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCardActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              className="h-7 px-2.5 text-xs font-mono text-slate-600 hover:text-slate-900 border-slate-300 bg-white hover:bg-slate-50 gap-1"
              title="Bỏ qua thử thách để xem kết quả lý thuyết ngay"
            >
              <FastForward className="h-3.5 w-3.5 text-slate-400" />
              Bỏ qua thử thách
            </Button>
          )}

          <Badge
            variant={isCardActive ? 'amber' : isSkipped ? 'outline' : 'cyan'}
            className="text-[10px] font-mono"
          >
            {hasSubmitted ? 'Đã dự đoán' : isSkipped ? 'Đã bỏ qua' : 'Khảo sát trước thực nghiệm'}
          </Badge>

          {(hasSubmitted || isSkipped) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetGuess}
              className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-900 font-mono gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Đoán lại
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-4 space-y-4">
        {isSkipped ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Bạn đã bỏ qua thử thách dự đoán. Toàn bộ thông số xác suất lý thuyết và buồng thí
                nghiệm đã được mở khóa hoàn toàn.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetGuess}
              className="h-7 text-xs font-mono border-slate-300 bg-white hover:bg-slate-50 text-slate-700 whitespace-nowrap"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Thử làm lại thử thách
            </Button>
          </div>
        ) : (
          <>
            {/* Context and Question */}
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500 font-sans italic">{challenge.context}</p>
              <h4 className="font-heading text-base font-bold text-slate-900 leading-snug">
                {challenge.question}
              </h4>
            </div>

            {/* Options list */}
            {!hasSubmitted ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {challenge.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option)}
                      className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition-all hover:border-amber-400 hover:bg-amber-50/30 active:scale-[0.99] group cursor-pointer shadow-2xs"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-50 font-mono text-xs font-bold text-slate-700 group-hover:border-amber-500 group-hover:text-amber-800 group-hover:bg-amber-100">
                        {letter}
                      </span>
                      <div className="space-y-0.5">
                        <div className="font-heading text-xs font-bold text-slate-900">
                          {option.label}
                        </div>
                        <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                          {option.explanation}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Intuition Gap Analysis View */
              <div className="space-y-4 pt-1 animate-in fade-in duration-300">
                {/* Visual Gap Meter */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                      Thước đo Độ lệch Trực giác (Intuition Gap Meter)
                    </span>
                    <Badge variant={rating.badgeVariant} className="gap-1 font-mono text-[10px]">
                      {rating.tier === 'master' ? (
                        <Award className="h-3 w-3" />
                      ) : rating.tier === 'moderate' ? (
                        <Sparkles className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {rating.label}
                    </Badge>
                  </div>

                  {/* Dual Progress / Values */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">
                        Bạn đã dự đoán:
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="font-mono text-xl font-extrabold text-amber-700 tabular-nums">
                          {selectedOption ? (selectedOption.value * 100).toFixed(1) : 0}%
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          {selectedOption?.label}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">
                        Định lý Toán học Khách quan:
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="font-mono text-xl font-extrabold text-blue-700 tabular-nums">
                          {(challenge.theoreticalTruth * 100).toFixed(1)}%
                        </span>
                        <span className="text-xs text-blue-700 font-semibold font-mono">
                          Chuẩn xác
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Distance Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-500">
                      <span>0%</span>
                      <span className="text-slate-900 font-bold">
                        Khoảng cách sai lệch: Δ {gapPercentage.toFixed(1)}%
                      </span>
                      <span>100%</span>
                    </div>
                    <div className="relative h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 bg-blue-600 rounded-full transition-all duration-500"
                        style={{
                          left: `${Math.min(
                            (selectedOption?.value ?? 0) * 100,
                            challenge.theoreticalTruth * 100,
                          )}%`,
                          width: `${gapPercentage}%`,
                        }}
                      />
                      {/* Target line */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-blue-900 z-10"
                        style={{ left: `${challenge.theoreticalTruth * 100}%` }}
                        title={`Định lý: ${(challenge.theoreticalTruth * 100).toFixed(1)}%`}
                      />
                    </div>
                  </div>
                </div>

                {/* Cognitive Bias Breakdown */}
                <div className="rounded-xl bg-slate-100/70 border-l-4 border-blue-600 p-4 text-xs text-slate-700 space-y-2">
                  <div className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    Giải mã Tâm lý Nhận thức: {challenge.biasName}
                  </div>
                  <p className="font-sans leading-relaxed">{challenge.truthExplanation}</p>
                  <p className="font-sans text-slate-500 text-[11px]">
                    <strong>Bản chất cạm bẫy:</strong> {challenge.biasDescription}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

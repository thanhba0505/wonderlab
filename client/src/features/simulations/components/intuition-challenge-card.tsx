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
import { MathFraction } from './simulation-math-fraction';

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
      className={`rounded-xl border border-amber-300/85 bg-gradient-to-b from-amber-50/50 via-white to-white shadow-xs p-5 transition-all ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
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
              title="Bỏ qua phần khảo sát trực giác"
            >
              <FastForward className="h-3.5 w-3.5 text-slate-400" />
              Bỏ qua thử thách
            </Button>
          )}

          <Badge
            variant={hasSubmitted ? 'emerald' : isSkipped ? 'outline' : 'amber'}
            className="text-xs font-mono"
          >
            {hasSubmitted ? 'Đã dự đoán' : isSkipped ? 'Đã bỏ qua' : 'Khảo sát trước thực nghiệm'}
          </Badge>

          {(hasSubmitted || isSkipped) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetGuess}
              className="h-6 px-2 text-xs text-slate-500 hover:text-slate-900 font-mono gap-1"
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
                Bạn đã bỏ qua phần khảo sát trực giác. Bạn có thể tự do thao tác các thông số và
                khảo sát dữ liệu trên buồng thí nghiệm.
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
                        <p className="text-xs text-slate-500 font-sans leading-relaxed">
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
                {/* Visual Gap Meter - Không đóng khung bao ngoài, hiển thị phẳng trực tiếp */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                      Thước đo Độ lệch Trực giác (Intuition Gap Meter)
                    </span>
                    <Badge variant={rating.badgeVariant} className="gap-1 font-mono text-xs">
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

                  {/* Dual Progress / Values: 2 ô cùng 1 màu xanh đồng nhất */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="rounded-lg bg-blue-50/60 p-3 border border-blue-200/70 shadow-2xs">
                      <span className="text-xs font-mono text-blue-800 uppercase block font-semibold">
                        Bạn đã dự đoán:
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="font-mono text-xl font-extrabold text-blue-700 tabular-nums">
                          {selectedOption ? (selectedOption.value * 100).toFixed(1) : 0}%
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          {selectedOption?.label}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-blue-50/60 p-3 border border-blue-200/70 shadow-2xs">
                      <span className="text-xs font-mono text-blue-800 uppercase block font-semibold">
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
                    <div className="flex justify-between text-xs font-mono text-slate-500">
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

                {/* Cognitive Bias Breakdown - Bỏ khung, dùng divider ngăn cách nhẹ */}
                <div className="border-t border-slate-200/80 pt-4 text-xs text-slate-700 space-y-2.5">
                  <div className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600" />
                    Giải mã Tâm lý Nhận thức: {challenge.biasName}
                  </div>
                  <p className="font-sans leading-relaxed">{challenge.truthExplanation}</p>

                  {/* Khối công thức giải mã toán học - Phân số trực quan, không dùng 1 line */}
                  <div className="rounded-lg bg-amber-50/30 border border-amber-200/50 p-2.5 font-mono text-xs text-slate-800">
                    {simulationSlug === 'birthday-paradox' && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-amber-900">P(Trùng)</span>
                        <span>=</span>
                        <span>1 &minus;</span>
                        <span className="inline-flex items-center">
                          <span className="text-sm font-light text-slate-400 -mt-0.5">(</span>
                          <MathFraction numerator="364" denominator="365" className="text-xs" />
                          <span className="text-slate-400">&times;</span>
                          <MathFraction numerator="363" denominator="365" className="text-xs" />
                          <span className="text-slate-400">&times; &hellip; &times;</span>
                          <MathFraction numerator="343" denominator="365" className="text-xs" />
                          <span className="text-sm font-light text-slate-400 -mt-0.5">)</span>
                        </span>
                        <span>&asymp;</span>
                        <span className="font-bold text-blue-700">50.73%</span>
                        <span className="text-slate-500 font-sans text-xs ml-1">
                          (tại n = 23, có 253 cặp đối sánh)
                        </span>
                      </div>
                    )}

                    {simulationSlug === 'monty-hall' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-blue-900">P(Thắng | Đổi)</span>
                        <span>=</span>
                        <span>1 &minus;</span>
                        <MathFraction numerator="1" denominator="3" className="text-xs" />
                        <span>=</span>
                        <MathFraction
                          numerator="2"
                          denominator="3"
                          className="text-xs font-bold text-blue-700"
                        />
                        <span className="text-slate-400">&asymp;</span>
                        <span className="font-bold text-blue-700">66.67%</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600">P(Thắng | Giữ) =</span>
                        <MathFraction numerator="1" denominator="3" className="text-xs" />
                        <span className="text-slate-400">&asymp; 33.33%</span>
                      </div>
                    )}

                    {simulationSlug === 'double-slit' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-blue-900">|&Psi;&rang;</span>
                        <span>=</span>
                        <MathFraction numerator="1" denominator="&radic;2" className="text-xs" />
                        <span>(|Khe 1&rang; + |Khe 2&rang;)</span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-blue-900">i = &Delta;y</span>
                        <span>=</span>
                        <MathFraction
                          numerator="&lambda; &middot; D"
                          denominator="d"
                          className="text-xs font-bold text-blue-700"
                        />
                      </div>
                    )}

                    {simulationSlug === 'prisoners-dilemma' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-amber-800">
                          T (5) &gt; R (3) &gt; P (1) &gt; S (0)
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-blue-900">w</span>
                        <span>&ge;</span>
                        <MathFraction
                          numerator="T &minus; R"
                          denominator="T &minus; P"
                          className="text-xs"
                        />
                        <span>=</span>
                        <MathFraction
                          numerator="2"
                          denominator="4"
                          className="text-xs font-bold text-blue-700"
                        />
                        <span>=</span>
                        <span className="font-bold text-blue-700">0.5 (50%)</span>
                      </div>
                    )}

                    {simulationSlug === 'zeno-paradox' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-blue-900">T*</span>
                        <span>=</span>
                        <MathFraction
                          numerator="d₀"
                          denominator="v_A &minus; v_T"
                          className="text-xs"
                        />
                        <span>=</span>
                        <MathFraction
                          numerator="100"
                          denominator="10 &minus; 1"
                          className="text-xs"
                        />
                        <span>=</span>
                        <MathFraction
                          numerator="100"
                          denominator="9"
                          className="text-xs font-bold text-blue-700"
                        />
                        <span>&asymp;</span>
                        <span className="font-bold text-blue-700">11.11 s</span>
                      </div>
                    )}

                    {simulationSlug === 'art-gallery' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-blue-900">g(n)</span>
                        <span>=</span>
                        <span className="font-bold text-emerald-700">&lfloor;</span>
                        <MathFraction numerator="n" denominator="3" className="text-xs" />
                        <span className="font-bold text-emerald-700">&rfloor;</span>
                        <span>=</span>
                        <span className="font-bold text-emerald-700">
                          Tối đa &lfloor;n/3&rfloor; lính gác
                        </span>
                      </div>
                    )}

                    {simulationSlug === 'prisoners-hats' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-blue-900">P(Đoán đúng)</span>
                        <span>&ge;</span>
                        <MathFraction numerator="n &minus; 1" denominator="n" className="text-xs" />
                        <span>=</span>
                        <span className="font-bold text-emerald-700">
                          Bảo đảm chắc chắn 9 / 10 người (90% - 95%)
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="font-sans text-slate-500 text-xs">
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

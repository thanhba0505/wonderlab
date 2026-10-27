'use client';

import * as React from 'react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Award,
  FastForward,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimulationHypothesis, SimulationHypothesisOption } from '../types';
import { calculateIntuitionGap, getIntuitionRating } from '../utils/intuition-math';
import { MathFraction } from './simulation-math-fraction';
import { useTranslation } from '@/i18n';

interface IntuitionChallengeCardProps {
  simulationSlug: string;
  challenge: SimulationHypothesis;
  onPredictionSelected?: (option: SimulationHypothesisOption, gap: number) => void;
  onGuessSubmitted?: (option: SimulationHypothesisOption, gap: number) => void;
  onResetGuess?: () => void;
  className?: string;
}

export function IntuitionChallengeCard({
  simulationSlug,
  challenge,
  onPredictionSelected,
  onGuessSubmitted,
  onResetGuess,
  className = '',
}: IntuitionChallengeCardProps) {
  const { dict } = useTranslation();
  const ch = dict.simulations.challenge;
  const storageKey = `wonderlab_intuition_${simulationSlug}`;
  const skipStorageKey = `wonderlab_intuition_skipped_${simulationSlug}`;

  const [selectedOption, setSelectedOption] = React.useState<SimulationHypothesisOption | null>(
    null,
  );
  const [hasSubmitted, setHasSubmitted] = React.useState<boolean>(false);
  const [isSkipped, setIsSkipped] = React.useState<boolean>(false);

  // Restore previous submission from localStorage on mount
  React.useEffect(() => {
    try {
      const skippedStored = localStorage.getItem(skipStorageKey);
      if (skippedStored === 'true') {
        setIsSkipped(true);
        return;
      }

      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as SimulationHypothesisOption;
        setSelectedOption(parsed);
        setHasSubmitted(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey, skipStorageKey]);

  const handleSelectOption = (option: SimulationHypothesisOption) => {
    setSelectedOption(option);
    setHasSubmitted(true);
    setIsSkipped(false);

    try {
      localStorage.setItem(storageKey, JSON.stringify(option));
      localStorage.removeItem(skipStorageKey);
    } catch {
      // Ignore
    }

    const gap = calculateIntuitionGap(option.value, challenge.theoreticalTruth);
    if (onPredictionSelected) {
      onPredictionSelected(option, gap);
    }
    if (onGuessSubmitted) {
      onGuessSubmitted(option, gap);
    }
  };

  const handleSkip = () => {
    setIsSkipped(true);
    setHasSubmitted(false);
    setSelectedOption(null);
    try {
      localStorage.setItem(skipStorageKey, 'true');
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  };

  const handleResetGuess = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setIsSkipped(false);
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(skipStorageKey);
    } catch {
      // Ignore
    }
    if (onResetGuess) {
      onResetGuess();
    }
  };

  const gap = selectedOption
    ? calculateIntuitionGap(selectedOption.value, challenge.theoreticalTruth)
    : 0;
  const rating = getIntuitionRating(gap, ch);
  const gapPercentage = gap * 100;
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
              {ch.intuition_challenge_title}
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
              title={ch.skip_survey}
            >
              <FastForward className="h-3.5 w-3.5 text-slate-400" />
              {ch.skip_challenge}
            </Button>
          )}

          <Badge
            variant={hasSubmitted ? 'emerald' : isSkipped ? 'outline' : 'amber'}
            className="text-xs font-mono"
          >
            {hasSubmitted ? ch.status_completed : isSkipped ? ch.status_skipped : ch.status_active}
          </Badge>

          {(hasSubmitted || isSkipped) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetGuess}
              className="h-6 px-2 text-xs text-slate-500 hover:text-slate-900 font-mono gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              {ch.guess_again}
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
              <span>{ch.skipped_notice}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetGuess}
              className="h-7 text-xs font-mono border-slate-300 bg-white hover:bg-slate-50 text-slate-700 whitespace-nowrap"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              {ch.retry_challenge}
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
                {/* Visual Gap Meter */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                      {ch.gap_meter_label}
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

                  {/* Dual Progress / Values */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="rounded-lg bg-blue-50/60 p-3 border border-blue-200/70 shadow-2xs">
                      <span className="text-xs font-mono text-blue-800 uppercase block font-semibold">
                        {ch.your_prediction}
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
                        {ch.objective_truth}
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="font-mono text-xl font-extrabold text-blue-700 tabular-nums">
                          {(challenge.theoreticalTruth * 100).toFixed(1)}%
                        </span>
                        <span className="text-xs text-blue-700 font-semibold font-mono">
                          {ch.exact_badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Distance Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-mono text-slate-500">
                      <span>0%</span>
                      <span className="text-slate-900 font-bold">
                        {ch.deviation_gap} {gapPercentage.toFixed(1)}%
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
                        title={`${ch.truth_label}: ${(challenge.theoreticalTruth * 100).toFixed(1)}%`}
                      />
                    </div>
                  </div>
                </div>

                {/* Cognitive Bias Breakdown */}
                <div className="border-t border-slate-200/80 pt-4 text-xs text-slate-700 space-y-2.5">
                  <div className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600" />
                    {ch.cognitive_bias_breakdown} {challenge.biasName}
                  </div>
                  <p className="font-sans leading-relaxed">{challenge.truthExplanation}</p>

                  {/* Formula Breakdown */}
                  <div className="rounded-lg bg-amber-50/30 border border-amber-200/50 p-2.5 font-mono text-xs text-slate-800">
                    {simulationSlug === 'birthday-paradox' && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-amber-900">
                          {dict.simulations.math_card.birthday_p_collision}
                        </span>
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
                      </div>
                    )}

                    {simulationSlug === 'monty-hall' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-blue-900">
                          {dict.simulations.math_card.monty_hall_switch}
                        </span>
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
                      </div>
                    )}

                    {simulationSlug === 'double-slit' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-blue-900">|&Psi;&rang;</span>
                        <span>=</span>
                        <MathFraction numerator="1" denominator="&radic;2" className="text-xs" />
                        <span>(|&Psi;₁&rang; + |&Psi;₂&rang;)</span>
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
                          {dict.simulations.math_card.art_gallery_chvatal}
                        </span>
                      </div>
                    )}

                    {simulationSlug === 'prisoners-hats' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-blue-900">
                          {dict.simulations.math_card.prisoners_hats_survival}
                        </span>
                        <span>&ge;</span>
                        <MathFraction numerator="n &minus; 1" denominator="n" className="text-xs" />
                        <span>=</span>
                        <span className="font-bold text-emerald-700">
                          {dict.simulations.math_card.prisoners_hats_expected}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="font-sans text-slate-500 text-xs">
                    <strong>{ch.bias_nature}</strong> {challenge.biasDescription}
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

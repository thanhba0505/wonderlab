'use client';

import * as React from 'react';
import { getPalette, evaluateUserGuess, UserEvaluationResult } from '../hat-puzzle-math';
import { Button } from '@/components/ui/button';
import {
  UserCheck,
  Eye,
  Sparkles,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  Heart,
  Users,
} from 'lucide-react';
import { useTranslation } from '@/i18n';
import { useHatSound } from '../utils/hat-audio';
import { cn } from '@/lib/utils';

interface RoleplayControllerProps {
  n: number;
  colorCount: 2 | 3;
  actualHats: number[];
  rolePlayPosition: number;
  onSelectPosition: (pos: number) => void;
  isMyTurn: boolean;
  hasUserGuessed: boolean;
  userGuessedColor: number | null;
  onUserSubmitGuess: (color: number) => void;
  onResetChallenge: () => void;
  className?: string;
}

export function RoleplayController({
  n,
  colorCount,
  actualHats,
  rolePlayPosition,
  onSelectPosition,
  isMyTurn,
  hasUserGuessed,
  userGuessedColor,
  onUserSubmitGuess,
  onResetChallenge,
  className = '',
}: RoleplayControllerProps) {
  const { dict } = useTranslation();
  const t = dict.sim_prisoners_hats;
  const [showHint, setShowHint] = React.useState<boolean>(false);
  const [showScratchpad, setShowScratchpad] = React.useState<boolean>(false);
  const [scratchpadOffset, setScratchpadOffset] = React.useState<number>(0);

  const { playSuccess, playMistakeFeedback, playHeartbeatPulse } = useHatSound();
  const palette = getPalette(colorCount);

  // Trigger heartbeat when it's the user's turn
  React.useEffect(() => {
    if (isMyTurn && !hasUserGuessed) {
      playHeartbeatPulse();
    }
  }, [isMyTurn, hasUserGuessed, playHeartbeatPulse]);

  // Compute evaluation when user has made a guess
  const evalResult: UserEvaluationResult | null = React.useMemo(() => {
    if (userGuessedColor === null) return null;
    return evaluateUserGuess(rolePlayPosition, userGuessedColor, actualHats, colorCount);
  }, [rolePlayPosition, userGuessedColor, actualHats, colorCount]);

  // Handle submit guess with audio feedback
  const handleGuess = (colorId: number) => {
    onUserSubmitGuess(colorId);
    const result = evaluateUserGuess(rolePlayPosition, colorId, actualHats, colorCount);
    if (result.isCorrect) {
      playSuccess(1.1);
    } else {
      playMistakeFeedback();
    }
  };

  // Compute visible hats in front for helper display
  const seenHatsAhead = React.useMemo(() => {
    const hatsAhead: number[] = [];
    for (let i = 0; i < rolePlayPosition - 1; i++) {
      hatsAhead.push(actualHats[i] ?? 0);
    }
    return hatsAhead;
  }, [rolePlayPosition, actualHats]);

  const seenBlackCount = seenHatsAhead.filter(h => h === 1).length;
  const seenSumTotal = seenHatsAhead.reduce((acc, h) => acc + h, 0);

  return (
    <div
      className={cn(
        'rounded-xl border border-indigo-200/90 bg-indigo-50/30 p-4 sm:p-5 space-y-4 shadow-2xs',
        className,
      )}
    >
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100/80 text-indigo-700">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
              {t.roleplay_panel_title}
            </h3>
            <p className="text-xs text-slate-500 font-sans">{t.roleplay_panel_desc}</p>
          </div>
        </div>

        <div>
          {isMyTurn && !hasUserGuessed ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse">
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
              <span>Đến lượt bạn</span>
            </span>
          ) : (
            <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              {hasUserGuessed ? 'Đã dự đoán' : 'Đang chờ lượt'}
            </span>
          )}
        </div>
      </div>

      {/* 2. Position Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-slate-700 font-semibold flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-indigo-600" />
            <span>{t.select_position}</span>
          </span>
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
            Người #{rolePlayPosition} {rolePlayPosition === n ? '(Hy sinh)' : ''}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {Array.from({ length: n }, (_, i) => i + 1).map(pos => (
            <button
              key={pos}
              type="button"
              onClick={() => {
                onSelectPosition(pos);
                setShowHint(false);
              }}
              className={cn(
                'h-8 w-8 sm:h-8 sm:w-9 rounded-lg font-mono text-xs font-bold transition-all border text-center flex items-center justify-center',
                rolePlayPosition === pos
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-105'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
              )}
            >
              #{pos}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Observation Field (Hats in front) */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            <span>{t.hats_visible_in_front}</span>
          </span>
          <span className="font-mono text-xs font-semibold text-slate-700">
            {seenHatsAhead.length} {t.people_unit || 'người'}
          </span>
        </div>

        {seenHatsAhead.length === 0 ? (
          <p className="text-xs italic text-slate-400 py-1">{t.nobody_ahead}</p>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {seenHatsAhead.map((color, idx) => {
              const meta = palette.find(c => c.id === color) ?? palette[0]!;
              return (
                <span
                  key={idx}
                  className="inline-flex items-center justify-center h-6 min-w-7 px-1.5 rounded-md border text-xs font-mono font-bold shadow-2xs"
                  style={{
                    backgroundColor: meta.bgHex,
                    borderColor: meta.id === 0 ? '#cbd5e1' : '#172554',
                    color: meta.textHex,
                  }}
                  title={t.person_tooltip
                    .replace('{id}', String(idx + 1))
                    .replace('{label}', meta.label)}
                >
                  #{idx + 1}:{meta.id}
                </span>
              );
            })}
          </div>
        )}

        {seenHatsAhead.length > 0 && (
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
            <span>
              {colorCount === 2
                ? `Σ Mũ đậm = ${seenBlackCount}`
                : `Tổng mod 3 = ${seenSumTotal % 3}`}
            </span>
            <span className="font-sans text-slate-500">
              {colorCount === 2
                ? `(mod 2 = ${seenBlackCount % 2} → ${seenBlackCount % 2 === 0 ? 'Chẵn' : 'Lẻ'})`
                : `(mod 3 = ${seenSumTotal % 3})`}
            </span>
          </div>
        )}
      </div>

      {/* 4. Decision & Guessing Section */}
      <div className="space-y-2.5 pt-1">
        {!hasUserGuessed ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading flex items-center gap-1.5">
                {isMyTurn ? (
                  <>
                    <Heart className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                    <span className="text-rose-700">Đến lượt bạn chọn màu mũ:</span>
                  </>
                ) : (
                  <span className="text-slate-600">{t.waiting_turn_prompt}</span>
                )}
              </span>

              <div className="flex items-center gap-1">
                {/* Scratchpad Toggle Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScratchpad(prev => !prev)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 h-7 px-2 border-indigo-200 bg-white"
                >
                  <Calculator className="mr-1 h-3.5 w-3.5 text-indigo-500" />
                  {showScratchpad ? 'Đóng nháp' : 'Nháp tính'}
                </Button>

                {/* Hint Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(prev => !prev)}
                  className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2"
                >
                  <Lightbulb className="mr-1 h-3.5 w-3.5 text-amber-500" />
                  {showHint ? t.hide_hint : 'Gợi ý'}
                </Button>
              </div>
            </div>

            {/* Interactive Scratchpad Calculator */}
            {showScratchpad && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-950 space-y-2 animate-in fade-in-0 duration-200">
                <div className="font-semibold flex items-center gap-1 text-indigo-900">
                  <Calculator className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{t.scratchpad_title}</span>
                </div>
                <p className="text-indigo-800 leading-relaxed font-sans">{t.scratchpad_desc}</p>
                <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded border border-indigo-100 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-sans">{t.scratchpad_sum_label}:</span>
                    <strong className="text-slate-800 text-sm">
                      {colorCount === 2 ? seenBlackCount : seenSumTotal}
                    </strong>
                  </div>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-sans">{t.scratchpad_parity_result}:</span>
                    <strong className="text-indigo-700 text-sm">
                      {colorCount === 2 ? seenBlackCount % 2 : seenSumTotal % 3}
                    </strong>
                  </div>
                  {rolePlayPosition < n && (
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-xs text-slate-500 font-sans">Thử trừ nhẩm:</span>
                      <button
                        type="button"
                        onClick={() => setScratchpadOffset(prev => (prev + 1) % colorCount)}
                        className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold hover:bg-indigo-200"
                      >
                        (S - {colorCount === 2 ? seenBlackCount % 2 : seenSumTotal % 3} +{' '}
                        {scratchpadOffset}) mod {colorCount}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hint Box */}
            {showHint && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 space-y-1.5 animate-in fade-in-0 duration-200 font-sans">
                <div className="font-semibold flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>{t.deduction_tip_title}</span>
                </div>
                {rolePlayPosition === n ? (
                  <p>{colorCount === 2 ? t.tip_sacrifice_2 : t.tip_sacrifice_3}</p>
                ) : (
                  <p>{t.tip_deduction_formula.replace('{k}', String(colorCount))}</p>
                )}
              </div>
            )}

            {/* Guessing Buttons */}
            <div className={cn('grid gap-2', colorCount === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
              {palette.map(color => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => handleGuess(color.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 px-3 font-sans text-xs font-bold text-slate-800 shadow-2xs transition-all hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-xs active:scale-[0.98]"
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border shrink-0"
                    style={{
                      backgroundColor: color.bgHex,
                      borderColor: color.id === 0 ? '#cbd5e1' : '#172554',
                    }}
                  />
                  <span className="truncate">
                    {color.label} ({color.id})
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Feedback Result After Guessing */
          <div className="space-y-3 animate-in zoom-in-95 duration-200">
            {evalResult?.isCorrect ? (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50/80 p-3.5 text-emerald-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{t.congrats_correct}</span>
                </div>
                <p className="text-xs text-emerald-800 font-sans leading-relaxed">
                  {evalResult.explanation}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-rose-300 bg-rose-50/80 p-3.5 text-rose-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{t.oops_incorrect}</span>
                </div>
                <p className="text-xs text-rose-800 font-sans leading-relaxed">
                  {evalResult?.explanation}
                </p>
              </div>
            )}

            {/* Try Again Button */}
            <div className="flex justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onResetChallenge}
                className="text-xs border-slate-300 hover:bg-slate-100 h-8"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                {t.try_again_btn}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

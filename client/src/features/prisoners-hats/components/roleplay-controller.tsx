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
} from 'lucide-react';

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
}: RoleplayControllerProps) {
  const [showHint, setShowHint] = React.useState<boolean>(false);
  const palette = getPalette(colorCount);

  // Compute evaluation when user has made a guess
  const evalResult: UserEvaluationResult | null = React.useMemo(() => {
    if (userGuessedColor === null) return null;
    return evaluateUserGuess(rolePlayPosition, userGuessedColor, actualHats, colorCount);
  }, [rolePlayPosition, userGuessedColor, actualHats, colorCount]);

  // Compute visible hats in front for helper display
  const seenHatsAhead = React.useMemo(() => {
    const hatsAhead: number[] = [];
    for (let i = 0; i < rolePlayPosition - 1; i++) {
      hatsAhead.push(actualHats[i] ?? 0);
    }
    return hatsAhead;
  }, [rolePlayPosition, actualHats]);

  const seenBlackCount = seenHatsAhead.filter(h => h === 1).length;

  return (
    <div className="rounded-xl border border-slate-300/85 bg-white p-4 sm:p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-slate-900">
              Chế Độ Nhập Vai: Bạn Đang Đứng Trong Hàng
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Mũ của bạn bị giấu kín. Dựa vào quan sát và câu hô của đồng đội để tự suy luận!
            </p>
          </div>
        </div>

        {/* Position Selector */}
        <div className="flex items-center gap-1.5 text-xs font-sans">
          <span className="text-slate-500 font-medium">Chọn vị trí của bạn:</span>
          <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
            {Array.from({ length: n }, (_, i) => i + 1).map(pos => (
              <button
                key={pos}
                type="button"
                onClick={() => {
                  onSelectPosition(pos);
                  setShowHint(false);
                }}
                className={`h-7 w-7 rounded-md font-mono text-xs font-semibold transition-all ${
                  rolePlayPosition === pos
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                #{pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roleplay Situation Card */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Vị trí của bạn:{' '}
              <span className="text-blue-700 font-bold">Người #{rolePlayPosition}</span>
            </span>
            {rolePlayPosition === n && (
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium text-xs">
                Người hy sinh phát tín hiệu Parity
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>
              Phía trước nhìn thấy: <strong>{seenHatsAhead.length} người</strong>
            </span>
          </div>
        </div>

        {/* Visible hats summary */}
        <div className="text-xs text-slate-600 font-sans flex flex-wrap items-center gap-2 bg-white p-2.5 rounded border border-slate-200">
          <span className="text-slate-500">Mũ bạn nhìn thấy phía trước:</span>
          {seenHatsAhead.length === 0 ? (
            <span className="italic text-slate-400">
              Không có ai phía trước (bạn là người đầu hàng #1).
            </span>
          ) : (
            <div className="flex items-center gap-1">
              {seenHatsAhead.map((color, idx) => {
                const meta = palette.find(c => c.id === color) ?? palette[0]!;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center justify-center h-5 w-6 rounded border text-xs font-mono font-bold shadow-2xs"
                    style={{
                      backgroundColor: meta.bgHex,
                      borderColor: meta.id === 0 ? '#cbd5e1' : '#0f172a',
                      color: meta.textHex,
                    }}
                    title={`Người #${idx + 1}: ${meta.label}`}
                  >
                    {meta.id}
                  </span>
                );
              })}
              {colorCount === 2 && (
                <span className="ml-2 font-mono text-slate-700">
                  (&Sigma; Đen = {seenBlackCount}, mod 2 = {seenBlackCount % 2})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Decision Section */}
      <div className="space-y-3 pt-1">
        {!hasUserGuessed ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
                {isMyTurn
                  ? '🎯 Đã đến lượt bạn! Hãy bấm chọn màu mũ của mình:'
                  : 'Đang chờ đến lượt bạn trong hàng...'}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(prev => !prev)}
                className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2"
              >
                <Lightbulb className="mr-1 h-3.5 w-3.5 text-amber-500" />
                {showHint ? 'Ẩn gợi ý' : 'Mở sổ tay gợi ý'}
              </Button>
            </div>

            {/* Hint Box */}
            {showHint && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 space-y-1.5 animate-fade-in font-sans">
                <div className="font-semibold flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  Mẹo suy luận:
                </div>
                {rolePlayPosition === n ? (
                  <p>
                    Bạn là người cuối hàng! Hãy đếm tổng số mũ {colorCount === 2 ? 'Đen' : ''} phía
                    trước. Nếu số lượng là{' '}
                    {colorCount === 2
                      ? 'Chẵn thì hô Trắng (0), Lẻ thì hô Đen (1)'
                      : 'tính tổng mod 3 và hô màu tương ứng'}
                    .
                  </p>
                ) : (
                  <p>
                    Lấy Parity kỳ vọng hiện tại (do người trước để lại) trừ đi tổng mũ bạn thấy
                    trước mặt mod {colorCount}. Kết quả chính là màu mũ của bạn!
                  </p>
                )}
              </div>
            )}

            {/* Guessing Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {palette.map(color => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onUserSubmitGuess(color.id)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 px-4 font-sans text-xs sm:text-sm font-bold text-slate-800 shadow-xs transition-all hover:border-blue-500 hover:bg-blue-50/40 active:scale-[0.98]"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-slate-400 shadow-2xs"
                    style={{ backgroundColor: color.bgHex }}
                  />
                  <span>
                    Đoán Mũ {color.label.toUpperCase()} ({color.id})
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Result Feedback Card */
          evalResult && (
            <div
              className={`rounded-xl border p-4 space-y-3 animate-scale-in ${
                evalResult.isCorrect
                  ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950'
                  : 'border-rose-300 bg-rose-50/80 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {evalResult.isCorrect ? (
                    <div className="p-1 rounded-full bg-emerald-200 text-emerald-800">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="p-1 rounded-full bg-rose-200 text-rose-800">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  )}
                  <h4 className="font-heading text-sm font-bold">
                    {evalResult.isCorrect
                      ? 'Chúc Mừng! Bạn Đã Đoán Chính Xác'
                      : 'Rất Tiếc! Kết Quả Chưa Đúng'}
                  </h4>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResetChallenge}
                  className="border-slate-300 bg-white text-xs h-7 gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Thử lại ván mới
                </Button>
              </div>

              <div className="text-xs space-y-1 font-sans leading-relaxed">
                <p>
                  <strong>Lựa chọn của bạn:</strong> Mũ {evalResult.userGuessLabel} |{' '}
                  <strong>Mũ thực tế:</strong> Mũ {evalResult.optimalLabel}
                </p>
                <p className="pt-1">{evalResult.explanation}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

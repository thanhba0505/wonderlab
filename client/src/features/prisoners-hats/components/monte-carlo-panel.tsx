'use client';

import * as React from 'react';
import { MonteCarloSummary, runMonteCarloSimulations } from '../hat-puzzle-math';
import { Button } from '@/components/ui/button';
import { Activity, PlayCircle, ShieldCheck, Flame, Cpu } from 'lucide-react';

interface MonteCarloPanelProps {
  n: number;
  colorCount: 2 | 3;
  onRunFinished?: (summary: MonteCarloSummary) => void;
}

export function MonteCarloPanel({ n, colorCount, onRunFinished }: MonteCarloPanelProps) {
  const [isRunning, setIsRunning] = React.useState<boolean>(false);
  const [summary, setSummary] = React.useState<MonteCarloSummary | null>(() => {
    return runMonteCarloSimulations(n, colorCount, 1000);
  });

  const handleRun = (trials: number) => {
    setIsRunning(true);
    // Use requestAnimationFrame / timeout to avoid blocking main thread
    setTimeout(() => {
      const result = runMonteCarloSimulations(n, colorCount, trials);
      setSummary(result);
      setIsRunning(false);
      if (onRunFinished) {
        onRunFinished(result);
      }
    }, 50);
  };

  return (
    <div className="rounded-xl border border-slate-300/85 bg-white p-4 sm:p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-slate-900">
              Kiểm Định Thực Nghiệm Monte Carlo
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Kiểm chứng sự hội tụ thống kê quy mô lớn qua hàng nghìn ván ngẫu nhiên
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={isRunning}
            onClick={() => handleRun(100)}
            className="text-xs h-7 border-slate-300 text-slate-700"
          >
            100 Ván
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isRunning}
            onClick={() => handleRun(1000)}
            className="text-xs h-7 border-slate-300 text-slate-700"
          >
            1.000 Ván
          </Button>
          <Button
            size="sm"
            disabled={isRunning}
            onClick={() => handleRun(5000)}
            className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
          >
            <PlayCircle className="h-3 w-3" />
            5.000 Ván
          </Button>
        </div>
      </div>

      {summary && (
        <div className="space-y-4">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Metric 1: Overall Survival */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-blue-600" />
                Tỷ lệ sống sót toàn đoàn:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                  {(summary.overallAccuracy * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  (Lý thuyết: {(summary.expectedTheoreticalAccuracy * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${summary.overallAccuracy * 100}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Guaranteed Group (N-1) */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 space-y-1">
              <span className="text-xs text-emerald-800 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Nhóm {n - 1} người bảo đảm:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-700">
                  {(summary.guaranteedGroupAccuracy * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-emerald-600 font-mono">(Bảo đảm 100%)</span>
              </div>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${summary.guaranteedGroupAccuracy * 100}%` }}
                />
              </div>
            </div>

            {/* Metric 3: Sacrifice Person */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-1">
              <span className="text-xs text-amber-800 font-medium flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-amber-600" />
                Người hy sinh (#{n}):
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl sm:text-2xl font-bold text-amber-800">
                  {(summary.sacrificeAccuracy * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-amber-700 font-mono">
                  (May mắn 1/{colorCount} = {((1 / colorCount) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${summary.sacrificeAccuracy * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Statistical Breakdown Note */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1 font-sans leading-relaxed">
            <p>
              <strong>Tổng kết mẫu thử:</strong> Đã chạy thực nghiệm mô phỏng{' '}
              <strong>{summary.trials.toLocaleString()} ván</strong> với tổng cộng{' '}
              <strong>{summary.totalPrisoners.toLocaleString()} lượt đoán</strong>.
            </p>
            <p className="text-slate-500">
              Dù màu mũ được xáo trộn hoàn toàn ngẫu nhiên ở mỗi vòng, nhóm {n - 1} người luôn đạt
              độ chính xác tuyệt đối 100% nhờ vào thuật toán kiểm tra tính chẵn lẻ modulo{' '}
              {colorCount}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

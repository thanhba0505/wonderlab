'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sliders, Play, Square, Flame, Sparkles, RotateCcw, Activity, Layers } from 'lucide-react';
import { useTranslation } from '@/i18n';

export interface ControlsDeckProps {
  isSimulatingBatch: boolean;
  workerProgress: number;
  completedTrials: number;
  targetBatchCount: number;
  totalGames: number;
  onSimulateBatch: (batchCount: number) => void;
  onAbortBatch: () => void;
  onResetStats: () => void;
}

export const ControlsDeck: React.FC<ControlsDeckProps> = ({
  isSimulatingBatch,
  workerProgress,
  completedTrials,
  targetBatchCount,
  totalGames,
  onSimulateBatch,
  onAbortBatch,
  onResetStats,
}) => {
  const { locale, dict } = useTranslation();
  const mDict = dict.sim_monty_hall;

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Header Khối Điều khiển */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-blue-600" />
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
            {dict.simulations.parameters}
          </h3>
        </div>
      </div>

      {/* 2. Thao tác Monte Carlo Hàng Loạt */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span>{mDict.monte_carlo_title}</span>
          </div>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">{mDict.sim_desc}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {isSimulatingBatch ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAbortBatch}
              className="col-span-2 h-8 text-xs font-semibold border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 shadow-2xs active:scale-[0.98]"
            >
              <Square className="h-3.5 w-3.5 mr-1.5 fill-current text-rose-600" />
              <span>{mDict.stop_cancel}</span>
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSimulateBatch(1000)}
                className="h-8 text-xs font-semibold border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100 shadow-2xs active:scale-[0.98]"
              >
                <Play className="h-3 w-3 mr-1 text-blue-600" />
                <span>{mDict.batch_1000}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSimulateBatch(10000)}
                className="h-8 text-xs font-semibold border-amber-200 bg-amber-50/70 text-amber-800 hover:bg-amber-100 shadow-2xs active:scale-[0.98]"
              >
                <Flame className="h-3 w-3 mr-1 text-amber-600" />
                <span>{mDict.batch_10000}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSimulateBatch(50000)}
                className="h-8 text-xs font-semibold border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-[0.98]"
              >
                <Sparkles className="h-3 w-3 mr-1 text-violet-600" />
                <span>{mDict.batch_50000}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSimulateBatch(100000)}
                className="h-8 text-xs font-semibold border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 shadow-2xs active:scale-[0.98]"
              >
                <Play className="h-3 w-3 mr-1 text-emerald-600" />
                <span>{mDict.batch_100000}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSimulateBatch(200000)}
                className="col-span-2 h-8 text-xs font-semibold border-purple-200 bg-purple-50/70 text-purple-800 hover:bg-purple-100 shadow-2xs active:scale-[0.98]"
              >
                <Sparkles className="h-3 w-3 mr-1 text-purple-600" />
                <span>{mDict.batch_200000}</span>
              </Button>
            </>
          )}
        </div>

        {/* Thanh Tiến trình Mô phỏng */}
        {isSimulatingBatch && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-blue-50/80 border border-blue-200">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <Activity className="h-3.5 w-3.5 animate-pulse text-blue-600" />
                <span>{mDict.batch_progress}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-slate-700">
                <span className="font-bold text-blue-700">{workerProgress}%</span>
                <span>•</span>
                <span>
                  {completedTrials.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}/
                  {targetBatchCount.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-150 ease-out"
                style={{ width: `${workerProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Nút Đặt lại Thống kê */}
        {totalGames > 0 && !isSimulatingBatch && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetStats}
            className="w-full h-8 text-xs text-slate-500 hover:text-slate-900 px-2 font-mono border border-dashed border-slate-300 hover:border-slate-400 active:scale-[0.98]"
          >
            <RotateCcw className="h-3 w-3 mr-1.5" />
            <span>{mDict.reset_btn}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

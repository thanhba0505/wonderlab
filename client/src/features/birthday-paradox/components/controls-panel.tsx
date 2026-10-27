'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Activity, Dices, Play, RotateCcw, Sparkles, Square } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface ControlsPanelProps {
  n: number;
  onChangeN: (n: number) => void;
  onRandomizeRoom: () => void;
  onRunBatch: (trials: number) => void;
  onAbortBatch?: () => void;
  onReset: () => void;
  isSimulatingBatch: boolean;
  batchProgress?: number;
  completedTrials?: number;
  targetTrials?: number;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  n,
  onChangeN,
  onRandomizeRoom,
  onRunBatch,
  onAbortBatch,
  onReset,
  isSimulatingBatch,
  batchProgress = 0,
  completedTrials = 0,
  targetTrials = 0,
}) => {
  const { locale, dict } = useTranslation();
  const bDict = dict.sim_birthday;

  return (
    <div className="flex flex-col gap-4">
      {/* Thanh trượt tham số n */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="room-size-slider"
            className="text-xs font-bold tracking-wider text-slate-700 uppercase"
          >
            {bDict.population_label}
            <span className="font-mono text-base font-bold text-blue-600">{n}</span>
          </label>

          {/* Các mốc nhanh */}
          <div className="flex items-center gap-1.5">
            {[10, 23, 50, 70].map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeN(preset)}
                className={`rounded px-2 py-0.5 font-mono text-xs font-semibold transition-all ${
                  n === preset
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset}
                {preset === 23 && '★'}
              </button>
            ))}
          </div>
        </div>

        <input
          id="room-size-slider"
          type="range"
          min="2"
          max="100"
          value={n}
          onChange={e => onChangeN(parseInt(e.target.value, 10))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
        />

        <div className="flex justify-between font-mono text-xs text-slate-600">
          <span>{bDict.preset_2}</span>
          <span className="text-amber-600 font-bold">{bDict.preset_23}</span>
          <span>{bDict.preset_50}</span>
          <span>{bDict.preset_100}</span>
        </div>
      </div>

      {/* Các nút hành động phòng lab */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        <Button
          onClick={onRandomizeRoom}
          disabled={isSimulatingBatch}
          className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white"
        >
          <Dices className="mr-1.5 h-4 w-4" />
          {bDict.run_1_room}
        </Button>

        {isSimulatingBatch ? (
          <Button
            variant="outline"
            onClick={onAbortBatch}
            className="border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 active:scale-[0.98]"
          >
            <Square className="mr-1.5 h-3.5 w-3.5 fill-current text-red-600" />
            {bDict.stop_cancel}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => onRunBatch(10000)}
              className="border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
            >
              <Play className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
              {bDict.run_10000_rooms}
            </Button>

            <Button
              variant="outline"
              onClick={() => onRunBatch(50000)}
              className="border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
            >
              <Play className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
              {bDict.run_50000_rooms}
            </Button>

            <Button
              variant="outline"
              onClick={() => onRunBatch(100000)}
              className="border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
            >
              <Play className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
              {bDict.run_100000_rooms}
            </Button>

            <Button
              variant="outline"
              onClick={() => onRunBatch(200000)}
              className="border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-purple-600" />
              {bDict.run_200000_rooms}
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          onClick={onReset}
          disabled={isSimulatingBatch}
          className="ml-auto text-slate-500 hover:text-slate-800"
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          {bDict.reset}
        </Button>
      </div>

      {/* Lab Progress Bar */}
      {isSimulatingBatch && (
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-blue-50/70 border border-blue-200/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-800 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 animate-pulse text-blue-600" />
              {bDict.batch_progress}
            </span>
            <span className="font-mono tabular-nums font-bold text-blue-700">
              {batchProgress}% (
              {completedTrials.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')} /{' '}
              {targetTrials.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')} {bDict.rooms_unit})
            </span>
          </div>
          <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${batchProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

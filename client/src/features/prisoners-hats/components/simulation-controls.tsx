'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Dices,
  Users,
  Palette,
  FastForward,
  Sparkles,
} from 'lucide-react';

interface SimulationControlsProps {
  n: number;
  onChangeN: (newN: number) => void;
  colorCount: 2 | 3;
  onChangeColorCount: (count: 2 | 3) => void;
  mode: 'auto' | 'roleplay';
  onChangeMode: (mode: 'auto' | 'roleplay') => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepNext: () => void;
  onReset: () => void;
  onRandomize: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  isCompleted: boolean;
}

export function SimulationControls({
  n,
  onChangeN,
  colorCount,
  onChangeColorCount,
  mode,
  onChangeMode,
  isPlaying,
  onTogglePlay,
  onStepNext,
  onReset,
  onRandomize,
  playbackSpeed,
  onChangeSpeed,
  isCompleted,
}: SimulationControlsProps) {
  return (
    <div className="rounded-xl border border-slate-300/85 bg-white p-4 sm:p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
      {/* Top Row: Mode Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => onChangeMode('auto')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'auto'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chế độ Tự động &amp; Từng bước
          </button>
          <button
            type="button"
            onClick={() => onChangeMode('roleplay')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
              mode === 'roleplay'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Nhập vai Thử thách
          </button>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            onClick={onTogglePlay}
            disabled={isCompleted}
            className={`h-8 gap-1.5 text-xs font-semibold ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                Tạm dừng
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                {isCompleted ? 'Hoàn thành' : 'Phát tự động'}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onStepNext}
            disabled={isPlaying || isCompleted}
            className="h-8 gap-1 text-xs border-slate-300 text-slate-700"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Bước tiếp
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-8 gap-1 text-xs border-slate-300 text-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Đặt lại
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRandomize}
            className="h-8 gap-1 text-xs border-slate-300 text-slate-700"
          >
            <Dices className="h-3.5 w-3.5" />
            Đổi màu ngẫu nhiên
          </Button>
        </div>
      </div>

      {/* Parameter Settings Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs font-sans">
        {/* Param 1: Number of prisoners */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              Số lượng người (N):
            </span>
            <span className="font-mono text-blue-700 font-bold">{n} người</span>
          </label>
          <div className="flex items-center gap-1">
            {[3, 4, 6, 8, 10].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => onChangeN(val)}
                className={`flex-1 py-1 rounded text-xs font-mono font-medium border transition-all ${
                  n === val
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Param 2: Color Palette */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-indigo-600" />
              Không gian màu mũ:
            </span>
            <span className="font-mono text-slate-700 font-bold">K = {colorCount}</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChangeColorCount(2)}
              className={`flex-1 py-1 px-2 rounded text-xs font-medium border transition-all ${
                colorCount === 2
                  ? 'border-slate-900 bg-slate-900 text-white font-bold'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              2 Màu (Đen / Trắng)
            </button>
            <button
              type="button"
              onClick={() => onChangeColorCount(3)}
              className={`flex-1 py-1 px-2 rounded text-xs font-medium border transition-all ${
                colorCount === 3
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              3 Màu (Mod 3)
            </button>
          </div>
        </div>

        {/* Param 3: Playback Speed */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5">
              <FastForward className="h-3.5 w-3.5 text-slate-500" />
              Tốc độ diễn hoạt:
            </span>
            <span className="font-mono text-slate-600">{playbackSpeed}x</span>
          </label>
          <div className="flex items-center gap-1">
            {[0.5, 1, 1.5, 2].map(speed => (
              <button
                key={speed}
                type="button"
                onClick={() => onChangeSpeed(speed)}
                className={`flex-1 py-1 rounded text-xs font-mono font-medium border transition-all ${
                  playbackSpeed === speed
                    ? 'border-slate-800 bg-slate-800 text-white font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

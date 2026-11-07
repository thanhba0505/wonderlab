'use client';

import * as React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Shuffle,
  Eye,
  Activity,
  Sliders,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PresetScenario } from '../ants-math';

interface ControlDeckProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onRandomize: () => void;
  speedMultiplier: number;
  onSpeedChange: (speed: number) => void;
  antCount: number;
  onAntCountChange: (count: number) => void;
  selectedPreset: PresetScenario;
  onSelectPreset: (preset: PresetScenario) => void;
  isGhostMode: boolean;
  onToggleGhostMode: () => void;
  showSpacetime: boolean;
  onToggleSpacetime: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isCompleted: boolean;
}

export function ControlDeck({
  isPlaying,
  onTogglePlay,
  onStep,
  onReset,
  onRandomize,
  speedMultiplier,
  onSpeedChange,
  antCount,
  onAntCountChange,
  selectedPreset,
  onSelectPreset,
  isGhostMode,
  onToggleGhostMode,
  showSpacetime,
  onToggleSpacetime,
  soundEnabled,
  onToggleSound,
  isCompleted,
}: ControlDeckProps) {
  const speeds = [0.5, 1, 2, 5, 10];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-300/85 bg-white p-4 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]">
      {/* 1. Header & Presets */}
      <div className="flex flex-col gap-2.5 border-b border-slate-200/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-amber-600" />
          <h3 className="font-heading text-sm font-semibold text-slate-800">
            Bàn Điều Khiển Thí Nghiệm
          </h3>
        </div>

        {/* Danh sách kịch bản mẫu (Presets) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={selectedPreset === 'default-10' ? 'default' : 'outline'}
            onClick={() => onSelectPreset('default-10')}
            className={`h-7 px-2.5 text-xs font-mono transition-all ${
              selectedPreset === 'default-10'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            10 Kiến (Mặc định)
          </Button>

          <Button
            type="button"
            size="sm"
            variant={selectedPreset === 'classic-100' ? 'default' : 'outline'}
            onClick={() => onSelectPreset('classic-100')}
            className={`h-7 px-2.5 text-xs font-mono transition-all ${
              selectedPreset === 'classic-100'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            100 Kiến Chuẩn
          </Button>

          <Button
            type="button"
            size="sm"
            variant={selectedPreset === 'two-ant-duel' ? 'default' : 'outline'}
            onClick={() => onSelectPreset('two-ant-duel')}
            className={`h-7 px-2.5 text-xs font-mono transition-all ${
              selectedPreset === 'two-ant-duel'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Song Đấu (2 Kiến)
          </Button>

          <Button
            type="button"
            size="sm"
            variant={selectedPreset === 'worst-case' ? 'default' : 'outline'}
            onClick={() => onSelectPreset('worst-case')}
            className={`h-7 px-2.5 text-xs font-mono transition-all ${
              selectedPreset === 'worst-case'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Cực Đoan (~100s)
          </Button>

          <Button
            type="button"
            size="sm"
            variant={selectedPreset === 'symmetric-exit' ? 'default' : 'outline'}
            onClick={() => onSelectPreset('symmetric-exit')}
            className={`h-7 px-2.5 text-xs font-mono transition-all ${
              selectedPreset === 'symmetric-exit'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Đối Xứng (~50s)
          </Button>
        </div>
      </div>

      {/* 2. Primary Playback Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Nút Play/Pause & Step */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={onTogglePlay}
            disabled={isCompleted}
            className={`h-9 px-4 font-semibold text-xs transition-all active:scale-[0.98] ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="mr-1.5 h-3.5 w-3.5" />
                Tạm dừng
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                {isCompleted ? 'Hoàn thành' : 'Chạy mô phỏng'}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onStep}
            disabled={isPlaying || isCompleted}
            className="h-9 px-2.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            title="Nhảy bước thời gian +0.2s"
          >
            <StepForward className="h-3.5 w-3.5 mr-1" />
            +0.2s
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-9 px-2.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            title="Đặt lại về thời điểm t = 0"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Đặt lại
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRandomize}
            className="h-9 px-2.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            title="Sinh vị trí và hướng ngẫu nhiên mới"
          >
            <Shuffle className="h-3.5 w-3.5 mr-1" />
            Ngẫu nhiên
          </Button>
        </div>

        {/* Nút tốc độ Speed Multipliers */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <span className="px-2 text-xs font-mono text-slate-500">Tốc độ:</span>
          {speeds.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onSpeedChange(s)}
              className={`rounded px-2 py-1 text-xs font-mono transition-all ${
                speedMultiplier === s
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 3. Slider điều chỉnh số lượng kiến & Toggles */}
      <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
        {/* Slider số lượng kiến */}
        <div className="flex flex-col justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Số lượng kiến trên thước:</span>
            <span className="font-mono font-bold text-amber-700 tabular-nums">{antCount} con</span>
          </div>
          <input
            type="range"
            min={2}
            max={100}
            step={1}
            value={antCount}
            onChange={e => onAntCountChange(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-600"
          />
          <div className="flex justify-between text-xs font-mono text-slate-600">
            <span>2 con</span>
            <span>10 con (Mặc định)</span>
            <span>100 con</span>
          </div>
        </div>

        {/* Cụm công tắc trực quan (Toggles) */}
        <div className="flex flex-wrap items-center justify-end gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
          {/* Toggle Ghost Mode */}
          <button
            type="button"
            onClick={onToggleGhostMode}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono font-semibold transition-all border ${
              isGhostMode
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-amber-600" />
            Bóng Ma Đi Xuyên {isGhostMode ? 'BẬT' : 'TẮT'}
          </button>

          {/* Toggle Spacetime Diagram */}
          <button
            type="button"
            onClick={onToggleSpacetime}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono font-semibold transition-all border ${
              showSpacetime
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            Biểu Đồ Không-Thời Gian
          </button>

          {/* Toggle Sound */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-mono transition-all border ${
              soundEnabled
                ? 'bg-white text-slate-700 border-slate-300'
                : 'bg-slate-200 text-slate-600 border-slate-300'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-slate-700" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

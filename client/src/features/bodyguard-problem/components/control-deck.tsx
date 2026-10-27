'use client';

import React from 'react';
import {
  Point,
  BODYGUARD_PRESETS,
  BodyguardPreset,
} from '@/features/bodyguard-problem/bodyguard-math';
import { Shield, ShieldAlert, RotateCcw, Eye, Compass, Target, SunMedium } from 'lucide-react';

export type ViewMode = 'dual' | 'room' | 'unfolded';
export type RayMode = 'targeted' | 'sweep360' | 'manual';

interface ControlDeckProps {
  source: Point;
  target: Point;
  guardsCount: number;
  showGuards: boolean;
  setShowGuards: (v: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  rayMode: RayMode;
  setRayMode: (v: RayMode) => void;
  maxBounces: number;
  setMaxBounces: (v: number) => void;
  rayCount: number;
  setRayCount: (v: number) => void;
  manualAngle: number;
  setManualAngle: (v: number) => void;
  activePresetId: string;
  onSelectPreset: (preset: BodyguardPreset) => void;
  onReset: () => void;
}

export function ControlDeck({
  source,
  target,
  guardsCount,
  showGuards,
  setShowGuards,
  viewMode,
  setViewMode,
  rayMode,
  setRayMode,
  maxBounces,
  setMaxBounces,
  rayCount,
  setRayCount,
  manualAngle,
  setManualAngle,
  activePresetId,
  onSelectPreset,
  onReset,
}: ControlDeckProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-300 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]">
      {/* Top Row: Presets & View Mode */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            Cấu hình mẫu:
          </span>
          {BODYGUARD_PRESETS.map(preset => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border border-blue-600 bg-blue-50 font-semibold text-blue-700'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                {preset.nameVi}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onReset}
            title="Thiết lập lại mặc định"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-3 w-3" />
            Mặc định
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setViewMode('dual')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              viewMode === 'dual'
                ? 'bg-white font-semibold text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Song song
          </button>
          <button
            type="button"
            onClick={() => setViewMode('room')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              viewMode === 'room'
                ? 'bg-white font-semibold text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phòng Gương
          </button>
          <button
            type="button"
            onClick={() => setViewMode('unfolded')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              viewMode === 'unfolded'
                ? 'bg-white font-semibold text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lưới Trải Phẳng
          </button>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Middle Row: Guard Toggle + Ray Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Guard Toggle Button */}
        <button
          type="button"
          onClick={() => setShowGuards(!showGuards)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
            showGuards
              ? 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-[0_2px_6px_0_rgba(16,185,129,0.15)] hover:bg-emerald-100'
              : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {showGuards ? (
            <>
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>{guardsCount} Vệ Sĩ ĐANG BẬT (Bảo vệ 100%)</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span>Vệ Sĩ ĐANG TẮT (Mục tiêu bị chiếu sáng)</span>
            </>
          )}
        </button>

        {/* Ray Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            Chế độ tia:
          </span>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setRayMode('targeted')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                rayMode === 'targeted'
                  ? 'bg-cyan-600 font-semibold text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              Tia Nhắm B
            </button>
            <button
              type="button"
              onClick={() => setRayMode('sweep360')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                rayMode === 'sweep360'
                  ? 'bg-blue-600 font-semibold text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SunMedium className="h-3.5 w-3.5" />
              Quét 360°
            </button>
            <button
              type="button"
              onClick={() => setRayMode('manual')}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                rayMode === 'manual'
                  ? 'bg-amber-600 font-semibold text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              Laser Thủ Công
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Dynamic Sliders & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-slate-50 p-3">
        {/* Sliders */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700">
          {/* Max Bounces Slider */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Số lần phản xạ:</span>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={maxBounces}
              onChange={e => setMaxBounces(Number(e.target.value))}
              className="h-1.5 w-24 accent-blue-600"
            />
            <span className="w-5 text-right font-mono font-semibold text-slate-900">
              {maxBounces}
            </span>
          </div>

          {/* Density slider for 360 mode */}
          {rayMode === 'sweep360' && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Mật độ tia:</span>
              <select
                value={rayCount}
                onChange={e => setRayCount(Number(e.target.value))}
                className="rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-800"
              >
                <option value={36}>36 tia</option>
                <option value={72}>72 tia</option>
                <option value={120}>120 tia</option>
              </select>
            </div>
          )}

          {/* Angle slider for manual mode */}
          {rayMode === 'manual' && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Góc bắn laser:</span>
              <input
                type="range"
                min={0}
                max={360}
                step={2}
                value={manualAngle}
                onChange={e => setManualAngle(Number(e.target.value))}
                className="h-1.5 w-28 accent-amber-600"
              />
              <span className="w-8 text-right font-mono font-semibold text-slate-900">
                {manualAngle}°
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-amber-600 bg-amber-400" />
            <span>
              Nguồn A ({source.x.toFixed(2)}, {source.y.toFixed(2)})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-cyan-600 bg-cyan-400" />
            <span>
              Mục tiêu B ({target.x.toFixed(2)}, {target.y.toFixed(2)})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-emerald-600 bg-emerald-400" />
            <span>Vệ sĩ G (tối đa 16)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

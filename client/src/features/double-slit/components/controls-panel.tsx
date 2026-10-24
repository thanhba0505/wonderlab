'use client';

import * as React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Zap,
  Sliders,
  Sparkles,
  Layers,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantumParameters, wavelengthToRgb } from '../quantum-math';

interface ControlsPanelProps {
  params: QuantumParameters;
  onParamsChange: (updater: (prev: QuantumParameters) => QuantumParameters) => void;
  onFireSingle: () => void;
  onFireBurst: (count: number) => void;
  onReset: () => void;
  isStreaming: boolean;
  onToggleStream: () => void;
  totalHits: number;
}

export function ControlsPanel({
  params,
  onParamsChange,
  onFireSingle,
  onFireBurst,
  onReset,
  isStreaming,
  onToggleStream,
  totalHits,
}: ControlsPanelProps) {
  const wavelengthNm = Math.round(params.wavelength * 1e9);
  const slitDistanceUm = Math.round(params.slitDistance * 1e6);
  const laserColor = wavelengthToRgb(wavelengthNm);

  // Khoảng vân giao thoa lý thuyết: i = lambda * D / d (đơn vị: mm)
  const fringeSpacingMm = (params.wavelength * params.screenDistance * 1000) / params.slitDistance;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-300/85 bg-white p-5 shadow-xs">
      {/* 1. THE QUANTUM OBSERVER TOGGLE (Highlight of the Experiment) */}
      <div
        className={`rounded-xl border p-4 transition-all duration-300 ${
          params.isObserverActive
            ? 'border-rose-300 bg-rose-50/70 shadow-sm'
            : 'border-blue-300 bg-blue-50/60 shadow-sm'
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {params.isObserverActive ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white shadow-xs">
                  <Eye className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                  <EyeOff className="h-4 w-4" />
                </div>
              )}
              <div>
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  {params.isObserverActive
                    ? 'Máy quan sát (Detector): ĐANG BẬT [Đo lường]'
                    : 'Máy quan sát (Detector): ĐANG TẮT [Không đo lường]'}
                </h3>
                <p className="text-xs text-slate-600">
                  {params.isObserverActive
                    ? 'Biết hạt đi qua khe nào ➔ Hàm sóng sụp đổ ➔ Trở về 2 vệt hạt cổ điển.'
                    : 'Không can thiệp đo lường ➔ Hạt tự giao thoa với chính nó ➔ Tạo vân sóng.'}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onParamsChange(prev => ({
                ...prev,
                isObserverActive: !prev.isObserverActive,
              }))
            }
            className={`relative inline-flex h-9 w-40 shrink-0 cursor-pointer items-center justify-center rounded-lg px-3 text-xs font-bold transition-all focus:outline-none ${
              params.isObserverActive
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
            }`}
          >
            {params.isObserverActive ? (
              <span className="flex items-center gap-1.5">
                <EyeOff className="h-3.5 w-3.5" /> Tắt Máy Quan Sát
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Bật Máy Quan Sát
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Particle Shooting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-200/80 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Single Shot Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onFireSingle}
            className="text-xs font-semibold border-slate-300 text-slate-800 hover:bg-slate-50 shadow-2xs"
          >
            <CircleDot className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            Bắn 1 Hạt (Single)
          </Button>

          {/* Stream Toggle Button */}
          <Button
            size="sm"
            onClick={onToggleStream}
            className={`text-xs font-semibold shadow-2xs ${
              isStreaming
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="h-3.5 w-3.5 mr-1.5" /> Tạm dừng bắn
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1.5" /> Bắn liên tục
              </>
            )}
          </Button>

          {/* Burst 1000 Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFireBurst(1000)}
            className="text-xs font-semibold border-slate-300 text-slate-800 hover:bg-slate-50 shadow-2xs"
          >
            <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
            Bắn nhanh 1.000 Hạt
          </Button>
        </div>

        {/* Reset hits button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={totalHits === 0}
          className="text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Xóa màn hứng
        </Button>
      </div>

      {/* 3. Parameter Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Wavelength Slider */}
        <div className="space-y-2 rounded-xl bg-slate-50/80 border border-slate-200/80 p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Bước sóng (λ)
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full border border-black/10 shadow-2xs"
                style={{ backgroundColor: laserColor }}
              />
              <span className="font-mono font-bold text-slate-900">{wavelengthNm} nm</span>
            </div>
          </div>
          <input
            type="range"
            min={400}
            max={700}
            step={5}
            value={wavelengthNm}
            onChange={e => {
              const val = parseFloat(e.target.value);
              onParamsChange(prev => ({ ...prev, wavelength: val * 1e-9 }));
            }}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>400nm (Tím)</span>
            <span>532nm (Lục)</span>
            <span>700nm (Đỏ)</span>
          </div>
        </div>

        {/* Slit Distance Slider */}
        <div className="space-y-2 rounded-xl bg-slate-50/80 border border-slate-200/80 p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              Khoảng cách 2 khe (d)
            </span>
            <span className="font-mono font-bold text-slate-900">{slitDistanceUm} µm</span>
          </div>
          <input
            type="range"
            min={15}
            max={50}
            step={1}
            value={slitDistanceUm}
            onChange={e => {
              const val = parseFloat(e.target.value);
              onParamsChange(prev => ({ ...prev, slitDistance: val * 1e-6 }));
            }}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>15µm (Rộng)</span>
            <span>25µm</span>
            <span>50µm (Hẹp)</span>
          </div>
        </div>

        {/* Screen Distance Slider */}
        <div className="space-y-2 rounded-xl bg-slate-50/80 border border-slate-200/80 p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-emerald-500" />
              Khoảng cách màn (D)
            </span>
            <span className="font-mono font-bold text-slate-900">
              {params.screenDistance.toFixed(2)} m
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2.0}
            step={0.1}
            value={params.screenDistance}
            onChange={e => {
              const val = parseFloat(e.target.value);
              onParamsChange(prev => ({ ...prev, screenDistance: val }));
            }}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>0.5 m</span>
            <span>1.0 m</span>
            <span>2.0 m</span>
          </div>
        </div>
      </div>

      {/* 4. Theoretical Metrics Strip */}
      <div className="flex flex-wrap items-center justify-between rounded-xl bg-slate-100/70 border border-slate-200 px-4 py-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Khoảng vân giao thoa lý thuyết (i = λD/d):</span>
          <span className="font-bold text-blue-700">{fringeSpacingMm.toFixed(2)} mm</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Trạng thái vật lý:</span>
          <span
            className={`font-bold ${params.isObserverActive ? 'text-rose-600' : 'text-emerald-700'}`}
          >
            {params.isObserverActive ? 'Hạt cổ điển (2 dải)' : 'Sóng chồng chập (Vân giao thoa)'}
          </span>
        </div>
      </div>
    </div>
  );
}

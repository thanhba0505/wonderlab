'use client';

import React from 'react';
import { Point } from '@/features/bodyguard-problem/bodyguard-math';

interface ControlDeckProps {
  source: Point;
  target: Point;
  showGuards: boolean;
  setShowGuards: (v: boolean) => void;
  maxBounces: number;
  setMaxBounces: (v: number) => void;
}

export function ControlDeck({
  source,
  target,
  showGuards,
  setShowGuards,
  maxBounces,
  setMaxBounces,
}: ControlDeckProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center gap-4">
        {/* Guard toggle */}
        <button
          type="button"
          onClick={() => setShowGuards(!showGuards)}
          className={[
            'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
            showGuards
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100',
          ].join(' ')}
        >
          {showGuards ? '🛡️ Tắt Vệ sĩ' : '🛡️ Bật Vệ sĩ'}
        </button>

        {/* Bounce slider */}
        <label className="flex items-center gap-3 text-sm text-slate-700">
          <span className="whitespace-nowrap">Số lần phản xạ tối đa:</span>
          <input
            type="range"
            min={5}
            max={40}
            step={1}
            value={maxBounces}
            onChange={e => setMaxBounces(Number(e.target.value))}
            className="w-28 accent-blue-600"
          />
          <span className="font-mono font-semibold text-slate-900 w-6 text-right">
            {maxBounces}
          </span>
        </label>
      </div>

      {/* Coordinates & Legend */}
      <div className="flex flex-wrap items-center gap-5">
        {/* Coordinates */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
          <span>
            <span className="text-amber-600 font-semibold">A</span> ({source.x.toFixed(2)},{' '}
            {source.y.toFixed(2)})
          </span>
          <span>
            <span className="text-cyan-600 font-semibold">B</span> ({target.x.toFixed(2)},{' '}
            {target.y.toFixed(2)})
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-400" />
            Nguồn sáng (A)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-cyan-400" />
            Điểm mục tiêu (B)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-400" />
            Vệ sĩ
          </span>
        </div>

        {/* Drag hint */}
        <span className="text-xs text-slate-400 italic">
          Kéo điểm A và B trên canvas để điều chỉnh
        </span>
      </div>
    </div>
  );
}

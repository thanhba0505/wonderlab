'use client';

import React from 'react';
import { Point } from '@/features/bodyguard-problem/bodyguard-math';

interface TelemetryPanelProps {
  source: Point;
  target: Point;
  guards: Point[];
  showGuards: boolean;
}

export function TelemetryPanel({
  source,
  target,
  guards,
  showGuards,
}: TelemetryPanelProps): React.JSX.Element {
  const distance = Math.hypot(source.x - target.x, source.y - target.y);
  const isProtected = showGuards && guards.length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
      {/* Panel header */}
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
        <h3 className="text-[18px] font-heading font-bold text-slate-900 tracking-tight">
          Telemetry Thực nghiệm
        </h3>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Guard count */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Vệ sĩ cần thiết
          </span>
          <span className="font-mono font-bold text-2xl text-emerald-700">{guards.length}</span>
        </div>

        {/* Source */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Nguồn sáng A
          </span>
          <span className="font-mono text-sm text-slate-800 font-semibold">
            ({source.x.toFixed(3)}, {source.y.toFixed(3)})
          </span>
        </div>

        {/* Target */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Điểm mục tiêu B
          </span>
          <span className="font-mono text-sm text-slate-800 font-semibold">
            ({target.x.toFixed(3)}, {target.y.toFixed(3)})
          </span>
        </div>

        {/* Distance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Khoảng cách A→B
          </span>
          <span className="font-mono text-sm text-slate-800 font-semibold">
            {distance.toFixed(3)} <span className="text-slate-400 font-normal text-xs">đơn vị</span>
          </span>
        </div>
      </div>

      {/* Status */}
      <div
        className={[
          'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
          isProtected
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border border-amber-200 text-amber-800',
        ].join(' ')}
      >
        {isProtected ? '🛡️ Bảo vệ hoàn toàn' : '⚠️ Không có bảo vệ'}
      </div>
    </div>
  );
}

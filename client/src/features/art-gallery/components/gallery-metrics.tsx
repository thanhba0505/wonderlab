'use client';

import * as React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export interface GalleryMetricsProps {
  numVertices: number;
  numGuards: number;
  coveragePercentage: number;
}

export const GalleryMetrics: React.FC<GalleryMetricsProps> = ({
  numVertices,
  numGuards,
  coveragePercentage,
}) => {
  const chvatalBound = Math.floor(numVertices / 3);
  const isFullyCovered = coveragePercentage >= 99.5;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pb-5 border-b border-slate-200/80">
      {/* 1. Số đỉnh & Ngưỡng Chvátal */}
      <div className="space-y-1">
        <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase font-sans">
          Số Đỉnh & Cận Chvátal
        </div>
        <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
          {numVertices} <span className="text-xs font-sans text-slate-400 font-normal">đỉnh</span>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Ngưỡng &lfloor;{numVertices}/3&rfloor; ={' '}
          <strong className="text-blue-700">{chvatalBound}</strong> lính
        </div>
      </div>

      {/* 2. Số người gác hiện tại */}
      <div className="space-y-1 sm:border-l sm:border-slate-200/80 sm:pl-4">
        <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase font-sans">
          Số Người Gác Hiện Tại
        </div>
        <div className="font-mono text-2xl sm:text-3xl font-bold text-amber-700 tabular-nums">
          {numGuards} <span className="text-xs font-sans text-slate-400 font-normal">người</span>
        </div>
        <div className="text-xs text-slate-500 font-sans">
          {numGuards <= chvatalBound ? (
            <span className="text-emerald-700 font-semibold font-mono">&le; Cận Chvátal</span>
          ) : (
            <span className="text-slate-500 font-mono">&gt; Cận Chvátal</span>
          )}
        </div>
      </div>

      {/* 3. Tỷ lệ diện tích phòng được quan sát */}
      <div className="space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-4">
        <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase font-sans">
          Độ Phủ Tầm Nhìn
        </div>
        <div className="font-mono text-2xl sm:text-3xl font-bold text-blue-700 tabular-nums">
          {coveragePercentage.toFixed(1)}%
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isFullyCovered ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, coveragePercentage)}%` }}
          />
        </div>
      </div>

      {/* 4. Trạng thái an ninh căn phòng */}
      <div className="space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-4">
        <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase font-sans">
          Trạng Thái An Ninh
        </div>
        <div className="pt-0.5">
          {isFullyCovered ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold text-xs font-sans">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Bao Quát 100%</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-800 font-semibold text-xs font-sans">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Còn Góc Khuất</span>
            </div>
          )}
        </div>
        <div className="text-xs text-slate-500 font-sans">
          {isFullyCovered ? 'Không còn góc chết nào trong phòng' : 'Cần thêm lính hoặc đổi góc đặt'}
        </div>
      </div>
    </div>
  );
};

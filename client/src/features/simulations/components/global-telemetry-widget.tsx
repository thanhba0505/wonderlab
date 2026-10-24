'use client';

import * as React from 'react';
import { Activity, Database, Sparkles } from 'lucide-react';
import { SimulationGlobalStats } from '@/lib/telemetry';

interface GlobalTelemetryWidgetProps {
  stats: SimulationGlobalStats | null;
  className?: string;
}

export function GlobalTelemetryWidget({ stats, className = '' }: GlobalTelemetryWidgetProps) {
  if (!stats || stats.totalTrials === 0) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-mono text-slate-600 ${className}`}
      >
        <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
        <span>Hệ thống sẵn sàng thu thập dữ liệu thực nghiệm sống</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-3 rounded-xl border border-slate-300/85 bg-white px-4 py-2 text-xs font-mono shadow-xs ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-bold text-slate-900">TELEMETRY CỘNG ĐỒNG:</span>
      </div>

      <div className="flex items-center gap-1.5 text-slate-700">
        <Database className="h-3.5 w-3.5 text-blue-600" />
        <span className="font-extrabold text-blue-700 tabular-nums">
          {stats.totalTrials.toLocaleString('vi-VN')}
        </span>
        <span className="text-slate-500">phép thử đã tích lũy</span>
      </div>

      <div className="hidden sm:inline-block h-3 w-px bg-slate-200" />

      <div className="flex items-center gap-1.5 text-slate-500">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span className="font-bold text-slate-800 tabular-nums">
          {stats.totalRuns.toLocaleString('vi-VN')}
        </span>
        <span>lượt chạy</span>
      </div>
    </div>
  );
}

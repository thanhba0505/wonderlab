'use client';

import * as React from 'react';

export interface SimulationWorkbenchCardProps {
  metricsBar?: React.ReactNode;
  children: React.ReactNode;
  tools?: React.ReactNode;
  telemetry?: React.ReactNode;
  className?: string;
}

export function SimulationWorkbenchCard({
  metricsBar,
  children,
  tools,
  telemetry,
  className = '',
}: SimulationWorkbenchCardProps) {
  const hasBottomBar = Boolean(tools || telemetry);

  return (
    <div
      className={`rounded-2xl border border-slate-300/85 bg-white shadow-xs p-5 sm:p-6 space-y-6 ${className}`}
    >
      {/* Thanh trạng thái đo lường nhỏ gọn */}
      {metricsBar && <div>{metricsBar}</div>}

      {/* Vùng thực nghiệm tương tác chính */}
      <div className="space-y-6">{children}</div>

      {/* Thanh công cụ và telemetry góc dưới */}
      {hasBottomBar && (
        <div className="border-t border-slate-200/80 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">{tools}</div>
          {telemetry && (
            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
              {telemetry}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

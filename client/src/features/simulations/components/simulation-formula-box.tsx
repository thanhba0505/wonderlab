'use client';

import * as React from 'react';

export interface SimulationFormulaBoxProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SimulationFormulaBox({
  title,
  children,
  className = '',
}: SimulationFormulaBoxProps) {
  return (
    <div
      className={`rounded-xl bg-amber-50/25 border border-amber-200/40 shadow-2xs p-3.5 font-mono text-xs text-slate-800 space-y-2 ${className}`}
    >
      {title && <div className="text-xs font-sans text-amber-900/80 font-semibold">{title}</div>}
      {children}
    </div>
  );
}

'use client';

import * as React from 'react';

export type SectionDotColor = 'amber' | 'blue' | 'emerald' | 'indigo' | 'violet';

const DOT_COLOR_CLASSES: Record<SectionDotColor, string> = {
  amber: 'bg-amber-500 shadow-amber-500/40',
  blue: 'bg-blue-600 shadow-blue-500/40',
  emerald: 'bg-emerald-600 shadow-emerald-500/40',
  indigo: 'bg-indigo-600 shadow-indigo-500/40',
  violet: 'bg-violet-600 shadow-violet-500/40',
};

export interface SimulationSectionHeaderProps {
  dotColor?: SectionDotColor;
  title: string;
  subtitle?: string;
  className?: string;
  action?: React.ReactNode;
}

export function SimulationSectionHeader({
  dotColor = 'blue',
  title,
  subtitle,
  className = '',
  action,
}: SimulationSectionHeaderProps) {
  const dotClasses = DOT_COLOR_CLASSES[dotColor] ?? DOT_COLOR_CLASSES.blue;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full shadow-xs ${dotClasses}`} />
          <h2 className="font-heading text-[18px] font-bold tracking-tight text-slate-900">
            {title}
          </h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      {subtitle && (
        <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

export interface SimulationSectionProps extends SimulationSectionHeaderProps {
  children: React.ReactNode;
  containerClassName?: string;
}

export function SimulationSection({
  children,
  containerClassName = '',
  ...headerProps
}: SimulationSectionProps) {
  return (
    <section className={`space-y-4 ${containerClassName}`}>
      <SimulationSectionHeader {...headerProps} />
      {children}
    </section>
  );
}

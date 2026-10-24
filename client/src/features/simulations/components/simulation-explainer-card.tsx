'use client';

import * as React from 'react';

export interface SimulationExplainerCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SimulationExplainerCard({
  children,
  className = '',
}: SimulationExplainerCardProps) {
  return (
    <div
      className={`rounded-2xl border border-blue-300/80 bg-gradient-to-b from-blue-50/50 via-white to-white p-5 sm:p-6 shadow-xs ${className}`}
    >
      {children}
    </div>
  );
}

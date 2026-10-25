import React from 'react';

export interface MathFractionProps {
  numerator: React.ReactNode;
  denominator: React.ReactNode;
  className?: string;
}

/**
 * Hiển thị một phân số chuẩn toán học với tử số, gạch phân số ngang và mẫu số
 */
export function MathFraction({ numerator, denominator, className = '' }: MathFractionProps) {
  return (
    <span
      className={`inline-flex flex-col items-center align-middle mx-1 font-mono text-xs ${className}`}
    >
      <span className="border-b border-current px-1 text-center font-semibold leading-none pb-0.5">
        {numerator}
      </span>
      <span className="px-1 text-center font-semibold leading-none pt-0.5">{denominator}</span>
    </span>
  );
}

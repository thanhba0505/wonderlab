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

export interface MathPowerProps {
  base: React.ReactNode;
  exponent: React.ReactNode;
  className?: string;
}

/**
 * Hiển thị số mũ / lũy thừa chuẩn toán học (base^exponent)
 */
export function MathPower({ base, exponent, className = '' }: MathPowerProps) {
  return (
    <span className={`inline-flex items-baseline font-mono text-xs ${className}`}>
      <span>{base}</span>
      <sup className="text-xs font-semibold leading-none pl-0.5 -top-1 relative">{exponent}</sup>
    </span>
  );
}

export interface MathSqrtProps {
  children: React.ReactNode;
  degree?: React.ReactNode;
  className?: string;
}

/**
 * Hiển thị căn thức chuẩn toán học (√expression hoặc ^degree√expression)
 */
export function MathSqrt({ children, degree, className = '' }: MathSqrtProps) {
  return (
    <span className={`inline-flex items-center align-middle font-mono text-xs mx-0.5 ${className}`}>
      {degree && (
        <sup className="text-xs font-semibold leading-none -mr-0.5 -top-1 relative">{degree}</sup>
      )}
      <span className="text-sm font-light leading-none mr-0.5">&radic;</span>
      <span className="border-t border-current px-1 leading-none pt-0.5">{children}</span>
    </span>
  );
}

export interface MathSubProps {
  base: React.ReactNode;
  subscript: React.ReactNode;
  className?: string;
}

/**
 * Hiển thị chỉ số dưới chuẩn toán học (base_subscript)
 */
export function MathSub({ base, subscript, className = '' }: MathSubProps) {
  return (
    <span className={`inline-flex items-baseline font-mono text-xs ${className}`}>
      <span>{base}</span>
      <sub className="text-xs font-semibold leading-none pl-0.5 top-0.5 relative">{subscript}</sub>
    </span>
  );
}

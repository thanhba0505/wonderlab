'use client';

import React from 'react';
import { Sigma, Sparkles, BookOpen } from 'lucide-react';

interface SimulationMathCardProps {
  slug: string;
  summary: string;
}

/**
 * Hiển thị một phân số chuẩn toán học với tử số, gạch phân số và mẫu số
 */
function MathFraction({
  numerator,
  denominator,
  className = '',
}: {
  numerator: React.ReactNode;
  denominator: React.ReactNode;
  className?: string;
}) {
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

export const SimulationMathCard: React.FC<SimulationMathCardProps> = ({ slug, summary }) => {
  return (
    <div className="rounded-xl border border-slate-300/85 bg-white shadow-xs p-5 space-y-4">
      {/* Tóm tắt ý nghĩa khoa học */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
          <BookOpen className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
            Tổng Quan Thí Nghiệm
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">{summary}</p>
        </div>
      </div>

      {/* Khối mô hình toán học - KHÔNG ĐÓNG KHUNG BÊN NGOÀI, line phân cách ở trên */}
      <div className="pt-4 border-t border-slate-200/80 space-y-3 font-mono">
        <div className="flex items-center gap-2 pb-1">
          <Sigma className="h-4 w-4 text-blue-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
            Mô Hình Toán Học & Công Thức Giải Tích
          </span>
        </div>

        {/* NGHỊCH LÝ NGÀY SINH (BIRTHDAY PARADOX) */}
        {slug === 'birthday-paradox' && (
          <div className="space-y-3 text-xs text-slate-800">
            {/* 1. Công thức giải tích chính xác */}
            <div className="space-y-1.5">
              <div className="text-xs font-sans text-slate-500 font-semibold flex items-center gap-1.5">
                <span>1. Xác suất bù chính xác (Exact Analytic Probability):</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm bg-slate-50/80 p-3 rounded-lg">
                <span className="font-bold text-slate-900">P(n)</span>
                <span>=</span>
                <span>1 &minus; P(không trùng)</span>
                <span>=</span>
                <span>1 &minus;</span>
                <span className="inline-flex items-center">
                  <span className="text-xl font-light text-slate-400 -mt-0.5">(</span>
                  <MathFraction numerator="365" denominator="365" />
                  <span className="text-slate-400">&times;</span>
                  <MathFraction numerator="364" denominator="365" />
                  <span className="text-slate-400">&times;</span>
                  <span className="text-slate-400">&hellip;</span>
                  <span className="text-slate-400">&times;</span>
                  <MathFraction numerator="365 &minus; n + 1" denominator="365" />
                  <span className="text-xl font-light text-slate-400 -mt-0.5">)</span>
                </span>
                <span>=</span>
                <span className="inline-flex items-center font-bold text-blue-700">
                  1 &minus;
                  <MathFraction
                    numerator="365!"
                    denominator={
                      <span>
                        (365 &minus; n)! &middot; 365
                        <sup className="text-xs font-semibold">n</sup>
                      </span>
                    }
                  />
                </span>
              </div>
            </div>

            {/* 2. Xấp xỉ chuỗi hàm mũ Taylor */}
            <div className="space-y-1.5">
              <div className="text-xs font-sans text-slate-500 font-semibold flex items-center gap-1.5">
                <span>2. Xấp xỉ tiệm cận hàm mũ Taylor (Taylor Series Approximation):</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm bg-slate-50/80 p-3 rounded-lg">
                <span className="font-bold text-slate-900">P(n)</span>
                <span className="text-slate-400">&asymp;</span>
                <span>1 &minus; e</span>
                <sup className="text-xs font-bold text-blue-700 -top-1.5">
                  &minus;
                  <MathFraction
                    numerator="n(n &minus; 1)"
                    denominator="2 &times; 365"
                    className="text-xs"
                  />
                </sup>
                <span>=</span>
                <span>1 &minus; e</span>
                <sup className="text-xs font-bold text-blue-700 -top-1.5">
                  &minus;
                  <MathFraction numerator="C(n, 2)" denominator="365" className="text-xs" />
                </sup>
                <div className="w-full pt-1.5 mt-1 border-t border-slate-200/60 text-xs font-sans text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>
                    Tại <strong className="font-mono text-slate-900">n = 23</strong>: có{' '}
                    <strong className="font-mono text-blue-700">C(23, 2) = 253</strong> cặp đối sánh
                    &rarr;{' '}
                    <strong className="font-mono text-emerald-700">P(23) &asymp; 50.73%</strong>{' '}
                    (vượt ngưỡng một nửa).
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NGHỊCH LÝ MONTY HALL */}
        {slug === 'monty-hall' && (
          <div className="space-y-3 text-xs text-slate-800">
            <div className="flex flex-wrap items-center gap-3 bg-slate-50/80 p-3 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">Giữ nguyên cửa ban đầu:</span>
                <span className="font-bold text-slate-900">P(Stay) =</span>
                <MathFraction numerator="1" denominator="3" />
                <span className="text-slate-400">&asymp; 33.3%</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">Đổi sang cửa còn lại:</span>
                <span className="font-bold text-emerald-700">P(Switch) = 1 &minus;</span>
                <MathFraction numerator="1" denominator="3" />
                <span className="font-bold text-emerald-700">=</span>
                <MathFraction numerator="2" denominator="3" />
                <span className="text-emerald-700 font-bold">&asymp; 66.7%</span>
              </div>
            </div>
          </div>
        )}

        {/* THÍ NGHIỆM HAI KHE YOUNG */}
        {slug === 'double-slit' && (
          <div className="space-y-3 text-xs text-slate-800">
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-3 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">Vị trí vân sáng:</span>
                <span className="font-bold text-slate-900">
                  y<sub>m</sub> = m &middot;
                </span>
                <MathFraction numerator="&lambda; &middot; L" denominator="d" />
                <span className="text-slate-400 font-sans">(m &isin; &Zopf;)</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">Cường độ sóng:</span>
                <span className="font-bold text-blue-700">
                  I(&theta;) = I<sub className="text-xs">0</sub> &middot; cos
                  <sup className="text-xs font-semibold">2</sup>
                </span>
                <span className="text-xs text-slate-600">
                  <span className="text-sm font-light text-slate-400">(</span>
                  <MathFraction
                    numerator="&pi; &middot; d &middot; sin(&theta;)"
                    denominator="&lambda;"
                  />
                  <span className="text-sm font-light text-slate-400">)</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SONG ĐỀ TÙ NHÂN */}
        {slug === 'prisoners-dilemma' && (
          <div className="space-y-3 text-xs text-slate-800">
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-3 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">Điều kiện song đề:</span>
                <span className="font-bold text-amber-700">T &gt; R &gt; P &gt; S</span>
                <span className="text-slate-400 font-sans">(5 &gt; 3 &gt; 1 &gt; 0)</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">Cân bằng Nash:</span>
                <span className="font-bold text-slate-900">
                  (Defect, Defect) &rarr; Payoff (1, 1)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* NGHỊCH LÝ ZENO */}
        {slug === 'zeno-paradox' && (
          <div className="space-y-3 text-xs text-slate-800">
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-3 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">Chuỗi hình học hội tụ:</span>
                <span className="font-bold text-slate-900">
                  &sum;<sub className="text-xs">n=1</sub>
                  <sup className="text-xs font-semibold">&infin;</sup>
                </span>
                <span className="inline-flex items-center">
                  <span className="text-sm font-light text-slate-400">(</span>
                  <MathFraction numerator="1" denominator="2" />
                  <span className="text-sm font-light text-slate-400">)</span>
                  <sup className="text-xs font-bold text-slate-700">n</sup>
                </span>
                <span>=</span>
                <MathFraction
                  numerator={<MathFraction numerator="1" denominator="2" />}
                  denominator={
                    <span>
                      1 &minus; <MathFraction numerator="1" denominator="2" />
                    </span>
                  }
                />
                <span className="font-bold text-emerald-700">= 1</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">Thời điểm bắt kịp:</span>
                <span className="font-bold text-blue-700">
                  T<sup className="text-xs font-semibold">*</sup> =
                </span>
                <MathFraction
                  numerator={
                    <span>
                      d<sub className="text-xs">0</sub>
                    </span>
                  }
                  denominator={
                    <span>
                      v<sub className="text-xs">A</sub> &minus; v<sub className="text-xs">T</sub>
                    </span>
                  }
                />
                <span className="text-slate-500 font-sans">=</span>
                <MathFraction numerator="100" denominator="10 &minus; 1" />
                <span className="font-bold text-blue-700">&asymp; 11.11 s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

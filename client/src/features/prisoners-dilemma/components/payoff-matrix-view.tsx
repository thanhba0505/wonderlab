'use client';

import * as React from 'react';
import { Move, DEFAULT_PAYOFFS } from '../game-theory-math';

interface PayoffMatrixViewProps {
  lastMove1?: Move | null;
  lastMove2?: Move | null;
}

export function PayoffMatrixView({ lastMove1, lastMove2 }: PayoffMatrixViewProps) {
  const isCellActive = (m1: Move, m2: Move) => lastMove1 === m1 && lastMove2 === m2;

  return (
    <div className="space-y-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="font-heading text-sm font-bold text-slate-900">
            Ma trận Phần thưởng (Payoff Matrix)
          </h4>
          <p className="text-xs text-slate-500 font-sans">
            Điểm số quy đổi từ cặp quyết định của hai bên (Người 1, Người 2)
          </p>
        </div>
        <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
          T (5) &gt; R (3) &gt; P (1) &gt; S (0)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center text-xs font-mono">
          <thead>
            <tr>
              <th className="p-2 text-slate-400 font-normal text-xs border border-slate-200 bg-slate-50/50">
                P1 \ P2
              </th>
              <th className="p-2 border border-slate-200 bg-emerald-50/70 text-emerald-800 font-bold">
                HỢP TÁC (C)
              </th>
              <th className="p-2 border border-slate-200 bg-rose-50/70 text-rose-800 font-bold">
                PHẢN BỘI (D)
              </th>
            </tr>
          </thead>
          <tbody>
            {/* ROW 1: P1 CHOOSES COOPERATE */}
            <tr>
              <th className="p-2 border border-slate-200 bg-emerald-50/70 text-emerald-800 font-bold text-left">
                HỢP TÁC (C)
              </th>

              {/* Cell (C, C) */}
              <td
                className={`p-3 border transition-all duration-200 ${
                  isCellActive('C', 'C')
                    ? 'border-emerald-500 bg-emerald-100/80 shadow-inner ring-2 ring-emerald-500/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-base font-extrabold text-emerald-700">
                  +{DEFAULT_PAYOFFS.R}, +{DEFAULT_PAYOFFS.R}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-sans">
                  Thưởng đôi bên cùng có lợi
                </div>
              </td>

              {/* Cell (C, D) */}
              <td
                className={`p-3 border transition-all duration-200 ${
                  isCellActive('C', 'D')
                    ? 'border-amber-500 bg-amber-100/80 shadow-inner ring-2 ring-amber-500/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-base font-extrabold text-slate-700">
                  <span className="text-rose-600">+{DEFAULT_PAYOFFS.S}</span>,{' '}
                  <span className="text-emerald-600">+{DEFAULT_PAYOFFS.T}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-sans">
                  Kẻ bị lừa (S) &amp; Kẻ cám dỗ (T)
                </div>
              </td>
            </tr>

            {/* ROW 2: P1 CHOOSES DEFECT */}
            <tr>
              <th className="p-2 border border-slate-200 bg-rose-50/70 text-rose-800 font-bold text-left">
                PHẢN BỘI (D)
              </th>

              {/* Cell (D, C) */}
              <td
                className={`p-3 border transition-all duration-200 ${
                  isCellActive('D', 'C')
                    ? 'border-amber-500 bg-amber-100/80 shadow-inner ring-2 ring-amber-500/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-base font-extrabold text-slate-700">
                  <span className="text-emerald-600">+{DEFAULT_PAYOFFS.T}</span>,{' '}
                  <span className="text-rose-600">+{DEFAULT_PAYOFFS.S}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-sans">
                  Kẻ cám dỗ (T) &amp; Kẻ bị lừa (S)
                </div>
              </td>

              {/* Cell (D, D) */}
              <td
                className={`p-3 border transition-all duration-200 ${
                  isCellActive('D', 'D')
                    ? 'border-rose-500 bg-rose-100/80 shadow-inner ring-2 ring-rose-500/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-base font-extrabold text-rose-700">
                  +{DEFAULT_PAYOFFS.P}, +{DEFAULT_PAYOFFS.P}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-sans">
                  Cân bằng Nash: Cùng chịu phạt
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

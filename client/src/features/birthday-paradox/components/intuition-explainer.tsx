'use client';

import React from 'react';
import { calculateComparisonPairs } from '../birthday-math';

interface IntuitionExplainerProps {
  currentN: number;
}

export const IntuitionExplainer: React.FC<IntuitionExplainerProps> = ({ currentN }) => {
  const currentPairs = calculateComparisonPairs(currentN);
  const naivePairs = Math.max(0, currentN - 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-slate-200 pb-2">
        <h3 className="font-heading text-base font-bold text-slate-900">
          Tại sao Trực giác của bạn lại Sai? (The Intuitive Flaw)
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Khác biệt căn bản giữa &ldquo;Trùng ngày sinh với TÔI&rdquo; và &ldquo;BẤT KỲ HAI NGƯỜI
          NÀO trùng nhau&rdquo;.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Khối 1: Lỗi nhận thức tự nhiên */}
        <div className="rounded-lg bg-slate-50 p-4 border-l-4 border-slate-400">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-700 uppercase">
              1. Trực giác Tự nhiên (Sai lệch)
            </span>
            <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
              {naivePairs} phép so sánh
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Khi bước vào phòng có {currentN} người, bạn thường vô thức đặt mình làm mốc trung tâm và
            tự hỏi:
            <span className="font-semibold text-slate-800">
              {' '}
              &ldquo;Có ai ở đây sinh cùng ngày với TÔI không?&rdquo;
            </span>
          </p>

          <div className="mt-3 rounded bg-white p-2.5 font-mono text-[11px] text-slate-700 border border-slate-200">
            <div className="text-slate-500">{'//'} Xác suất trùng với BẠN:</div>
            <div className="mt-1 font-semibold text-slate-900">
              P = 1 - (364/365)^{naivePairs} ≈{' '}
              {((1 - Math.pow(364 / 365, naivePairs)) * 100).toFixed(1)}%
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 italic">
            Xác suất này rất nhỏ, tạo cảm giác sai lầm rằng biến cố trùng ngày sinh là hiếm thấy.
          </p>
        </div>

        {/* Khối 2: Bản chất toán học thực tế */}
        <div className="rounded-lg bg-blue-50/60 p-4 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-900 uppercase">
              2. Không gian Tổ hợp Thực tế
            </span>
            <span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-800">
              {currentPairs} cặp đối sánh!
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-700">
            Nghịch lý không hỏi ai trùng với BẠN, mà tìm{' '}
            <span className="font-semibold text-blue-900">BẤT KỲ CẶP NGƯỜI NÀO</span> trong phòng
            trùng nhau. Số lượng cặp đối sánh tăng theo hàm bậc hai:
            <span className="font-mono font-bold text-blue-900">
              {' '}
              C({currentN}, 2) = {currentN} × {currentN - 1} / 2
            </span>
            .
          </p>

          <div className="mt-3 rounded bg-white p-2.5 font-mono text-[11px] text-slate-800 border border-blue-200">
            <div className="text-slate-500">
              {'//'} Xác suất có ít nhất 1 trong {currentPairs} cặp trùng nhau:
            </div>
            <div className="mt-1 font-semibold text-blue-700">
              Tại n = 23: C(23, 2) = 253 cặp đối sánh → P = 50.7%
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-600">
            Với 253 cơ hội đối sánh độc lập, việc xuất hiện ít nhất một cặp trùng trở thành biến cố
            rất khả dĩ!
          </p>
        </div>
      </div>
    </div>
  );
};

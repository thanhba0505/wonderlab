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
      <div className="pb-1">
        <h3 className="font-heading text-base font-bold text-slate-900">
          Tại sao Trực giác của bạn lại Sai? (The Intuitive Flaw)
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Khác biệt căn bản giữa &ldquo;Trùng ngày sinh với TÔI&rdquo; và &ldquo;BẤT KỲ HAI NGƯỜI
          NÀO trùng nhau&rdquo;.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cột 1: Lỗi nhận thức tự nhiên - Dùng line dọc ngăn cách, không đóng khung */}
        <div className="space-y-3 border-l-2 border-slate-300 pl-4 sm:pl-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wide">
              Trực giác Tự nhiên (Sai lệch)
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
              {naivePairs} phép so sánh
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-600">
            Khi bước vào phòng có {currentN} người, bạn thường vô thức đặt mình làm mốc trung tâm và
            tự hỏi:
            <span className="font-semibold text-slate-800">
              {' '}
              &ldquo;Có ai ở đây sinh cùng ngày với TÔI không?&rdquo;
            </span>
          </p>

          {/* Công thức: Dùng line dọc nhấn, không đóng khung hộp */}
          <div className="border-l-2 border-slate-400 bg-slate-50/70 py-2 px-3 rounded-r font-mono text-[11px] text-slate-700">
            <div className="text-slate-400">{'//'} Xác suất trùng với BẠN:</div>
            <div className="mt-0.5 font-bold text-slate-900">
              P = 1 - (364/365)^{naivePairs} ≈{' '}
              {((1 - Math.pow(364 / 365, naivePairs)) * 100).toFixed(1)}%
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Xác suất này rất nhỏ, tạo cảm giác sai lầm rằng biến cố trùng ngày sinh là cực kỳ hiếm
            thấy.
          </p>
        </div>

        {/* Cột 2: Bản chất toán học thực tế - Dùng line dọc lam, không đóng khung */}
        <div className="space-y-3 border-l-2 border-blue-500 pl-4 sm:pl-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-900 uppercase tracking-wide">
              Không gian Tổ hợp Thực tế
            </span>
            <span className="rounded bg-blue-100/70 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-800">
              {currentPairs} cặp đối sánh!
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-700">
            Nghịch lý không hỏi ai trùng với BẠN, mà tìm{' '}
            <span className="font-semibold text-blue-900">BẤT KỲ CẶP NGƯỜI NÀO</span> trong phòng
            trùng nhau. Số lượng cặp đối sánh tăng theo hàm bậc hai:
            <span className="font-mono font-bold text-blue-900">
              {' '}
              C({currentN}, 2) = {currentN} × {currentN - 1} / 2
            </span>
            .
          </p>

          {/* Công thức: Dùng line dọc nhấn xanh, không đóng khung hộp */}
          <div className="border-l-2 border-blue-600 bg-blue-50/60 py-2 px-3 rounded-r font-mono text-[11px] text-slate-800">
            <div className="text-blue-500">
              {'//'} Xác suất có ít nhất 1 trong {currentPairs} cặp trùng nhau:
            </div>
            <div className="mt-0.5 font-bold text-blue-700">
              Tại n = 23: C(23, 2) = 253 cặp đối sánh → P = 50.7%
            </div>
          </div>
          <p className="text-[11px] text-slate-600">
            Với 253 cơ hội đối sánh độc lập, việc xuất hiện ít nhất một cặp trùng trở thành biến cố
            tất yếu và rất khả dĩ!
          </p>
        </div>
      </div>
    </div>
  );
};

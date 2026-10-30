'use client';

import * as React from 'react';
import { BookOpen, Lightbulb, Compass, Award } from 'lucide-react';
import { MathFraction } from '@/features/simulations/components';

export function BodyguardExplainer(): React.JSX.Element {
  return (
    <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700">
      {/* Khối 1: Nghịch lý Bida Toán học & Lịch sử */}
      <div className="space-y-2">
        <h4 className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <span>Nghịch Lý Bida Toán Học & Nguồn Gốc Bài Toán Vệ Sĩ</span>
        </h4>
        <p className="text-slate-600">
          Bài toán Vệ sĩ (The Bodyguard Problem) xuất hiện lần đầu trong kỳ thi Olympic Toán
          Leningrad năm 1990 và được nhà toán học Eugene Gutkin nghiên cứu tổng quát hóa năm 2005.
          Trực giác thông thường cho rằng một nguồn sáng phát 360° trong phòng gương kín sẽ tạo ra
          vô hạn tia phản xạ chằng chịt, do đó cần vô hạn chướng ngại vật mới che được mục tiêu.
        </p>
        <p className="text-slate-600">
          Tuy nhiên, toán học chứng minh điều ngược lại: trong căn phòng hình vuông (hoặc đa giác có
          tính chất bida đối xứng), <strong>chỉ cần tối đa 16 điểm</strong> là đủ để chặn 100% mọi
          tia sáng chiếu tới mục tiêu, bất kể tia đó phản xạ 1 lần hay hàng nghìn lần!
        </p>
      </div>

      <hr className="border-slate-200/80" />

      {/* Khối 2: Phương pháp Trải phẳng (Unfolding Technique) */}
      <div className="space-y-2">
        <h4 className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
          <Compass className="h-4 w-4 text-cyan-600" />
          <span>Kỹ Thuật Trải Phẳng (Unfolding Technique) & Nhóm Phản Xạ</span>
        </h4>
        <p className="text-slate-600">
          Chìa khóa của lời giải là biến các đường đi gấp khúc trong phòng thực tế thành các đường
          thẳng tắp trong mặt phẳng vô hạn:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-slate-600">
          <li>
            <strong>Trải phẳng mặt phẳng:</strong> Mỗi lần tia sáng va vào tường gương, thay vì cho
            tia bẻ hướng quay lại, ta lật đối xứng toàn bộ căn phòng qua bức tường đó.
          </li>
          <li>
            <strong>Mạng lưới ô vuông vô hạn:</strong> Mặt phẳng được lát kín bởi các bản sao phản
            xạ của căn phòng ban đầu, tạo thành một lưới tinh thể tuần hoàn với chu kỳ 2 theo cả hai
            trục.
          </li>
          <li>
            <strong>Ảnh ảo của mục tiêu:</strong> Trong mỗi ô vuông (u, w), mục tiêu B có một ảnh ảo
            B&apos; với tọa độ phụ thuộc vào tính chẵn/lẻ của chỉ số ô:
            <span className="block my-1 font-mono text-xs bg-slate-100 p-2 rounded text-slate-800">
              B&apos;(u, w) = (2n &plusmn; x<sub>B</sub>, 2p &plusmn; y<sub>B</sub>)
            </span>
          </li>
        </ul>
      </div>

      <hr className="border-slate-200/80" />

      {/* Khối 3: Tại sao lại là chính xác 16 điểm? */}
      <div className="space-y-2">
        <h4 className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
          <Award className="h-4 w-4 text-emerald-600" />
          <span>Tại Sao Lại Là Tối Đa 16 Điểm Vệ Sĩ? (Định Lý Eugene Gutkin)</span>
        </h4>
        <p className="text-slate-600">
          Bất kỳ tia sáng nào từ A tới ảnh ảo B&apos; đều là một đoạn thẳng nối A và B&apos;. Trung
          điểm của đoạn thẳng này chính là:
        </p>
        <div className="my-2 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 flex items-center flex-wrap gap-2">
          <span>M =</span>
          <MathFraction numerator="A + B'" denominator="2" />
          <span>=</span>
          <span>(</span>
          <MathFraction
            numerator={
              <span>
                x<sub>A</sub> &plusmn; x<sub>B</sub>
              </span>
            }
            denominator="2"
          />
          <span>+ n,</span>
          <MathFraction
            numerator={
              <span>
                y<sub>A</sub> &plusmn; y<sub>B</sub>
              </span>
            }
            denominator="2"
          />
          <span>+ p)</span>
        </div>
        <p className="text-slate-600">
          Khi ta gập ngược mặt phẳng trở lại phòng gốc [0, 1]<sup>2</sup> qua phép chiếu modulo 2,
          các số nguyên n và p chỉ phụ thuộc vào tính chẵn lẻ (n mod 2 &isin; &#123;0, 1&#125;, p
          mod 2 &isin; &#123;0, 1&#125;). Do đó:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-slate-600">
          <li>
            2 lựa chọn cho dấu của x: &plusmn; x<sub>B</sub>
          </li>
          <li>
            2 lựa chọn cho dấu của y: &plusmn; y<sub>B</sub>
          </li>
          <li>2 lựa chọn cho độ dịch chẵn lẻ theo x: k &isin; &#123;0, 1&#125;</li>
          <li>2 lựa chọn cho độ dịch chẵn lẻ theo y: m &isin; &#123;0, 1&#125;</li>
        </ul>
        <p className="font-semibold text-emerald-800">
          Tổng cộng: 2 &times; 2 &times; 2 &times; 2 = 2<sup>4</sup> = 16 điểm trung điểm duy nhất
          trong phòng! Vì mọi đường nối A tới bất kỳ ảnh ảo nào của B đều buộc phải đi qua một trung
          điểm, việc đặt 16 vật cản tại 16 vị trí này bảo đảm 100% tia sáng đều bị triệt tiêu!
        </p>
      </div>

      <hr className="border-slate-200/80" />

      {/* Khối 4: Ứng dụng & Mở rộng */}
      <div className="space-y-2">
        <h4 className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span>Ứng Dụng Thực Tiễn & Các Không Gian Khác</span>
        </h4>
        <p className="text-slate-600">
          Định lý Gutkin về tính chất chặn hữu hạn (Finite Blocking Property) không chỉ đúng với
          hình vuông mà còn mở rộng cho tam giác đều, lục giác đều và các mặt phẳng Riemann phẳng
          (Flat Surfaces). Nó có ứng dụng quan trọng trong lý thuyết tán xạ sóng vô tuyến, thiết kế
          phòng tiêu âm, bida lượng tử (Quantum Billiards) và bảo mật quang học.
        </p>
      </div>
    </div>
  );
}

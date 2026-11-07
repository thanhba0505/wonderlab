'use client';

import * as React from 'react';
import { Lightbulb, Compass, GitCommit, Binary } from 'lucide-react';
import {
  SimulationExplainerCard,
  SimulationFormulaBox,
  MathFraction,
} from '@/features/simulations/components';

export function AntsExplainer() {
  return (
    <SimulationExplainerCard>
      <div className="flex flex-col gap-6 text-slate-800">
        {/* Phần 1: Nghịch lý và Cú twist tư duy */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-700">
            <Lightbulb className="h-5 w-5" />
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Bản Chất Bài Toán: Cú Twist &quot;Xem Va Chạm Như Đi Xuyên Qua Nhau&quot;
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-slate-700">
            Khi mới đọc đề bài với 100 con kiến va chạm và quay đầu liên tiếp, trực giác tự nhiên
            của con người thường rơi vào{' '}
            <strong>Bẫy Ảo Tưởng Phản Ứng Dây Chuyền (Chain-Reaction Bias)</strong>: ta hình dung
            những vụ va chạm liên miên sẽ đẩy các con kiến qua lại như quả bóng bàn, khiến thời gian
            để chúng thoát khỏi thanh gỗ kéo dài hàng giờ hoặc thậm chí kẹt lại vô tận.
          </p>

          <p className="text-sm leading-relaxed text-slate-700">
            Tuy nhiên, bí mật nằm ở tính chất{' '}
            <strong>đồng nhất tuyệt đối (Indistinguishable Particles)</strong> của đàn kiến:
          </p>

          <div className="my-2 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 text-sm leading-relaxed text-slate-800">
            <p className="font-semibold text-amber-950 mb-1.5">
              Nguyên lý Hoán đổi Vận tốc Hoàn hảo:
            </p>
            Khi kiến A (đi sang phải với vận tốc 1 cm/s) va chạm với kiến B (đi sang trái với 1
            cm/s):
            <ul className="list-disc pl-5 mt-1.5 space-y-1">
              <li>Kiến A nảy lại sang trái với tốc độ 1 cm/s (tiếp quản đúng hướng đi của B).</li>
              <li>Kiến B nảy lại sang phải với tốc độ 1 cm/s (tiếp quản đúng hướng đi của A).</li>
            </ul>
            Nếu bạn không dán nhãn tên cho từng con kiến, trạng thái tổng thể của hệ thống{' '}
            <strong>hoàn toàn không thể phân biệt</strong> với việc kiến A và B đơn giản là đi xuyên
            qua nhau mà không hề va chạm!
          </div>
        </div>

        {/* Phần 2: Chứng minh giới hạn thời gian tối đa */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-700">
            <Compass className="h-5 w-5" />
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Chứng Minh Toán Học: Tại Sao Tối Đa Luôn Đúng Bằng 100 Giây?
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-slate-700">
            Dưới góc nhìn tương đương &quot;đi xuyên qua nhau&quot;, mỗi con kiến giống như một
            &quot;bóng ma&quot; chuyển động thẳng đều với vận tốc không đổi{' '}
            <span className="font-mono text-xs">v = 1 cm/s</span> trên thanh gỗ có chiều dài{' '}
            <span className="font-mono text-xs">L = 100 cm</span>.
          </p>

          <SimulationFormulaBox title="Công thức thời gian tồn tại tối đa của hệ thống">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span>T</span>
              <sub>max</sub>
              <span>=</span>
              <MathFraction numerator={<span>L</span>} denominator={<span>v</span>} />
              <span>=</span>
              <MathFraction numerator={<span>100 cm</span>} denominator={<span>1 cm/s</span>} />
              <span>= 100 giây</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Vì không có hạt nào xuất phát ở tọa độ ngoài khoảng [0, 100] cm, quãng đường dài nhất
              mà một hạt có thể di chuyển trước khi chạm mép chỉ tối đa là 100 cm. Do đó sau đúng
              100 giây, chắc chắn toàn bộ đàn kiến sẽ rơi hết!
            </p>
          </SimulationFormulaBox>
        </div>

        {/* Phần 3: Định lý Bảo toàn Thứ tự trên Không gian 1 Chiều */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <GitCommit className="h-5 w-5" />
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Định Lý Bảo Toàn Thứ Tự (Topological Invariance)
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-slate-700">
            Trên thanh gỗ 1 chiều, hai con kiến không bao giờ có thể nhảy vượt qua đầu nhau. Khi va
            chạm, chúng lập tức nảy ngược lại. Do đó:
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <h3 className="font-heading text-sm font-semibold text-slate-900 mb-1">
                Bảo Toàn Thứ Tự Không Gian
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nếu ban đầu{' '}
                <span className="font-mono">
                  x<sub>1</sub> &lt; x<sub>2</sub> &lt; ... &lt; x<sub>N</sub>
                </span>
                , thì tại mọi thời điểm t trong quá trình bò, bất đẳng thức này luôn được giữ
                nguyên. Con kiến ngoài cùng bên trái luôn là cá thể đầu tiên rơi về bên trái!
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <h3 className="font-heading text-sm font-semibold text-slate-900 mb-1">
                Bảo Toàn Số Lượng Thoát
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Số lượng kiến rơi về bên trái{' '}
                <span className="font-mono">
                  N<sub>left</sub>
                </span>{' '}
                luôn bằng chính xác số lượng con kiến ban đầu hướng sang trái. Tương tự, số lượng
                rơi bên phải{' '}
                <span className="font-mono">
                  N<sub>right</sub>
                </span>{' '}
                bằng số con ban đầu hướng sang phải.
              </p>
            </div>
          </div>
        </div>

        {/* Phần 4: Liên hệ Vật lý & Khoa học Máy tính */}
        <div className="flex flex-col gap-2 border-t border-slate-200/80 pt-4">
          <div className="flex items-center gap-2 text-purple-700">
            <Binary className="h-5 w-5" />
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Ý Nghĩa Khoa Học: Từ Cơ Học Lượng Tử Đến Thuật Toán
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-slate-700">
            Bài toán này chứa đựng hai bài học tư duy nền tảng trong khoa học hiện đại:
          </p>

          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <strong>1. Góc nhìn Euler vs Lagrange:</strong> Khi quan sát từng cá thể (Lagrange)
              quá phức tạp vì có quá nhiều tương tác cục bộ, việc chuyển sang quan sát trường phân
              bố của toàn hệ thống (Euler) sẽ biến bài toán phi tuyến tính thành một hệ tuyến tính
              đơn giản.
            </p>
            <p>
              <strong>2. Khái niệm Hạt Đồng Nhất (Indistinguishable Particles):</strong> Trong cơ
              học lượng tử, các electron hoặc photon hoàn toàn đồng nhất. Việc &quot;hoán đổi danh
              tính&quot; của hai hạt không làm thay đổi hàm sóng hay trạng thái đo lường của hệ
              thống vật lý.
            </p>
          </div>
        </div>
      </div>
    </SimulationExplainerCard>
  );
}

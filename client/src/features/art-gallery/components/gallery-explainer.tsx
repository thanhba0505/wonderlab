'use client';

import * as React from 'react';
import { BookOpen, Lightbulb, Award } from 'lucide-react';
import { useTranslation } from '@/i18n';

export const GalleryExplainer: React.FC = () => {
  const { locale } = useTranslation();
  const isEn = locale === 'en';

  return (
    <div className="space-y-6 text-slate-700 font-sans text-xs sm:text-sm leading-relaxed">
      {/* Khối 1: Lịch sử & Câu hỏi của Victor Klee */}
      <div className="space-y-2">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <span>
            {isEn
              ? '1. Problem Origin & Victor Klee’s Question (1973)'
              : '1. Nguồn Gốc Bài Toán & Câu Hỏi Của Victor Klee (1973)'}
          </span>
        </h4>
        <p className="text-slate-600">
          {isEn ? (
            <>
              In 1973 at a Stanford math conference, mathematician Victor Klee posed a deceptively
              simple question to Václav Chvátal:{' '}
              <em>
                &quot;An art museum has n consecutive straight walls forming a simple n-gon. How
                many stationary guards are always sufficient to oversee every corner of the room,
                regardless of its shape?&quot;
              </em>
            </>
          ) : (
            <>
              Năm 1973, tại một hội nghị toán học ở Stanford, nhà toán học Victor Klee đã đặt ra một
              câu hỏi tưởng chừng đơn giản cho Václav Chvátal:{' '}
              <em>
                &quot;Một bảo tàng nghệ thuật có n bức tường thẳng liên tiếp (tạo thành một đa giác
                đơn n đỉnh). Cần bao nhiêu lính gác tĩnh để luôn luôn có thể quan sát hết mọi ngóc
                ngách của căn phòng, bất kể hình thù căn phòng quái dị ra sao?&quot;
              </em>
            </>
          )}
        </p>
        <p className="text-slate-600">
          {isEn ? (
            <>
              Shortly after in 1975, Václav Chvátal proved his eponymous theorem: exactly{' '}
              <strong className="font-mono text-slate-900">&lfloor;n/3&rfloor;</strong> guards are
              always sufficient and sometimes necessary.
            </>
          ) : (
            <>
              Chỉ ít lâu sau, năm 1975, Václav Chvátal đã chứng minh thành công định lý mang tên
              ông: Số người gác luôn luôn đủ và đôi khi là bắt buộc chính xác bằng{' '}
              <strong className="font-mono text-slate-900">&lfloor;n/3&rfloor;</strong>.
            </>
          )}
        </p>
      </div>

      <hr className="border-slate-200/80" />

      {/* Khối 2: Nghệ thuật chứng minh của Steve Fisk */}
      <div className="space-y-2">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Award className="h-4 w-4 text-emerald-600" />
          <span>
            {isEn
              ? '2. The Elegance of Steve Fisk’s Proof (1978)'
              : '2. Vẻ Đẹp Kỳ Diệu Trong Chứng Minh Của Steve Fisk (1978)'}
          </span>
        </h4>
        <p className="text-slate-600">
          {isEn ? (
            <>
              Chvátal’s original proof used lengthy geometric induction. In 1978, Steve Fisk
              published an elegant proof spanning just one journal page, selected by Paul Erdős for{' '}
              <em>&quot;Proofs from THE BOOK&quot;</em>:
            </>
          ) : (
            <>
              Lời giải ban đầu của Chvátal dùng quy nạp hình học rất phức tạp và dài dòng. Năm 1978,
              Steve Fisk công bố một chứng minh chỉ vỏn vẹn trong một trang tạp chí, được nhà toán
              học vĩ đại Paul Erdős tuyển chọn vào cuốn sách danh giá{' '}
              <em>&quot;Proofs from THE BOOK&quot;</em>:
            </>
          )}
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
          <li>
            <strong>{isEn ? 'Polygon Triangulation:' : 'Tam giác hóa đa giác:'}</strong>{' '}
            {isEn ? (
              <>
                Any simple n-gon can be partitioned into{' '}
                <code className="font-mono text-slate-800">n - 2</code> triangles using{' '}
                <code className="font-mono text-slate-800">n - 3</code> internal diagonals (Ear
                Clipping algorithm).
              </>
            ) : (
              <>
                Bất kỳ đa giác đơn n đỉnh nào cũng chia được thành{' '}
                <code className="font-mono text-slate-800">n - 2</code> hình tam giác nhờ{' '}
                <code className="font-mono text-slate-800">n - 3</code> đường chéo nội vi (thuật
                toán Ear Clipping).
              </>
            )}
          </li>
          <li>
            <strong>{isEn ? 'Dual Graph is a Tree:' : 'Đồ thị đối ngẫu là cây:'}</strong>{' '}
            {isEn ? (
              <>
                Treating each triangle as a node and shared edges as branches, the dual graph is an
                acyclic tree. Thus, the vertices of any triangulated polygon can always be{' '}
                <strong>3-colored</strong> without adjacent vertices sharing a color.
              </>
            ) : (
              <>
                Khi xem mỗi tam giác là một nút và hai tam giác chung cạnh là một nhánh nối, đồ thị
                này không bao giờ có chu trình (luôn là một cây). Do đó, các đỉnh của đồ thị tam
                giác hóa luôn có thể tô bằng <strong>3 màu</strong> sao cho không có cạnh nào nối 2
                đỉnh cùng màu.
              </>
            )}
          </li>
          <li>
            <strong>{isEn ? 'Pigeonhole Principle:' : 'Nguyên lý Dirichlet (Lồng chim):'}</strong>{' '}
            {isEn ? (
              <>
                Partitioning n vertices into 3 color classes guarantees that the least frequent
                color class contains at most{' '}
                <code className="font-mono text-slate-800">&le; &lfloor;n/3&rfloor;</code> vertices.
              </>
            ) : (
              <>
                Có n đỉnh chia cho 3 màu. Chắc chắn nhóm màu xuất hiện ít nhất sẽ có số lượng đỉnh{' '}
                <code className="font-mono text-slate-800">&le; &lfloor;n/3&rfloor;</code>.
              </>
            )}
          </li>
          <li>
            <strong>{isEn ? 'Triangles are Convex Sets:' : 'Tam giác là tập lồi:'}</strong>{' '}
            {isEn ? (
              <>
                Every triangle contains all 3 colors, so each has at least one vertex in that
                minimal color group. A guard at any vertex of a convex triangle sees 100% of its
                area. The union of all triangles covers the entire gallery!
              </>
            ) : (
              <>
                Mỗi tam giác con có đủ 3 màu, tức là luôn chứa 1 đỉnh thuộc nhóm màu cực tiểu đó.
                Một người đứng tại đỉnh tam giác lồi sẽ nhìn thấy trọn vẹn 100% diện tích tam giác
                đó. Hợp của mọi tam giác chính là toàn bộ phòng trưng bày!
              </>
            )}
          </li>
        </ul>
      </div>

      <hr className="border-slate-200/80" />

      {/* Khối 3: Khoảng cách giữa Chặn Trên và Bài toán Tối Ưu Thực Tế (NP-hard) */}
      <div className="space-y-2">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span>
            {isEn
              ? '3. Why Finding Minimal Guards for a Specific Room is NP-Hard?'
              : '3. Tại Sao Tìm Số Lính Ít Nhất Cho Một Bản Vẽ Lại Là NP-Hard?'}
          </span>
        </h4>
        <p className="text-slate-600">
          {isEn
            ? 'We must clearly distinguish between two very different mathematical questions:'
            : 'Cần phân biệt rõ hai câu hỏi toán học rất khác nhau:'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-mono text-xs font-bold text-blue-700 uppercase">
              {isEn
                ? '1. Worst-Case Bound (Guaranteed Safety)'
                : '1. Chặn Trên Mọi Trường Hợp (Worst-Case Bound)'}
            </span>
            <p className="text-xs text-slate-600">
              {isEn ? (
                <>
                  Chvátal’s theorem guarantees that even for the most convoluted room (like combs),
                  we never need more than &lfloor;n/3&rfloor; guards. Guard locations can be
                  computed in <code className="font-mono">O(n log n)</code> time.
                </>
              ) : (
                <>
                  Định lý Chvátal cho ta một bảo đảm an toàn: dù căn phòng có hình thù quái gở nhất
                  (như răng lược), ta không bao giờ cần quá &lfloor;n/3&rfloor; người. Ta tìm được
                  vị trí đặt lính chỉ trong thời gian <code className="font-mono">O(n log n)</code>.
                </>
              )}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-mono text-xs font-bold text-rose-700 uppercase">
              {isEn
                ? '2. Specific Floor Plan Optimization (Minimum Guard)'
                : '2. Tối Ưu Cho 1 Phòng Cụ Thể (Minimum Guard Problem)'}
            </span>
            <p className="text-xs text-slate-600">
              {isEn ? (
                <>
                  Given a specific floor plan, finding the absolute minimum number of guards (e.g. 2
                  instead of 4 for a 12-gon) is <strong>NP-hard</strong> and{' '}
                  <strong>APX-hard</strong>. No algorithm can find the exact optimum in polynomial
                  time as n grows large.
                </>
              ) : (
                <>
                  Với một bản vẽ phòng cụ thể đưa vào, việc tìm số lượng lính ít nhất tuyệt đối (ví
                  dụ phòng 12 đỉnh nhưng thực tế chỉ cần 2 lính thay vì 4) là bài toán{' '}
                  <strong>NP-khó (NP-hard)</strong> và <strong>APX-hard</strong>. Máy tính không thể
                  tìm ra lời giải tối ưu nhanh chóng nếu số đỉnh n lớn.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

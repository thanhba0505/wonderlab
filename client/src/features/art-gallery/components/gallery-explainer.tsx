'use client';

import * as React from 'react';
import { BookOpen, Lightbulb, Award } from 'lucide-react';

export const GalleryExplainer: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-700 font-sans text-xs sm:text-sm leading-relaxed">
      {/* Khối 1: Lịch sử & Câu hỏi của Victor Klee */}
      <div className="space-y-2">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <span>1. Nguồn Gốc Bài Toán & Câu Hỏi Của Victor Klee (1973)</span>
        </h4>
        <p className="text-slate-600">
          Năm 1973, tại một hội nghị toán học ở Stanford, nhà toán học Victor Klee đã đặt ra một câu
          hỏi tưởng chừng đơn giản cho Václav Chvátal:{' '}
          <em>
            &quot;Một bảo tàng nghệ thuật có n bức tường thẳng liên tiếp (tạo thành một đa giác đơn
            n đỉnh). Cần bao nhiêu lính gác tĩnh để luôn luôn có thể quan sát hết mọi ngóc ngách của
            căn phòng, bất kể hình thù căn phòng quái dị ra sao?&quot;
          </em>
        </p>
        <p className="text-slate-600">
          Chỉ ít lâu sau, năm 1975, Václav Chvátal đã chứng minh thành công định lý mang tên ông: Số
          người gác luôn luôn đủ và đôi khi là bắt buộc chính xác bằng{' '}
          <strong className="font-mono text-slate-900">&lfloor;n/3&rfloor;</strong>.
        </p>
      </div>

      <hr className="border-slate-200/80" />

      {/* Khối 2: Nghệ thuật chứng minh của Steve Fisk */}
      <div className="space-y-2">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Award className="h-4 w-4 text-emerald-600" />
          <span>2. Vẻ Đẹp Kỳ Diệu Trong Chứng Minh Của Steve Fisk (1978)</span>
        </h4>
        <p className="text-slate-600">
          Lời giải ban đầu của Chvátal dùng quy nạp hình học rất phức tạp và dài dòng. Năm 1978,
          Steve Fisk công bố một chứng minh chỉ vỏn vẹn trong một trang tạp chí, được nhà toán học
          vĩ đại Paul Erdős tuyển chọn vào cuốn sách danh giá{' '}
          <em>&quot;Proofs from THE BOOK&quot;</em>:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
          <li>
            <strong>Tam giác hóa đa giác:</strong> Bất kỳ đa giác đơn n đỉnh nào cũng chia được
            thành <code className="font-mono text-slate-800">n - 2</code> hình tam giác nhờ{' '}
            <code className="font-mono text-slate-800">n - 3</code> đường chéo nội vi (thuật toán
            Ear Clipping).
          </li>
          <li>
            <strong>Đồ thị đối ngẫu là cây:</strong> Khi xem mỗi tam giác là một nút và hai tam giác
            chung cạnh là một nhánh nối, đồ thị này không bao giờ có chu trình (luôn là một cây). Do
            đó, các đỉnh của đồ thị tam giác hóa luôn có thể tô bằng <strong>3 màu</strong> sao cho
            không có cạnh nào nối 2 đỉnh cùng màu.
          </li>
          <li>
            <strong>Nguyên lý Dirichlet (Lồng chim):</strong> Có n đỉnh chia cho 3 màu. Chắc chắn
            nhóm màu xuất hiện ít nhất sẽ có số lượng đỉnh{' '}
            <code className="font-mono text-slate-800">&le; &lfloor;n/3&rfloor;</code>.
          </li>
          <li>
            <strong>Tam giác là tập lồi:</strong> Mỗi tam giác con có đủ 3 màu, tức là luôn chứa 1
            đỉnh thuộc nhóm màu cực tiểu đó. Một người đứng tại đỉnh tam giác lồi sẽ nhìn thấy trọn
            vẹn 100% diện tích tam giác đó. Hợp của mọi tam giác chính là toàn bộ phòng trưng bày!
          </li>
        </ul>
      </div>

      <hr className="border-slate-200/80" />

      {/* Khối 3: Khoảng cách giữa Chặn Trên và Bài toán Tối Ưu Thực Tế (NP-hard) */}
      <div className="space-y-2">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span>3. Tại Sao Tìm Số Lính Ít Nhất Cho Một Bản Vẽ Lại Là NP-Hard?</span>
        </h4>
        <p className="text-slate-600">Cần phân biệt rõ hai câu hỏi toán học rất khác nhau:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-mono text-xs font-bold text-blue-700 uppercase">
              1. Chặn Trên Mọi Trường Hợp (Worst-Case Bound)
            </span>
            <p className="text-xs text-slate-600">
              Định lý Chvátal cho ta một bảo đảm an toàn: dù căn phòng có hình thù quái gở nhất (như
              răng lược), ta không bao giờ cần quá &lfloor;n/3&rfloor; người. Ta tìm được vị trí đặt
              lính chỉ trong thời gian <code className="font-mono">O(n log n)</code>.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-mono text-xs font-bold text-rose-700 uppercase">
              2. Tối Ưu Cho 1 Phòng Cụ Thể (Minimum Guard Problem)
            </span>
            <p className="text-xs text-slate-600">
              Với một bản vẽ phòng cụ thể đưa vào, việc tìm số lượng lính ít nhất tuyệt đối (ví dụ
              phòng 12 đỉnh nhưng thực tế chỉ cần 2 lính thay vì 4) là bài toán{' '}
              <strong>NP-khó (NP-hard)</strong> và <strong>APX-hard</strong>. Máy tính không thể tìm
              ra lời giải tối ưu nhanh chóng nếu số đỉnh n lớn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

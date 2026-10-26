'use client';

import * as React from 'react';
import { BookOpen, Cpu, HardDrive, ShieldCheck, Binary } from 'lucide-react';
import { useTranslation } from '@/i18n';

export function ParityExplainer() {
  const { locale } = useTranslation();
  const isEn = locale === 'en';

  return (
    <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-7 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] space-y-6">
      {/* Editorial Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-slate-900">
            {isEn
              ? 'From Hat Puzzles to Modern Computing Architecture'
              : 'Từ Câu Đố Chiếc Mũ Đến Kiến Trúc Điện Toán Hiện Đại'}
          </h2>
          <p className="text-xs text-slate-600 font-sans">
            {isEn
              ? 'Information theory, parity check bits, and error-correction engineering foundations'
              : 'Lý thuyết thông tin, mã kiểm tra chẵn lẻ (Parity Bit) và nền tảng của kỹ thuật sửa sai'}
          </p>
        </div>
      </div>

      {/* Section 1: The Intuition Trap */}
      <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
        <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
          <Binary className="h-4 w-4 text-indigo-600" />
          {isEn
            ? '1. The Independence Fallacy & Power of Cooperative Information'
            : '1. Ảo Tưởng Tính Độc Lập & Sức Mạnh Của Thông Tin Hợp Tác'}
        </h3>
        <p>
          {isEn
            ? 'When first encountering the problem, our intuition suggests that because nobody sees their own hat and colors are distributed 50/50, each individual has at most a 50% chance of survival. The probability that 9 consecutive prisoners guess correctly at random is infinitesimal:'
            : 'Khi tiếp cận bài toán lần đầu, trực giác thông thường của chúng ta cho rằng vì mỗi người không nhìn thấy chiếc mũ của mình và mũ được phân bổ ngẫu nhiên 50/50, nên mỗi người chỉ có tối đa 50% cơ hội sống sót. Xác suất để 9 người liên tiếp cùng đoán đúng một cách ngẫu nhiên là vô cùng mong manh:'}
        </p>
        <div className="font-mono text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200 text-slate-800">
          {isEn
            ? 'P(Random 9 guesses) = (1/2)⁹ = 1 / 512 ≈ 0.195%'
            : 'P(Đoán mò 9 người) = (1/2)⁹ = 1 / 512 ≈ 0.195%'}
        </div>
        <p>
          {isEn ? (
            <>
              However, by sacrificing the last person to broadcast a{' '}
              <strong>parity check bit (Parity Bit)</strong>, the team converts independent events
              into a <em>system of linear congruence equations</em>. Each announced guess saves that
              person and yields the exact data needed for the next person to solve their own
              equation.
            </>
          ) : (
            <>
              Tuy nhiên, bằng cách hy sinh người đứng cuối cùng để phát đi một{' '}
              <strong>bit kiểm tra tính chẵn lẻ (Parity Bit)</strong>, cả nhóm đã chuyển hóa các
              biến cố độc lập thành một <em>hệ thống phương trình tuyến tính đồng dư</em>. Mỗi câu
              trả lời phát ra không chỉ giải cứu người nói mà còn cung cấp thêm dữ liệu để người
              tiếp theo giải phương trình của riêng họ.
            </>
          )}
        </p>
      </div>

      {/* Section 2: Mathematical Foundation */}
      <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
        <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          {isEn
            ? '2. Algebra Over Finite Field F₂ & The XOR Operation'
            : '2. Đại Số Trên Trường Hữu Hạn F₂ & Phép Toán XOR'}
        </h3>
        <p>
          {isEn
            ? 'In discrete mathematics, parity corresponds to addition in the binary field F₂ (or GF(2)), equivalent to the logical XOR operator (⊕):'
            : 'Trong toán học rời rạc, tính chẵn lẻ chính là phép cộng trong trường nhị phân F₂ (hay GF(2)), tương đương với toán tử logic XOR (⊕):'}
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>
            <strong>0 &oplus; 0 = 0</strong>{' '}
            {isEn ? '(Even ⊕ Even = Even)' : '(Chẵn & Chẵn = Chẵn)'}
          </li>
          <li>
            <strong>0 &oplus; 1 = 1</strong> {isEn ? '(Even ⊕ Odd = Odd)' : '(Chẵn & Lẻ = Lẻ)'}
          </li>
          <li>
            <strong>1 &oplus; 1 = 0</strong> {isEn ? '(Odd ⊕ Odd = Even)' : '(Lẻ & Lẻ = Chẵn)'}
          </li>
        </ul>
        <p>
          {isEn ? (
            <>
              Because the <code>XOR</code> operation is self-inverting (A &oplus; A = 0), once the
              last prisoner broadcasts P = c₁ &oplus; c₂ &oplus; ... &oplus; cₙ₋₁, anyone who knows
              P and the (n &minus; 2) other values can isolate their own color perfectly:
            </>
          ) : (
            <>
              Vì phép <code>XOR</code> có tính chất tự nghịch đảo (A &oplus; A = 0), khi người đứng
              cuối công bố P = c₁ &oplus; c₂ &oplus; ... &oplus; cₙ₋₁, bất kỳ ai biết P và (n
              &minus; 2) giá trị còn lại đều có thể trích xuất màu của mình một cách hoàn hảo:
            </>
          )}
        </p>
        <div className="font-mono text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200 text-blue-700 font-bold">
          {'cₖ = P ⊕ (⊕_{j ≠ k} cⱼ)'}
        </div>
      </div>

      {/* Section 3: Real-World Applications */}
      <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans border-t border-slate-200/80 pt-4">
        <h3 className="font-heading text-sm font-bold text-slate-900">
          {isEn
            ? '3. Applications in Computer Systems & Telecommunications'
            : '3. Ứng Dụng Trong Kỹ Thuật Máy Tính & Viễn Thông'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ECC RAM */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
              <Cpu className="h-4 w-4 text-blue-600" />
              <span>
                {isEn
                  ? 'ECC RAM Memory (Error-Correcting Code)'
                  : 'Bộ Nhớ RAM ECC (Error-Correcting Code)'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isEn
                ? 'Charged cosmic radiation particles can flip a bit (0 to 1 or vice versa) in memory chips. By appending a parity bit to every data byte (9 bits instead of 8), servers detect single-bit errors immediately without crashing running applications.'
                : 'Các hạt mang điện từ bức xạ vũ trụ có thể làm lật một bit (0 thành 1 hoặc ngược lại) trong chip RAM. Bằng cách thêm một bit parity vào mỗi byte dữ liệu (9 bit thay vì 8 bit), hệ thống máy chủ phát hiện lỗi ngay lập tức mà không làm sập ứng dụng.'}
            </p>
          </div>

          {/* RAID 5 */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
              <HardDrive className="h-4 w-4 text-indigo-600" />
              <span>
                {isEn ? 'RAID 4 & RAID 5 Storage Arrays' : 'Mảng Lưu Trữ RAID 4 & RAID 5'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isEn
                ? 'In modern data centers, RAID 5 distributes parity blocks across all physical disks. If any single hard drive suffers catastrophic failure, 100% of its data is reconstructed on the fly via XOR operations across the remaining surviving drives.'
                : 'Trong các trung tâm dữ liệu, RAID 5 phân phối các khối parity trên tất cả ổ cứng. Nếu bất kỳ một ổ cứng vật lý nào đột ngột bị cháy hoặc hư hỏng cơ học, toàn bộ 100% dữ liệu của ổ đó được tính toán lại ngay lập tức thông qua phép XOR giữa các ổ còn sống.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Sparkles, Github, ArrowUpRight, Scale } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-300/80 bg-slate-200/40 py-12 text-slate-600">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/20 ring-1 ring-black/5">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-heading font-black text-slate-900 tracking-tight">
                WONDER<span className="text-blue-600">LAB</span>
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-600 font-sans">
              Không gian thí nghiệm trực quan cho khoa học, toán học, xác suất và nghịch lý logic.
              Khám phá cách thế giới vận hành qua những hiện tượng phản trực giác.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
              Khám phá
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <a
                  href="#featured"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Nghịch lý Monty Hall
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Chủ đề khoa học & Bento
                </a>
              </li>
              <li>
                <a
                  href="#curated"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Danh mục tuyển chọn
                </a>
              </li>
              <li>
                <a
                  href="#editorial"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Tiểu luận & Tư duy
                </a>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-amber-700 hover:text-amber-800 transition-colors font-medium"
                >
                  Quản trị (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Open source & Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
              Mã nguồn
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <a
                  href="https://github.com/thanhba0505/wonderlab"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Github className="h-4 w-4" />
                  GitHub Repository
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Scale className="h-4 w-4" />
                  Giấy phép MIT License
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Wonderlab Foundation. Mã nguồn mở phục vụ nghiên cứu và giáo dục cộng đồng.</p>
          <p className="mt-2 sm:mt-0 font-sans text-slate-500">
            Khoa học thực nghiệm & Giáo dục khai phóng
          </p>
        </div>
      </div>
    </footer>
  );
}

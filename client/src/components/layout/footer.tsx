import Link from 'next/link';
import { Sparkles, Github, Terminal, ArrowUpRight } from 'lucide-react';

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
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 pt-2 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>NestJS Server API: Sẵn sàng hoạt động (/api/v1/health)</span>
            </div>
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

          {/* Open source & dev */}
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
                <a
                  href="http://localhost:4101/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Terminal className="h-4 w-4" />
                  Swagger API Docs
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Wonderlab Foundation. Mã nguồn mở phục vụ nghiên cứu và giáo dục cộng đồng.</p>
          <p className="mt-2 sm:mt-0 font-mono text-blue-700 font-semibold">
            Next.js 15 • React 19 • NestJS 10 • Clean Paper Lab
          </p>
        </div>
      </div>
    </footer>
  );
}

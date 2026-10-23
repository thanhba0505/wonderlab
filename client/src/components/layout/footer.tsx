import Link from 'next/link';
import { Sparkles, Github, Terminal, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 py-12 text-slate-400">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-violet-600">
                <Sparkles className="h-4 w-4 text-slate-950" />
              </div>
              <span className="text-lg font-bold text-slate-100 tracking-tight">
                WONDER<span className="text-cyan-400">LAB</span>
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              Không gian thí nghiệm trực quan cho khoa học, toán học, xác suất và nghịch lý logic.
              Khám phá cách thế giới vận hành qua những hiện tượng phản trực giác.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 pt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>NestJS Server API: Operational (/api/v1/health)</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Khám phá
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#featured" className="hover:text-cyan-400 transition-colors">
                  Nghịch lý Monty Hall
                </a>
              </li>
              <li>
                <a href="#explore" className="hover:text-cyan-400 transition-colors">
                  Chủ đề khoa học
                </a>
              </li>
              <li>
                <a href="#editorial" className="hover:text-cyan-400 transition-colors">
                  Tiểu luận & Tư duy
                </a>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition-colors">
                  Quản trị (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Open source & dev */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Mã nguồn
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/thanhba0505/wonderlab"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <Github className="h-4 w-4" />
                  GitHub Repository
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:3001/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <Terminal className="h-4 w-4" />
                  Swagger API Docs
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Wonderlab Foundation. Mã nguồn mở phục vụ nghiên cứu và giáo dục cộng đồng.</p>
          <p className="mt-2 sm:mt-0 font-mono">
            Next.js 15 • React 19 • NestJS 10 • PostgreSQL 16
          </p>
        </div>
      </div>
    </footer>
  );
}

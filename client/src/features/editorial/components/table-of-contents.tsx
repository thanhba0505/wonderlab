'use client';

import * as React from 'react';
import { EditorialSectionBlock } from '@/types';
import { ListOrdered } from 'lucide-react';

interface TableOfContentsProps {
  sections: EditorialSectionBlock[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <nav
      aria-label="Mục lục bài viết"
      className="p-4 sm:p-5 rounded-xl border border-slate-300/85 bg-white shadow-xs space-y-3"
    >
      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
        <ListOrdered className="h-4 w-4 text-blue-700" />
        <span>Mục lục bài tiểu luận</span>
      </div>

      <ol className="space-y-2 text-xs sm:text-sm font-sans">
        {sections.map((section, idx) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="flex items-start gap-2 text-slate-600 hover:text-blue-700 transition-colors group py-0.5"
            >
              <span className="font-mono text-xs font-semibold text-slate-400 group-hover:text-blue-600">
                0{idx + 1}.
              </span>
              <span className="group-hover:underline underline-offset-2">{section.heading}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

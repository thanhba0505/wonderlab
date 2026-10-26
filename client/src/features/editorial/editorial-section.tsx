'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote, Atom, ArrowUpRight } from 'lucide-react';
import { ESSAYS } from './essays-data';
import { useTranslation } from '@/i18n';

export function EditorialSection() {
  const { dict } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8">
      {ESSAYS.map((article, idx) => {
        const href = `/essays/${article.slug || article.id}`;

        return (
          <Link
            key={article.id}
            href={href}
            className="block group rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-[0.99] transition-transform"
          >
            <Card className="h-full relative border-slate-300/85 bg-white flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition-all duration-300 p-6 xl:p-7 overflow-hidden shadow-xs cursor-pointer">
              {/* Subtle watermark background number */}
              <div className="absolute top-2 right-4 text-7xl font-mono font-black text-slate-100 select-none pointer-events-none group-hover:text-blue-50 transition-colors">
                0{idx + 1}
              </div>

              <CardHeader className="p-0 space-y-3 relative z-10">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-mono text-blue-700 font-bold">
                    <Atom className="h-3.5 w-3.5" />
                    {dict.essays.essay_prefix}
                    {article.issueNumber || `0${idx + 1}`}
                  </span>
                  <span className="font-mono text-slate-400">
                    {article.readTimeMinutes} {dict.essays.min_read}
                  </span>
                </div>

                <div>
                  <CardTitle className="text-lg font-heading font-extrabold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                    {article.title}
                  </CardTitle>
                  <p className="text-xs font-mono text-blue-700/80 mt-1.5 font-medium">
                    {article.subtitle}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-0 pt-4 space-y-4 flex-1 flex flex-col justify-between relative z-10">
                <p className="text-sm text-slate-600 leading-relaxed font-sans">{article.teaser}</p>

                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50/80 p-3.5 border-l-2 border-blue-600 text-xs italic text-slate-800 flex items-start gap-2.5">
                    <Quote className="h-4 w-4 shrink-0 text-blue-600 opacity-80 mt-0.5" />
                    <span className="leading-relaxed">&ldquo;{article.quote}&rdquo;</span>
                  </div>

                  <div className="flex items-center text-xs font-bold text-slate-600 group-hover:text-blue-700 transition-colors">
                    <span>{dict.essays.read_more}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

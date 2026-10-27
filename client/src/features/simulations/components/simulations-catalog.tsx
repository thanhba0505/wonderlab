'use client';

import * as React from 'react';
import Link from 'next/link';
import { SimulationMeta } from '../types';
import { getAllSimulations } from '../registry';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, FlaskConical, Sparkles, Search } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface SimulationsCatalogProps {
  initialSimulations: SimulationMeta[];
}

export function SimulationsCatalog({ initialSimulations }: SimulationsCatalogProps) {
  const { locale, dict } = useTranslation();

  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const categories = [
    { id: 'all', label: dict.simulations.filter_all },
    { id: 'probability', label: dict.simulations.category_probability },
    { id: 'physics', label: dict.simulations.category_physics },
    { id: 'game-theory', label: dict.simulations.category_game_theory },
    { id: 'paradox', label: dict.simulations.category_paradox },
  ];

  const localizedSimulations = React.useMemo(() => {
    if (initialSimulations && locale === 'vi') {
      return initialSimulations;
    }
    return getAllSimulations(locale);
  }, [initialSimulations, locale]);

  const filteredSimulations = React.useMemo(() => {
    return localizedSimulations.filter(sim => {
      const matchesCategory = selectedCategory === 'all' || sim.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sim.title.toLowerCase().includes(q) ||
        sim.subtitle.toLowerCase().includes(q) ||
        sim.summary.toLowerCase().includes(q) ||
        sim.tags.some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [localizedSimulations, selectedCategory, search]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header chỉ mục */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 font-mono text-xs text-blue-600 font-semibold uppercase tracking-wider">
          <FlaskConical className="h-4 w-4" />
          <span>{dict.simulations.library_repo}</span>
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {dict.simulations.title}
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 leading-relaxed font-sans">
          {dict.simulations.subtitle}
        </p>

        {/* Filter and Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Categories Tab */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition active:scale-[0.98] ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={dict.simulations.search_placeholder}
              className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Lưới danh sách mô phỏng */}
      {filteredSimulations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <p className="text-sm font-medium">{dict.simulations.no_results}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSimulations.map(sim => {
            const isActive = sim.status === 'active';

            return (
              <div
                key={sim.slug}
                className="lab-card lab-card-hover flex flex-col justify-between rounded-xl p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-500 uppercase">
                      {sim.category}
                    </span>
                    {isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                        <Sparkles className="mr-1 h-3 w-3" />
                        {dict.simulations.active_badge}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 border-slate-300">
                        {dict.simulations.upcoming_badge}
                      </Badge>
                    )}
                  </div>

                  <Link href={`/simulations/${sim.slug}`} className="block">
                    <h3 className="font-heading mt-3 text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {sim.title}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">{sim.subtitle}</p>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">{sim.summary}</p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1 font-mono text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      ~{sim.estimatedMinutes} {dict.simulations.min_unit}
                    </span>
                  </div>

                  <Link href={`/simulations/${sim.slug}`}>
                    <Button
                      size="sm"
                      variant={isActive ? 'default' : 'outline'}
                      className={
                        isActive
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'border-slate-300 text-slate-600'
                      }
                    >
                      <span>{isActive ? dict.home.enter_lab : dict.simulations.coming_soon}</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Khối kêu gọi đề xuất bài toán mới */}
      <div className="mt-4 rounded-2xl border border-slate-300/85 bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-700 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>{dict.simulations.community_ideas}</span>
          </div>
          <h2 className="font-heading mt-1 text-lg font-bold text-slate-900">
            {dict.simulations.community_ideas}
          </h2>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            {dict.simulations.community_ideas_desc}
          </p>
        </div>
        <Link href="/requests">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            <span>{dict.simulations.propose_and_vote}</span>
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

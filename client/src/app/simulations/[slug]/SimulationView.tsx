'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n';
import { useSimulationMeta } from '@/features/simulations/hooks';
import { SimulationMeta } from '@/features/simulations/types';
import { BirthdaySimulation } from '@/features/birthday-paradox/birthday-simulation';
import { MontyHallSimulation } from '@/features/monty-hall/monty-hall-simulation';
import { DoubleSlitSimulation } from '@/features/double-slit/double-slit-simulation';
import { PrisonersDilemmaSimulation } from '@/features/prisoners-dilemma/prisoners-dilemma-simulation';
import { ZenoSimulation } from '@/features/zeno-paradox/zeno-simulation';
import { ArtGallerySimulation } from '@/features/art-gallery/art-gallery-simulation';
import { PrisonersHatsSimulation } from '@/features/prisoners-hats/prisoners-hats-simulation';
import { CommentSection } from '@/features/simulations/components/comment-section';
import { SimulationMathCard } from '@/features/simulations/components/simulation-math-card';
import { SimulationSection } from '@/features/simulations/components/simulation-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, FlaskConical, Sparkles } from 'lucide-react';

interface SimulationViewProps {
  slug: string;
  initialSim: SimulationMeta;
}

export function SimulationView({ slug, initialSim }: SimulationViewProps) {
  const { dict } = useTranslation();
  const meta = useSimulationMeta(slug) ?? initialSim;

  const difficultyLabel = React.useMemo(() => {
    switch (meta.difficulty) {
      case 'beginner':
        return dict.simulations.difficulty_beginner;
      case 'intermediate':
        return dict.simulations.difficulty_intermediate;
      case 'advanced':
        return dict.simulations.difficulty_advanced;
      default:
        return meta.difficulty;
    }
  }, [meta.difficulty, dict.simulations]);

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb và Header điều hướng */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Link href="/" className="flex items-center gap-1 hover:text-slate-800">
            <ArrowLeft className="h-3.5 w-3.5" />
            {dict.nav.home}
          </Link>
          <span>/</span>
          <Link href="/simulations" className="hover:text-slate-800">
            {dict.nav.simulations}
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate">{meta.title}</span>
        </div>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {meta.title}
              </h1>
              {meta.status === 'active' ? (
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
            <p className="mt-1 text-sm text-slate-600">{meta.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-500">
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
              <Clock className="h-3.5 w-3.5" />~{meta.estimatedMinutes} {dict.simulations.min_unit}
            </span>
            <span className="bg-slate-100 px-2 py-1 rounded capitalize">
              {dict.simulations.difficulty} {difficultyLabel}
            </span>
          </div>
        </div>

        {/* Tóm tắt & Mô hình toán học */}
        <div className="mt-2">
          <SimulationMathCard slug={meta.slug} summary={meta.summary} />
        </div>
      </div>

      {/* Vùng hiển thị tương tác */}
      {meta.slug === 'birthday-paradox' && <BirthdaySimulation />}
      {meta.slug === 'monty-hall' && <MontyHallSimulation />}
      {meta.slug === 'double-slit' && <DoubleSlitSimulation />}
      {meta.slug === 'prisoners-dilemma' && <PrisonersDilemmaSimulation />}
      {meta.slug === 'zeno-paradox' && <ZenoSimulation />}
      {meta.slug === 'art-gallery' && <ArtGallerySimulation />}
      {meta.slug === 'prisoners-hats' && <PrisonersHatsSimulation />}

      {/* Hiển thị cho các mô phỏng đang phát triển */}
      {meta.status === 'in-development' && (
        <div className="lab-card rounded-xl border-slate-300 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4 border border-slate-200">
            <FlaskConical className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="font-heading text-lg font-bold text-slate-900">
            {dict.simulations.under_construction_title}
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 leading-relaxed">
            {meta.description}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/simulations/birthday-paradox">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                {dict.simulations.explore_birthday}
              </Button>
            </Link>
            <Link href="/simulations/monty-hall">
              <Button variant="outline" className="border-slate-300">
                {dict.simulations.try_monty_hall}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Đường phân cách trước phần thảo luận */}
      <hr className="border-slate-200/80 my-2" />

      {/* Title Bình Luận & Thảo Luận */}
      <SimulationSection
        dotColor="indigo"
        title={dict.simulations.scientific_discussion}
        subtitle={dict.simulations.discussion_guideline}
      >
        <CommentSection simulationSlug={meta.slug} />
      </SimulationSection>
    </div>
  );
}

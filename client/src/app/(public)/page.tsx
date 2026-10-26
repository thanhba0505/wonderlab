'use client';

import { Button } from '@/components/ui/button';
import { HeroVisual } from '@/features/hero/hero-visual';
import { MontyHallSimulation } from '@/features/monty-hall/monty-hall-simulation';
import { CategoryGrid } from '@/features/explore/category-grid';
import { CuratedList } from '@/features/curated/curated-list';
import { EditorialSection } from '@/features/editorial/editorial-section';
import { FlaskConical, Compass, BookOpen, Atom } from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function HomePage() {
  const { dict } = useTranslation();

  return (
    <div className="flex flex-col gap-24 pb-28">
      {/* ==================================================================== */}
      {/* HERO SECTION */}
      {/* ==================================================================== */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="container mx-auto max-w-7xl xl:max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1.5 text-xs font-mono font-medium text-blue-700 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span>{dict.home.hero_badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                {dict.home.hero_title_lead}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                  {dict.home.hero_title_accent}
                </span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-sans font-normal">
                {dict.home.hero_desc}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href="#featured">
                  <Button size="lg" className="shadow-md shadow-blue-500/20 font-bold px-7">
                    <FlaskConical className="h-5 w-5 mr-2" />
                    {dict.home.hero_primary_cta}
                  </Button>
                </a>
                <a href="#explore">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="border-slate-300 font-semibold px-7"
                  >
                    <Compass className="h-5 w-5 mr-2 text-blue-600" />
                    {dict.home.hero_secondary_cta}
                  </Button>
                </a>
              </div>

              {/* Core virtues pills */}
              <div className="pt-5 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-mono text-slate-700">
                <span className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  {dict.home.hero_feature_1}
                </span>
                <span className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-violet-600" />
                  {dict.home.hero_feature_2}
                </span>
                <span className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  {dict.home.hero_feature_3}
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Constellation Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FEATURED EXPERIENCE (MONTY HALL INTERACTIVE) */}
      {/* ==================================================================== */}
      <section id="featured" className="scroll-mt-24">
        <div className="container mx-auto max-w-7xl xl:max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-blue-600" />
              <h2 className="text-xs font-mono font-bold tracking-widest text-blue-700 uppercase">
                {dict.home.featured_badge}
              </h2>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              {dict.home.featured_title}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-sans">
              {dict.home.featured_desc}
            </p>
          </div>

          <MontyHallSimulation showHistory={false} />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* EXPLORE CATEGORIES */}
      {/* ==================================================================== */}
      <section id="explore" className="scroll-mt-24">
        <div className="container mx-auto max-w-7xl xl:max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-violet-600" />
              <h2 className="text-xs font-mono font-bold tracking-widest text-violet-700 uppercase">
                {dict.home.topics_badge}
              </h2>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              {dict.home.topics_title}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-sans">
              {dict.home.topics_desc}
            </p>
          </div>

          <CategoryGrid />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* CURATED EXPERIENCES */}
      {/* ==================================================================== */}
      <section id="curated" className="scroll-mt-24">
        <div className="container mx-auto max-w-7xl xl:max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-2">
              <Atom className="h-5 w-5 text-amber-600" />
              <h2 className="text-xs font-mono font-bold tracking-widest text-amber-700 uppercase">
                {dict.home.curated_badge}
              </h2>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              {dict.home.curated_title}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-sans">
              {dict.home.curated_desc}
            </p>
          </div>

          <CuratedList />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* EDITORIAL SECTION */}
      {/* ==================================================================== */}
      <section id="editorial" className="scroll-mt-24">
        <div className="container mx-auto max-w-7xl xl:max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xs font-mono font-bold tracking-widest text-emerald-700 uppercase">
                {dict.home.editorial_badge}
              </h2>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              {dict.home.editorial_title}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-sans">
              {dict.home.editorial_desc}
            </p>
          </div>

          <EditorialSection />
        </div>
      </section>
    </div>
  );
}

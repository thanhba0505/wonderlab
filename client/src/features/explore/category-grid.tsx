'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Atom,
  Dice5,
  Infinity as InfinityIcon,
  Gamepad2,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from '@/i18n';

export function CategoryGrid() {
  const { dict } = useTranslation();
  // Mini interactive state for Tile 1: Double-slit mode
  const [slitsMode, setSlitsMode] = React.useState<'single' | 'double'>('double');

  // Mini interactive state for Tile 2: Dice roll
  const [diceRoll, setDiceRoll] = React.useState<{ d1: number; d2: number; sum: number }>({
    d1: 3,
    d2: 4,
    sum: 7,
  });

  // Mini interactive state for Tile 4: Prisoner's dilemma choice
  const [prisonerChoice, setPrisonerChoice] = React.useState<'cooperate' | 'defect'>('cooperate');

  const handleRollDice = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDiceRoll({ d1, d2, sum: d1 + d2 });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* ==================================================================== */}
      {/* TILE 1: Khoa học Thực nghiệm (Bento Span 2 cols) */}
      {/* ==================================================================== */}
      <Card className="lg:col-span-2 group relative overflow-hidden border-slate-300/85 bg-white hover:border-blue-500 hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Atom className="h-48 w-48 text-blue-600" />
        </div>

        <CardHeader className="space-y-3 pb-3 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                <Atom className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-heading font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {dict.explore.physics_title}
                </CardTitle>
                <CardDescription className="text-xs font-mono font-medium text-slate-500">
                  {dict.explore.physics_subtitle}
                </CardDescription>
              </div>
            </div>
            <Badge variant="cyan">{dict.explore.physics_badge}</Badge>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            {dict.explore.physics_desc}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-1 relative z-10">
          {/* Mini Interactive Experiment Widget */}
          <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                {dict.explore.physics_interactive_label}
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSlitsMode('single')}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-all ${
                    slitsMode === 'single'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dict.explore.physics_slit_1}
                </button>
                <button
                  type="button"
                  onClick={() => setSlitsMode('double')}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-all ${
                    slitsMode === 'double'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dict.explore.physics_slit_2}
                </button>
              </div>
            </div>

            {/* Visual Screen Representation */}
            <div className="h-14 w-full rounded-lg bg-slate-950 p-2 flex items-center justify-center relative overflow-hidden border border-slate-800">
              {slitsMode === 'double' ? (
                // Interference fringes preview
                <div className="w-full h-full flex items-center justify-around opacity-90">
                  <div className="w-1.5 h-full bg-cyan-400 blur-[1px] shadow-[0_0_10px_#22d3ee]" />
                  <div className="w-0.5 h-full bg-cyan-600 opacity-20" />
                  <div className="w-3 h-full bg-cyan-300 blur-[1px] shadow-[0_0_15px_#67e8f9]" />
                  <div className="w-0.5 h-full bg-cyan-600 opacity-20" />
                  <div className="w-4 h-full bg-cyan-100 blur-[0.5px] shadow-[0_0_20px_#a5f3fc]" />
                  <div className="w-0.5 h-full bg-cyan-600 opacity-20" />
                  <div className="w-3 h-full bg-cyan-300 blur-[1px] shadow-[0_0_15px_#67e8f9]" />
                  <div className="w-0.5 h-full bg-cyan-600 opacity-20" />
                  <div className="w-1.5 h-full bg-cyan-400 blur-[1px] shadow-[0_0_10px_#22d3ee]" />
                </div>
              ) : (
                // Single diffraction blob
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-full bg-blue-400 blur-sm opacity-90 shadow-[0_0_20px_#60a5fa]" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>{dict.explore.physics_laser_source}</span>
              <span className="font-semibold text-blue-700">
                {slitsMode === 'double'
                  ? dict.explore.physics_interference_observed
                  : dict.explore.physics_particle_observed}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/simulations/double-slit"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-700 hover:text-blue-800 group/link"
            >
              <span>{dict.explore.physics_cta}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ==================================================================== */}
      {/* TILE 2: Xác suất & Thống kê */}
      {/* ==================================================================== */}
      <Card className="group relative overflow-hidden border-slate-300/85 bg-white hover:border-amber-500 hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Dice5 className="h-40 w-40 text-amber-600" />
        </div>

        <CardHeader className="space-y-3 pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <Dice5 className="h-6 w-6" />
            </div>
            <Badge variant="amber">{dict.explore.prob_badge}</Badge>
          </div>
          <div>
            <CardTitle className="text-xl font-heading font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
              {dict.explore.prob_title}
            </CardTitle>
            <CardDescription className="text-xs font-mono font-medium text-slate-500">
              {dict.explore.prob_subtitle}
            </CardDescription>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            {dict.explore.prob_desc}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-1 relative z-10">
          {/* Mini Interactive Dice Roller */}
          <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-700">
                {dict.explore.prob_roll_dice}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRollDice}
                className="h-7 text-xs font-mono px-2.5 border-slate-300 hover:border-amber-500 hover:text-amber-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {dict.explore.prob_roll_btn}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-3 py-2">
              <div className="h-10 w-10 rounded-lg bg-white border border-slate-300 shadow-2xs flex items-center justify-center font-mono font-bold text-lg text-slate-800">
                {diceRoll.d1}
              </div>
              <span className="font-mono text-slate-400 font-bold">+</span>
              <div className="h-10 w-10 rounded-lg bg-white border border-slate-300 shadow-2xs flex items-center justify-center font-mono font-bold text-lg text-slate-800">
                {diceRoll.d2}
              </div>
              <span className="font-mono text-slate-400 font-bold">=</span>
              <div className="h-10 px-3 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-mono font-bold text-lg shadow-2xs">
                {diceRoll.sum}
              </div>
            </div>

            <p className="text-xs text-slate-600 font-sans leading-tight">
              {dict.explore.prob_bell_curve}
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/simulations/birthday-paradox"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700 hover:text-amber-800 group/link"
            >
              <span>{dict.explore.prob_cta}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ==================================================================== */}
      {/* TILE 3: Nghịch lý Tư duy */}
      {/* ==================================================================== */}
      <Card className="group relative overflow-hidden border-slate-300/85 bg-white hover:border-violet-500 hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <InfinityIcon className="h-40 w-40 text-violet-600" />
        </div>

        <CardHeader className="space-y-3 pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-700">
              <InfinityIcon className="h-6 w-6" />
            </div>
            <Badge variant="violet">{dict.explore.paradox_badge}</Badge>
          </div>
          <div>
            <CardTitle className="text-xl font-heading font-extrabold text-slate-900 group-hover:text-violet-700 transition-colors">
              {dict.explore.paradox_title}
            </CardTitle>
            <CardDescription className="text-xs font-mono font-medium text-slate-500">
              {dict.explore.paradox_subtitle}
            </CardDescription>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            {dict.explore.paradox_desc}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-1 relative z-10">
          <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 space-y-2 font-mono text-xs text-slate-700">
            <div className="font-semibold text-slate-900 flex items-center justify-between">
              <span>{dict.explore.paradox_achilles}</span>
              <span className="text-violet-700 font-bold">1/2 + 1/4 + 1/8...</span>
            </div>
            <div className="text-slate-500">{dict.explore.paradox_distance}</div>
            <div className="text-xs text-slate-600 font-sans leading-tight">
              {dict.explore.paradox_limit}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/simulations"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-violet-700 hover:text-violet-800 group/link"
            >
              <span>{dict.explore.paradox_cta}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ==================================================================== */}
      {/* TILE 4: Lý thuyết Trò chơi (Bento Span 2 cols) */}
      {/* ==================================================================== */}
      <Card className="lg:col-span-2 group relative overflow-hidden border-slate-300/85 bg-white hover:border-emerald-500 hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Gamepad2 className="h-48 w-48 text-emerald-600" />
        </div>

        <CardHeader className="space-y-3 pb-3 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                <Gamepad2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-heading font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {dict.explore.game_theory_title}
                </CardTitle>
                <CardDescription className="text-xs font-mono font-medium text-slate-500">
                  {dict.explore.game_theory_subtitle}
                </CardDescription>
              </div>
            </div>
            <Badge variant="emerald">{dict.explore.game_theory_badge}</Badge>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            {dict.explore.game_theory_desc}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-1 relative z-10">
          {/* Mini Interactive Payoff Matrix Widget */}
          <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                {dict.explore.game_theory_interactive_label}
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPrisonerChoice('cooperate')}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-all ${
                    prisonerChoice === 'cooperate'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dict.explore.game_theory_cooperate}
                </button>
                <button
                  type="button"
                  onClick={() => setPrisonerChoice('defect')}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-all ${
                    prisonerChoice === 'defect'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dict.explore.game_theory_defect}
                </button>
              </div>
            </div>

            {/* Matrix result display */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div
                className={`p-3 rounded-lg border transition-all ${
                  prisonerChoice === 'cooperate'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="text-slate-500 font-medium mb-1">
                  {dict.explore.game_theory_opp_cooperates}
                </div>
                <div>
                  {prisonerChoice === 'cooperate'
                    ? dict.explore.game_theory_payoff_draw
                    : dict.explore.game_theory_payoff_win}
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border transition-all ${
                  prisonerChoice === 'defect'
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="text-slate-500 font-medium mb-1">
                  {dict.explore.game_theory_opp_defects}
                </div>
                <div>
                  {prisonerChoice === 'cooperate'
                    ? dict.explore.game_theory_payoff_lose
                    : dict.explore.game_theory_payoff_lose}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/simulations"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 hover:text-emerald-800 group/link"
            >
              <span>{dict.explore.game_theory_cta}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

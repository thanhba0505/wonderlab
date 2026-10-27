'use client';

import * as React from 'react';
import { BookOpen, Cpu, HardDrive, ShieldCheck, Binary } from 'lucide-react';
import { MathFraction } from '@/features/simulations/components';
import { useTranslation } from '@/i18n';

export function ParityExplainer() {
  const { dict } = useTranslation();
  const t = dict.sim_prisoners_hats;

  return (
    <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-7 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] space-y-6">
      {/* Editorial Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-slate-900">{t.exp_hero_title}</h2>
          <p className="text-xs text-slate-600 font-sans">{t.exp_hero_desc}</p>
        </div>
      </div>

      {/* Section 1: The Intuition Trap */}
      <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
        <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
          <Binary className="h-4 w-4 text-indigo-600" />
          {t.exp_sec1_heading}
        </h3>
        <p>{t.exp_sec1_p1}</p>
        <div className="font-mono text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200 text-slate-800 flex items-center flex-wrap gap-1">
          <span>
            {t.exp_sec1_heading.includes('Random') ? 'P(Random 9 guesses)' : 'P(Đoán mò 9 người)'} =
          </span>
          <span>(</span>
          <MathFraction numerator="1" denominator="2" />
          <span>)</span>
          <sup className="text-xs font-semibold">9</sup>
          <span>=</span>
          <MathFraction numerator="1" denominator="512" />
          <span>&asymp; 0.195%</span>
        </div>
        <p>{t.exp_sec1_p2}</p>
      </div>

      {/* Section 2: Mathematical Foundation */}
      <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
        <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          {t.exp_sec2_heading}
        </h3>
        <p>{t.exp_sec2_p1}</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>
            <strong>0 &oplus; 0 = 0</strong> {t.exp_sec2_rule1.replace('0 ⊕ 0 = 0 ', '')}
          </li>
          <li>
            <strong>0 &oplus; 1 = 1</strong> {t.exp_sec2_rule2.replace('0 ⊕ 1 = 1 ', '')}
          </li>
          <li>
            <strong>1 &oplus; 1 = 0</strong> {t.exp_sec2_rule3.replace('1 ⊕ 1 = 0 ', '')}
          </li>
        </ul>
        <p>{t.exp_sec2_p2}</p>
        <div className="font-mono text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200 text-blue-700 font-bold">
          {'cₖ = P ⊕ (⊕_{j ≠ k} cⱼ)'}
        </div>
      </div>

      {/* Section 3: Real-World Applications */}
      <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans border-t border-slate-200/80 pt-4">
        <h3 className="font-heading text-sm font-bold text-slate-900">{t.exp_sec3_heading}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ECC RAM */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
              <Cpu className="h-4 w-4 text-blue-600" />
              <span>{t.exp_ecc_title}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t.exp_ecc_desc}</p>
          </div>

          {/* RAID 5 */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
              <HardDrive className="h-4 w-4 text-indigo-600" />
              <span>{t.exp_raid_title}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t.exp_raid_desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

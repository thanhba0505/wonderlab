'use client';

import * as React from 'react';
import {
  BookOpen,
  Cpu,
  HardDrive,
  ShieldCheck,
  Binary,
  Zap,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { MathFraction } from '@/features/simulations/components';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/ui/button';
import { useHatSound } from '../utils/hat-audio';
import { cn } from '@/lib/utils';

export function ParityExplainer() {
  const { dict } = useTranslation();
  const t = dict.sim_prisoners_hats;
  const { playSuccess, playMistakeFeedback } = useHatSound();

  // Interactive ECC RAM Bit-Flip Demo State
  // Initial 8-bit word with even parity (sum = 4, parity = 0)
  const defaultBits = [1, 0, 1, 1, 0, 0, 1, 0];
  const [memoryBits, setMemoryBits] = React.useState<number[]>(defaultBits);
  const [corruptedBitIndex, setCorruptedBitIndex] = React.useState<number | null>(null);

  // Compute parity of current bits
  const bitSum = memoryBits.reduce((acc, b) => acc + b, 0);
  const isParityError = bitSum % 2 !== 0;

  // Handle manual or cosmic ray bit flip
  const handleFlipBit = (index: number) => {
    playMistakeFeedback();
    setMemoryBits(prev => {
      const next = [...prev];
      next[index] = next[index] === 1 ? 0 : 1;
      return next;
    });
    setCorruptedBitIndex(index);
  };

  const handleRandomCosmicRay = () => {
    const randomIndex = Math.floor(Math.random() * memoryBits.length);
    handleFlipBit(randomIndex);
  };

  const handleRepairBit = () => {
    playSuccess(1.0);
    setMemoryBits(defaultBits);
    setCorruptedBitIndex(null);
  };

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

      {/* Cinematic Narrative Prologue */}
      <div className="rounded-xl border border-indigo-200/90 bg-indigo-50/50 p-4 sm:p-5 space-y-2">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs sm:text-sm font-heading">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span>{t.cinematic_prologue_title}</span>
        </div>
        <p className="text-xs sm:text-sm text-indigo-950 font-sans leading-relaxed">
          {t.cinematic_prologue_body}
        </p>
      </div>

      {/* Section 1: The Intuition Trap */}
      <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
        <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
          <Binary className="h-4 w-4 text-indigo-600" />
          <span>{t.exp_sec1_heading}</span>
        </h3>
        <p>{t.exp_sec1_p1}</p>
        <div className="font-mono text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200 text-slate-800 flex items-center flex-wrap gap-1.5">
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

      {/* Section 2: Mathematical Foundation F2 & XOR */}
      <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans border-t border-slate-200/80 pt-4">
        <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>{t.exp_sec2_heading}</span>
        </h3>
        <p>{t.exp_sec2_p1}</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600 font-mono text-xs">
          <li>
            <strong>0 &oplus; 0 = 0</strong>{' '}
            <span className="font-sans text-slate-600">
              {t.exp_sec2_rule1.replace('0 ⊕ 0 = 0 ', '')}
            </span>
          </li>
          <li>
            <strong>0 &oplus; 1 = 1</strong>{' '}
            <span className="font-sans text-slate-600">
              {t.exp_sec2_rule2.replace('0 ⊕ 1 = 1 ', '')}
            </span>
          </li>
          <li>
            <strong>1 &oplus; 1 = 0</strong>{' '}
            <span className="font-sans text-slate-600">
              {t.exp_sec2_rule3.replace('1 ⊕ 1 = 0 ', '')}
            </span>
          </li>
        </ul>
        <p>{t.exp_sec2_p2}</p>
        <div className="font-mono text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200 text-blue-700 font-bold">
          c<sub>k</sub> = P &oplus; (&oplus;<sub>j &ne; k</sub> c<sub>j</sub>)
        </div>
      </div>

      {/* Section 3: Interactive Cosmic Ray Bit-Flip in ECC RAM */}
      <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans border-t border-slate-200/80 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-600" />
            <span>{t.ecc_interactive_title}</span>
          </h3>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRandomCosmicRay}
              className="text-xs h-7 border-amber-300 text-amber-800 hover:bg-amber-50 gap-1 font-sans"
            >
              <Zap className="h-3 w-3 text-amber-600" />
              <span>{t.flip_bit_btn}</span>
            </Button>
            {isParityError && (
              <Button
                size="sm"
                onClick={handleRepairBit}
                className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-sans"
              >
                <RefreshCw className="h-3 w-3" />
                <span>{t.repair_bit_btn}</span>
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-sans">{t.ecc_interactive_desc}</p>

        {/* 8-bit memory word visualization */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-800">
              Thanh ghi 8-Bit + 1 Bit Parity Kiểm Tra:
            </span>
            <div className="font-mono text-xs flex items-center gap-2">
              <span>&Sigma; Bit = {bitSum}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded font-bold',
                  isParityError
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200',
                )}
              >
                {isParityError ? 'LỖI PARITY (Odd)' : 'PARITY KHỚP (Even)'}
              </span>
            </div>
          </div>

          {/* Interactive Bit Cells */}
          <div className="grid grid-cols-4 sm:grid-cols-9 gap-1.5 font-mono text-center">
            {memoryBits.map((bit, idx) => {
              const isCorrupted = corruptedBitIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleFlipBit(idx)}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-lg border transition-all active:scale-95',
                    isCorrupted
                      ? 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-400/50 shadow-xs'
                      : 'border-slate-300 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50/30',
                  )}
                  title={`Nhấp để đảo bit #${idx}`}
                >
                  <span className="text-xs text-slate-400 font-sans">b{idx}</span>
                  <span className="text-base font-bold">{bit}</span>
                </button>
              );
            })}

            {/* Parity Bit Cell */}
            <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-indigo-300 bg-indigo-50/80 text-indigo-900">
              <span className="text-xs text-indigo-600 font-sans font-bold">P (Parity)</span>
              <span className="text-base font-bold">0</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-sans pt-1 flex items-center justify-between">
            <span>
              {isParityError ? (
                <strong className="text-rose-700">
                  {t.memory_error_detected.replace('{bit}', String(corruptedBitIndex ?? 0))}
                </strong>
              ) : (
                <strong className="text-emerald-700">{t.memory_intact}</strong>
              )}
            </span>
            <span className="text-slate-400 italic font-mono text-xs">
              * Nhấp vào bất kỳ ô bit để mô phỏng lật bit
            </span>
          </div>
        </div>
      </div>

      {/* Section 4: Advanced Variant - Simultaneous Guessing & Hamming Code [7, 4] */}
      <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans border-t border-slate-200/80 pt-4">
        <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-violet-600" />
          <span>{t.hamming_variant_title}</span>
        </h3>
        <p>{t.hamming_variant_desc}</p>

        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
          <h4 className="font-heading text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-violet-600" />
            <span>{t.hamming_sphere_title}</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {t.hamming_sphere_desc}
          </p>

          <div className="font-mono text-xs bg-white p-2.5 rounded-md border border-slate-200 text-slate-800 flex items-center flex-wrap gap-2">
            <span>Xác suất toàn đội chiến thắng =</span>
            <span>1 &minus;</span>
            <MathFraction numerator="16" denominator="128" />
            <span>=</span>
            <MathFraction numerator="112" denominator="128" />
            <span>=</span>
            <MathFraction numerator="7" denominator="8" />
            <span>= 87.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

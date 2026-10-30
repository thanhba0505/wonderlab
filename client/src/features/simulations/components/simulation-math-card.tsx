'use client';

import React from 'react';
import { Sigma, Sparkles, BookOpen } from 'lucide-react';
import { MathFraction } from './simulation-math-fraction';
import { useTranslation } from '@/i18n';

interface SimulationMathCardProps {
  slug: string;
  summary: string;
}

export const SimulationMathCard: React.FC<SimulationMathCardProps> = ({ slug, summary }) => {
  const { dict } = useTranslation();
  const mc = dict.simulations.math_card;

  return (
    <div className="rounded-xl border border-slate-300/85 bg-white shadow-xs p-5 space-y-4">
      {/* Tóm tắt ý nghĩa khoa học */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
          <BookOpen className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
            {mc.experiment_overview}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">{summary}</p>
        </div>
      </div>

      {/* Khối mô hình toán học - KHÔNG ĐÓNG KHUNG BÊN NGOÀI, line phân cách ở trên */}
      <div className="pt-4 border-t border-slate-200/80 space-y-3 font-mono">
        <div className="flex items-center gap-2 pb-1">
          <Sigma className="h-4 w-4 text-blue-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
            {mc.math_model_title}
          </span>
        </div>

        {/* NGHỊCH LÝ NGÀY SINH (BIRTHDAY PARADOX) */}
        {slug === 'birthday-paradox' && (
          <div className="space-y-3 text-xs text-slate-800">
            {/* 1. Công thức giải tích chính xác */}
            <div className="space-y-1.5">
              <div className="text-xs font-sans text-slate-500 font-semibold flex items-center gap-1.5">
                <span>{mc.birthday_p_collision}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm bg-slate-50/80 p-3 rounded-lg">
                <span className="font-bold text-slate-900">P(n)</span>
                <span>=</span>
                <span>{mc.birthday_p_no_collision}</span>
                <span>=</span>
                <span>1 &minus;</span>
                <span className="inline-flex items-center">
                  <span className="text-xl font-light text-slate-400 -mt-0.5">(</span>
                  <MathFraction numerator="365" denominator="365" />
                  <span className="text-slate-400">&times;</span>
                  <MathFraction numerator="364" denominator="365" />
                  <span className="text-slate-400">&times;</span>
                  <span className="text-slate-400">&hellip;</span>
                  <span className="text-slate-400">&times;</span>
                  <MathFraction numerator="365 &minus; n + 1" denominator="365" />
                  <span className="text-xl font-light text-slate-400 -mt-0.5">)</span>
                </span>
                <span>=</span>
                <span className="inline-flex items-center font-bold text-blue-700">
                  1 &minus;
                  <MathFraction
                    numerator="365!"
                    denominator={
                      <span>
                        (365 &minus; n)! &middot; 365
                        <sup className="text-xs font-semibold">n</sup>
                      </span>
                    }
                  />
                </span>
              </div>
            </div>

            {/* 2. Xấp xỉ chuỗi hàm mũ Taylor */}
            <div className="space-y-1.5">
              <div className="text-xs font-sans text-slate-500 font-semibold flex items-center gap-1.5">
                <span>{mc.birthday_taylor}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm bg-slate-50/80 p-3 rounded-lg">
                <span className="font-bold text-slate-900">P(n)</span>
                <span className="text-slate-400">&asymp;</span>
                <span>1 &minus; e</span>
                <sup className="text-xs font-bold text-blue-700 -top-1.5">
                  &minus;
                  <MathFraction
                    numerator="n(n &minus; 1)"
                    denominator="2 &times; 365"
                    className="text-xs"
                  />
                </sup>
                <span>=</span>
                <span>1 &minus; e</span>
                <sup className="text-xs font-bold text-blue-700 -top-1.5">
                  &minus;
                  <MathFraction numerator="C(n, 2)" denominator="365" className="text-xs" />
                </sup>

                <div className="w-full pt-1.5 mt-1 border-t border-slate-200/60 text-xs font-sans text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>{mc.birthday_threshold_note}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NGHỊCH LÝ MONTY HALL */}
        {slug === 'monty-hall' && (
          <div className="space-y-3 text-xs text-slate-800">
            <div className="flex flex-wrap items-center gap-3 bg-slate-50/80 p-3 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.monty_hall_keep}</span>
                <span className="font-bold text-slate-900">P(Stay) =</span>
                <MathFraction numerator="1" denominator="3" />
                <span className="text-slate-400">&asymp; 33.3%</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.monty_hall_switch}</span>
                <span className="font-bold text-emerald-700">P(Switch) = 1 &minus;</span>
                <MathFraction numerator="1" denominator="3" />
                <span className="font-bold text-emerald-700">=</span>
                <MathFraction numerator="2" denominator="3" />
                <span className="text-emerald-700 font-bold">&asymp; 66.7%</span>
              </div>
            </div>
          </div>
        )}

        {/* THÍ NGHIỆM HAI KHE YOUNG */}
        {slug === 'double-slit' && (
          <div className="space-y-3 text-xs text-slate-800">
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-3 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.double_slit_bright_fringe}</span>
                <span className="font-bold text-slate-900">
                  y<sub>m</sub> = m &middot;
                </span>
                <MathFraction numerator="&lambda; &middot; L" denominator="d" />
                <span className="text-slate-400 font-sans">(m &isin; &Zopf;)</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.double_slit_intensity}</span>
                <span className="font-bold text-blue-700">
                  I(&theta;) = I<sub className="text-xs">0</sub> &middot; cos
                  <sup className="text-xs font-semibold">2</sup>
                </span>
                <span className="text-xs text-slate-600">
                  <span className="text-sm font-light text-slate-400">(</span>
                  <MathFraction
                    numerator="&pi; &middot; d &middot; sin(&theta;)"
                    denominator="&lambda;"
                  />
                  <span className="text-sm font-light text-slate-400">)</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SONG ĐỀ TÙ NHÂN */}
        {slug === 'prisoners-dilemma' && (
          <div className="space-y-3 text-xs text-slate-800">
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-3 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.prisoners_dilemma_condition}</span>
                <span className="font-bold text-amber-700">T &gt; R &gt; P &gt; S</span>
                <span className="text-slate-400 font-sans">(5 &gt; 3 &gt; 1 &gt; 0)</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.prisoners_dilemma_tit_for_tat}</span>
                <span className="font-bold text-blue-700">w &ge;</span>
                <MathFraction numerator="T &minus; R" denominator="T &minus; P" />
                <span>=</span>
                <MathFraction numerator="2" denominator="4" />
                <span className="font-bold text-blue-700">= 0.5 (50%)</span>
              </div>
            </div>
          </div>
        )}

        {/* NGHỊCH LÝ ZENO */}
        {slug === 'zeno-paradox' && (
          <div className="space-y-3 text-xs text-slate-800">
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-3 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.zeno_convergent_series}</span>
                <span className="font-bold text-slate-900">
                  &sum;<sub className="text-xs">n=1</sub>
                  <sup className="text-xs font-semibold">&infin;</sup>
                </span>
                <span className="inline-flex items-center">
                  <span className="text-sm font-light text-slate-400">(</span>
                  <MathFraction numerator="1" denominator="2" />
                  <span className="text-sm font-light text-slate-400">)</span>
                  <sup className="text-xs font-bold text-slate-700">n</sup>
                </span>
                <span>=</span>
                <MathFraction
                  numerator={<MathFraction numerator="1" denominator="2" />}
                  denominator={
                    <span>
                      1 &minus; <MathFraction numerator="1" denominator="2" />
                    </span>
                  }
                />
                <span className="font-bold text-emerald-700">= 1</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.zeno_catch_up_time}</span>
                <span className="font-bold text-blue-700">
                  T<sup className="text-xs font-semibold">*</sup> =
                </span>
                <MathFraction
                  numerator={
                    <span>
                      d<sub className="text-xs">0</sub>
                    </span>
                  }
                  denominator={
                    <span>
                      v<sub className="text-xs">A</sub> &minus; v<sub className="text-xs">T</sub>
                    </span>
                  }
                />
                <span className="text-slate-500 font-sans">=</span>
                <MathFraction numerator="100" denominator="10 &minus; 1" />
                <span className="font-bold text-blue-700">&asymp; 11.11 s</span>
              </div>
            </div>
          </div>
        )}

        {/* BÀI TOÁN PHÒNG TRƯNG BÀY TRANH (ART GALLERY PROBLEM) */}
        {slug === 'art-gallery' && (
          <div className="space-y-3 text-xs text-slate-800">
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-3 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.art_gallery_chvatal}</span>
                <span className="font-bold text-slate-900">g(n) =</span>
                <span className="font-bold text-emerald-700">&lfloor;</span>
                <MathFraction numerator="n" denominator="3" />
                <span className="font-bold text-emerald-700">&rfloor;</span>
                <span className="text-slate-500 font-sans">{mc.art_gallery_chvatal_note}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.art_gallery_triangulation}</span>
                <span className="font-bold text-blue-700">T = n &minus; 2</span>
                <span className="text-slate-400 font-sans">&bull;</span>
                <span className="text-slate-500 font-sans">{mc.art_gallery_diagonals}</span>
                <span className="font-bold text-indigo-700">D = n &minus; 3</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.art_gallery_orthogonal}</span>
                <span className="font-bold text-amber-700">
                  g<sub>ortho</sub>(n) = &lfloor;
                </span>
                <MathFraction numerator="n" denominator="4" />
                <span className="font-bold text-amber-700">&rfloor;</span>
              </div>
            </div>
          </div>
        )}

        {/* BÀI TOÁN ĐỘI MŨ & BIT CHẴN LẺ (PRISONERS HAT PUZZLE) */}
        {slug === 'prisoners-hats' && (
          <div className="space-y-3 text-xs text-slate-800">
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-3 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.prisoners_hats_survival}</span>
                <span className="font-bold text-slate-900">P &ge;</span>
                <MathFraction numerator="n &minus; 1" denominator="n" />
                <span className="text-slate-500 font-sans">&bull;</span>
                <span className="text-slate-500 font-sans">{mc.prisoners_hats_expected}</span>
                <span className="font-bold text-emerald-700">95.0%</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.prisoners_hats_parity}</span>
                <span className="font-bold text-blue-700">
                  p = &sum; c<sub>j</sub> (mod K)
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">{mc.prisoners_hats_decoding}</span>
                <span className="font-bold text-indigo-700">
                  c<sub>k</sub> = (p<sub>k</sub> &minus; &sum; c<sub>trước</sub>) mod K
                </span>
              </div>
            </div>
          </div>
        )}

        {/* BÀI TOÁN VỆ SĨ & PHÒNG GƯƠNG (THE BODYGUARD PROBLEM) */}
        {slug === 'bodyguard-problem' && (
          <div className="space-y-3 text-xs text-slate-800">
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-3 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">Định lý Gutkin (2005):</span>
                <span className="font-bold text-slate-900">
                  |G| &le; 2<sup>4</sup> = 16
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">Trung điểm ảnh ảo:</span>
                <span className="font-bold text-blue-700">M =</span>
                <MathFraction
                  numerator={
                    <span>
                      A + B&apos;<sub>k,m,s</sub>
                    </span>
                  }
                  denominator="2"
                />
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-sans">Tính chất chặn:</span>
                <span className="font-bold text-emerald-700">100% tia bị triệt tiêu</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

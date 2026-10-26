'use client';

import * as React from 'react';
import { BookOpen, Lightbulb, Award } from 'lucide-react';
import { useTranslation } from '@/i18n';

export const GalleryExplainer: React.FC = () => {
  const { dict } = useTranslation();

  return (
    <div className="space-y-6 text-slate-700 font-sans text-xs sm:text-sm leading-relaxed">
      {/* Khối 1: Lịch sử & Câu hỏi của Victor Klee */}
      <div className="space-y-2">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <span>{dict.sim_art_gallery.explainer_sec1_title}</span>
        </h4>
        <p className="text-slate-600">{dict.sim_art_gallery.explainer_sec1_p1}</p>
        <p className="text-slate-600">{dict.sim_art_gallery.explainer_sec1_p2}</p>
      </div>

      <hr className="border-slate-200/80" />

      {/* Khối 2: Nghệ thuật chứng minh của Steve Fisk */}
      <div className="space-y-2">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Award className="h-4 w-4 text-emerald-600" />
          <span>{dict.sim_art_gallery.explainer_sec2_title}</span>
        </h4>
        <p className="text-slate-600">{dict.sim_art_gallery.explainer_sec2_p1}</p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
          <li>
            <strong>{dict.sim_art_gallery.explainer_point_triangulation_title}</strong>{' '}
            {dict.sim_art_gallery.explainer_point_triangulation_body}
          </li>
          <li>
            <strong>{dict.sim_art_gallery.explainer_point_dual_title}</strong>{' '}
            {dict.sim_art_gallery.explainer_point_dual_body}
          </li>
          <li>
            <strong>{dict.sim_art_gallery.explainer_point_pigeonhole_title}</strong>{' '}
            {dict.sim_art_gallery.explainer_point_pigeonhole_body}
          </li>
          <li>
            <strong>{dict.sim_art_gallery.explainer_point_convex_title}</strong>{' '}
            {dict.sim_art_gallery.explainer_point_convex_body}
          </li>
        </ul>
      </div>

      <hr className="border-slate-200/80" />

      {/* Khối 3: Khoảng cách giữa Chặn Trên và Bài toán Tối Ưu Thực Tế (NP-hard) */}
      <div className="space-y-2">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span>{dict.sim_art_gallery.explainer_sec3_title}</span>
        </h4>
        <p className="text-slate-600">{dict.sim_art_gallery.explainer_sec3_subtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-mono text-xs font-bold text-blue-700 uppercase">
              {dict.sim_art_gallery.explainer_worst_case_title}
            </span>
            <p className="text-xs text-slate-600">
              {dict.sim_art_gallery.explainer_worst_case_body}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-mono text-xs font-bold text-rose-700 uppercase">
              {dict.sim_art_gallery.explainer_np_hard_title}
            </span>
            <p className="text-xs text-slate-600">{dict.sim_art_gallery.explainer_np_hard_body}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

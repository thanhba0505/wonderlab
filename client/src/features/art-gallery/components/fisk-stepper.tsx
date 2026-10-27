'use client';

import * as React from 'react';
import { FiskProofResult } from '../art-gallery-math';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n';

export interface FiskStepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  fiskProof: FiskProofResult;
  numVertices: number;
}

export const FiskStepper: React.FC<FiskStepperProps> = ({
  currentStep,
  onStepChange,
  fiskProof,
  numVertices,
}) => {
  const { dict } = useTranslation();
  const steps = dict.sim_art_gallery.fisk_steps;
  const activeStep = steps[currentStep] ?? steps[0]!;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-300/85 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
              {dict.sim_art_gallery.fisk_stepper_title}
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              {dict.sim_art_gallery.fisk_stepper_subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="font-bold text-slate-800">
            {`${dict.sim_art_gallery.step_label} ${currentStep + 1}`}
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500">{steps.length}</span>
        </div>
      </div>

      {/* Step Indicators Bar */}
      <div className="grid grid-cols-5 gap-1.5">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <button
              key={`step-btn-${idx}`}
              onClick={() => onStepChange(idx)}
              className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-md text-center transition-all ${
                isCurrent
                  ? 'bg-blue-50 border border-blue-400 text-blue-900 font-bold'
                  : isDone
                    ? 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono text-xs">{idx}</span>
              <span className="text-[12px] font-sans truncate max-w-full hidden sm:inline">
                {step.title.split(':')[0] ?? `Step ${idx}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Step Content */}
      <div className="rounded-lg bg-slate-50/80 border border-slate-200/80 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-heading text-xs sm:text-sm font-bold text-slate-900">
            {activeStep.title}
          </h4>
          {currentStep === 4 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {dict.sim_art_gallery.covered_100}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 font-sans leading-relaxed">{activeStep.description}</p>

        {/* Step-specific Extra Metrics */}
        {currentStep === 1 && (
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-600 border-t border-slate-200/60">
            <span>
              {dict.sim_art_gallery.triangles_count_label}
              <strong>{fiskProof.triangles.length}</strong> (n - 2 = {numVertices - 2})
            </span>
            <span>&bull;</span>
            <span>
              {dict.sim_art_gallery.diagonals_count_label}
              <strong>{fiskProof.diagonals.length}</strong> (n - 3 = {numVertices - 3})
            </span>
          </div>
        )}

        {currentStep === 2 && (
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-600 border-t border-slate-200/60">
            <span>
              {dict.sim_art_gallery.color_a}
              <strong>{fiskProof.colorCounts[0]}</strong> {dict.sim_art_gallery.vertices_unit}
            </span>
            <span>&bull;</span>
            <span>
              {dict.sim_art_gallery.color_b}
              <strong>{fiskProof.colorCounts[1]}</strong> {dict.sim_art_gallery.vertices_unit}
            </span>
            <span>&bull;</span>
            <span>
              {dict.sim_art_gallery.color_c}
              <strong>{fiskProof.colorCounts[2]}</strong> {dict.sim_art_gallery.vertices_unit}
            </span>
          </div>
        )}

        {currentStep === 3 && (
          <div className="pt-2 flex flex-wrap gap-3 text-xs font-sans text-slate-700 border-t border-slate-200/60">
            <span>{dict.sim_art_gallery.pigeonhole_proof_note}</span>
          </div>
        )}
      </div>

      {/* Stepper Navigation Buttons */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="outline"
          disabled={currentStep === 0}
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          className="border-slate-300 text-xs flex items-center gap-1 active:scale-[0.98]"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{dict.sim_art_gallery.prev_step}</span>
        </Button>

        <Button
          disabled={currentStep === steps.length - 1}
          onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1 active:scale-[0.98]"
        >
          <span>{dict.sim_art_gallery.next_step}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

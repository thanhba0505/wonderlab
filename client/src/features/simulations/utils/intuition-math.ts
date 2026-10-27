/**
 * Intuition Gap & Cognitive Bias Analytics — Wonderlab
 */

import { Locale, SimulationChallengeDictionary } from '@/i18n';
import { vi } from '@/i18n/locales/vi';
import { en } from '@/i18n/locales/en';

export type IntuitionTier = 'master' | 'moderate' | 'trap';

export interface IntuitionRating {
  tier: IntuitionTier;
  label: string;
  badgeVariant: 'emerald' | 'outline' | 'amber';
  feedback: string;
}

/**
 * Calculates absolute gap between user intuition prediction and mathematical truth.
 */
export function calculateIntuitionGap(guessedValue: number, theoreticalTruth: number): number {
  return Math.abs(guessedValue - theoreticalTruth);
}

/**
 * Evaluates cognitive gap into scientific insight tier using typed dictionary.
 */
export function getIntuitionRating(
  gap: number,
  localeOrDict?: Locale | SimulationChallengeDictionary,
): IntuitionRating {
  const challengeDict =
    typeof localeOrDict === 'object' && localeOrDict !== null
      ? localeOrDict
      : localeOrDict === 'en'
        ? en.simulations.challenge
        : vi.simulations.challenge;

  const gapPercentage = gap * 100;

  if (gapPercentage < 5) {
    return {
      tier: 'master',
      label: challengeDict.master_label,
      badgeVariant: 'emerald',
      feedback: challengeDict.master_feedback,
    };
  }

  if (gapPercentage <= 30) {
    return {
      tier: 'moderate',
      label: `${challengeDict.moderate_label} (Δ ${gapPercentage.toFixed(1)}%)`,
      badgeVariant: 'outline',
      feedback: challengeDict.moderate_feedback,
    };
  }

  return {
    tier: 'trap',
    label: `${challengeDict.trap_label} (Δ ${gapPercentage.toFixed(1)}%)`,
    badgeVariant: 'amber',
    feedback: challengeDict.trap_feedback,
  };
}

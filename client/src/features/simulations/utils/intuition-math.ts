/**
 * Intuition Gap & Cognitive Bias Analytics — Wonderlab
 */

import { Locale } from '@/i18n';

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
 * Evaluates cognitive gap into scientific insight tier.
 */
export function getIntuitionRating(gap: number, locale: Locale = 'vi'): IntuitionRating {
  const gapPercentage = gap * 100;
  const isEn = locale === 'en';

  if (gapPercentage < 5) {
    return {
      tier: 'master',
      label: isEn ? 'Superb Intuition! (Error < 5%)' : 'Trực giác Ngoại cảm! (Sai số < 5%)',
      badgeVariant: 'emerald',
      feedback: isEn
        ? 'Outstanding mathematical intuition or prior familiarity with this paradox.'
        : 'Bạn có sự nhạy cảm xuất sắc với toán học tổ hợp hoặc đã hiểu rõ bản chất nghịch lý từ trước.',
    };
  }

  if (gapPercentage <= 30) {
    return {
      tier: 'moderate',
      label: isEn
        ? `Moderate Deviation (Δ ${gapPercentage.toFixed(1)}%)`
        : `Độ lệch Vừa phải (Δ ${gapPercentage.toFixed(1)}%)`,
      badgeVariant: 'outline',
      feedback: isEn
        ? 'Your intuition captured the qualitative trend, but linear heuristics introduced a slight offset.'
        : 'Trực giác của bạn cảm nhận được xu hướng nhưng vẫn bị ảnh hưởng nhẹ bởi tư duy tuyến tính thông thường.',
    };
  }

  return {
    tier: 'trap',
    label: isEn
      ? `Linear Intuition Trap (Δ ${gapPercentage.toFixed(1)}%)`
      : `Mắc Bẫy Trực giác Tuyến tính (Δ ${gapPercentage.toFixed(1)}%)`,
    badgeVariant: 'amber',
    feedback: isEn
      ? 'Do not be discouraged! Over 90% of people fall into this trap because human cognition evolved for linear scaling rather than combinatorial explosion.'
      : 'Đừng thất vọng! Hơn 90% mọi người đều rơi vào bẫy này do não bộ người tiến hóa để xử lý các phép nhân tuyến tính thay vì bùng nổ tổ hợp.',
  };
}

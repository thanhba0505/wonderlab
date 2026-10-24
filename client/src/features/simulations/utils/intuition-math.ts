/**
 * Intuition Gap & Cognitive Bias Analytics — Wonderlab
 */

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
export function getIntuitionRating(gap: number): IntuitionRating {
  const gapPercentage = gap * 100;

  if (gapPercentage < 5) {
    return {
      tier: 'master',
      label: 'Trực giác Ngoại cảm! (Sai số < 5%)',
      badgeVariant: 'emerald',
      feedback:
        'Bạn có sự nhạy cảm xuất sắc với toán học tổ hợp hoặc đã hiểu rõ bản chất nghịch lý từ trước.',
    };
  }

  if (gapPercentage <= 30) {
    return {
      tier: 'moderate',
      label: `Độ lệch Vừa phải (Δ ${gapPercentage.toFixed(1)}%)`,
      badgeVariant: 'outline',
      feedback:
        'Trực giác của bạn cảm nhận được xu hướng nhưng vẫn bị ảnh hưởng nhẹ bởi tư duy tuyến tính thông thường.',
    };
  }

  return {
    tier: 'trap',
    label: `Mắc Bẫy Trực giác Tuyến tính (Δ ${gapPercentage.toFixed(1)}%)`,
    badgeVariant: 'amber',
    feedback:
      'Đừng thất vọng! Hơn 90% mọi người đều rơi vào bẫy này do não bộ người tiến hóa để xử lý các phép nhân tuyến tính thay vì bùng nổ tổ hợp.',
  };
}

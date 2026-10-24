import { describe, it, expect } from 'vitest';
import { calculateIntuitionGap, getIntuitionRating } from './intuition-math';

describe('intuition-math', () => {
  describe('calculateIntuitionGap', () => {
    it('calculates the absolute delta between guess and truth', () => {
      expect(calculateIntuitionGap(0.1, 0.5073)).toBeCloseTo(0.4073, 4);
      expect(calculateIntuitionGap(0.5, 0.5073)).toBeCloseTo(0.0073, 4);
      expect(calculateIntuitionGap(0.8, 0.5073)).toBeCloseTo(0.2927, 4);
    });
  });

  describe('getIntuitionRating', () => {
    it('returns "master" tier when gap is under 5%', () => {
      const rating = getIntuitionRating(0.02);
      expect(rating.tier).toBe('master');
      expect(rating.badgeVariant).toBe('emerald');
      expect(rating.label).toContain('Ngoại cảm');
    });

    it('returns "moderate" tier when gap is between 5% and 30%', () => {
      const rating = getIntuitionRating(0.15);
      expect(rating.tier).toBe('moderate');
      expect(rating.badgeVariant).toBe('outline');
      expect(rating.label).toContain('Vừa phải');
      expect(rating.label).toContain('15.0%');
    });

    it('returns "trap" tier when gap is above 30%', () => {
      const rating = getIntuitionRating(0.42);
      expect(rating.tier).toBe('trap');
      expect(rating.badgeVariant).toBe('amber');
      expect(rating.label).toContain('Mắc Bẫy Trực giác Tuyến tính');
      expect(rating.label).toContain('42.0%');
    });
  });
});

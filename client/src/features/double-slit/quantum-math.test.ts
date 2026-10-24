import { describe, it, expect } from 'vitest';
import {
  sinc,
  calculateIntensity,
  generateIntensityProfile,
  sampleHitPosition,
  sampleBatchHits,
  wavelengthToRgb,
  DEFAULT_QUANTUM_PARAMS,
} from './quantum-math';

describe('Quantum Double-Slit Mathematical Core', () => {
  describe('sinc function', () => {
    it('should return 1.0 at x = 0', () => {
      expect(sinc(0)).toBe(1.0);
      expect(sinc(1e-12)).toBe(1.0);
    });

    it('should return 0 at x = Math.PI', () => {
      expect(sinc(Math.PI)).toBeCloseTo(0, 5);
    });
  });

  describe('calculateIntensity with Observer OFF (Quantum Wave Interference)', () => {
    const params = {
      ...DEFAULT_QUANTUM_PARAMS,
      isObserverActive: false,
    };

    it('should have maximum intensity at central fringe y = 0', () => {
      const centralIntensity = calculateIntensity(0, params);
      expect(centralIntensity).toBeCloseTo(1.0, 3);
    });

    it('should have destructive interference (dark fringe ~ 0) at first minimum', () => {
      // First dark fringe occurs when phaseInterference = pi / 2
      // (pi * d * y) / (lambda * D) = pi / 2 => y = lambda * D / (2 * d)
      const firstDarkY = (params.wavelength * params.screenDistance) / (2 * params.slitDistance);
      const darkIntensity = calculateIntensity(firstDarkY, params);
      expect(darkIntensity).toBeCloseTo(0, 3);
    });

    it('should have constructive interference (bright fringe ~ 1) at first maximum', () => {
      // First bright fringe occurs when y = lambda * D / d
      const firstBrightY = (params.wavelength * params.screenDistance) / params.slitDistance;
      const brightIntensity = calculateIntensity(firstBrightY, params);
      // Bright fringe is slightly modulated by sinc envelope
      expect(brightIntensity).toBeGreaterThan(0.8);
    });
  });

  describe('calculateIntensity with Observer ON (Wavefunction Collapse)', () => {
    const params = {
      ...DEFAULT_QUANTUM_PARAMS,
      isObserverActive: true,
    };

    it('should eliminate interference dark fringes (intensity is non-zero between peaks)', () => {
      // At the point that was dark in quantum mode:
      const formerDarkY = (params.wavelength * params.screenDistance) / (2 * params.slitDistance);
      const intensity = calculateIntensity(formerDarkY, params);
      // In classical mode, there is positive particle probability here!
      expect(intensity).toBeGreaterThan(0.3);
    });

    it('should exhibit peaks corresponding to the two classical slit positions', () => {
      const slit1Y = params.slitDistance / 2;
      const slit2Y = -params.slitDistance / 2;

      const intensity1 = calculateIntensity(slit1Y, params);
      const intensity2 = calculateIntensity(slit2Y, params);

      expect(intensity1).toBeCloseTo(intensity2, 4);
      expect(intensity1).toBeGreaterThan(0.4);
    });
  });

  describe('generateIntensityProfile', () => {
    it('should return symmetric profile points across screen', () => {
      const points = generateIntensityProfile(DEFAULT_QUANTUM_PARAMS, 51, 0.05);
      expect(points).toHaveLength(51);

      // Center point (index 25) should be y = 0
      expect(points[25].yMm).toBeCloseTo(0, 1);
      expect(points[25].intensity).toBeCloseTo(1.0, 2);

      // Points should be symmetric about center
      expect(points[0].intensity).toBeCloseTo(points[50].intensity, 2);
    });
  });

  describe('Monte Carlo Particle Hit Sampling', () => {
    it('should generate hit positions within the specified screen range', () => {
      const yRange = 0.04;
      for (let i = 0; i < 20; i++) {
        const hit = sampleHitPosition(DEFAULT_QUANTUM_PARAMS, yRange);
        expect(hit).toBeGreaterThanOrEqual(-yRange);
        expect(hit).toBeLessThanOrEqual(yRange);
      }
    });

    it('should batch sample the requested number of hits', () => {
      const count = 500;
      const hits = sampleBatchHits(count, DEFAULT_QUANTUM_PARAMS, 0.05);
      expect(hits).toHaveLength(count);
      expect(hits instanceof Float32Array).toBe(true);
    });
  });

  describe('wavelengthToRgb', () => {
    it('should return green for 532nm', () => {
      const color = wavelengthToRgb(532);
      expect(color).toContain('rgb(');
      // In 532nm (green), green component should be dominant
      expect(color).toContain(', 255,');
    });

    it('should return red for 650nm', () => {
      const color = wavelengthToRgb(650);
      expect(color).toMatch(/^rgb\(255,\s*0,\s*0\)$/);
    });

    it('should return violet/blue for 420nm', () => {
      const color = wavelengthToRgb(420);
      expect(color).toContain('rgb(');
    });
  });
});

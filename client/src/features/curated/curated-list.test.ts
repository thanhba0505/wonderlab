import { describe, it, expect } from 'vitest';
import { CURATED_LIST } from './curated-list';
import { getSimulationBySlug } from '@/features/simulations/registry';

describe('CURATED_LIST data integrity and navigation links', () => {
  it('should have curated items configured with valid simulation hrefs', () => {
    expect(CURATED_LIST.length).toBeGreaterThan(0);

    CURATED_LIST.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.title).toBeTruthy();
      expect(item.summary).toBeTruthy();
      expect(item.href).toBeDefined();
      expect(item.href).toMatch(/^\/simulations\/[a-z0-9-]+$/);
      // Must not link to placeholder or in-page anchor
      expect(item.href).not.toBe('#featured');
    });
  });

  it('should only reference active registered simulations', () => {
    CURATED_LIST.forEach(item => {
      const slug = item.href?.replace('/simulations/', '') || item.id;
      const sim = getSimulationBySlug(slug);

      expect(sim).toBeDefined();
      expect(sim?.status).toBe('active');
    });
  });

  it('should have distinct items with valid estimated minutes and concepts', () => {
    const ids = CURATED_LIST.map(item => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    CURATED_LIST.forEach(item => {
      expect(item.estimatedMinutes).toBeGreaterThan(0);
      expect(item.concept).toBeTruthy();
      expect(item.highlightTag).toBeTruthy();
    });
  });
});

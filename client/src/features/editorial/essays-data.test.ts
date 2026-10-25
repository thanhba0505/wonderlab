import { describe, it, expect } from 'vitest';
import { ESSAYS, getAllEssays, getEssayBySlug } from './essays-data';
import { getSimulationBySlug } from '@/features/simulations/registry';

describe('Editorial Essays Data and Registry Integrity', () => {
  it('should have 3 essays configured with required fields', () => {
    expect(ESSAYS.length).toBe(3);

    ESSAYS.forEach((essay, idx) => {
      expect(essay.id).toBeTruthy();
      expect(essay.slug).toBeTruthy();
      expect(essay.issueNumber).toBe(`0${idx + 1}`);
      expect(essay.title).toBeTruthy();
      expect(essay.subtitle).toBeTruthy();
      expect(essay.readTimeMinutes).toBeGreaterThan(0);
      expect(essay.teaser).toBeTruthy();
      expect(essay.quote).toBeTruthy();
      expect(essay.sections && essay.sections.length).toBeGreaterThan(0);
    });
  });

  it('should only link to existing and active simulations', () => {
    ESSAYS.forEach(essay => {
      if (essay.linkedSimulations) {
        essay.linkedSimulations.forEach(simLink => {
          const sim = getSimulationBySlug(simLink.slug);
          expect(sim).toBeDefined();
          expect(sim?.status).toBe('active');
        });
      }
    });
  });

  it('should retrieve essays by both slug and id via getEssayBySlug', () => {
    ESSAYS.forEach(essay => {
      const bySlug = getEssayBySlug(essay.slug!);
      expect(bySlug).toBeDefined();
      expect(bySlug?.id).toBe(essay.id);

      const byId = getEssayBySlug(essay.id);
      expect(byId).toBeDefined();
      expect(byId?.slug).toBe(essay.slug);
    });

    expect(getEssayBySlug('non-existent-slug')).toBeUndefined();
  });

  it('should return all essays via getAllEssays', () => {
    const all = getAllEssays();
    expect(all).toHaveLength(3);
    expect(all.map(e => e.id)).toEqual(['intuition-failure', 'paradox-power', 'quantum-reality']);
  });
});

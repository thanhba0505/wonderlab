import { describe, it, expect } from 'vitest';
import { cn, getApiBaseUrl } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('px-2 py-1', 'bg-black')).toBe('px-2 py-1 bg-black');
    });

    it('resolves conflicting tailwind classes', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('handles conditional classes properly', () => {
      expect(cn('base', false && 'hidden', undefined, null, 'active')).toBe('base active');
    });
  });

  describe('getApiBaseUrl', () => {
    it('returns default URL when environment variable is unset', () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      expect(getApiBaseUrl()).toBe('http://localhost:3001/api/v1');

      process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    });
  });
});

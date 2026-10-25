import { describe, it, expect } from 'vitest';
import { GET } from './route';
import rootPkg from '../../../../package.json';

describe('Client Health Check API Route', () => {
  it('should return 200 with status ok, service identifier and dynamic package version', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('wonderlab-client');
    expect(data.version).toBe(rootPkg.version);
    expect(typeof data.timestamp).toBe('string');
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });
});

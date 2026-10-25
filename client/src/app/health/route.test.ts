import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('Client Health Check API Route', () => {
  it('should return 200 with status ok and service identifier', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('wonderlab-client');
    expect(data.version).toBe('1.0.0');
    expect(typeof data.timestamp).toBe('string');
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });
});

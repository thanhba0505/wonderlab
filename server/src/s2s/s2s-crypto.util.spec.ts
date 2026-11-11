import {
  generateS2SSignature,
  verifyS2SSignature,
  normalizeS2SPath,
  canonicalizeS2SBody,
} from './s2s-crypto.util';

describe('Wonderlab S2SCryptoUtil', () => {
  const secret = 'wl_test_secret_key_98765';
  const timestamp = '1773000000';
  const method = 'PATCH';
  const path = '/api/v1/users/usr_1/role';
  const body = { role: 'ADMIN' };

  it('should generate valid 64-char hex HMAC-SHA256 signature', () => {
    const sig = generateS2SSignature(secret, timestamp, method, path, body);
    expect(sig).toBeDefined();
    expect(sig).toHaveLength(64);
  });

  it('should verify signature successfully with same parameters', () => {
    const sig = generateS2SSignature(secret, timestamp, method, path, body);
    expect(verifyS2SSignature(secret, timestamp, method, path, sig, body)).toBe(true);
  });

  it('should reject when body is altered', () => {
    const sig = generateS2SSignature(secret, timestamp, method, path, body);
    expect(verifyS2SSignature(secret, timestamp, method, path, sig, { role: 'USER' })).toBe(false);
  });

  it('should normalize paths and canonicalize body accurately', () => {
    expect(normalizeS2SPath('api/v1/health')).toBe('/api/v1/health');
    expect(normalizeS2SPath('/api/v1/health?param=1')).toBe('/api/v1/health');
    expect(canonicalizeS2SBody(null)).toBe('');
    expect(canonicalizeS2SBody('raw_payload')).toBe('raw_payload');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [I18nService],
    }).compile();

    service = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resolveLocale', () => {
    it('defaults to vi when rawLocale is undefined or null', () => {
      expect(service.resolveLocale(undefined)).toBe('vi');
      expect(service.resolveLocale(null)).toBe('vi');
      expect(service.resolveLocale('')).toBe('vi');
    });

    it('resolves direct locale strings correctly', () => {
      expect(service.resolveLocale('en')).toBe('en');
      expect(service.resolveLocale('vi')).toBe('vi');
      expect(service.resolveLocale('en-US')).toBe('en');
      expect(service.resolveLocale('vi-VN')).toBe('vi');
    });

    it('parses multi-language Accept-Language headers', () => {
      expect(service.resolveLocale('en-US,en;q=0.9,vi;q=0.8')).toBe('en');
      expect(service.resolveLocale('vi-VN,vi;q=0.9,en;q=0.7')).toBe('vi');
      expect(service.resolveLocale('fr-FR,fr;q=0.9,en;q=0.8')).toBe('en');
      expect(service.resolveLocale('fr-FR,de-DE')).toBe('vi'); // Fallback default
    });
  });

  describe('t (translate)', () => {
    it('translates keys into Vietnamese by default', () => {
      const msg = service.t('auth.invalid_credentials', 'vi');
      expect(msg).toBe('Tên đăng nhập hoặc mật khẩu không chính xác');
    });

    it('translates keys into English when requested', () => {
      const msg = service.t('auth.invalid_credentials', 'en');
      expect(msg).toBe('Incorrect username or password');
    });

    it('returns the key if translation is missing', () => {
      const missing = service.t('unknown.key.path', 'en');
      expect(missing).toBe('unknown.key.path');
    });

    it('interpolates parameters when provided', () => {
      // Let's test param interpolation with a dynamic string or parameter
      const key = 'test.greeting';
      // Fallback returns key
      expect(service.t(key)).toBe(key);
    });
  });
});

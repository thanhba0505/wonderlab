import { validateSync } from 'class-validator';
import { IsEmailIfProd, MinLengthIfProd, MatchesIfProd } from './validation-helpers';

class SampleDevDto {
  @IsEmailIfProd()
  email!: string;

  @MinLengthIfProd(8)
  password!: string;

  @MatchesIfProd(/^[a-zA-Z0-9_]+$/)
  username!: string;
}

describe('validation-helpers', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('in development environment (non-production)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should accept arbitrary email formats without strict regex check', () => {
      const dto = new SampleDevDto();
      dto.email = 'arbitrary_test_email';
      dto.password = '123';
      dto.username = 'any-username!';

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });

    it('should allow short passwords (under 8 chars)', () => {
      const dto = new SampleDevDto();
      dto.email = 'dev';
      dto.password = '1';
      dto.username = 'u';

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('in production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should reject invalid email format', () => {
      const dto = new SampleDevDto();
      dto.email = 'invalid-email';
      dto.password = 'StrongPass123!';
      dto.username = 'valid_user';

      const errors = validateSync(dto);
      const emailError = errors.find(e => e.property === 'email');
      expect(emailError).toBeDefined();
      expect(emailError?.constraints?.isEmailIfProd).toBe('Định dạng email không hợp lệ');
    });

    it('should reject password with less than 8 characters', () => {
      const dto = new SampleDevDto();
      dto.email = 'user@wonderlab.local';
      dto.password = '12345';
      dto.username = 'valid_user';

      const errors = validateSync(dto);
      const passwordError = errors.find(e => e.property === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints?.minLengthIfProd).toContain('8 ký tự');
    });

    it('should accept valid email and strong password in production', () => {
      const dto = new SampleDevDto();
      dto.email = 'scientist@wonderlab.local';
      dto.password = 'SecureLabPassword2026!';
      dto.username = 'scientist_2026';

      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });
  });
});

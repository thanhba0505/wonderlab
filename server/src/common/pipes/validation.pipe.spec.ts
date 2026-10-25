import { ValidationError } from '@nestjs/common';
import { extractValidationErrors, createValidationPipe } from './validation.pipe';

describe('ValidationPipe utilities', () => {
  it('should extract top-level and nested validation errors into key-value map', () => {
    const mockErrors: ValidationError[] = [
      {
        property: 'email',
        constraints: {
          isEmail: 'Định dạng email không hợp lệ',
          isNotEmpty: 'Email không được để trống',
        },
      },
      {
        property: 'profile',
        children: [
          {
            property: 'bio',
            constraints: {
              maxLength: 'Tiểu sử quá dài',
            },
          },
        ],
      },
    ];

    const result = extractValidationErrors(mockErrors);

    expect(result).toEqual({
      email: ['Định dạng email không hợp lệ', 'Email không được để trống'],
      'profile.bio': ['Tiểu sử quá dài'],
    });
  });

  it('should instantiate createValidationPipe properly', () => {
    const pipe = createValidationPipe();
    expect(pipe).toBeDefined();
  });
});

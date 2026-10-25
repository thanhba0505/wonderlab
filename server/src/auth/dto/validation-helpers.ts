import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator';

/**
 * Validates email format strictly in production environment.
 * In development / test, accepts any non-empty string so developers can create
 * accounts with arbitrary test emails (e.g. 'dev', 'admin', 'test').
 */
export function IsEmailIfProd(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isEmailIfProd',
      validator: {
        validate: (value: unknown): boolean => {
          if (process.env.NODE_ENV !== 'production') {
            return typeof value === 'string' && value.trim().length > 0;
          }
          return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        defaultMessage: buildMessage(
          eachPrefix => `${eachPrefix}Định dạng email không hợp lệ`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

/**
 * Validates minimum string length strictly in production environment.
 * In development / test, accepts any non-empty string so developers can use
 * simple passwords (e.g. '1', '123') without validation errors.
 */
export function MinLengthIfProd(
  min: number,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'minLengthIfProd',
      constraints: [min],
      validator: {
        validate: (value: unknown, args): boolean => {
          if (process.env.NODE_ENV !== 'production') {
            return typeof value === 'string' && value.length > 0;
          }
          const [minLength] = args?.constraints || [min];
          return typeof value === 'string' && value.length >= minLength;
        },
        defaultMessage: buildMessage(
          eachPrefix => `${eachPrefix}Mật khẩu tối thiểu phải có ${min} ký tự`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

/**
 * Validates regex matches strictly in production environment.
 * In development / test, accepts any non-empty string.
 */
export function MatchesIfProd(
  pattern: RegExp,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'matchesIfProd',
      constraints: [pattern],
      validator: {
        validate: (value: unknown, args): boolean => {
          if (process.env.NODE_ENV !== 'production') {
            return typeof value === 'string' && value.length > 0;
          }
          const [reg] = args?.constraints || [pattern];
          return typeof value === 'string' && reg.test(value);
        },
        defaultMessage: buildMessage(
          eachPrefix => `${eachPrefix}Định dạng không hợp lệ`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

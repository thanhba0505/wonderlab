import { BadRequestException, ValidationPipe, ValidationError } from '@nestjs/common';

/**
 * Recursively extracts validation constraints into a flat dictionary of field paths
 * and their corresponding error messages.
 */
export function extractValidationErrors(
  errors: ValidationError[],
  parentKey = '',
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const error of errors) {
    const key = parentKey ? `${parentKey}.${error.property}` : error.property;

    if (error.constraints && Object.keys(error.constraints).length > 0) {
      result[key] = Object.values(error.constraints);
    }

    if (error.children && error.children.length > 0) {
      const childErrors = extractValidationErrors(error.children, key);
      for (const [childKey, messages] of Object.entries(childErrors)) {
        result[childKey] = messages;
      }
    }
  }

  return result;
}

/**
 * Creates a standard ValidationPipe configured with uniform field error extraction.
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (validationErrors: ValidationError[]) => {
      const errors = extractValidationErrors(validationErrors);
      return new BadRequestException({
        statusCode: 400,
        message: 'Dữ liệu không hợp lệ.',
        error: 'Bad Request',
        errors,
      });
    },
  });
}

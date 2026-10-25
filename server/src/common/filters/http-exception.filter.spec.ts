import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common/interfaces';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    const mockResponse = {
      status: mockStatus,
    };

    const mockRequest = {
      url: '/api/v1/auth/register',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should format structured errors object correctly', () => {
    const exception = new BadRequestException({
      statusCode: 400,
      message: 'Dữ liệu không hợp lệ.',
      error: 'Bad Request',
      errors: {
        email: ['Định dạng email không hợp lệ'],
        username: ['Tên đăng nhập đã tồn tại'],
      },
    });

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Dữ liệu không hợp lệ.',
        error: 'BadRequest',
        errors: {
          email: ['Định dạng email không hợp lệ'],
          username: ['Tên đăng nhập đã tồn tại'],
        },
        path: '/api/v1/auth/register',
      }),
    );
  });

  it('should map field property to errors dictionary when provided', () => {
    const exception = new BadRequestException({
      message: 'Email đã được sử dụng',
      field: 'email',
    });

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Email đã được sử dụng',
        errors: {
          email: ['Email đã được sử dụng'],
        },
      }),
    );
  });

  it('should format simple string HttpException gracefully', () => {
    const exception = new HttpException('Forbidden access', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: 'Forbidden access',
        errors: {},
      }),
    );
  });
});

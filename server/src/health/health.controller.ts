import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiOkResponse({
    description: 'System is healthy and ready to serve requests',
    type: HealthResponseDto,
  })
  check(): HealthResponseDto {
    return {
      status: 'ok',
      service: 'wonderlab-server',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}

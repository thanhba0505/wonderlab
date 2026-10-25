import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'System health check endpoint with database connectivity check' })
  @ApiOkResponse({
    description: 'System is healthy and database is connected',
    type: HealthResponseDto,
  })
  async check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}

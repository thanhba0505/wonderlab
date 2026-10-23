import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'Overall system health status' })
  status!: string;

  @ApiProperty({ example: 'wonderlab-server', description: 'Name of the microservice' })
  service!: string;

  @ApiProperty({
    example: '2026-10-23T04:20:00.000Z',
    description: 'Current server time in ISO-8601 format',
  })
  timestamp!: string;

  @ApiProperty({ example: '1.0.0', description: 'API contract version' })
  version!: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class SimulationHistoryQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by simulation slug',
    example: 'birthday-paradox',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  simulationSlug?: string;

  @ApiPropertyOptional({
    description: 'Anonymous client session identifier',
    example: 'sess_9f8b2c4e-1a2b-4c3d-8e4f-5a6b7c8d9e0f',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  clientSession?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of records to return',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

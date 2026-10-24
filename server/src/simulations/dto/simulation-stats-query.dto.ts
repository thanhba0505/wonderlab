import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SimulationStatsQueryDto {
  @ApiPropertyOptional({
    description: 'Optional filter by simulation slug (e.g. birthday-paradox)',
    example: 'birthday-paradox',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  simulationSlug?: string;
}

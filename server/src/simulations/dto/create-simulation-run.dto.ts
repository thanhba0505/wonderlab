import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSimulationRunDto {
  @ApiProperty({
    description: 'Identifier slug of the simulation (e.g., birthday-paradox, monty-hall)',
    example: 'birthday-paradox',
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  simulationSlug!: string;

  @ApiProperty({
    description: 'Input parameters configured for this simulation run',
    example: { groupSize: 23 },
  })
  @IsObject()
  @IsNotEmpty()
  parameters!: Record<string, unknown>;

  @ApiProperty({
    description: 'Empirical results recorded during this simulation run',
    example: { collisions: 5074, empiricalProbability: 0.5074, theoreticalProbability: 0.5073 },
  })
  @IsObject()
  @IsNotEmpty()
  results!: Record<string, unknown>;

  @ApiProperty({
    description: 'Total number of iterations or trials executed in this batch',
    example: 10000,
    minimum: 1,
    maximum: 1000000,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Max(1000000)
  trialsCount!: number;

  @ApiPropertyOptional({
    description: 'Execution duration in milliseconds',
    example: 125,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMs?: number;

  @ApiPropertyOptional({
    description: 'Anonymous client session identifier',
    example: 'sess_9f8b2c4e-1a2b-4c3d-8e4f-5a6b7c8d9e0f',
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  clientSession?: string;
}

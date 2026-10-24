import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { Request } from 'express';
import {
  SimulationsService,
  GlobalTelemetryStats,
  SimulationRunRecord,
} from './simulations.service';
import { CreateSimulationRunDto } from './dto/create-simulation-run.dto';
import { SimulationStatsQueryDto } from './dto/simulation-stats-query.dto';
import { SimulationHistoryQueryDto } from './dto/simulation-history-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

@ApiTags('Simulations')
@Controller('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/overview')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Lấy dữ liệu tổng quan KPIs và hoạt động thực nghiệm (Admin only)',
    description: 'Tổng hợp số lượt chạy, số người dùng, số bình luận và hoạt động gần đây.',
  })
  async getAdminOverview() {
    return this.simulationsService.getAdminOverview();
  }

  @Post('runs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Record a simulation run',
    description:
      'Stores the parameters, sample results, and trial counts for a Monte Carlo simulation run.',
  })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Anonymous client session identifier',
  })
  @ApiResponse({
    status: 201,
    description: 'The simulation run was successfully recorded.',
  })
  async recordRun(
    @Body() dto: CreateSimulationRunDto,
    @Headers('x-session-id') sessionHeader?: string,
    @Req() req?: AuthenticatedRequest,
  ): Promise<{
    run: SimulationRunRecord;
    cumulative: {
      slugRuns: number;
      slugTrials: number;
      globalTrials: number;
    };
  }> {
    if (!dto.clientSession && sessionHeader) {
      dto.clientSession = sessionHeader;
    }

    const userId = req?.user?.id;
    return this.simulationsService.recordRun(dto, userId);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Retrieve global simulation telemetry statistics',
    description:
      'Returns aggregate counts of total runs and trials across all simulations or filtered by slug.',
  })
  @ApiResponse({
    status: 200,
    description: 'Global telemetry statistics.',
  })
  async getStats(@Query() query: SimulationStatsQueryDto): Promise<GlobalTelemetryStats> {
    return this.simulationsService.getGlobalStats(query.simulationSlug);
  }

  @Get('runs/history')
  @ApiOperation({
    summary: 'Retrieve recent simulation runs',
    description: 'Returns the most recent runs filtered by client session or authenticated user.',
  })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Anonymous client session identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of recent simulation runs.',
  })
  async getHistory(
    @Query() query: SimulationHistoryQueryDto,
    @Headers('x-session-id') sessionHeader?: string,
    @Req() req?: AuthenticatedRequest,
  ): Promise<SimulationRunRecord[]> {
    if (!query.clientSession && sessionHeader) {
      query.clientSession = sessionHeader;
    }

    const userId = req?.user?.id;
    return this.simulationsService.getRecentHistory(query, userId);
  }
}

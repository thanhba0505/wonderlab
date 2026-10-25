import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSimulationRunDto } from './dto/create-simulation-run.dto';
import { SimulationHistoryQueryDto } from './dto/simulation-history-query.dto';

export interface GlobalTelemetryStats {
  totalRuns: number;
  totalTrials: number;
  bySimulation: Record<
    string,
    {
      runs: number;
      trials: number;
      lastRunAt: Date | null;
    }
  >;
  updatedAt: string;
}

export interface SimulationRunRecord {
  id: string;
  simulationSlug: string;
  parameters: unknown;
  results: unknown;
  trialsCount: number;
  durationMs: number | null;
  clientSession: string | null;
  createdAt: Date;
}

@Injectable()
export class SimulationsService {
  private readonly logger = new Logger(SimulationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a new simulation run in the database and returns the created record
   * along with the new cumulative totals.
   */
  async recordRun(
    dto: CreateSimulationRunDto,
    userId?: string,
  ): Promise<{
    run: SimulationRunRecord;
    cumulative: {
      slugRuns: number;
      slugTrials: number;
      globalTrials: number;
    };
  }> {
    const created = await this.prisma.simulationRun.create({
      data: {
        simulationSlug: dto.simulationSlug,
        parameters: dto.parameters as Prisma.InputJsonValue,
        results: dto.results as Prisma.InputJsonValue,
        trialsCount: dto.trialsCount,
        durationMs: dto.durationMs ?? null,
        clientSession: dto.clientSession ?? null,
        userId: userId ?? null,
      },
    });

    const [slugStats, globalStats] = await Promise.all([
      this.prisma.simulationRun.aggregate({
        where: { simulationSlug: dto.simulationSlug },
        _count: { id: true },
        _sum: { trialsCount: true },
      }),
      this.prisma.simulationRun.aggregate({
        _sum: { trialsCount: true },
      }),
    ]);

    this.logger.log(
      `Recorded run for [${dto.simulationSlug}] with ${dto.trialsCount} trials (ID: ${created.id})`,
    );

    return {
      run: {
        id: created.id,
        simulationSlug: created.simulationSlug,
        parameters: created.parameters,
        results: created.results,
        trialsCount: created.trialsCount,
        durationMs: created.durationMs,
        clientSession: created.clientSession,
        createdAt: created.createdAt,
      },
      cumulative: {
        slugRuns: slugStats._count.id,
        slugTrials: slugStats._sum.trialsCount ?? 0,
        globalTrials: globalStats._sum.trialsCount ?? 0,
      },
    };
  }

  /**
   * Retrieves aggregated global telemetry stats across all simulations or filtered by slug.
   */
  async getGlobalStats(slugFilter?: string): Promise<GlobalTelemetryStats> {
    const whereClause = slugFilter ? { simulationSlug: slugFilter } : {};

    const [totalRuns, globalSum, grouped] = await Promise.all([
      this.prisma.simulationRun.count({ where: whereClause }),
      this.prisma.simulationRun.aggregate({
        where: whereClause,
        _sum: { trialsCount: true },
      }),
      this.prisma.simulationRun.groupBy({
        by: ['simulationSlug'],
        where: whereClause,
        _count: { id: true },
        _sum: { trialsCount: true },
        _max: { createdAt: true },
      }),
    ]);

    const bySimulation: Record<string, { runs: number; trials: number; lastRunAt: Date | null }> =
      {};

    for (const group of grouped) {
      bySimulation[group.simulationSlug] = {
        runs: group._count.id,
        trials: group._sum.trialsCount ?? 0,
        lastRunAt: group._max.createdAt ?? null,
      };
    }

    return {
      totalRuns,
      totalTrials: globalSum._sum.trialsCount ?? 0,
      bySimulation,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieves recent simulation runs filtered by session or authenticated user.
   */
  async getRecentHistory(
    query: SimulationHistoryQueryDto,
    userId?: string,
  ): Promise<SimulationRunRecord[]> {
    const where: Prisma.SimulationRunWhereInput = {};

    if (query.simulationSlug) {
      where.simulationSlug = query.simulationSlug;
    }

    // Filter by user or session
    if (userId) {
      where.userId = userId;
    } else if (query.clientSession) {
      where.clientSession = query.clientSession;
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, query.limit || 20);
    const skip = (page - 1) * limit;

    const runs = await this.prisma.simulationRun.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        simulationSlug: true,
        parameters: true,
        results: true,
        trialsCount: true,
        durationMs: true,
        clientSession: true,
        createdAt: true,
      },
    });

    return runs;
  }

  /**
   * Retrieves comprehensive system overview metrics for the Admin Dashboard
   */
  async getAdminOverview(): Promise<{
    totalRuns: number;
    totalTrials: number;
    totalUsers: number;
    totalComments: number;
    bySimulation: Record<string, { runs: number; trials: number }>;
    recentRuns: Array<{
      id: string;
      simulationSlug: string;
      trialsCount: number;
      durationMs: number | null;
      createdAt: Date;
    }>;
    recentComments: Array<{
      id: string;
      content: string;
      simulationSlug: string;
      parentId: string | null;
      createdAt: Date;
      user: { username: string; role: string };
    }>;
  }> {
    const [
      totalRuns,
      trialsAgg,
      totalUsers,
      totalComments,
      recentRuns,
      recentComments,
      groupedBySlug,
    ] = await Promise.all([
      this.prisma.simulationRun.count(),
      this.prisma.simulationRun.aggregate({
        _sum: { trialsCount: true },
      }),
      this.prisma.user.count(),
      this.prisma.comment.count({ where: { isDeleted: false } }),
      this.prisma.simulationRun.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          simulationSlug: true,
          trialsCount: true,
          durationMs: true,
          createdAt: true,
        },
      }),
      this.prisma.comment.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          content: true,
          simulationSlug: true,
          parentId: true,
          createdAt: true,
          user: {
            select: {
              username: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.simulationRun.groupBy({
        by: ['simulationSlug'],
        _count: { _all: true },
        _sum: { trialsCount: true },
      }),
    ]);

    const bySimulation: Record<string, { runs: number; trials: number }> = {};
    for (const group of groupedBySlug) {
      bySimulation[group.simulationSlug] = {
        runs: group._count._all,
        trials: group._sum.trialsCount || 0,
      };
    }

    return {
      totalRuns,
      totalTrials: trialsAgg._sum.trialsCount || 0,
      totalUsers,
      totalComments,
      bySimulation,
      recentRuns,
      recentComments,
    };
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceConnection } from '@prisma/client';

@Injectable()
export class S2SService {
  private readonly logger = new Logger(S2SService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get an active service connection by slug
   */
  async getConnection(slug: string): Promise<ServiceConnection | null> {
    return this.prisma.serviceConnection.findFirst({
      where: { slug, isActive: true },
    });
  }

  /**
   * Make an authenticated HTTP call to a connected service
   */
  async call<T>(slug: string, endpoint: string, options: RequestInit = {}): Promise<T> {
    const connection = await this.getConnection(slug);
    if (!connection) {
      throw new NotFoundException(`Active service connection not found for slug: ${slug}`);
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${connection.domain}${connection.apiPrefix}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (connection.apiKey) {
      headers['Authorization'] = `Bearer ${connection.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), connection.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `S2S call to ${slug} (${url}) failed with status ${response.status}: ${errorText}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      this.logger.error(`Failed S2S call to ${slug}: ${(error as Error).message}`);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

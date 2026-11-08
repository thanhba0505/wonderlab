import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class S2SAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const connections = await this.prisma.serviceConnection.findMany({
      where: {
        isActive: true,
        incomingSecret: { not: null },
      },
    });

    const tokenBuffer = Buffer.from(token);

    const matched = connections.find(conn => {
      if (!conn.incomingSecret) return false;
      const secretBuffer = Buffer.from(conn.incomingSecret);
      if (secretBuffer.length !== tokenBuffer.length) return false;
      return crypto.timingSafeEqual(secretBuffer, tokenBuffer);
    });

    if (!matched) {
      throw new UnauthorizedException('Invalid service token');
    }

    request.serviceConnection = matched;
    return true;
  }
}

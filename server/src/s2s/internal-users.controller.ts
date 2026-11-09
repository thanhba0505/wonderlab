import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { S2SAuthGuard } from './s2s-auth.guard';
import { SyncUserDto } from './dto/sync-user.dto';

@ApiTags('Internal S2S')
@ApiBearerAuth()
@UseGuards(S2SAuthGuard)
@Controller('internal/users')
export class InternalUsersController {
  private readonly logger = new Logger(InternalUsersController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Synchronize user identity from Central Gateway' })
  async syncUser(@Body() dto: SyncUserDto) {
    this.logger.log(`Received user sync request for user: ${dto.username} (${dto.id})`);

    const role = dto.role === 'ADMIN' ? Role.ADMIN : Role.USER;

    // Check if user exists by ID, username, or email
    let existing = await this.prisma.user.findUnique({
      where: { id: dto.id },
    });

    if (!existing) {
      existing = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });
    }

    if (!existing && dto.email) {
      existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
    }

    let user;
    if (existing) {
      user = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          username: dto.username,
          email: dto.email ?? null,
          avatarUrl: dto.avatarUrl ?? null,
          role,
          isActive: dto.isActive,
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          id: dto.id,
          username: dto.username,
          email: dto.email ?? null,
          avatarUrl: dto.avatarUrl ?? null,
          role,
          isActive: dto.isActive,
          isEmailVerified: true,
        },
      });
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }
}

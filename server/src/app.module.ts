import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { I18nModule } from './i18n/i18n.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SimulationsModule } from './simulations/simulations.module';
import { CommentsModule } from './comments/comments.module';
import { SimulationRequestsModule } from './simulation-requests/simulation-requests.module';
import { S2SModule } from './s2s/s2s.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '../.env.local'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    I18nModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    HealthModule,
    SimulationsModule,
    CommentsModule,
    SimulationRequestsModule,
    S2SModule,
  ],
})
export class AppModule {}

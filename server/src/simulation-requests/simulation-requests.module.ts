import { Module } from '@nestjs/common';
import { SimulationRequestsController } from './simulation-requests.controller';
import { SimulationRequestsService } from './simulation-requests.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SlackNotificationService } from '../common/slack-notification.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SimulationRequestsController],
  providers: [SimulationRequestsService, SlackNotificationService],
  exports: [SimulationRequestsService],
})
export class SimulationRequestsModule {}

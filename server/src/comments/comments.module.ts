import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SlackNotificationService } from '../common/slack-notification.service';

@Module({
  imports: [PrismaModule],
  controllers: [CommentsController],
  providers: [CommentsService, SlackNotificationService],
  exports: [CommentsService],
})
export class CommentsModule {}

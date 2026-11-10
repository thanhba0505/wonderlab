import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { S2SModule } from '../s2s/s2s.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, S2SModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

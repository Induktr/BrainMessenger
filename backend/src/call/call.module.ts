import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallService } from './call.service';
import { CallResolver } from './call.resolver';
import { Call } from './call.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Call])],
  providers: [CallService, CallResolver],
})
export class CallModule {}
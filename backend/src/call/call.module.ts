import { Module } from '@nestjs/common';
import { CallService } from './call.service';
import { CallResolver } from './call.resolver';
// Removed: import { Call } from './call.entity';

@Module({
  imports: [], // Removed TypeOrmModule.forFeature([Call])
  providers: [CallService, CallResolver],
})
export class CallModule {}
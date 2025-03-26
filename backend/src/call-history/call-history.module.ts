import { Module } from '@nestjs/common';
import { CallHistoryService } from './call-history.service';

@Module({
  providers: [CallHistoryService],
  exports: [CallHistoryService],
})
export class CallHistoryModule {}

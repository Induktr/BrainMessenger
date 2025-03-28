import { Module } from '@nestjs/common';
import { CallHistoryService } from './call-history.service';
import { CallHistoryResolver } from './call-history.resolver'; // Import resolver

@Module({
  providers: [CallHistoryService, CallHistoryResolver], // Add resolver
  exports: [CallHistoryService],
})
export class CallHistoryModule {}

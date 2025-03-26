import { Module } from '@nestjs/common';
import { NhostService } from './nhost.service';

@Module({
  providers: [NhostService],
  exports: [NhostService],
})
export class NhostModule {}

import { Module } from '@nestjs/common';
import { MessageService } from './message.service';

@Module({
  imports: [], // Remove TypeOrmModule
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}

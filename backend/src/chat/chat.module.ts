import { Module } from '@nestjs/common';
// Removed: import { Chat } from '../chat.entity';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [MessageModule], // Removed TypeOrmModule.forFeature([Chat])
  providers: [ChatService, ChatResolver],
  exports: [ChatService],
})
export class ChatModule {}

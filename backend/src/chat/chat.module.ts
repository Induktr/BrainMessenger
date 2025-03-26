import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from '../chat.entity';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chat]), MessageModule],
  providers: [ChatService, ChatResolver],
  exports: [ChatService],
})
export class ChatModule {}

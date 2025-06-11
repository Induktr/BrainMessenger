import { Module, forwardRef } from '@nestjs/common'; // Import forwardRef
import { PubSub } from 'graphql-subscriptions'; // Import PubSub
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { MessageModule } from '../message/message.module';
import { CloudflareModule } from '../cloudflare/cloudflare.module'; // Import CloudflareModule
import { AppModule } from '../app.module'; // Import AppModule

@Module({
  imports: [MessageModule, CloudflareModule, forwardRef(() => AppModule)], // Use forwardRef to resolve circular dependency
  providers: [
    ChatService,
    ChatResolver,
    PubSub, // Provide PubSub here
  ],
  exports: [ChatService],
})
export class ChatModule {}

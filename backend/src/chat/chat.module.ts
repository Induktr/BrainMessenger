import { Module, forwardRef } from '@nestjs/common'; // Import forwardRef
import { ChatService } from './chat.service';
import { PubSubModule } from '../pubsub/pubsub.module'; // Import PubSubModule
// Remove old PubSub import
// import { PubSub } from 'graphql-subscriptions'; // Import PubSub
import { ChatResolver } from './chat.resolver';
import { MessageModule } from '../message/message.module';
import { CloudflareModule } from '../cloudflare/cloudflare.module'; // Import CloudflareModule
import { AppModule } from '../app.module'; // Import AppModule

@Module({
  imports: [MessageModule, CloudflareModule, PubSubModule, forwardRef(() => AppModule)], // Remove forwardRef from MessageModule import
  providers: [
    ChatService,
    ChatResolver, // Remove forwardRef here
  ],
  // Remove PubSub from exports as it's now exported by PubSubModule
  exports: [ChatService],
})
export class ChatModule {}

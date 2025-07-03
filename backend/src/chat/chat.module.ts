import { Module, forwardRef } from '@nestjs/common'; // Import forwardRef
import { ChatService } from './chat.service';
import { PubSubModule } from '../pubsub/pubsub.module'; // Import PubSubModule
// Remove old PubSub import
// import { PubSub } from 'graphql-subscriptions'; // Import PubSub
import { ChatResolver } from './chat.resolver';
import { MessageModule } from '../message/message.module';
import { CloudflareModule } from '../cloudflare/cloudflare.module'; // Import CloudflareModule
<<<<<<< HEAD
import { UserModule } from '../user/user.module';


@Module({
  imports: [MessageModule, CloudflareModule, PubSubModule, forwardRef(() => UserModule)],
=======


@Module({
  imports: [MessageModule, CloudflareModule, PubSubModule],
>>>>>>> f701f644797923ab65532d63750f4fcba8d1b5df
  providers: [
    ChatService,
    ChatResolver, // Remove forwardRef here
  ],
  // Remove PubSub from exports as it's now exported by PubSubModule
  exports: [ChatService],
})
export class ChatModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { pubSubProvider } from './pubsub.provider';

@Module({
  imports: [ConfigModule], // Import ConfigModule as the provider depends on ConfigService
  providers: [pubSubProvider],
  exports: [pubSubProvider], // Export the provider so other modules can inject PubSub
})
export class PubSubModule {}
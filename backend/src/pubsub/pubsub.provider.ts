import { Provider, Logger } from '@nestjs/common';
import { PubSubEngine } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const PUB_SUB = 'PUB_SUB'; // Define a token for the provider

export const pubSubProvider: Provider = {
  provide: PUB_SUB, // Provide the PubSub instance
    useFactory: (configService: ConfigService): PubSubEngine => {
    const logger = new Logger('PubSubProvider');
    const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379'; // Default to localhost URL
    const redisOptions = {
       retryStrategy: (times: number) => {
         // reconnect after
         return Math.min(times * 50, 2000);
       },
     };
    logger.log(`Initializing RedisPubSub with URL: ${redisUrl}`);
    return new RedisPubSub({
      publisher: new Redis(redisUrl, redisOptions), // Pass URL and options
      subscriber: new Redis(redisUrl, redisOptions), // Pass URL and options
    });
  },
  inject: [ConfigService], // Inject ConfigService to get Redis config
};
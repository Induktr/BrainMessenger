import { Module, forwardRef } from '@nestjs/common'; // Import forwardRef
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { WebrtcSignalingGateway } from './webrtc-signaling';
import { PrismaModule } from './prisma/prisma.module';
import { FileModule } from './file/file.module'; // Import FileModule
import { CloudflareModule } from './cloudflare/cloudflare.module'; // Import CloudflareModule
import { APP_GUARD } from '@nestjs/core'; // Import APP_GUARD
import { UpdateLastActiveGuard } from './common/guards/update-last-active.guard'; // Import UpdateLastActiveGuard
import { CacheModule } from '@nestjs/cache-manager'; // Import CacheModule
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { PubSub } from 'graphql-subscriptions'; // Keep PubSub for type
import { RedisPubSub } from 'graphql-redis-subscriptions'; // Import RedisPubSub
import Redis from 'ioredis'; // Import Redis constructor directly
import * as redisStore from 'cache-manager-redis-store'; // Keep redisStore

@Module({
  imports: [
    PrismaModule, // Add PrismaModule here
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './backend/.env', // Specify the path to your .env file
    }),
    HttpModule.register({
      global: true,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [AuthModule, ConfigModule], // Import AuthModule and ConfigModule
      inject: [JwtService, ConfigService], // Inject JwtService and ConfigService
      useFactory: async (jwtService: JwtService, configService: ConfigService) => ({
        autoSchemaFile: 'dist/schema.gql',
        // formatError: (error) => {
        //   // Safely log GraphQL errors, checking for 'locations' property
        //   const errorDetails = {
        //     message: error.message,
        //     path: error.path,
        //     extensions: error.extensions,
        //     locations: (error as any).locations ? (error as any).locations : 'N/A' // Safely access locations
        //   };
        //   console.error('[GraphQL Error Formatter] Formatted error:', JSON.stringify(errorDetails, null, 2));
        //   // Return the original error to the client for full details during development
        //   // In production, you might want to mask sensitive details
        //   return error;
        // },
        subscriptions: {
          'graphql-ws': {
            path: '/graphql', // Specify the WebSocket path
            onConnect: async (context: any) => {
              const { connectionParams, extra } = context;
              // Extract token from connectionParams for WebSocket connections
              const token = connectionParams?.Authorization?.split(' ')[1] || connectionParams?.authorization?.split(' ')[1];

              console.log('[GraphQLModule - onConnect] Received connectionParams:', connectionParams);
              console.log('[GraphQLModule - onConnect] Extracted token:', token ? token.substring(0, 10) + '...' : 'No token');

              if (token) {
                try {
                  const payload = jwtService.verify(token, {
                    secret: configService.get<string>('JWT_SECRET'),
                  });
                  console.log('[GraphQLModule - onConnect] Token verified. Payload:', payload);
                  // Attach the user payload and the raw token to the extra object, which will be available in context
                  extra.user = payload;
                  extra.token = token; // Attach the raw token
                  return extra; // Return the extra object as the context
                } catch (e) {
                  console.error('[GraphQLModule - onConnect] WebSocket authentication error:', e.message);
                  throw new Error('Unauthorized'); // Reject connection
                }
              }
              console.warn('[GraphQLModule - onConnect] No token provided for WebSocket connection. Rejecting.');
              throw new Error('Unauthorized'); // Reject connection if no token
            },
          },
        },
        context: ({ req, connection }) => {
          // For HTTP requests, req.user will be populated by Passport.js after JwtAuthGuard.
          // For WebSocket connections, connection.context.user is populated by onConnect.
          // We ensure both are available in the context.
          return { req, connection };
        },
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379'; // Default to localhost URL
        return {
          store: redisStore,
          url: redisUrl, // Use the URL for cache-manager-redis-store
          ttl: configService.get<number>('CACHE_TTL') || 300, // seconds
        };
      },
      isGlobal: true, // Make CacheModule global
    }),
    UserModule,
    AuthModule,
    forwardRef(() => ChatModule), // Use forwardRef to resolve circular dependency
    MessageModule,
    MailModule,
    FileModule, // Add FileModule here
    CloudflareModule, // Add CloudflareModule here
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WebrtcSignalingGateway,
    {
      provide: PubSub,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') || 'redis-19864.c300.eu-central-1-1.ec2.redns.redis-cloud.com:19864'; // Default to localhost URL
        const redisOptions = {
           retryStrategy: (times: number) => {
             // reconnect after
             return Math.min(times * 50, 2000);
           },
         };
        console.log('[AppModule] Initializing RedisPubSub with URL:', redisUrl);
        return new RedisPubSub({
          publisher: new Redis(redisUrl, redisOptions), // Pass URL and options
          subscriber: new Redis(redisUrl, redisOptions), // Pass URL and options
        });
      },
      inject: [ConfigService], // Inject ConfigService to get Redis config
    },
    // { // Temporarily disabled for debugging 'Forbidden resource'
    //   provide: APP_GUARD,
    //   useClass: UpdateLastActiveGuard,
    // },
  ],
  exports: [PubSub], // Export PubSub to make it available to other modules
})
export class AppModule {}

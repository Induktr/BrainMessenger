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
import { PubSub } from 'graphql-subscriptions'; // Import PubSub
import * as redisStore from 'cache-manager-redis-store'; // Import redisStore
import { KafkaModule } from './kafka/kafka.module'; // Import KafkaModule

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
        formatError: (error) => {
          console.error('[GraphQL Error Formatter] Original error:', error);
          // Return the original error to the client for full details during development
          // In production, you might want to mask sensitive details
          return error;
        },
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
                  // Attach the user payload to the extra object, which will be available in context
                  extra.user = payload;
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
          // For HTTP requests (queries/mutations)
          if (req) {
            // Ensure req.headers exists, even if empty
            req.headers = req.headers || {};
            return { request: req };
          }
          // For WebSocket connections (subscriptions)
          if (connection) {
            // The user payload is attached to `extra.user` in onConnect, which becomes `connection.context.user`.
            // We need to ensure the user is directly available on `connection.user` for Passport/Guards.
            // Also, ensure `connection.context.req` is set up if guards expect a `req` object.
            connection.user = connection.context.user; // Attach user directly to connection for guards
            connection.context.req = connection.context.req || {}; // Ensure req object exists in context
            connection.context.req.user = connection.context.user; // Also map to req.user for consistency
            return { req, connection }; // Return both req and connection
          }
          return {};
        },
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST') || 'localhost',
        port: configService.get<number>('REDIS_PORT') || 6379,
        ttl: configService.get<number>('CACHE_TTL') || 300, // seconds
      }),
      isGlobal: true, // Make CacheModule global
    }),
    UserModule,
    AuthModule,
    forwardRef(() => ChatModule), // Use forwardRef to resolve circular dependency
    MessageModule,
    MailModule,
    FileModule, // Add FileModule here
    CloudflareModule, // Add CloudflareModule here
    KafkaModule, // Add KafkaModule here
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WebrtcSignalingGateway,
    {
      provide: PubSub,
      useValue: new PubSub(),
    },
    // { // Temporarily disabled for debugging 'Forbidden resource'
    //   provide: APP_GUARD,
    //   useClass: UpdateLastActiveGuard,
    // },
  ],
  exports: [PubSub], // Export PubSub to make it available to other modules
})
export class AppModule {}

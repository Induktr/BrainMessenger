import { Module, forwardRef, Logger, UnauthorizedException } from '@nestjs/common'; // Import forwardRef and Logger
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
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
import { PrismaService } from './prisma/prisma.service';
import { FileModule } from './file/file.module'; // Import FileModule
import { CloudflareModule } from './cloudflare/cloudflare.module'; // Import CloudflareModule
import { APP_GUARD } from '@nestjs/core'; // Import APP_GUARD
import { UpdateLastActiveGuard } from './common/guards/update-last-active.guard'; // Import UpdateLastActiveGuard
import { CacheModule } from '@nestjs/cache-manager'; // Import CacheModule
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { PubSubModule } from './pubsub/pubsub.module'; // Import PubSubModule
import { LinkPreviewModule } from './link-preview/link-preview.module'; // Import LinkPreviewModule
// Remove old PubSub related imports
// import { PubSub } from 'graphql-subscriptions'; // Keep PubSub for type
// import { RedisPubSub } from 'graphql-redis-subscriptions'; // Import RedisPubSub
// import Redis from 'ioredis'; // Import Redis constructor directly
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
      imports: [AuthModule, ConfigModule, PrismaModule],
      inject: [JwtService, ConfigService, PrismaService],
      useFactory: async (
        jwtService: JwtService,
        configService: ConfigService,
        prisma: PrismaService,
      ) => ({
        autoSchemaFile: 'dist/schema.gql',
        subscriptions: {
          'graphql-ws': {
            path: '/graphql',
            onConnect: async (context: any) => {
              const logger = new Logger('GraphQLModule-onConnect');
              const { connectionParams } = context;
              logger.log(`[onConnect] Received connectionParams: ${JSON.stringify(connectionParams)}`);

              const token = connectionParams?.Authorization?.split(' ')[1] || connectionParams?.authorization?.split(' ')[1];

              logger.log(`[onConnect] Extracted token: ${token ? 'Token found' : 'No token'}`);

              if (token) {
                try {
                  const payload = jwtService.verify(token, {
                    secret: configService.get<string>('JWT_SECRET'),
                  });

                  const user = await prisma.user.findUnique({
                    where: { id: payload.sub },
                  });

                  if (!user) {
                    logger.warn(
                      `[onConnect] Authentication failed: User with ID ${payload.sub} not found.`,
                    );
                    throw new Error(
                      'Authentication failed: Invalid token or user not found.',
                    );
                  }

                  logger.log(
                    `[onConnect] User ${user.email} authenticated. Creating request context.`,
                  );
                  // Return the full context object that the guard expects, now including the user.
                  return { req: { user, context: { token } } };
                } catch (error) {
                  logger.error(
                    `[onConnect] Token verification or user lookup failed: ${error.message}`,
                  );
                  throw new Error('Unauthorized: Invalid token or user.');
                }
              }
              logger.warn('[onConnect] No token provided for WebSocket connection. Rejecting.');
              throw new Error('Unauthorized: No token provided');
            },
          },
        },
        // The context function is now simplified.
        // For HTTP, it receives { req, res } and passes it on.
        // For WebSockets, it receives the context object we returned from `onConnect`
        context: ({ req, res, connection }) => {
          // For WebSockets, the context is already populated by `onConnect`
          if (connection) {
            return { req: connection.context.req, res };
          }
          // For HTTP requests, just pass the request and response objects.
          return { req, res };
        },
        formatError: (error: GraphQLError) => {
          const logger = new Logger('GraphQLFormatError');
          const originalError = error.extensions?.originalError as any;

          if (originalError instanceof UnauthorizedException) {
            logger.warn(`[formatError] Caught UnauthorizedException: "${originalError.message}". Formatting for client.`);
            const graphQLFormattedError: GraphQLFormattedError = {
              message: originalError.message || 'Unauthorized',
              locations: error.locations,
              path: error.path,
              extensions: {
                code: 'UNAUTHENTICATED',
                timestamp: new Date().toISOString(),
              },
            };
            return graphQLFormattedError;
          }

          logger.error(`[formatError] Unhandled error: ${error.message}`);
          return error;
        },
        playground: false, // Disable the old playground
        // Instead, Apollo Server v4 uses the landing page which is enabled by default.
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
    PubSubModule, // Import the new PubSubModule
    LinkPreviewModule, // Add LinkPreviewModule here
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WebrtcSignalingGateway,
    Logger, // Provide Logger globally
    // Remove the old PubSub provider factory
    // {
    //   provide: PubSub,
    //   useFactory: (configService: ConfigService) => {
    //     const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379'; // Default to localhost URL
    //     const redisOptions = {
    //        retryStrategy: (times: number) => {
    //          // reconnect after
    //          return Math.min(times * 50, 2000);
    //        },
    //      };
    //     const logger = new Logger('AppModule'); // Initialize logger for AppModule
    //     logger.log(`Initializing RedisPubSub with URL: ${redisUrl}`); // Replaced console.log
    //     return new RedisPubSub({
    //       publisher: new Redis(redisUrl, redisOptions), // Pass URL and options
    //       subscriber: new Redis(redisUrl, redisOptions), // Pass URL and options
    //     });
    //   },
    //   inject: [ConfigService], // Inject ConfigService to get Redis config
    // },
    // { // Temporarily disabled for debugging 'Forbidden resource'
    //   provide: APP_GUARD,
    //   useClass: UpdateLastActiveGuard,
    // },
  ],
  // Remove PubSub from exports as it's now exported by PubSubModule
  // exports: [PubSub], // Export PubSub to make it available to other modules
  exports: [Logger], // Export Logger to make it available to other modules
})
export class AppModule {}

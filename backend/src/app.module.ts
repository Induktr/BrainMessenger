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
import { PubSubModule } from './pubsub/pubsub.module';
// import { PubSubModule } from './pubsub/pubsub.module'; // Import PubSubModule
import { LinkPreviewModule } from './link-preview/link-preview.module'; // Import LinkPreviewModule
// Remove old PubSub related imports
import { PubSub } from 'graphql-subscriptions';


import * as redisStore from 'cache-manager-redis-store'; // Keep redisStore

@Module({
  imports: [
    PrismaModule, // Add PrismaModule here
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Correct path for the test environment
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
        autoSchemaFile: process.env.NODE_ENV === 'test' ? true : 'dist/schema.gql',
        subscriptions: {
          'graphql-ws': {
            path: '/graphql',
            onConnect: async (context: any) => {
              const logger = new Logger('GraphQLWS onConnect');
              logger.debug('New WebSocket connection attempt.');

              try {
                const connectionParams = context.connectionParams || {};
                logger.debug(`Connection params: ${JSON.stringify(connectionParams)}`);

                const { Authorization, authorization } = connectionParams;
                const token = (Authorization || authorization)?.split(' ')[1];

                if (!token) {
                  logger.warn('Authentication token is missing.');
                  throw new UnauthorizedException('Authentication token is missing.');
                }
                logger.debug('Token found.');

                const jwtSecret = configService.get<string>('JWT_SECRET');
                if (!jwtSecret) {
                    logger.error('JWT_SECRET is not configured!');
                    throw new Error('JWT_SECRET is not configured!');
                }
                logger.debug('JWT_SECRET loaded.');

                const payload = jwtService.verify(token, { secret: jwtSecret });
                logger.debug(`Token payload verified: ${JSON.stringify(payload)}`);

                const user = await prisma.user.findUnique({
                  where: { id: payload.sub },
                });

                if (!user) {
                  logger.warn(`User not found for payload sub: ${payload.sub}`);
                  throw new UnauthorizedException('User not found.');
                }
                logger.log(`Successfully authenticated user: ${user.email}`);

                return { user };
              } catch (error) {
                logger.error(`Authentication failed in onConnect: ${error.message}`, error.stack);
                // Re-throwing a generic error to the client
                throw new UnauthorizedException('Authentication failed');
              }
            },
          },
        },
        context: ({ req, res, connection }) => {
          if (connection) {
            // For WS, the user is already on the context from onConnect.
            // We just pass it along.
            return { ...connection.context, req, res };
          }
          // For HTTP, we rely on the standard request flow.
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
    // { // Temporarily disabled for debugging 'Forbidden resource'
    //   provide: APP_GUARD,
    //   useClass: UpdateLastActiveGuard,
    // },
  ],
    exports: [Logger], // Export Logger to make it available to other modules
})
export class AppModule {}

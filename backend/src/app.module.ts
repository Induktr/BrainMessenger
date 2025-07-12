import { Module, forwardRef, Logger, UnauthorizedException } from '@nestjs/common';
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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebrtcSignalingGateway } from './webrtc-signaling';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { FileModule } from './file/file.module';
import { CloudflareModule } from './cloudflare/cloudflare.module';
import { APP_GUARD } from '@nestjs/core';
import { UpdateLastActiveGuard } from './common/guards/update-last-active.guard';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { PubSubModule } from './pubsub/pubsub.module';
import { LinkPreviewModule } from './link-preview/link-preview.module';
import { FeedbackComplaintModule } from './feedback-complaint/feedback-complaint.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule.register({
      global: true,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [AuthModule, ConfigModule, PrismaModule],
      inject: [JwtService, ConfigService, PrismaService],
      useFactory: (
        jwtService: JwtService,
        configService: ConfigService,
        prisma: PrismaService,
      ) => ({
        autoSchemaFile: 'dist/schema.gql',
        subscriptions: {
          'graphql-ws': {
            path: '/graphql',
            onConnect: async (context: any) => {
              const logger = new Logger('GraphQLWS onConnect');
              logger.debug('[GraphQLWS onConnect] Attempting to connect...');
              try {
                const connectionParams = context.connectionParams || {};
                logger.debug(`[GraphQLWS onConnect] Connection params: ${JSON.stringify(connectionParams)}`);
                const token = (connectionParams?.Authorization || connectionParams?.authorization)?.split(' ')[1];

                if (!token) {
                  logger.warn('[GraphQLWS onConnect] Authentication token is missing.');
                  throw new UnauthorizedException('Authentication token is missing.');
                }
                logger.debug(`[GraphQLWS onConnect] Token received (first 10 chars): ${token.substring(0, 10)}...`);

                const jwtSecret = configService.get<string>('JWT_SECRET');
                let payload: any;
                try {
                  payload = jwtService.verify(token, { secret: jwtSecret });
                  logger.debug(`[GraphQLWS onConnect] JWT Payload: ${JSON.stringify(payload)}`);
                } catch (jwtError) {
                  logger.error(`[GraphQLWS onConnect] JWT verification failed: ${jwtError.message}`);
                  throw new UnauthorizedException('Invalid authentication token.');
                }
                
                const user = await prisma.user.findUnique({ where: { id: payload.sub } });

                if (!user) {
                  logger.warn(`[GraphQLWS onConnect] User not found for ID: ${payload.sub}`);
                  throw new UnauthorizedException('User not found.');
                }

                logger.log(`[GraphQLWS onConnect] Successfully authenticated user: ${user.email}`);
                // Attach user and token to context.extra for later access in the context function
                context.extra.user = user;
                context.extra.token = token;
                return { user, token }; // Still return for Apollo's internal context management
              } catch (error) {
                logger.error(`[GraphQLWS onConnect] WebSocket authentication failed: ${error.message}`, error.stack);
                // Re-throw UnauthorizedException to ensure Apollo Server closes the socket with the correct code
                if (error instanceof UnauthorizedException) {
                  throw error;
                }
                throw new UnauthorizedException('Authentication failed during WebSocket connection.');
              }
            },
          },
        },
        context: async ({ req, res, connection }) => {
          const logger = new Logger('GraphQLContext');
          let user: any = undefined;
          let token: string | undefined;
          let newReq: any = req; // Start with the original req object for HTTP requests

          // Ensure req.headers exists at the very beginning for the original req object
          if (!newReq.headers) {
            newReq.headers = {};
            logger.warn('[GraphQLContext] Initial req.headers was undefined, initialized to empty object.');
          }

          if (connection) {
            // For WebSocket subscriptions, the `onConnect` hook has already authenticated
            // and stored user/token in `connection.context`.
            const wsContext = connection.context;
            token = wsContext?.token;
            user = wsContext?.user; // User object from onConnect

            logger.debug(`[GraphQLContext] WebSocket connection. User from onConnect: ${user?.id}, Token present: ${!!token}`);

            // Create a synthetic req object for WebSocket to mimic HTTP request structure
            // Ensure headers object is always present
            newReq = {
              user: user, // Attach the user directly
              headers: {
                authorization: token ? `Bearer ${token}` : undefined,
              },
            };
            logger.debug('[GraphQLContext] Created synthetic req for WebSocket with headers.');

          } else {
            // For standard HTTP requests, newReq is the original req object.
            // Ensure headers object is always present for HTTP requests as well.
            if (!newReq.headers) {
              newReq.headers = {};
              logger.warn('[GraphQLContext] HTTP request: req.headers was undefined, initialized to empty object.');
            }

            // Try to get token from headers for HTTP requests
            if (newReq.headers.authorization || newReq.headers.Authorization) { // Now safe to access newReq.headers.authorization
              token = newReq.headers.authorization.split(' ')[1] || newReq.headers.Authorization.split(' ')[1];
              logger.debug(`[GraphQLContext] HTTP request. Token from headers: ${token ? token.substring(0, 10) + '...' : 'None'}`);
            } else {
              logger.warn('[GraphQLContext] HTTP request: No authorization header found.');
            }

            // If user is not already populated by a global guard/middleware for HTTP,
            // attempt to authenticate manually from headers.
            if (!newReq.user && token) {
              try {
                const jwtSecret = configService.get<string>('JWT_SECRET');
                const payload = jwtService.verify(token, { secret: jwtSecret });
                user = await prisma.user.findUnique({ where: { id: payload.sub } });
                if (user) {
                  newReq.user = user; // Manually attach user to req object
                  logger.debug(`[GraphQLContext] HTTP request: Manually authenticated user: ${user.email}`);
                } else {
                  logger.warn('[GraphQLContext] HTTP request: User not found after token verification.');
                }
              } catch (error) {
                logger.warn(`[GraphQLContext] HTTP request: Token verification failed: ${error.message}`);
              }
            } else if (newReq.user) {
              // If req.user is already populated (e.g., by a global guard), use it.
              user = newReq.user;
              logger.debug(`[GraphQLContext] HTTP request: User already populated by guard: ${user.email}`);
            }
          }

          // Ensure the final req object has a user property
          if (!newReq.user && user) {
            newReq.user = user;
          } else if (!newReq.user && !user) {
            logger.warn('[GraphQLContext] Final newReq.user is still undefined.');
          }

          return { req: newReq, res };
        },
        formatError: (error: GraphQLError) => {
          const logger = new Logger('GraphQLFormatError');
          const originalError = error.extensions?.originalError as any;

          if (originalError instanceof UnauthorizedException) {
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

          logger.error(`Unhandled error: ${error.message}`);
          return error;
        },
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        return {
          store: redisStore,
          url: redisUrl,
          ttl: configService.get<number>('CACHE_TTL') || 300,
        };
      },
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    forwardRef(() => ChatModule),
    MessageModule,
    MailModule,
    FileModule,
    CloudflareModule,
    PubSubModule,
    LinkPreviewModule,
    FeedbackComplaintModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WebrtcSignalingGateway,
    Logger,
    {
      provide: APP_GUARD,
      useClass: UpdateLastActiveGuard,
    },
  ],
  exports: [Logger],
})
export class AppModule {}

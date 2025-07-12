import { Module, UnauthorizedException } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { UserService } from '../user/user.service'; // Import UserService
import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService
import { User } from '@prisma/client'; // Import Prisma User type

@Module({
  imports: [
    HttpModule.register({
      global: true,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [], // No imports needed here, dependencies are provided via inject
      inject: [JwtService, ConfigService, UserService, PrismaService], // Inject services
      useFactory: (jwtService: JwtService, configService: ConfigService, userService: UserService, prismaService: PrismaService) => ({
        autoSchemaFile: 'schema.gql',
        subscriptions: {
          'graphql-ws': {
            onConnect: async (context: any) => {
              const { connectionParams, extra } = context;
              if (connectionParams.Authorization) {
                const token = connectionParams.Authorization.split(' ')[1];
                try {
                  const secret = configService.get<string>('JWT_SECRET');
                  if (!secret) {
                    throw new Error('JWT_SECRET is not defined in configuration.');
                  }
                  const payload = jwtService.verify(token, { secret });
                  const user = await userService.findOne(payload.userId);
                  if (!user) {
                    throw new UnauthorizedException('User not found.');
                  }
                  (extra as any).user = user;
                  return true;
                } catch (error) {
                  console.error('WebSocket authentication error:', error.message);
                  throw new UnauthorizedException('Invalid token or authentication failed.');
                }
              }
              throw new UnauthorizedException('Authorization token not provided.');
            },
            onDisconnect: (context: any) => {
              console.log('WebSocket disconnected:', context.reason);
            },
          },
        },
        context: async ({ req, connection }) => {
          if (connection) {
            // For subscriptions, the user is already attached in onConnect
            return { ...connection.context };
          }
          if (req) {
            // For queries/mutations, extract user from JWT
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
              const token = authHeader.split(' ')[1];
              try {
                const secret = configService.get<string>('JWT_SECRET');
                if (!secret) {
                  throw new Error('JWT_SECRET is not defined in configuration.');
                }
                const payload = jwtService.verify(token, { secret });
                const user = await userService.findOne(payload.userId);
                if (user) {
                  return { req, user };
                }
              } catch (error) {
                console.error('HTTP authentication error:', error.message);
              }
            }
            return { req };
          }
          return {};
        },
      }),
    }),
  ],
  providers: [JwtService, ConfigService, UserService, PrismaService], // Keep providers here
  exports: [GraphQLModule],
})
export class GraphQLConfigModule {}
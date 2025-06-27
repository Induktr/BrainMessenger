import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

// Create a module-level logger instance. This resolves the issue of `this` being unavailable in the constructor before `super()` is called.
const logger = new Logger('JwtStrategy');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // Declare properties at the class level
  private readonly prisma: PrismaService;
  private readonly configService: ConfigService;

  constructor(
    // Inject services without using 'private' or 'public' modifiers
    prisma: PrismaService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      logger.error('Fatal Error: JWT_SECRET environment variable is not set.');
      throw new Error('Fatal Error: JWT_SECRET environment variable is not set.');
    }

    // Call super() first, before any 'this' access
    super({
      jwtFromRequest: (req: any) => {
        logger.log('[JwtStrategy] Attempting to extract JWT token...');

        // Scenario 1: WebSocket connection
        if (req?.context?.token) {
          logger.log('[JwtStrategy] Success: Token found in WebSocket connection context.');
          return req.context.token;
        }

        // Scenario 2: Standard HTTP request with 'Authorization: Bearer <token>' header
        if (req?.headers?.authorization) {
          logger.log('[JwtStrategy] Authorization header found. Attempting to extract Bearer token.');
          try {
            const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
            if (token) {
              logger.log('[JwtStrategy] Success: Token extracted from Authorization header.');
              return token;
            }
            logger.warn('[JwtStrategy] Authorization header was present but was not a valid Bearer token.');
          } catch (error) {
            logger.warn(`[JwtStrategy] Error while extracting from Authorization header: ${error.message}`);
          }
        }

        // --- Failure Case ---
        logger.warn('[JwtStrategy] FAILURE: Could not extract JWT token from any known source.');
        if (req) {
          const requestInfo = {
            headers: req.headers,
            body: req.body,
            query: req.query,
            params: req.params,
            operationName: req.body?.operationName,
          };
          logger.debug(`[JwtStrategy] Details of failed request: ${JSON.stringify(requestInfo, null, 2)}`);
        } else {
          logger.error('[JwtStrategy] Critical Failure: The request object passed to jwtFromRequest was null or undefined.');
        }

        return null; // Explicitly return null if no token is found
      },
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    // Now it is safe to assign properties to 'this'
    this.prisma = prisma;
    this.configService = configService;
  }

  async validate(payload: any): Promise<any> {
    logger.log(`[JwtStrategy] Validating token payload: ${JSON.stringify(payload)}`);
    
    if (!payload || !payload.sub) {
      logger.error('[JwtStrategy] Validation failed: Invalid token payload, "sub" (subject) is missing.');
      throw new UnauthorizedException('Invalid token payload.');
    }

    const userId = payload.sub;
    logger.debug(`[JwtStrategy] Searching for user with ID: "${userId}"`);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn(
        `[JwtStrategy] Validation failed: User with ID '${payload.sub}' from token not found in database.`,
      );
      throw new UnauthorizedException(
        'Authentication failed: Invalid token or user not found.',
      );
    }

    logger.log(`[JwtStrategy] Validation successful for user: ${user.email} (ID: ${user.id})`);

    // Return a secure user object, excluding sensitive data like the password or refresh token.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...result } = user;
    return result;
  }
}

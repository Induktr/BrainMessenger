import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

const logger = new Logger('JwtStrategy');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      logger.error('Fatal Error: JWT_SECRET is not set.');
      throw new Error('Fatal Error: JWT_SECRET is not set.');
    }

    super({
      secretOrKey: secret,
      ignoreExpiration: false,
      jwtFromRequest: (req) => {
        // WsJwtAuthGuard ensures that for WebSocket connections,
        // the req object will have a headers.authorization property.
        // For HTTP requests, it's the standard req.headers.authorization.
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (token) {
          logger.debug('[JwtStrategy] Token extracted from Authorization header.');
        } else {
          logger.warn('[JwtStrategy] No token found by custom extractor.');
        }
        return token;
      },
    });
  }

  async validate(payload: any): Promise<any> {
    logger.log(`[JwtStrategy] Validating token payload for user ID: ${payload.sub}`);
    
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    logger.log(`[JwtStrategy] Validation successful for user: ${user.email}`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...result } = user;
    return result;
  }
}

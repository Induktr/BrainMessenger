import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('Fatal Error: JWT_SECRET environment variable is not set.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // Use the validated secret
    });
  }

  async validate(payload: any) {
    console.log('[JwtStrategy] Validating token with payload:', payload); // Added logging
    // Payload содержит то, что мы передали при создании токена (sub: userId, email)
    if (!payload || !payload.sub) {
        console.error('[JwtStrategy] Invalid token payload: Missing subject (sub).', payload); // Added logging
        throw new UnauthorizedException('Invalid token payload: Missing subject (sub).');
    }
    const userId = payload.sub;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    console.log('[JwtStrategy] User lookup result for userId', userId, ':', user ? 'Found' : 'Not Found'); // Added logging

    if (!user) {
      // Если пользователь с таким ID не найден в базе, токен недействителен
      throw new UnauthorizedException('User associated with token not found.');
    }

    // Можно добавить проверку, активен ли пользователь, если есть такое поле
    // if (!user.isActive) {
    //   throw new UnauthorizedException('User account is inactive.');
    // }

    // Возвращаем объект, который будет записан в request.user
    // Убедимся, что он содержит поля, ожидаемые в резолверах (id, name, email, isVerified)
    // Не возвращаем пароль или другие чувствительные данные!
    // Return the user object that will be attached to request.user
    // Include all non-sensitive fields needed in resolvers or guards
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username, // Include username field
      isVerified: user.isVerified,
      avatarUrl: user.avatarUrl,
      bio: user.bio, // Include bio field
      twoFactorEnabled: user.twoFactorEnabled, // Include other relevant fields
      twoFactorMethod: user.twoFactorMethod,
      recoveryEmail: user.recoveryEmail,
      roles: user.roles, // Include roles from Prisma
      // Add other non-sensitive fields as needed
    };
  }
}

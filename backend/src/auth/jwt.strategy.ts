import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common'; // Import UnauthorizedException
import { jwtConstants } from './constants';
import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) { // Inject PrismaService
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Keep checking expiration
      secretOrKey: jwtConstants.secret, // Ensure this uses the env variable via constants.ts
    });
  }

  async validate(payload: any) {
    // Payload содержит то, что мы передали при создании токена (sub: userId, email)
    if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload: Missing subject (sub).');
    }
    const userId = payload.sub;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Если пользователь с таким ID не найден в базе, токен недействителен
      throw new UnauthorizedException('User associated with token not found.');
    }

    // Можно добавить проверку, активен ли пользователь, если есть такое поле
    // if (!user.isActive) {
    //   throw new UnauthorizedException('User account is inactive.');
    // }

    // Возвращаем объект, который будет записан в request.user
    // Убедимся, что он содержит поля, ожидаемые в резолверах (userId, email)
    // Не возвращаем пароль или другие чувствительные данные!
    return { userId: user.id, email: user.email /*, возможно, name: user.name, если нужно */ };
  }
}

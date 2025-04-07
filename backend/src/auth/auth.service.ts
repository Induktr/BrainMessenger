import { UserService } from '../user/user.service';
import { Injectable, UnauthorizedException, NotImplementedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService
  ) {}
  
  private readonly logger = new Logger(AuthService.name);

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      // Находим пользователя по email
      const user = await this.prisma.user.findUnique({ where: { email } });
      
      // Если пользователь не найден или пароль не совпадает, возвращаем null
      if (!user || !(await bcrypt.compare(pass, user.password))) {
        return null;
      }
      
      // Исключаем пароль из результата
      const { password, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(email: string, password: string, name: string): Promise<any> {
    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        // Используем стандартную ошибку NestJS для конфликта
        throw new ConflictException('Пользователь с таким email уже существует');
      }

      // Хешируем пароль
      const saltRounds = 10; // Рекомендуемое количество раундов солирования
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Создаем нового пользователя с emailVerified = false
      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          emailVerified: false, // Пользователь не подтвержден до ввода кода
        },
      });

      // Генерируем код подтверждения
      const code = this.generateConfirmationCode();
      
      // Отправляем код на email пользователя
      await this.mailService.sendVerificationCode(email, code, newUser.id);

      // Возвращаем пользователя без пароля
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = newUser;
      return result;
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`, error.stack);
      throw error;
    }
  }

  generateConfirmationCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  async verifyConfirmationCode(email: string, code: string): Promise<any> {
    try {
      // Находим пользователя по email
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      // Находим последний действующий код подтверждения для этого пользователя
      const verificationCode = await this.prisma.verificationCode.findFirst({
        where: {
          userId: user.id,
          type: 'EMAIL_VERIFICATION',
          expiresAt: { gt: new Date() }, // Код еще не истек
        },
        orderBy: { createdAt: 'desc' },
      });

      // Если код не найден или истек срок его действия
      if (!verificationCode) {
        throw new UnauthorizedException('Код подтверждения не найден или истек срок его действия');
      }

      // Проверяем совпадение кода
      if (verificationCode.code !== code) {
        // Увеличиваем счетчик попыток
        await this.prisma.verificationCode.update({
          where: { id: verificationCode.id },
          data: { attempts: { increment: 1 } },
        });

        // Если превышено максимальное количество попыток (например, 5)
        if (verificationCode.attempts >= 4) { // 5 попыток включая текущую
          // Удаляем код и требуем запросить новый
          await this.prisma.verificationCode.delete({
            where: { id: verificationCode.id },
          });
          throw new UnauthorizedException('Превышено количество попыток. Запросите новый код.');
        }

        throw new UnauthorizedException('Неверный код подтверждения');
      }

      // Код верный, отмечаем email как подтвержденный
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });

      // Удаляем использованный код
      await this.prisma.verificationCode.delete({
        where: { id: verificationCode.id },
      });

      // Создаем JWT токен для пользователя
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);

      // Возвращаем токен и информацию о пользователе
      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: true
        }
      };
    } catch (error) {
      this.logger.error(`Error verifying confirmation code: ${error.message}`, error.stack);
      throw error;
    }
  }
}

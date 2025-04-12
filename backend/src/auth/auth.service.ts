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

      // Генерируем код подтверждения
      const code = this.generateConfirmationCode();
      // Устанавливаем срок действия кода (например, 10 минут)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Создаем нового пользователя с кодом, сроком действия и emailVerified = false
      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          isVerified: false, // Используем isVerified согласно схеме
          verificationCode: code,
          verificationCodeExpiresAt: expiresAt,
        },
      });

      // Отправляем код на email пользователя, используя правильный метод MailService
      // Запускаем отправку асинхронно, не блокируя ответ регистрации
      // Отправляем код на email пользователя, используя правильный метод MailService
      // Запускаем отправку асинхронно, не блокируя ответ регистрации
      this.mailService.sendVerificationEmail(email, code).catch(err => {
          // Логируем ошибку отправки, но не прерываем регистрацию
          this.logger.error(`Failed to send verification email to ${email}: ${err.message}`, err.stack);
          // Здесь можно добавить логику для повторной отправки или уведомления администратора
      });

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
    this.logger.log(`AuthService: Starting verifyConfirmationCode for email: ${email}`); // <-- Log start
    try {
      // Находим пользователя по email
      this.logger.log(`AuthService: Finding user by email: ${email}`); // <-- Log find user
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        this.logger.warn(`AuthService: User not found for email: ${email}`); // <-- Log user not found
        throw new UnauthorizedException('Пользователь не найден');
      }
      this.logger.log(`AuthService: User found: ${user.id}`); // <-- Log user found

      // Проверяем, есть ли у пользователя код и не истек ли он
      this.logger.log(`AuthService: Checking verification code existence and expiration for user: ${user.id}`); // <-- Log check code/expiry
      if (!user.verificationCode || !user.verificationCodeExpiresAt) {
          this.logger.warn(`AuthService: Verification code or expiry not found for user: ${user.id}`); // <-- Log code/expiry not found
          throw new UnauthorizedException('Код подтверждения не найден для этого пользователя.');
      }
      this.logger.log(`AuthService: Code exists, checking expiry time: ${user.verificationCodeExpiresAt}`); // <-- Log expiry check

      if (user.verificationCodeExpiresAt < new Date()) {
          this.logger.warn(`AuthService: Verification code expired for user: ${user.id}. Expiry: ${user.verificationCodeExpiresAt}`); // <-- Log expired
          // Очищаем истекший код, чтобы пользователь запросил новый
          await this.prisma.user.update({
              where: { id: user.id },
              data: { verificationCode: null, verificationCodeExpiresAt: null },
          });
          throw new UnauthorizedException('Срок действия кода подтверждения истек. Запросите новый код.');
      }
      this.logger.log(`AuthService: Code not expired for user: ${user.id}`); // <-- Log not expired

      // Проверяем совпадение кода
      this.logger.log(`AuthService: Comparing provided code "${code}" with stored code "${user.verificationCode}" for user: ${user.id}`); // <-- Log code comparison
      if (user.verificationCode !== code) {
          this.logger.warn(`AuthService: Invalid verification code provided for user: ${user.id}. Expected: ${user.verificationCode}, Got: ${code}`); // <-- Log invalid code
          // Здесь можно добавить логику ограничения попыток, если нужно,
          // например, сохраняя счетчик попыток в самой модели User или используя Redis.
          // Пока просто возвращаем ошибку.
          throw new UnauthorizedException('Неверный код подтверждения.');
      }
      this.logger.log(`AuthService: Code matched for user: ${user.id}`); // <-- Log code matched

      // Код верный, отмечаем email как подтвержденный и очищаем код/срок
      this.logger.log(`AuthService: Updating user ${user.id} to verified and clearing code.`); // <-- Log updating user
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationCode: null, // Очищаем код после успешной верификации
          verificationCodeExpiresAt: null, // Очищаем срок действия
         },
      });
      this.logger.log(`AuthService: User ${user.id} updated successfully.`); // <-- Log update success

      // Логика удаления отдельной записи кода больше не нужна

      // Создаем JWT токен для пользователя
      this.logger.log(`AuthService: Generating JWT for user: ${user.id}`); // <-- Log generating token
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);
      this.logger.log(`AuthService: JWT generated for user: ${user.id}`); // <-- Log token generated

      // Возвращаем токен и информацию о пользователе
      // Ensure the returned user object matches the structure expected by UserDto
      // We assume UserDto includes id, email, name, isVerified.
      // It's safer to return the whole updatedUser object (excluding password)
      // if UserDto is designed to map directly to the Prisma User model fields.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, verificationCode: __, verificationCodeExpiresAt: ___, ...userResult } = updatedUser;

      this.logger.log(`AuthService: Verification successful for email: ${email}. Returning token and user data.`); // <-- Log final success
      return {
        access_token: token,
        user: userResult // Return the Prisma user object (minus sensitive fields)
      };
    } catch (error) {
      // Логируем ошибку перед тем, как ее перебросить
      this.logger.error(`AuthService: Error during verifyConfirmationCode for email ${email}: ${error.message}`, error.stack); // <-- Log caught error
      throw error; // Перебрасываем ошибку, чтобы NestJS мог ее обработать (например, преобразовать в HttpException)
    }
  }
}

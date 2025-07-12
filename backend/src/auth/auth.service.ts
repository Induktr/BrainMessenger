import { UserService } from '../user/user.service';
import { Injectable, UnauthorizedException, NotImplementedException, ConflictException, Logger, Inject, forwardRef } from '@nestjs/common'; // Import Inject and forwardRef
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { addHours } from 'date-fns';
 
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
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

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async login(user: any): Promise<{ access_token: string; refresh_token: string; user: any }> {
    this.logger.log(`AuthService: Starting login for user: ${user?.id || 'null'}`); // Log start of login
    this.logger.debug(`AuthService: User object received in login: ${JSON.stringify(user)}`); // Log user object

    // Add a check for null user
    if (!user) {
      this.logger.warn('AuthService: Login called with null user.'); // Log warning for null user
      throw new UnauthorizedException('Invalid credentials provided to login method.'); // Should not happen if validateUser is checked in resolver
    }

    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    // Generate a refresh token
    const refresh_token = crypto.randomBytes(32).toString('hex');
    const refreshTokenExpiresAt = addHours(new Date(), 30 * 24); // Refresh token valid for 30 days
 
    const updateData = { // Define update data
      refreshToken: refresh_token,
      refreshTokenExpiresAt: refreshTokenExpiresAt,
    };
    this.logger.debug(`AuthService: Updating user ${user.id} with refresh token data: ${JSON.stringify(updateData)}`); // Log update data

    // Save the refresh token and its expiration to the user in the database
    await this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
    this.logger.log(`AuthService: Refresh token saved for user: ${user.id}`); // Log refresh token saved

    return {
      access_token,
      refresh_token,
      user: user, // Return the user object (ensure sensitive fields are excluded elsewhere if needed)
    };
  }
 
  async register(email: string, password: string, name: string, username?: string): Promise<any> {
    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        // Используем стандартную ошибку NestJS для конфликта
        throw new ConflictException('A user with this email already exists.');
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
      const finalUsername = username === '' ? null : username;
      this.logger.debug(`AuthService: Attempting to create user with username: ${finalUsername}`); // Added log
      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          username: finalUsername, // Use the determined finalUsername
          isVerified: false, // Используем isVerified согласно схеме
          role: 'USER', // Assign default 'user' role
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
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()';
    let code = '';
    const codeLength = 8; // 8-digit code

    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }

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
        throw new UnauthorizedException('User not found');
      }
      this.logger.log(`AuthService: User found: ${user.id}`); // <-- Log user found

      // Log the state of the verification code and its expiration
      this.logger.debug(`AuthService: User ${user.id} verificationCode: ${user.verificationCode}, verificationCodeExpiresAt: ${user.verificationCodeExpiresAt}`);

      // Log the state of the verification code and its expiration
      this.logger.debug(`AuthService: User ${user.id} verificationCode: ${user.verificationCode}, verificationCodeExpiresAt: ${user.verificationCodeExpiresAt}`);

      // Проверяем, есть ли у пользователя код и не истек ли он
      this.logger.log(`AuthService: Checking verification code existence and expiration for user: ${user.id}`); // <-- Log check code/expiry
      if (!user.verificationCode || !user.verificationCodeExpiresAt) {
          this.logger.warn(`AuthService: Verification code or expiry not found for user: ${user.id}`); // <-- Log code/expiry not found
          throw new UnauthorizedException('Confirmation code not found for this user.');
      }
      this.logger.log(`AuthService: Code exists, checking expiry time: ${user.verificationCodeExpiresAt}`); // <-- Log expiry check

      if (user.verificationCodeExpiresAt < new Date()) {
          this.logger.warn(`AuthService: Verification code expired for user: ${user.id}. Expiry: ${user.verificationCodeExpiresAt}`); // <-- Log expired
          // Очищаем истекший код, чтобы пользователь запросил новый
          await this.prisma.user.update({
              where: { id: user.id },
              data: { verificationCode: null, verificationCodeExpiresAt: null },
          });
          throw new UnauthorizedException('The confirmation code has expired. Request a new code.');
      }
      this.logger.log(`AuthService: Code not expired for user: ${user.id}`); // <-- Log not expired

      // Log the codes being compared
      this.logger.debug(`AuthService: Comparing provided code "${code}" with stored code "${user.verificationCode}" for user: ${user.id}`); // <-- Log code comparison

      // Check if user has exceeded max attempts (5)
      if (user.verificationAttempts >= 5 && user.lastVerificationAttempt) {
          const nextAttemptTime = new Date(user.lastVerificationAttempt);
          nextAttemptTime.setMinutes(nextAttemptTime.getMinutes() + 15);
          
          if (new Date() < nextAttemptTime) {
              throw new UnauthorizedException('Maximum attempt limit exceeded. Please try again in 15 minutes.');
          } else {
              // Reset attempts if cooldown period has passed
              await this.prisma.user.update({
                  where: { id: user.id },
                  data: { verificationAttempts: 0 }
              });
          }
      }

      // Normalize codes (trim and case insensitive)
      const normalizedStoredCode = user.verificationCode?.trim().toUpperCase();
      const normalizedInputCode = code.trim().toUpperCase();
      
      this.logger.debug(`AuthService: Comparing codes - stored normalized: "${normalizedStoredCode}", input normalized: "${normalizedInputCode}"`); // Added quotes for clarity
      this.logger.debug(`AuthService: Comparing codes - stored original: "${user.verificationCode}", input original: "${code}"`); // Log original codes

      if (normalizedStoredCode !== normalizedInputCode) {
          this.logger.warn(`AuthService: Invalid verification code attempt for email: ${email}`); // Added log
          this.logger.debug(`AuthService: Provided code: "${code}", Stored code: "${user.verificationCode}"`); // Added log
          this.logger.debug(`AuthService: Current attempts: ${user.verificationAttempts}`); // Added log

          // Add small delay to prevent brute force
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Increment attempt count and update last attempt time
          const updatedUserAfterAttempt = await this.prisma.user.update({ // Modified to capture updated user
              where: { id: user.id },
              data: {
                  verificationAttempts: { increment: 1 },
                  lastVerificationAttempt: new Date()
              },
              select: { verificationAttempts: true } // Select only the updated attempts
          });

          const attemptsLeft = 5 - (user.verificationAttempts + 1);
          throw new UnauthorizedException(
              `Incorrect verification code. Attempts remaining: ${attemptsLeft}`
          );
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

      // Код верный, отмечаем email как подтвержденный и очищаем код/срок
      this.logger.log(`AuthService: Updating user ${user.id} to verified and clearing code.`); // <-- Log updating user
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationCode: null, // Очищаем код после успешной верификации
          verificationCodeExpiresAt: null, // Очищаем срок действия
         },
      });
      this.logger.log(`AuthService: User ${user.id} updated successfully.`); // <-- Log update success

      // Логика удаления отдельной записи кода больше не нужна

      this.logger.log(`AuthService: Verification successful for email: ${email}.`); // <-- Log final success
      return true; // Return true on successful verification
    } catch (error) {
      // Логируем ошибку перед тем, как ее перебросить
      this.logger.error(`AuthService: Error during verifyConfirmationCode for email ${email}: ${error.message}`, error.stack); // <-- Log caught error
      throw error; // Перебрасываем ошибку, чтобы NestJS мог ее обработать (например, преобразовать в HttpException)
    }
  }
 
  async refreshTokens(refreshToken: string): Promise<{ access_token: string; refresh_token: string; user: any }> {
    this.logger.log(`AuthService: refreshTokens method called.`); // Added log to indicate method call
    this.logger.log(`AuthService: Starting refreshTokens with token: ${refreshToken ? 'Present' : 'Missing'}`); // Log start and token presence
    this.logger.debug(`AuthService: Received refresh token (first 10 chars): ${refreshToken ? refreshToken.substring(0, 10) + '...' : 'null'}`); // Log partial token
    this.logger.debug(`AuthService: Received refresh token (full): ${refreshToken}`); // Add log for full token

    try {
      // Find the user by the refresh token
      this.logger.log(`AuthService: Searching for user with refresh token.`); // Log search start
      this.logger.debug(`AuthService: Searching for token: ${refreshToken ? refreshToken.substring(0, 10) + '...' : 'null'}`); // Log token used in search
      const user = await this.prisma.user.findFirst({
        where: {
          refreshToken: refreshToken,
          refreshTokenExpiresAt: {
            gt: new Date(), // Check if the refresh token has not expired
          },
        },
      });
      this.logger.debug(`AuthService: User search result: ${user ? 'Found user ' + user.id : 'User not found'}`); // Log search result
      if (user) {
          this.logger.debug(`AuthService: Found user ${user.id}, refresh token expires at: ${user.refreshTokenExpiresAt?.toISOString()}`); // Log expiry if user found
      }


      if (!user) {
        this.logger.warn('AuthService: Invalid or expired refresh token provided.'); // Log warning
        throw new UnauthorizedException('Invalid or expired refresh token.');
      }
      this.logger.log(`AuthService: User ${user.id} found for token refresh.`); // Log user found

      this.logger.log(`AuthService: Generating new tokens for user ${user.id}.`); // Log token generation start
      // Generate a new access token
      const payload = { email: user.email, sub: user.id };
      const access_token = this.jwtService.sign(payload);
      this.logger.log(`AuthService: New access token generated for user ${user.id}.`); // Log new access token

      // Generate a new refresh token
      const new_refresh_token = crypto.randomBytes(32).toString('hex');
      const newRefreshTokenExpiresAt = addHours(new Date(), 30 * 24); // New refresh token valid for 30 days
      this.logger.log(`AuthService: New refresh token generated for user ${user.id}.`); // Log new refresh token
      this.logger.debug(`AuthService: New refresh token expires at: ${newRefreshTokenExpiresAt.toISOString()}`); // Log new expiry

      this.logger.log(`AuthService: Updating user ${user.id} with new refresh token.`); // Log update start
      // Update the user's refresh token and its expiration in the database
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: new_refresh_token,
          refreshTokenExpiresAt: newRefreshTokenExpiresAt,
        },
      });
      this.logger.log(`AuthService: User ${user.id} updated with new refresh token.`); // Log update success
      this.logger.debug(`AuthService: New refresh token saved (first 10 chars): ${new_refresh_token.substring(0, 10) + '...'}`); // Log partial new token


      // Exclude sensitive fields from the user object before returning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, refreshToken: _, refreshTokenExpiresAt: __, verificationCode, verificationCodeExpiresAt, verificationAttempts, lastVerificationAttempt, ...userResult } = user;

      this.logger.log(`AuthService: Token refresh successful for user ${user.id}. Returning new tokens and user data.`); // Log success
      return {
        access_token,
        refresh_token: new_refresh_token,
        user: userResult,
      };
    } catch (error) {
      this.logger.error(`AuthService: Error refreshing tokens: ${error.message}`, error.stack);
      // If it's already an UnauthorizedException, re-throw it. Otherwise, throw a generic one.
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Log the specific error type if it's not UnauthorizedException
      this.logger.error(`AuthService: Unexpected error type during token refresh: ${error.constructor.name}`);
      throw new UnauthorizedException('Failed to refresh tokens.');
    }
  }
}

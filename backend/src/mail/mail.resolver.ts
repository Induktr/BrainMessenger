import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { MailService } from './mail.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from '../user/user.service';

@Resolver()
export class MailResolver {
  constructor(
    private readonly mailService: MailService,
    private readonly userService: UserService
  ) {}

  @Mutation(() => Boolean)
  async sendVerificationCode(@Args('email') email: string): Promise<boolean> {
    try {
      // Проверяем, существует ли пользователь с таким email
      const user = await this.userService.findOneByEmail(email);
      if (!user) {
        throw new Error('Пользователь с таким email не найден');
      }
      
      // Генерируем код подтверждения (6 цифр)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Отправляем код на email
      await this.mailService.sendVerificationCode(email, code, user.id);
      return true;
    } catch (error) {
      console.error('Error sending verification code:', error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async enableTwoFactorAuth(@Args('userId', { type: () => Int }) userId: number): Promise<boolean> {
    // Implement two-factor authentication enabling logic here
    return true;
  }

  @Mutation(() => Boolean)
  async disableTwoFactorAuth(@Args('userId', { type: () => Int }) userId: number): Promise<boolean> {
    // Implement two-factor authentication disabling logic here
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async sendTwoFactorCode(@Args('userId') userId: string): Promise<boolean> {
    try {
      // Получаем пользователя по ID
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }
      
      // Генерируем код двухфакторной аутентификации (6 цифр)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Отправляем код на email пользователя
      await this.mailService.sendTwoFactorCode(user.email, code, userId);
      return true;
    } catch (error) {
      console.error('Error sending two-factor code:', error);
      return false;
    }
  }
}

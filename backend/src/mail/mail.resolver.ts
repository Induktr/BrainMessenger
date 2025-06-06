// backend/src/mail/mail.resolver.ts
    import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
    import { MailService } from './mail.service';
    import { UseGuards } from '@nestjs/common';
    // import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Removed incorrect import
    import { AuthGuard } from '@nestjs/passport'; // Added correct guard import
    import { UserService } from '../user/user.service';

    @Resolver()
    export class MailResolver {
      constructor(
        private readonly mailService: MailService,
        private readonly userService: UserService
      ) {}

      // Removed redundant sendVerificationCode mutation.
      // This logic is handled in AuthResolver/AuthService.

      @Mutation(() => Boolean)
      async enableTwoFactorAuth(@Args('userId', { type: () => Int }) userId: number): Promise<boolean> {
        // Implement two-factor authentication enabling logic here
        // This is a placeholder
        console.warn(`enableTwoFactorAuth called for user ${userId}, but is not implemented.`);
        return true;
      }

      @Mutation(() => Boolean)
      async disableTwoFactorAuth(@Args('userId', { type: () => Int }) userId: number): Promise<boolean> {
        // Implement two-factor authentication disabling logic here
        // This is a placeholder
        console.warn(`disableTwoFactorAuth called for user ${userId}, but is not implemented.`);
        return true;
      }

      // Commented out 2FA mutation as it's not fully implemented and MailService lacks the method.
      // @Mutation(() => Boolean)
      // @UseGuards(AuthGuard('jwt')) // Use correct guard syntax
      // async sendTwoFactorCode(@Args('userId') userId: string): Promise<boolean> {
      //   try {
      //     // Получаем пользователя по ID
      //     const user = await this.userService.findOne(userId);
      //     if (!user) {
      //       throw new Error('Пользователь не найден');
      //     }

      //     // Генерируем код двухфакторной аутентификации (6 цифр)
      //     const code = Math.floor(100000 + Math.random() * 900000).toString();

      //     // Отправляем код на email пользователя
      //     // await this.mailService.sendTwoFactorCode(user.email, code, userId); // Method doesn't exist
      //     console.warn(`sendTwoFactorCode called for user ${userId}, but MailService method is not implemented.`);
      //     // TODO: Implement sendTwoFactorCode in MailService and uncomment
      //     return true; // Placeholder return
      //   } catch (error) {
      //     console.error('Error sending two-factor code:', error);
      //     return false;
      //   }
      // }
    }

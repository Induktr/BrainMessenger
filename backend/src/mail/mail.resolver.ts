import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { MailService } from './mail.service';

@Resolver()
export class MailResolver {
  constructor(private readonly mailService: MailService) {}

  @Mutation(() => Boolean)
  async sendVerificationCode(@Args('email') email: string, @Args('code') code: string): Promise<boolean> {
    try {
      await this.mailService.sendVerificationCode(email, code);
      return true;
    } catch (error) {
      console.error(error);
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
  async sendTwoFactorCode(@Args('userId', { type: () => Int }) userId: number, @Args('code') code: string): Promise<boolean> {
    try {
      // In a real application, you would retrieve the user's email based on the userId
      const email = 'user@example.com'; // Replace with actual email retrieval logic
      await this.mailService.sendTwoFactorCode(email, code);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

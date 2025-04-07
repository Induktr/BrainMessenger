import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginResponse } from './dto/login-response';
import { RegisterInput } from './dto/register-input';
import { LoginInput } from './dto/login-input';
import { MailService } from '../mail/mail.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Mutation(() => LoginResponse)
  async register(
    @Args('registerInput') registerInput: RegisterInput,
  ): Promise<LoginResponse> {
    const { email, password, name } = registerInput;

    const user = await this.authService.register(email, password, name);
    if (!user) {
      throw new Error('Registration failed');
    }

    return this.authService.login(user);
  }

  @Mutation(() => LoginResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<LoginResponse> {
    const { email, password } = loginInput;
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Mutation(() => Boolean)
  async logoutUser(): Promise<boolean> {
    return true;
  }

  @Mutation(() => LoginResponse)
  async verifyEmail(
    @Args('email') email: string,
    @Args('code') code: string,
  ): Promise<LoginResponse> {
    return this.authService.verifyConfirmationCode(email, code);
  }

  @Mutation(() => Boolean)
  async resendVerificationCode(
    @Args('email') email: string,
  ): Promise<boolean> {
    try {
      // Находим пользователя по email
      const user = await this.userService.findOneByEmail(email);
      if (!user) {
        throw new Error('Пользователь с таким email не найден');
      }

      // Генерируем новый код подтверждения
      const code = this.authService.generateConfirmationCode();
      
      // Отправляем код на email
      await this.mailService.sendVerificationCode(email, code, user.id);
      return true;
    } catch (error) {
      console.error('Error resending verification code:', error);
      return false;
    }
  }
}

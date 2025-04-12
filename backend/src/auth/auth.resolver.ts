import { Resolver, Mutation, Args, Context } from '@nestjs/graphql'; // Added Context
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service'; // Added PrismaService
import { UserDto } from '../user/dto/user.dto'; // Added UserDto (removed .ts)
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
    private readonly prisma: PrismaService, // Injected PrismaService
  ) {}

  @Mutation(() => UserDto) // Changed return type to UserDto
  async register(
    @Args('registerInput') registerInput: RegisterInput,
  ): Promise<UserDto> { // Changed return type to UserDto
    const { email, password, name } = registerInput;

    const user = await this.authService.register(email, password, name);
    if (!user) {
      throw new Error('Registration failed');
    }

    // Don't log in immediately, return user info instead
    // The user object returned by authService.register already excludes password
    return user;
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
    // --- Добавлено логирование ---
    console.log(`AuthResolver: verifyEmail called with email: ${email}, code: ${code}`);
    try {
      const result = await this.authService.verifyConfirmationCode(email, code);
      console.log(`AuthResolver: verifyEmail successful for email: ${email}`);
      return result;
    } catch (error) {
      console.error(`AuthResolver: Error calling authService.verifyConfirmationCode for email ${email}:`, error);
      // Перебрасываем ошибку дальше, чтобы NestJS обработал ее стандартно
      throw error;
    }
  }

  @Mutation(() => Boolean)
  async resendVerificationCode(@Args('email') email: string): Promise<boolean> {
    // Find user by email
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // It's often better not to reveal if an email exists for security reasons
      // Log the attempt but return true to the client
      console.warn(`Attempt to resend verification code for non-existent email: ${email}`);
      return true; // Or throw a generic error if preferred
      // throw new Error('User not found.'); // Less secure
    }

    // Check if user is already verified
    if (user.isVerified) {
      console.warn(`Attempt to resend verification code for already verified email: ${email}`);
      // Optionally throw an error or just return true
      // throw new Error('Email is already verified.');
      return true; // Indicate success even if no email is sent
    }

    // Generate new code and expiration
    const code = this.authService.generateConfirmationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute expiration

    try {
      // Update user with new code and expiration time
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          verificationCode: code,
          verificationCodeExpiresAt: expiresAt,
        },
      });

      // Send the new code via email (asynchronously)
      // Send the new code via email (asynchronously)
      this.mailService.sendVerificationEmail(email, code).catch(err => {
        // Log error but don't fail the mutation for the client
        console.error(`Failed to resend verification email to ${email}: ${err.message}`, err.stack);
      });

      return true; // Indicate success
    } catch (error) {
      console.error(`Error updating user or sending email during resendVerificationCode for ${email}:`, error);
      // Throw a generic error to the client
      throw new Error('Failed to resend verification code. Please try again later.');
    }
  }
}

import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { BadRequestException, UseGuards, Inject, forwardRef } from '@nestjs/common'; // Import UseGuards, Inject, forwardRef
import { LoginResponse } from './dto/login-response';
import { RegisterInput } from './dto/register-input';
import { LoginInput } from './dto/login-input';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => UserDto) // Define a new query
  @UseGuards(JwtAuthGuard) // Protect the query with the AuthGuard
  async getCurrentUser(@Context() context): Promise<UserDto> {
    // The user object is added to the context by the JwtAuthGuard
    return context.req.user;
  }

  @Mutation(() => UserDto) // Changed return type to UserDto
  async register(
    @Args('registerInput') registerInput: RegisterInput,
  ): Promise<UserDto> { // Changed return type to UserDto
    const { email, password, name, username } = registerInput;

    const user = await this.authService.register(email, password, name, username);
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
    const loginResult = await this.authService.login(user);
    console.log('AuthResolver - login mutation returning:', loginResult); // Added log
    // Explicitly construct LoginResponse to ensure correct serialization
    return {
      access_token: loginResult.access_token,
      refresh_token: loginResult.refresh_token,
      user: loginResult.user,
    };
  }

  @Mutation(() => Boolean)
  async logoutUser(): Promise<boolean> {
    return true;
  }

  @Mutation(() => Boolean) // Change return type to Boolean
  async verifyEmail(
    @Args('email') email: string,
    @Args('code') code: string,
  ): Promise<boolean> { // Change return type to boolean
    // Валидация и нормализация кода
    const normalizedCode = code.trim();
    // Updated regex to match 8 characters from the allowed set
    const allowedCharactersRegex = /^[0-9a-zA-Z!@#$%^&*()]{8}$/;
    if (!allowedCharactersRegex.test(normalizedCode)) {
      console.error(`Invalid code format received: ${code}`);
      throw new BadRequestException('The code must contain 8 characters (digits, letters, !@#$%^&*())'); // Updated error message
    }
    console.log(`AuthResolver: verifyEmail called with email: ${email}, normalized code: ${normalizedCode}`);
    try {
      await this.authService.verifyConfirmationCode(email, code); // Call the service method
      console.log(`AuthResolver: verifyEmail successful for email: ${email}`);
      return true; // Return true on success
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
 
  @Mutation(() => LoginResponse)
  async refreshToken(@Args('refreshToken') refreshToken: string): Promise<LoginResponse> {
    // Call the new refreshTokens method in AuthService
    return this.authService.refreshTokens(refreshToken);
  }
}

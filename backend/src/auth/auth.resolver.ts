import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '../user.entity';
import * as bcrypt from 'bcrypt';
import { LoginResponse } from './dto/login-response';
import { RegisterInput } from './dto/register-input';
import { LoginInput } from './dto/login-input';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
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
}

import { Resolver, Query, Mutation, Args, Int, ID, ObjectType, Context, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException, UseInterceptors } from '@nestjs/common'; // Import UseInterceptors
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'; // Import CacheInterceptor, CacheKey, CacheTTL
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { InputType, Field } from '@nestjs/graphql';
import { LoginResponse } from '../auth/dto/login-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { RegisterInput } from '../auth/dto/register-input'; // Import RegisterInput
import { LoginInput } from '../auth/dto/login-input'; // Import LoginInput
import { CurrentUser } from '../auth/current-user.decorator'; // Import CurrentUser decorator
import { User } from '@prisma/client'; // Import Prisma User type

@InputType()
class UpdateUserInput {
  @Field({ nullable: true })
  email?: string;
 
  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  twoFactorEnabled?: boolean;

  @Field({ nullable: true })
  twoFactorMethod?: string;

  @Field({ nullable: true })
  recoveryEmail?: string;

  @Field({ nullable: true })
  devices?: string;
  
  @Field({ nullable: true })
  bio?: string;

}
 
@Resolver(() => UserDto)
export class UserResolver {
  constructor(private readonly userService: UserService) {}
 
  @Query(() => UserDto, { nullable: true })
  async getUser(@Args('id', { type: () => ID }) id: string): Promise<UserDto | null> {
    const user = await this.userService.findOne(id);
    if (!user) {
      return null;
    }
    return user;
  }
 
  @Query(() => [UserDto])
  async getUsers(): Promise<UserDto[]> {
    return []; // Placeholder
  }
 
  @Query(() => UserDto, { name: 'getCurrentUser', nullable: true })
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User): Promise<UserDto | null> {
    // The CurrentUser decorator ensures 'user' is available and authenticated.
    // If the guard passes, 'user' will contain the authenticated user object.
    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required: User ID not available.');
    }
    // console.log('UserResolver - getCurrentUser: User ID from decorator:', user.id); // Added log
    const foundUser = await this.userService.findOne(user.id);
    if (!foundUser) {
        return null;
    }
    return foundUser;
  }

  @ResolveField(() => String)
  status(@Parent() user: UserDto & { lastActiveAt?: Date }): string {
    if (!user.lastActiveAt) {
      return 'Offline'; // Default to offline if lastActiveAt is not set
    }
    const twentySecondsAgo = new Date(Date.now() - 20 * 1000); // Use 20 seconds for online status
    return user.lastActiveAt > twentySecondsAgo ? 'Online' : 'Offline';
  }

  @Query(() => [UserDto])
  @UseGuards(JwtAuthGuard)
  async searchUsersByUsername(
    @Args('username') username: string,
  ): Promise<UserDto[]> {
    return this.userService.searchByUsername(username);
  }

  @Mutation(() => UserDto)
  async createUser(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('name') name: string,
  ): Promise<UserDto | null> {
    return null; // Placeholder
  }

  @Mutation(() => UserDto, { nullable: true })
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserDto | null> {
    const updatedUser = await this.userService.update(id, input);
    return updatedUser;
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.userService.remove(id);
    return true;
  }

  @Mutation(() => UserDto)
  @UseGuards(JwtAuthGuard)
  async updateLastActive(@CurrentUser() user: User): Promise<UserDto> {
    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required: User ID not available.');
    }
    return this.userService.updateLastActive(user.id);
  }

  @Mutation(() => [String])
  async generateRecoveryCodes(@Args('id', { type: () => ID }) id: string): Promise<string[]> {
    return this.userService.generateRecoveryCodes(id);
  }

  @Mutation(() => Boolean)
  async verifyDevice(@Args('id', { type: () => ID }) id: string, @Args('code') code: string): Promise<boolean> {
    return this.userService.verifyDevice(id, code);
  }

  @Query(() => [String])
  async getDevices(@Args('id', { type: () => ID }) id: string): Promise<string[]> {
    return this.userService.getDevices(id);
  }

  @Mutation(() => Boolean)
  async logoutDevice(@Args('deviceId') deviceId: string): Promise<boolean> {
    return this.userService.logoutDevice(deviceId);
  }


  @Mutation(() => LoginResponse)
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<LoginResponse> {
    return this.userService.login(loginInput);
  }

  @Mutation(() => Boolean)
  async logoutUser(): Promise<boolean> {
    return this.userService.logoutUser();
  }

  @Mutation(() => UserDto)
  @UseGuards(JwtAuthGuard)
  async uploadAvatar(
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
    @CurrentUser() user: User,
  ): Promise<UserDto> {
    if (!user || !user.id) {
       throw new UnauthorizedException('Authentication required: User ID not available.');
    }
    try {
      const updatedUser = await this.userService.uploadAvatar(user.id, file);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async sendVerificationEmail(@CurrentUser() user: User): Promise<boolean> {
    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required: User ID not available.');
    }
    return this.userService.sendVerificationEmail(user.id);
  }

  @Mutation(() => UserDto)
  @UseGuards(JwtAuthGuard)
  async verifyEmail(
    @Args('code') code: string,
    @CurrentUser() user: User,
  ): Promise<UserDto> {
    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required: User ID not available.');
    }
    return this.userService.verifyEmail(user.id, code);
  }
}

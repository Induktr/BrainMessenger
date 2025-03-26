import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from '../user.entity';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
class UpdateUserInput {
  @Field({ nullable: true })
  email?: string;

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
  recoveryPhone?: string;

  @Field({ nullable: true })
  devices?: string;
}

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { nullable: true })
  async getUser(@Args('id', { type: () => Int }) id: number): Promise<any | null> {
    return this.userService.findOne(id);
  }

  @Query(() => [User])
  async getUsers(): Promise<any[]> {
    return this.userService.findAll();
  }

  @Mutation(() => User)
  async createUser(@Args('email') email: string, @Args('password') password: string, @Args('name') name: string): Promise<User> {
    return this.userService.create({ email, password, name });
  }

  @Mutation(() => User, { nullable: true })
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUserInput,
  ): Promise<any | null> {
    return this.userService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    await this.userService.remove(id);
    return true;
  }

  @Mutation(() => [String])
  async generateRecoveryCodes(@Args('id', { type: () => Int }) id: number): Promise<string[]> {
    return this.userService.generateRecoveryCodes(id);
  }

  @Mutation(() => Boolean)
  async verifyDevice(@Args('id', { type: () => Int }) id: number, @Args('code') code: string): Promise<boolean> {
    return this.userService.verifyDevice(id, code);
  }

  @Query(() => [String]) // Replace String with Device type later
  async getDevices(@Args('id', { type: () => Int }) id: number): Promise<string[]> {
    return this.userService.getDevices(id);
  }

  @Mutation(() => Boolean)
  async logoutDevice(@Args('deviceId') deviceId: string): Promise<boolean> {
    return this.userService.logoutDevice(deviceId);
  }
}

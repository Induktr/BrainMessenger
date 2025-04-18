import { Resolver, Query, Mutation, Args, Int, ID, ObjectType, Context } from '@nestjs/graphql'; // Added ObjectType, Context
import { UseGuards, UnauthorizedException } from '@nestjs/common'; // Import UseGuards
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto'; // Import UserDto
import { InputType, Field } from '@nestjs/graphql';
import { LoginResponse } from '../auth/dto/login-response'; // Import LoginResponse from auth module
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Проверяем путь импорта Guard
// Возможно, понадобится декоратор CurrentUser, если он у вас есть, или будем извлекать из context

@InputType()
class UpdateUserInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string; // Consider removing password from update input unless handled securely

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
  devices?: string; // Consider a more structured type if needed
}

// --- Define Input and Response Types for Register/Login ---

@InputType()
export class RegisterInput {
  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

// --- End Input/Response Types ---
// Removed mapNhostUserToDto helper function

@Resolver(() => UserDto) // Use UserDto
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // Changed Args ID type to ID (string)
  @Query(() => UserDto, { nullable: true }) // Use UserDto
  async getUser(@Args('id', { type: () => ID }) id: string): Promise<UserDto | null> {
    // userService.findOne now accepts string ID
    // TODO: Update when userService.findOne is implemented with Prisma
    // const user = await this.userService.findOne(id);
    // return user; // Assuming userService returns UserDto or null
    return null; // Placeholder
  }

  @Query(() => [UserDto]) // Use UserDto
  async getUsers(): Promise<UserDto[]> {
    // TODO: Update when userService.findAll is implemented with Prisma
    // const users = await this.userService.findAll();
    // return users; // Assuming userService returns UserDto[]
    return []; // Placeholder
  }

  // --- Добавляем Query для получения текущего пользователя ---
  @Query(() => UserDto, { name: 'getCurrentUser', nullable: true }) // Имя запроса как на фронтенде
  @UseGuards(JwtAuthGuard) // Включаем Guard обратно!
  async getCurrentUser(@Context() context): Promise<UserDto | null> {
    // JwtAuthGuard добавляет объект user в request, который доступен через context.
    // Проверяем стандартные поля payload: userId (если добавлено в стратегии) или sub (стандартное JWT поле для ID)
    const userId = context.req.user?.userId ?? context.req.user?.sub;

    if (!userId) {
      // Эта ошибка будет видна на бэкенде, если Guard пропустит запрос без user ID или стратегия не вернет ID
      console.error('User ID not found in context after JwtAuthGuard. Check JwtStrategy payload.');
      // Важно выбросить ошибку, чтобы фронтенд получил не 400, а 401/403
      throw new UnauthorizedException('Authentication required: User ID not found in token payload.');
    }

    // Используем реализованный метод findOne
    const user = await this.userService.findOne(userId);
    if (!user) {
        // Эта ошибка будет видна на бэкенде, если пользователь с таким ID не найден в базе
        console.error(`User with ID ${userId} not found in database.`);
        // Возвращаем null, так как запрос getCurrentUser помечен как nullable
        return null;
        // Или можно выбросить NotFoundException, если фронтенд должен обрабатывать это как ошибку
        // throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user; // Возвращаем найденного пользователя (DTO)
  }
  // --- Конец добавленного Query ---

  // Note: createUser likely needs password hashing before calling service
  @Mutation(() => UserDto) // Use UserDto
  async createUser(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('name') name: string
  ): Promise<UserDto | null> { // Return type might need adjustment
    // TODO: Update when userService.create is implemented with Prisma
    // const newUser = await this.userService.create({ email, password, name });
    // return newUser; // Assuming userService returns UserDto or similar
    return null; // Placeholder
  }

  // Changed Args ID type from Int to ID
  @Mutation(() => UserDto, { nullable: true }) // Use UserDto
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserDto | null> {
    // userService.update now accepts string ID
    // TODO: Update when userService.update is implemented with Prisma
    // const updatedUser = await this.userService.update(id, input);
    // return updatedUser; // Assuming userService returns UserDto or null
    return null; // Placeholder
  }

  // Changed Args ID type from Int to ID
  @Mutation(() => Boolean)
  async deleteUser(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    // userService.remove now accepts string ID
    await this.userService.remove(id);
    return true;
  }

  // Changed Args ID type from Int to ID
  @Mutation(() => [String])
  async generateRecoveryCodes(@Args('id', { type: () => ID }) id: string): Promise<string[]> {
    // userService.generateRecoveryCodes now accepts string ID
    return this.userService.generateRecoveryCodes(id);
  }

  // Changed Args ID type from Int to ID
  @Mutation(() => Boolean)
  async verifyDevice(@Args('id', { type: () => ID }) id: string, @Args('code') code: string): Promise<boolean> {
    // userService.verifyDevice now accepts string ID
    return this.userService.verifyDevice(id, code);
  }

  // Changed Args ID type from Int to ID
  @Query(() => [String]) // Replace String with Device type later
  async getDevices(@Args('id', { type: () => ID }) id: string): Promise<string[]> {
    // userService.getDevices now accepts string ID
    return this.userService.getDevices(id);
  }

  @Mutation(() => Boolean)
  async logoutDevice(@Args('deviceId') deviceId: string): Promise<boolean> {
    return this.userService.logoutDevice(deviceId);
  }

  // --- Add Register Mutation ---
  @Mutation(() => LoginResponse)
  async register(
    @Args('registerInput') registerInput: RegisterInput,
  ): Promise<LoginResponse> {
    // TODO: Implement password hashing in userService.register
    // TODO: Ensure userService.register returns { access_token, user }
    return this.userService.register(registerInput);
  }
  // --- End Register Mutation ---

  // --- Add Login Mutation (Placeholder - Assuming it's needed based on schema) ---
  @Mutation(() => LoginResponse)
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<LoginResponse> {
    // TODO: Implement login logic in userService.login
    return this.userService.login(loginInput);
  }
  // --- End Login Mutation ---

  // --- Add Logout Mutation (Placeholder - Assuming it's needed based on schema) ---
  @Mutation(() => Boolean)
  async logoutUser(): Promise<boolean> {
    // TODO: Implement logout logic in userService.logoutUser if needed
    return this.userService.logoutUser(); // Keep call, service handles logic
  }
  // --- End Logout Mutation ---
}

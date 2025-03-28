import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common'; // Added exceptions
import { NhostService } from '../nhost/nhost.service';
import * as crypto from 'crypto';
import { RegisterInput, LoginInput, LoginResponse } from './user.resolver'; // Import types from resolver
import { UserDto } from './dto/user.dto'; // Import UserDto

@Injectable()
export class UserService {
  constructor(private nhostService: NhostService) {}

  async findOne(id: string): Promise<any | null> { // Changed id type to string
    const nhost = this.nhostService.getNhostClient();
    // GraphQL query already expects uuid! which is compatible with string
    const result = await nhost.graphql.request(`
      query GetUser($id: uuid!) {
        user(id: $id) {
          id
          email
          name
        }
      }
    `, { id });
    return result.data?.user;
  }

  async findAll(): Promise<any[]> {
    const nhost = this.nhostService.getNhostClient();
    const result = await nhost.graphql.request(`
      query GetUsers {
        users {
          id
          email
          name
        }
      }
    `);
    return result.data?.users;
  }

  async create(user: any): Promise<any> {
    const nhost = this.nhostService.getNhostClient();
    const result = await nhost.graphql.request(`
      mutation InsertUser($email: String!, $password: String!, $name: String!) {
        insert_users_one(object: {email: $email, password: $password, name: $name}) {
          id
          email
          name
        }
      }
    `, { email: user.email, password: user.password, name: user.name });
    return result.data?.insert_users_one;
  }

  async update(id: string, user: any): Promise<any | null> { // Changed id type to string
    const nhost = this.nhostService.getNhostClient();
    // GraphQL query already expects uuid! which is compatible with string
    const result = await nhost.graphql.request(
      `
      mutation UpdateUser($id: uuid!, $user: users_set_input!) {
        update_users_by_pk(pk_columns: {id: $id}, _set: $user) {
          id
          email
          name
          twoFactorEnabled
          twoFactorMethod
          recoveryEmail
          recoveryPhone
        }
      }
    `,
      {
        id,
        user: {
          email: user.email,
          name: user.name,
          password: user.password,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorMethod: user.twoFactorMethod,
          recoveryEmail: user.recoveryEmail,
          recoveryPhone: user.recoveryPhone,
        },
      }
    );
    return result.data?.update_users_by_pk;
  }

  async findOneByEmail(email: string): Promise<any | null> {
    const nhost = this.nhostService.getNhostClient();
    const result = await nhost.graphql.request(`
      query GetUserByEmail($email: String!) {
        users(where: {email: {_eq: $email}}) {
          id
          email
          name
        }
      }
    `, { email });
    return result.data?.users[0];
  }

  async remove(id: string): Promise<void> { // Changed id type to string
    const nhost = this.nhostService.getNhostClient();
    // GraphQL query already expects uuid! which is compatible with string
    await nhost.graphql.request(`
      mutation DeleteUser($id: uuid!) {
        delete_users_by_pk(id: $id) {
          id
        }
      }
    `, { id });
  }

  async generateRecoveryCodes(id: string): Promise<string[]> { // Changed id type to string
    // Note: This method doesn't interact with DB via Nhost currently,
    // but changing type for consistency with resolver.
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const randomBytes = crypto.randomBytes(4);
      let code = "";
      for (const byte of randomBytes) {
        code += byte.toString(16).padStart(2, "0");
      }
      codes.push(code);
    }
    // TODO: Store the generated codes securely in the database
    return codes;
  }

  async verifyDevice(id: string, code: string): Promise<boolean> { // Changed id type to string
    // Note: This method doesn't interact with DB via Nhost currently,
    // but changing type for consistency with resolver.
    // TODO: Implement device verification logic
    return false;
  }

  async getDevices(id: string): Promise<string[]> { // Changed id type to string
    // Note: This method doesn't interact with DB via Nhost currently,
    // but changing type for consistency with resolver.
    // TODO: Implement get devices logic
    return [];
  }

  async logoutDevice(deviceId: string): Promise<boolean> {
    // In a real implementation, this would invalidate the session or token
    // associated with the device ID.
    console.log(`Logging out device with ID: ${deviceId}`);
    return true;
  }

  // --- Authentication Methods ---

  async register(registerInput: RegisterInput): Promise<LoginResponse> {
    const nhost = this.nhostService.getNhostClient();
    try {
      // Use Nhost Auth SDK for sign up
      const { session, error } = await nhost.auth.signUp({
        email: registerInput.email,
        password: registerInput.password,
        options: {
          displayName: registerInput.name,
          // Nhost automatically handles email verification flow if enabled in settings
          // You might need to configure allowed roles if using Hasura permissions
          // allowedRoles: ['user'],
          // defaultRole: 'user',
        }
      });

      if (error) {
        console.error("Nhost SignUp Error:", error);
        // Provide more specific feedback if possible
        if (error.message.includes('Email already in use')) {
           throw new UnauthorizedException('Email already exists.');
        }
        if (error.message.includes('Password is too weak')) {
            throw new UnauthorizedException('Password is too weak. Please choose a stronger password.');
        }
        throw new InternalServerErrorException(error.message || 'Registration failed');
      }

      if (!session || !session.user) {
          // This case might indicate email verification is required before a session is active
          // Or an unexpected issue with Nhost signup flow
          console.warn("Nhost SignUp: No session returned. Email verification might be pending or an issue occurred.");
          // Depending on desired UX, you might throw an error or return a specific status
          // For now, throwing an error as login won't be possible immediately.
          throw new InternalServerErrorException('Registration initiated, but requires email verification or encountered an issue.');
          // Alternatively, if you want to allow login immediately (less secure, depends on Nhost settings):
          // throw new InternalServerErrorException('Registration completed but no session or user returned.');
      }

      // Map Nhost user to UserDto
      const userDto: UserDto = {
        id: session.user.id,
        email: session.user.email ?? '', // Handle potential null email
        name: session.user.displayName ?? registerInput.name, // Use displayName or fallback to input name
      };

      return {
        access_token: session.accessToken,
        user: userDto,
      };

    } catch (err) {
      console.error("Register Service Error:", err);
      if (err instanceof InternalServerErrorException || err instanceof UnauthorizedException) {
        throw err; // Re-throw specific exceptions
      }
      // Catch-all for unexpected errors
      throw new InternalServerErrorException('An unexpected error occurred during registration.');
    }
  }

  async login(loginInput: LoginInput): Promise<LoginResponse> {
    const nhost = this.nhostService.getNhostClient();
    try {
      // Use Nhost Auth SDK for sign in
      const { session, error } = await nhost.auth.signIn({
        email: loginInput.email,
        password: loginInput.password,
      });

      if (error) {
        console.error("Nhost SignIn Error:", error);
        // Nhost often returns specific error messages for invalid credentials
        if (error.message.includes('Invalid email or password') || error.message.includes('Invalid credentials')) {
           throw new UnauthorizedException('Invalid email or password.');
        }
        if (error.message.includes('Email not confirmed')) {
            throw new UnauthorizedException('Please verify your email before logging in.');
        }
        throw new InternalServerErrorException(error.message || 'Login failed');
      }

      if (!session || !session.user) {
          throw new InternalServerErrorException('Login successful but no session or user returned.');
      }

      // Map Nhost user to UserDto
      const userDto: UserDto = {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.displayName ?? '', // Nhost might not return displayName on login, adjust if needed
      };

      return {
        access_token: session.accessToken,
        user: userDto,
      };

    } catch (err) {
       console.error("Login Service Error:", err);
       if (err instanceof UnauthorizedException || err instanceof InternalServerErrorException) {
           throw err; // Re-throw specific exceptions
       }
       throw new InternalServerErrorException('An unexpected error occurred during login.');
    }
  }

  async logoutUser(): Promise<boolean> {
      const nhost = this.nhostService.getNhostClient();
      try {
          // Use Nhost Auth SDK for sign out
          const { error } = await nhost.auth.signOut();

          if (error) {
              console.error("Nhost SignOut Error:", error);
              // SignOut errors are usually less critical, but log them.
              // Depending on the error, you might decide if it warrants throwing an exception.
              // For now, return false indicating logout might not have fully completed on Nhost side.
              return false;
          }
          return true; // Logout successful
      } catch (err) {
          console.error("Logout Service Error:", err);
          throw new InternalServerErrorException('An unexpected error occurred during logout.');
      }
  }
  // --- End Authentication Methods ---
}

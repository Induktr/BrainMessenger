import { Injectable, UnauthorizedException, InternalServerErrorException, NotImplementedException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common'; // Import Inject and forwardRef
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PubSubEngine } from 'graphql-subscriptions';
import { PUB_SUB } from '../pubsub/pubsub.provider';
import * as crypto from 'crypto';
import { RegisterInput } from '../auth/dto/register-input';
import { LoginInput } from '../auth/dto/login-input';
import { LoginResponse } from '../auth/dto/login-response';
import { UserDto } from './dto/user.dto';
import { CloudflareR2Service } from '../cloudflare/cloudflare-r2.service';
import { FileUpload } from 'graphql-upload-ts';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Readable } from 'stream';
import { MailService } from '../mail/mail.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { addHours } from 'date-fns';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private cloudflareR2Service: CloudflareR2Service,
    private configService: ConfigService,
    private mailService: MailService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService, // Inject AuthService with forwardRef
    private jwtService: JwtService,
    @Inject(PUB_SUB) private readonly pubSub: PubSubEngine,
  ) {}

  private readonly logger = new Logger(UserService.name);

  async findOne(id: string): Promise<any | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        twoFactorEnabled: true,
        twoFactorMethod: true,
        recoveryEmail: true,
        avatarUrl: true,
        bio: true,
        username: true,
        lastActiveAt: true, // Include lastActiveAt
        roles: true, // Include roles
      },
    });
    // console.log(`UserService - findOne: Prisma returned user for ID ${id}:`, JSON.stringify(user, null, 2)); // Removed excessive log
    return user;
  }

  // --- TEMPORARY METHOD FOR TESTING ---
  async findFirstUser(): Promise<any | null> {
    // console.warn("Executing TEMPORARY findFirstUser method in UserService!"); // Removed temporary log
    const user = await this.prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        avatarUrl: true,
        bio: true,
        username: true,
        twoFactorEnabled: true,
        twoFactorMethod: true,
        recoveryEmail: true,
      },
    });
    return user;
  }
  // --- END TEMPORARY METHOD ---

  async findAll(): Promise<any[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        twoFactorEnabled: true,
        twoFactorMethod: true,
        recoveryEmail: true,
        avatarUrl: true,
        bio: true,
        username: true,
        lastActiveAt: true, // Include lastActiveAt
        roles: true, // Include roles
      },
    });
    return users;
  }

  async create(user: any): Promise<any> {
    throw new NotImplementedException('create not implemented');
  }

 async update(id: string, data: { name?: string; username?: string; email?: string; bio?: string }): Promise<any | null> {
   // this.logger.log(`update: Called for user ID: ${id}, data: ${JSON.stringify(data)}`); // Removed excessive log
   try {
     const user = await this.prisma.user.findUnique({ where: { id } });
     if (!user) {
       throw new UnauthorizedException('User not found.');
     }
     const updateData: any = { ...data };

     // Валидация для имени: не может быть пустой строкой
     if (data.name !== undefined) {
       const trimmedName = data.name.trim();
       if (trimmedName === '') {
         throw new BadRequestException('Name cannot be empty.');
       }
       updateData.name = trimmedName;
     }

     // Валидация для имени пользователя: может быть null, но не пустой строкой
     if (data.username !== undefined) {
       const trimmedUsername = data.username.trim();
       if (trimmedUsername === '') {
         updateData.username = null; // Установить в null, если пустая строка
       } else {
         updateData.username = trimmedUsername;
       }
       // Проверка уникальности имени пользователя
       if (updateData.username !== user.username && updateData.username !== null) {
         // this.logger.log(`update: Username change detected for user ${id}. New username: ${updateData.username}`); // Removed excessive log
         const existingUserWithNewUsername = await this.prisma.user.findUnique({ where: { username: updateData.username } });
         if (existingUserWithNewUsername && existingUserWithNewUsername.id !== id) {
           throw new BadRequestException('Username already in use by another account.');
         }
       }
     } else if (user.username !== null && data.username === undefined) {
       // Если username не был предоставлен в data, но был у пользователя, сохраняем его текущее значение
       updateData.username = user.username;
     }


     // Валидация для email: не может быть пустой строкой и должен быть уникальным
     if (data.email !== undefined) {
       const trimmedEmail = data.email.trim();
       if (trimmedEmail === '') {
         throw new BadRequestException('Email cannot be empty.');
       }
       if (trimmedEmail !== user.email) {
         // this.logger.log(`update: Email change detected for user ${id}. New email: ${trimmedEmail}`); // Removed excessive log
         const existingUserWithNewEmail = await this.prisma.user.findUnique({ where: { email: trimmedEmail } });
         if (existingUserWithNewEmail && existingUserWithNewEmail.id !== id) {
           throw new BadRequestException('Email already in use by another account.');
         }
         updateData.email = trimmedEmail;

         // Set isVerified to false and generate new verification code
         updateData.isVerified = false;
         const verificationCode = crypto.randomBytes(4).toString('hex'); // 8-character hex code
         const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

         updateData.verificationCode = verificationCode;
         updateData.verificationCodeExpiresAt = verificationCodeExpiresAt;
         updateData.verificationAttempts = 0; // Reset attempts
         updateData.lastVerificationAttempt = null; // Reset last attempt

         // Send verification email to the NEW email address
         await this.mailService.sendVerificationEmail(trimmedEmail, verificationCode);
         // this.logger.log(`update: Sent verification email to new email ${trimmedEmail} for user ${id}.`); // Removed excessive log
       } else {
         updateData.email = user.email; // Если email не изменился, сохраняем текущее значение
       }
     }

     const updatedUser = await this.prisma.user.update({
       where: { id },
       data: updateData,
       select: {
         id: true,
         email: true,
         name: true,
         isVerified: true,
         twoFactorEnabled: true,
         twoFactorMethod: true,
         recoveryEmail: true,
         avatarUrl: true,
         bio: true,
         username: true,
         roles: true, // Include roles
         // lastActiveAt: true, // Include lastActiveAt - not needed for update return type
       },
     });
     // this.logger.log(`update: User ${id} updated successfully.`); // Removed excessive log
     return updatedUser;
   } catch (error) {
     this.logger.error(`update: Error updating user ${id}:`, error.stack);
     if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
       throw error;
     }
     throw new InternalServerErrorException(`Failed to update user with ID ${id}.`);
   }
 }

 async updateLastActive(userId: string): Promise<any> {
   // this.logger.log(`updateLastActive: Called for user ID: ${userId}`); // Removed excessive log
   try {
     const updatedUser = await this.prisma.user.update({
       where: { id: userId },
       data: {
         lastActiveAt: new Date(),
       },
       select: {
         id: true,
         email: true,
         name: true,
         isVerified: true,
         twoFactorEnabled: true,
         twoFactorMethod: true,
         recoveryEmail: true,
         avatarUrl: true,
         bio: true,
         username: true,
         lastActiveAt: true,
         roles: true, // Include roles
       },
     });
     // this.logger.log(`updateLastActive: User ${userId} last active timestamp updated successfully.`); // Removed excessive log
     return updatedUser;
   } catch (error) {
     this.logger.error(`updateLastActive: Error updating last active timestamp for user ${userId}:`, error.stack);
     throw new InternalServerErrorException(`Failed to update last active timestamp for user with ID ${userId}.`);
   }
 }

 async setUserOffline(userId: string): Promise<void> {
   try {
     const user = await this.prisma.user.update({
       where: { id: userId },
       data: {
         // Set lastActiveAt to a time in the past to ensure they appear offline
         lastActiveAt: new Date(Date.now() - 30 * 1000), // 30 seconds ago
       },
     });

     this.pubSub.publish('userStatusUpdated', {
       userStatus: {
         userId: user.id,
         isOnline: false,
         lastSeen: user.lastActiveAt ? user.lastActiveAt.toISOString() : null,
       },
     });
   } catch (error) {
     this.logger.error(`setUserOffline: Error setting user ${userId} to offline:`, error.stack);
   }
 }

 async findOneByEmail(email: string): Promise<any | null> {
   throw new NotImplementedException('findOneByEmail not implemented');
 }

  async remove(id: string): Promise<void> {
    throw new NotImplementedException('remove not implemented');
  }

  async generateRecoveryCodes(id: string): Promise<string[]> {
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const randomBytes = crypto.randomBytes(4);
      let code = "";
      for (const byte of randomBytes) {
        code += byte.toString(16).padStart(2, "0");
      }
      codes.push(code);
    }
    return codes;
  }

  async verifyDevice(id: string, code: string): Promise<boolean> {
    return false;
  }

  async getDevices(id: string): Promise<string[]> {
    return [];
  }

  async logoutDevice(deviceId: string): Promise<boolean> {
    // console.log(`Logging out device with ID: ${deviceId}`); // Removed excessive log
    return true;
  }

  // --- Authentication Methods ---

  async register(registerInput: RegisterInput): Promise<LoginResponse> {
    throw new NotImplementedException('register not implemented');
  }

  async login(loginInput: LoginInput): Promise<LoginResponse> {
    const { email, password } = loginInput;
    // console.log(`UserService - login: Attempting to log in user with email: ${email}`); // Removed excessive log

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // console.warn(`UserService - login: User with email ${email} not found.`); // Removed excessive log
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await this.authService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      // console.warn(`UserService - login: Invalid password for user ${email}.`); // Removed excessive log
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    // console.log(`UserService - login: User ${email} logged in successfully. Token generated.`); // Removed excessive log

    // Generate a refresh token
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenExpiresAt = addHours(new Date(), 30 * 24); // Refresh token valid for 30 days

    // Save the refresh token and its expiration to the user in the database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: refreshToken,
        refreshTokenExpiresAt: refreshTokenExpiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken, // Added refresh_token
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled ?? null,
        twoFactorMethod: user.twoFactorMethod ?? null,
        recoveryEmail: user.recoveryEmail ?? null,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        username: user.username,
        roles: user.roles,
      },
    };
  }

  async logoutUser(): Promise<boolean> {
      try {
          // console.log("User logout requested (server-side action may be needed)"); // Removed excessive log
          return true;
      } catch (err) {
          console.error("Logout Service Error:", err);
          throw new InternalServerErrorException('An unexpected error occurred during logout.');
      }
  }
  // --- End Authentication Methods ---
  async searchByUsername(username: string): Promise<any[]> {
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        twoFactorEnabled: true,
        twoFactorMethod: true,
        recoveryEmail: true,
        avatarUrl: true,
        bio: true,
        username: true,
        lastActiveAt: true, // Include lastActiveAt
        roles: true, // Include roles
      },
    });
    return users;
  }

  // --- Add Upload Avatar Method ---
  async uploadAvatar(userId: string, file: FileUpload): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const { createReadStream, filename, mimetype } = file;
    const stream = createReadStream();

    // Generate a unique filename
    const fileExtension = path.extname(filename);
    const uniqueFilename = `avatars/${userId}/${uuidv4()}${fileExtension}`;

    try {
      // console.log(`UserService - uploadAvatar: Starting upload for user ${userId}, filename: ${filename}`); // Removed excessive log
      // console.log(`UserService - uploadAvatar: Generated unique filename: ${uniqueFilename}`); // Removed excessive log

      // To get the file size from a FileUpload stream, we need to read it into a buffer first.
      // This is necessary because the S3 PutObjectCommand with a stream requires ContentLength.
      const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });

      // console.log(`UserService - uploadAvatar: Calling cloudflareR2Service.uploadFile...`); // Removed excessive log
      const uploadResult = await this.cloudflareR2Service.uploadFile(fileBuffer, uniqueFilename, mimetype, fileBuffer.length); // Pass buffer and its length
      // console.log(`UserService - uploadAvatar: cloudflareR2Service.uploadFile successful. Result:`, uploadResult); // Removed excessive log
      const avatarUrl = uploadResult.Location;
      // console.log(`UserService - uploadAvatar: Generated avatarUrl: ${avatarUrl}`); // Removed excessive log

      // Optional: Delete previous avatar if it exists
      if (user.avatarUrl) {
        // console.log(`UserService - uploadAvatar: Previous avatar found for user ${userId}: ${user.avatarUrl}`); // Removed excessive log
        try {
          const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
          const bucketBaseUrl = `https://${accountId}.r2.cloudflarestorage.com/${this.cloudflareR2Service.bucketName}/`;
          let oldKey: string | null = user.avatarUrl.replace(bucketBaseUrl, '');
           if (oldKey === user.avatarUrl) {
               const parts = user.avatarUrl.split(`/${this.cloudflareR2Service.bucketName}/`);
               if (parts.length > 1) {
                   oldKey = parts[1];
               } else {
                   console.warn(`UserService - uploadAvatar: Could not reliably extract old avatar key from URL: ${user.avatarUrl}. Skipping deletion.`);
                   oldKey = null;
               }
           }

          if (oldKey) {
            // console.log(`UserService - uploadAvatar: Attempting to delete old avatar with key: ${oldKey}`); // Removed excessive log
            await this.cloudflareR2Service.deleteFile(oldKey);
            // console.log(`UserService - uploadAvatar: Deleted old avatar for user ${userId}: ${oldKey}`); // Removed excessive log
          }

        } catch (deleteError) {
          console.warn(`UserService - uploadAvatar: Failed to delete old avatar for user ${userId}:`, deleteError);
        }
      } else {
        // console.log(`UserService - uploadAvatar: No previous avatar found for user ${userId}. Skipping deletion.`); // Removed excessive log
      }

      // Update user's avatarUrl in the database
      // console.log(`UserService - uploadAvatar: Calling prisma.user.update to set avatarUrl for user ${userId}...`); // Removed excessive log
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: {
          id: true,
          email: true,
          name: true,
          isVerified: true,
          twoFactorEnabled: true,
          twoFactorMethod: true,
          recoveryEmail: true,
          avatarUrl: true,
          bio: true,
          username: true,
          roles: true, // Include roles
        },
      });
      // console.log(`UserService - uploadAvatar: prisma.user.update successful for user ${userId}.`); // Removed excessive log

      // console.log(`UserService - uploadAvatar: Returning updated user object for user ${userId}.`); // Removed excessive log
      return updatedUser;

    } catch (error) {
      console.error(`UserService - uploadAvatar: Caught error during avatar upload for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to upload avatar.');
    }
  }
  // --- End Upload Avatar Method ---
  async sendVerificationEmail(userId: string): Promise<boolean> {
    // this.logger.log(`sendVerificationEmail: Called for user ID: ${userId}`); // Removed excessive log
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (user.isVerified) {
      this.logger.warn(`sendVerificationEmail: User ${userId} is already verified. Skipping email send.`);
      return true; // Already verified, no need to send
    }

    const verificationCode = crypto.randomBytes(4).toString('hex'); // 8-character hex code
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          verificationCode,
          verificationCodeExpiresAt,
          verificationAttempts: 0, // Reset attempts on new code send
          lastVerificationAttempt: null,
        },
      });
      await this.mailService.sendVerificationEmail(user.email, verificationCode);
      // this.logger.log(`sendVerificationEmail: Verification email sent to ${user.email} for user ${userId}.`); // Removed excessive log
      return true;
    } catch (error) {
      this.logger.error(`sendVerificationEmail: Failed to send verification email for user ${userId}:`, error.stack);
      throw new InternalServerErrorException('Failed to send verification email.');
    }
  }

  async verifyEmail(userId: string, code: string): Promise<any> {
    // this.logger.log(`verifyEmail: Called for user ID: ${userId}, code: ${code}`); // Removed excessive log
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (user.isVerified) {
      this.logger.warn(`verifyEmail: User ${userId} is already verified.`);
      return user; // Already verified
    }

    if (!user.verificationCode || !user.verificationCodeExpiresAt) {
      this.logger.warn(`verifyEmail: No verification code found for user ${userId}.`);
      throw new BadRequestException('No verification code found. Please request a new one.');
    }

    if (user.verificationCodeExpiresAt < new Date()) {
      this.logger.warn(`verifyEmail: Verification code for user ${userId} has expired.`);
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    if (user.verificationAttempts && user.verificationAttempts >= 5) { // Limit attempts
      this.logger.warn(`verifyEmail: Too many verification attempts for user ${userId}.`);
      throw new BadRequestException('Too many failed attempts. Please request a new code.');
    }

    if (user.verificationCode !== code) {
      this.logger.warn(`verifyEmail: Invalid verification code for user ${userId}. Attempt: ${user.verificationAttempts + 1}`);
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          verificationAttempts: {
            increment: 1,
          },
          lastVerificationAttempt: new Date(),
        },
      });
      throw new BadRequestException('Invalid verification code.');
    }

    // Code is valid, verify user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
        verificationAttempts: 0,
        lastVerificationAttempt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        twoFactorEnabled: true,
        twoFactorMethod: true,
        recoveryEmail: true,
        avatarUrl: true,
        bio: true,
        username: true,
        roles: true, // Include roles
      },
    });
    // this.logger.log(`verifyEmail: User ${userId} successfully verified.`); // Removed excessive log
    return updatedUser;
  }
}

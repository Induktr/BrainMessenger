import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { addHours } from 'date-fns';

// Mock dependencies
const mockUserService = {
  // Mock methods used by AuthService if any
};

const mockJwtService = {
  sign: jest.fn((payload: any) => `mock_access_token_${payload.sub}`),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(), // Mock findFirst for refreshTokens
  },
  // Mock other models if needed
};

const mockMailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined), // Return a resolved promise
};

// Mock bcrypt and crypto
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({ toString: jest.fn().mockReturnValue('mock_refresh_token') }),
}));

jest.mock('date-fns', () => ({
  addHours: jest.fn((date, hours) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  }),
}));


describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks before each test
    jest.clearAllMocks();
    (bcrypt.compare as jest.Mock).mockReset();
    (bcrypt.hash as jest.Mock).mockReset();
    (crypto.randomBytes as jest.Mock).mockReset().mockReturnValue({ toString: jest.fn().mockReturnValue('mock_refresh_token') });
    (addHours as jest.Mock).mockReset().mockImplementation((date, hours) => {
        const newDate = new Date(date);
        newDate.setHours(newDate.getHours() + hours);
        return newDate;
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      username: 'testuser',
      isVerified: true,
      twoFactorEnabled: false,
      twoFactorMethod: null,
      recoveryEmail: null,
      recoveryPhone: null,
      verificationCode: null as string | null | undefined,
      verificationCodeExpiresAt: null as Date | null | undefined,
      verificationAttempts: 0 as number | undefined,
      lastVerificationAttempt: null as Date | null | undefined,
      avatarUrl: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      bio: null,
    };

    it('should return user if validation is successful', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        isVerified: true,
        twoFactorEnabled: false,
        twoFactorMethod: null,
        recoveryEmail: null,
        recoveryPhone: null,
        verificationCode: null,
        verificationCodeExpiresAt: null,
        verificationAttempts: 0,
        lastVerificationAttempt: null,
        avatarUrl: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        bio: null,
      }); // Ensure password is excluded
    });

    it('should return null if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      username: 'testuser',
      isVerified: true,
      twoFactorEnabled: false,
      twoFactorMethod: null,
      recoveryEmail: null,
      recoveryPhone: null,
      verificationCode: null,
      verificationCodeExpiresAt: null,
      verificationAttempts: 0,
      lastVerificationAttempt: null,
      avatarUrl: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      bio: null,
    };

    it('should return access and refresh tokens and user data on successful login', async () => {
      const mockDate = new Date();
      // Mock Date to control time in tests, including Date.now()
      jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate.getTime()); // Mock Date.now()
      (addHours as jest.Mock).mockReturnValue(new Date(mockDate.getTime() + 30 * 24 * 60 * 60 * 1000)); // Mock addHours

      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        refreshToken: 'mock_refresh_token',
        refreshTokenExpiresAt: new Date(mockDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      });

      const result = await service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email, sub: mockUser.id });
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect((crypto.randomBytes(32) as any).toString).toHaveBeenCalledWith('hex');
      // Check if addHours was called with a Date object and the correct number of hours
      expect(addHours).toHaveBeenCalledWith(expect.any(Date), 30 * 24);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          refreshToken: 'mock_refresh_token',
          refreshTokenExpiresAt: new Date(mockDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      expect(result).toEqual({
        access_token: 'mock_access_token_user-id',
        refresh_token: 'mock_refresh_token',
        user: mockUser,
      });
    });

    it('should throw UnauthorizedException if user is null', async () => {
      await expect(service.login(null)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerInput = {
      email: 'newuser@example.com',
      password: 'newPassword',
      name: 'New User',
      username: 'newuser',
    };
    const mockNewUser = {
      id: 'new-user-id',
      email: 'newuser@example.com',
      password: 'hashedNewPassword',
      name: 'New User',
      username: 'newuser',
      isVerified: false,
      verificationCode: 'mockCode',
      verificationCodeExpiresAt: new Date(),
      verificationAttempts: 0,
      lastVerificationAttempt: null,
      avatarUrl: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      bio: null,
    };

    it('should create a new user and send verification email on successful registration', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      jest.spyOn(service, 'generateConfirmationCode').mockReturnValue('mockCode');
      const mockExpiresAt = new Date();
      // Mock Date to control time in tests, including Date.now()
      jest.spyOn(global.Date, 'now').mockImplementation(() => mockExpiresAt.getTime()); // Mock Date.now()
      mockExpiresAt.setMinutes(mockExpiresAt.getMinutes() + 10);


      (prisma.user.create as jest.Mock).mockResolvedValue(mockNewUser);

      const result = await service.register(
        registerInput.email,
        registerInput.password,
        registerInput.name,
        registerInput.username
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: registerInput.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerInput.password, 10);
      expect(service.generateConfirmationCode).toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerInput.email,
          password: 'hashedNewPassword',
          name: registerInput.name,
          username: registerInput.username,
          isVerified: false,
          verificationCode: 'mockCode',
          verificationCodeExpiresAt: expect.any(Date), // Check for any Date object
        },
      });
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(registerInput.email, 'mockCode');
      expect(result).toEqual({
        id: 'new-user-id',
        email: 'newuser@example.com',
        name: 'New User',
        username: 'newuser',
        isVerified: false,
        verificationCode: 'mockCode',
        verificationCodeExpiresAt: mockNewUser.verificationCodeExpiresAt,
        verificationAttempts: 0,
        lastVerificationAttempt: null,
        avatarUrl: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        bio: null,
      }); // Ensure password is excluded
    });

    it('should throw ConflictException if user with email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user-id' });

      await expect(service.register(
        registerInput.email,
        registerInput.password,
        registerInput.name,
        registerInput.username
      )).rejects.toThrow(ConflictException);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: registerInput.email } });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(mockMailService.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('verifyConfirmationCode', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      username: 'testuser',
      isVerified: false,
      twoFactorEnabled: false,
      twoFactorMethod: null,
      recoveryEmail: null,
      recoveryPhone: null,
      verificationCode: 'VALIDCODE',
      verificationCodeExpiresAt: addHours(new Date(), 1), // Valid for 1 hour
      verificationAttempts: 0,
      lastVerificationAttempt: null,
      avatarUrl: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      bio: null,
    };

    it('should return true and update user if code is valid and not expired', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, isVerified: true, verificationCode: null, verificationCodeExpiresAt: null });

      const result = await service.verifyConfirmationCode('test@example.com', 'VALIDCODE');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          isVerified: true,
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      });
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.verifyConfirmationCode('nonexistent@example.com', 'SOMECODE')).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if code is incorrect', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, verificationAttempts: 1, lastVerificationAttempt: new Date() }); // Simulate attempt increment

      await expect(service.verifyConfirmationCode('test@example.com', 'WRONGCODE')).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: mockUser.id },
          data: {
              verificationAttempts: { increment: 1 },
              lastVerificationAttempt: expect.any(Date)
          },
          select: { verificationAttempts: true }
      });
    });

    it('should throw UnauthorizedException if code has expired', async () => {
      const expiredUser = {
        ...mockUser,
        verificationCodeExpiresAt: addHours(new Date(), -1), // Expired 1 hour ago
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(expiredUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...expiredUser, verificationCode: null, verificationCodeExpiresAt: null }); // Simulate clearing expired code

      await expect(service.verifyConfirmationCode('test@example.com', 'VALIDCODE')).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: expiredUser.id },
          data: { verificationCode: null, verificationCodeExpiresAt: null },
      });
    });

    it('should throw UnauthorizedException if max attempts exceeded', async () => {
        const userWithMaxAttempts = {
            ...mockUser,
            verificationAttempts: 5,
            lastVerificationAttempt: new Date(), // Last attempt within cooldown
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithMaxAttempts);

        await expect(service.verifyConfirmationCode('test@example.com', 'WRONGCODE')).rejects.toThrow(UnauthorizedException);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
        expect(prisma.user.update).not.toHaveBeenCalled(); // Should not update attempts if max attempts reached within cooldown
    });

    it('should reset attempts if max attempts exceeded but cooldown passed', async () => {
        const userWithMaxAttempts = {
            ...mockUser,
            verificationAttempts: 5,
            lastVerificationAttempt: addHours(new Date(), -1), // Last attempt outside cooldown
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithMaxAttempts);
         (prisma.user.update as jest.Mock).mockResolvedValue({ ...userWithMaxAttempts, verificationAttempts: 0 }); // Simulate resetting attempts

        await expect(service.verifyConfirmationCode('test@example.com', 'WRONGCODE')).rejects.toThrow(UnauthorizedException); // Still throws for wrong code
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
        expect(prisma.user.update).toHaveBeenCalledWith({
             where: { id: userWithMaxAttempts.id },
             data: { verificationAttempts: 0 }
        });
    });
  });

  describe('refreshTokens', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashedPassword', // Include password for completeness, though it should be excluded in return
      name: 'Test User',
      username: 'testuser',
      isVerified: true,
      twoFactorEnabled: false,
      twoFactorMethod: null,
      recoveryEmail: null,
      recoveryPhone: null,
      verificationCode: null,
      verificationCodeExpiresAt: null,
      verificationAttempts: 0,
      lastVerificationAttempt: null,
      avatarUrl: null,
      refreshToken: 'valid_refresh_token',
      refreshTokenExpiresAt: addHours(new Date(), 30 * 24), // Valid for 30 days
      bio: null,
    };

    it('should return new access and refresh tokens on successful refresh', async () => {
      const mockDate = new Date();
      // Mock Date to control time in tests, including Date.now()
      jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate.getTime()); // Mock Date.now()
      (addHours as jest.Mock).mockReturnValue(new Date(mockDate.getTime() + 30 * 24 * 60 * 60 * 1000)); // Mock addHours

      // Exclude verification fields from the mock user object before resolving
      // Exclude verification fields from the mock user object before resolving
      const userWithoutVerificationFields: any = { ...mockUser }; // Cast to any
      delete userWithoutVerificationFields.verificationCode;
      delete userWithoutVerificationFields.verificationCodeExpiresAt;
      delete userWithoutVerificationFields.verificationAttempts;
      delete userWithoutVerificationFields.lastVerificationAttempt;
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(userWithoutVerificationFields);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        refreshToken: 'new_mock_refresh_token',
        refreshTokenExpiresAt: new Date(mockDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      });
      (crypto.randomBytes as jest.Mock).mockReturnValue({ toString: jest.fn().mockReturnValue('new_mock_refresh_token') });


      const result = await service.refreshTokens('valid_refresh_token');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          refreshToken: 'valid_refresh_token',
          refreshTokenExpiresAt: {
            gt: expect.any(Date), // Check if it's comparing against a Date
          },
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email, sub: mockUser.id });
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect((crypto.randomBytes(32) as any).toString).toHaveBeenCalledWith('hex');
      // Check if addHours was called with a Date object and the correct number of hours
      expect(addHours).toHaveBeenCalledWith(expect.any(Date), 30 * 24);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          refreshToken: 'new_mock_refresh_token',
          refreshTokenExpiresAt: new Date(mockDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      expect(result).toEqual({
        access_token: 'mock_access_token_user-id',
        refresh_token: 'new_mock_refresh_token',
        user: { // Ensure sensitive fields are excluded
            id: 'user-id',
            email: 'test@example.com',
            name: 'Test User',
            username: 'testuser',
            isVerified: true,
            twoFactorEnabled: false,
            twoFactorMethod: null,
            recoveryEmail: null,
            recoveryPhone: null,
            avatarUrl: null,
            bio: null,
        },
      });
    });

    it('should throw UnauthorizedException if refresh token is not found', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.refreshTokens('nonexistent_refresh_token')).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          refreshToken: 'nonexistent_refresh_token',
          refreshTokenExpiresAt: {
            gt: expect.any(Date),
          },
        },
      });
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if refresh token has expired', async () => {
      const expiredUser = {
        ...mockUser,
        refreshTokenExpiresAt: addHours(new Date(), -1), // Expired 1 hour ago
      };
      // Mock prisma.user.findFirst to return null, simulating that Prisma doesn't find a user with an expired token
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.refreshTokens('expired_refresh_token')).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          refreshToken: 'expired_refresh_token',
          refreshTokenExpiresAt: {
            gt: expect.any(Date),
          },
        },
      });
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
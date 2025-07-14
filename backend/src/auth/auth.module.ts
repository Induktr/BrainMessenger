import { Module, forwardRef, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { AuthController } from './auth.controller'; // Import AuthController
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy'; // Import GoogleStrategy
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { WsJwtAuthGuard } from './ws-jwt-auth.guard';


@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('Fatal Error: JWT_SECRET environment variable is not set');
        }
        return {
          secret: secret,
          signOptions: { expiresIn: '8h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController], // Add AuthController here
  providers: [AuthService, AuthResolver, JwtStrategy, GoogleStrategy, Logger, JwtAuthGuard, WsJwtAuthGuard], // Add GoogleStrategy here
  exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
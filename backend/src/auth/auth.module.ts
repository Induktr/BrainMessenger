import { Module, forwardRef, Logger } from '@nestjs/common'; // Import forwardRef and Logger
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
 imports: [
   forwardRef(() => UserModule), // Use forwardRef to break circular dependency
   PassportModule.register({ defaultStrategy: 'jwt', session: false }), // Configure PassportModule to be stateless
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
  providers: [AuthService, AuthResolver, JwtStrategy, Logger, JwtAuthGuard], // Provide Logger and JwtAuthGuard
  exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
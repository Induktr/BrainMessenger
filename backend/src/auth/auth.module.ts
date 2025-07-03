import { Module, forwardRef, Logger } from '@nestjs/common'; // Import forwardRef and Logger
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
<<<<<<< HEAD
import { JwtAuthGuard } from './jwt-auth.guard';
=======
>>>>>>> f701f644797923ab65532d63750f4fcba8d1b5df

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
<<<<<<< HEAD
  providers: [AuthService, AuthResolver, JwtStrategy, Logger, JwtAuthGuard], // Provide Logger and JwtAuthGuard
  exports: [AuthService, JwtModule, JwtAuthGuard],
=======
  providers: [AuthService, AuthResolver, JwtStrategy, Logger], // Provide Logger
  exports: [AuthService, JwtModule],
>>>>>>> f701f644797923ab65532d63750f4fcba8d1b5df
})
export class AuthModule {}
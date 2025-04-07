import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
// import { NhostModule } from '../nhost/nhost.module'; // Removed Nhost
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService
import { MailModule } from '../mail/mail.module'; // Импортируем MailModule

@Module({
 imports: [
   UserModule,
   PassportModule,
   MailModule, // Добавляем MailModule в импорты
   // Use registerAsync to inject ConfigService and read JWT_SECRET from env
   JwtModule.registerAsync({
     imports: [ConfigModule], // Import ConfigModule here as well
     useFactory: async (configService: ConfigService) => {
       const secret = configService.get<string>('JWT_SECRET');
       if (!secret) {
         // Throw an error during startup if the secret is missing
         throw new Error('Fatal Error: JWT_SECRET environment variable is not set');
       }
       return {
         secret: secret, // Read from env
         signOptions: { expiresIn: '1h' }, // Or read from env if needed: configService.get('JWT_EXPIRATION_TIME') || '1h'
       };
     },
     inject: [ConfigService], // Inject ConfigService into the factory
   }),
   // NhostModule, // Removed Nhost
 ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

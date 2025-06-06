import { Module, forwardRef } from '@nestjs/common'; // Import forwardRef
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { CloudflareModule } from '../cloudflare/cloudflare.module';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    CloudflareModule,
    MailModule,
    forwardRef(() => AuthModule), // Use forwardRef to break circular dependency
    JwtModule.register({}),
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}

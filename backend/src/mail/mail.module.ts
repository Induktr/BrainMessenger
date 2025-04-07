import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailResolver } from './mail.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  providers: [MailService, MailResolver],
  exports: [MailService], // Экспортируем MailService для использования в AuthModule
})
export class MailModule {}

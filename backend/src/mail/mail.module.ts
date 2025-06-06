// backend/src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule

@Module({
  imports: [ConfigModule], // Import ConfigModule to use environment variables
  providers: [MailService],
  exports: [MailService], // Export MailService so other modules can use it
})
export class MailModule {}

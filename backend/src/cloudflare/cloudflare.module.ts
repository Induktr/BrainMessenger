import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule if not already global
import { CloudflareR2Service } from './cloudflare-r2.service';

@Module({
  imports: [ConfigModule], // Ensure ConfigService is available
  providers: [CloudflareR2Service],
  exports: [CloudflareR2Service], // Export the service for other modules to use
})
export class CloudflareModule {}
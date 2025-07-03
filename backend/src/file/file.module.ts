import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileResolver } from './file.resolver';
import { CloudflareModule } from '../cloudflare/cloudflare.module'; // Import CloudflareModule

@Module({
  imports: [CloudflareModule], // Import CloudflareModule to make CloudflareR2Service available
  providers: [FileService, FileResolver],
  exports: [FileService], // Export service if needed by other modules
})
export class FileModule {}
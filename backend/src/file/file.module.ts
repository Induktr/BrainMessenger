import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileResolver } from './file.resolver';
import { AwsModule } from '../aws/aws.module'; // Import AwsModule

@Module({
  imports: [AwsModule], // Import AwsModule to make AwsS3Service available
  providers: [FileService, FileResolver],
  exports: [FileService], // Export service if needed by other modules
})
export class FileModule {}
import { Injectable, InternalServerErrorException, NotFoundException, NotImplementedException } from '@nestjs/common'; // Added NotImplementedException
import { PrismaService } from '../prisma/prisma.service';
import { CloudflareR2Service } from '../cloudflare/cloudflare-r2.service'; // Import R2 Service
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { createReadStream, ReadStream } from 'fs'; // Keep ReadStream for type hint if needed
// Removed FileUpload import, using any for now

// Removed streamToBuffer helper function

// Removed getKeyFromUrl helper function (was S3 specific)


@Injectable()
export class FileService {
  constructor(
    private prisma: PrismaService,
    private cloudflareR2Service: CloudflareR2Service, // Inject R2 Service
  ) {}

  // Using 'any' for FileUpload and return type
  async uploadFile(fileUpload: any /* FileUpload */, uploaderId: string): Promise<any> {
    const { createReadStream, filename, mimetype } = await fileUpload;
    if (!createReadStream || !filename || !mimetype) {
        throw new InternalServerErrorException('Invalid file upload object received.');
    }
    const stream = createReadStream(); // This is the Readable stream
    const uniqueFilename = `${Date.now()}-${filename}`;

    try {
      // Define the key for R2 (e.g., using a folder structure)
      const r2Key = `uploads/${uploaderId}/${uniqueFilename}`;

      // Upload the file stream to R2
      const uploadResult = await this.cloudflareR2Service.uploadFile(stream, r2Key, mimetype);

      if (!uploadResult || !uploadResult.Location) {
        throw new InternalServerErrorException('Failed to upload file to R2');
      }

      // TODO: Determine file size accurately.
      // This might require reading headers or buffering the stream before upload.
      let fileSize = 0; // Placeholder

      // Save file metadata to the database
      const fileData: Prisma.FileCreateInput = {
        name: filename,
        url: uploadResult.Location, // Store the R2 public URL
        size: fileSize,
        type: mimetype,
        uploader: { connect: { id: uploaderId } },
        // Add messageId, chatId if needed based on your schema
      };

      const savedFile = await this.prisma.file.create({ data: fileData });
      return savedFile;

    } catch (error) {
      console.error('Error uploading file:', error);
      // Note: No need to manually delete from R2 on DB error here,
      // as the file might not have been successfully uploaded if uploadResult is invalid.
      // Consider more robust error handling/cleanup if needed.
      throw new InternalServerErrorException('Failed to process file upload.');
    }
  }

  // Using 'any' temporarily for return type
  async getFilesByUser(userId: string): Promise<any[]> {
    // Accessing model via string index as workaround
    return this.prisma['file'].findMany({
      where: { uploaderId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteFile(fileId: string, userId: string): Promise<boolean> {
     // Accessing model via string index as workaround
    const file = await this.prisma['file'].findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found.`);
    }

    if (file.uploaderId !== userId) {
      throw new Error('User not authorized to delete this file.');
    }

    // Extract the R2 key from the stored URL
    let r2Key: string | null = null;
    try {
      // Assuming URL is like https://<endpoint>/<bucket>/<key>
      const urlParts = new URL(file.url);
      const bucketName = this.cloudflareR2Service.bucketName; // Access bucket name from service
      if (urlParts.pathname.startsWith(`/${bucketName}/`)) {
          r2Key = urlParts.pathname.substring(`/${bucketName}/`.length);
      }
    } catch (e) {
       console.error(`Error parsing file URL for R2 key: ${file.url}`, e);
       throw new InternalServerErrorException('Could not determine file key for deletion.');
    }

    if (!r2Key) {
        console.error(`Could not extract R2 key from URL: ${file.url}`);
        throw new InternalServerErrorException('Could not process file deletion.');
    }

    try {
      // Delete from R2 first
      await this.cloudflareR2Service.deleteFile(r2Key);

      // Then delete from the database
      await this.prisma.file.delete({ where: { id: fileId } });
      return true;
    } catch (error) {
      // If R2 deletion fails but DB deletion succeeds, or vice versa,
      // you might have orphaned data. Consider more robust transaction/cleanup logic.
      console.error(`Error deleting file ${fileId} (key: ${r2Key}):`, error);
      throw new InternalServerErrorException('Failed to delete file.');
    }
  }
}
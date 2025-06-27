import { Injectable, InternalServerErrorException, NotFoundException, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudflareR2Service } from '../cloudflare/cloudflare-r2.service';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Readable } from 'stream'; // Import Readable stream 
import { Logger } from '@nestjs/common';

@Injectable()
export class FileService {
  constructor(
    private prisma: PrismaService,
    private cloudflareR2Service: CloudflareR2Service,
  ) {}
  private readonly logger = new Logger(FileService.name);

  // Using 'any' for FileUpload and return type
  async uploadFile(fileUpload: any /* FileUpload */, uploaderId: string): Promise<any> {
    const { createReadStream, filename, mimetype } = await fileUpload;
    if (!createReadStream || !filename || !mimetype) {
        throw new InternalServerErrorException('Invalid file upload object received.');
    }
    const stream = createReadStream(); // This is the Readable stream
    const uniqueFilename = `${Date.now()}-${filename}`;
    
    try {
      // Read the stream into a buffer to get its length (ContentLength)
      const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });

      // Define the key for R2 (e.g., using a folder structure)
      const r2Key = `uploads/${uploaderId}/${uniqueFilename}`;

      // Upload the file buffer to R2, providing ContentLength
      const uploadResult = await this.cloudflareR2Service.uploadFile(fileBuffer, r2Key, mimetype, fileBuffer.length);

      if (!uploadResult || !uploadResult.Location) {
        throw new InternalServerErrorException('Failed to upload file to R2');
      }

      const fileSize = fileBuffer.length; // File size is now known from the buffer
      
      // Save file metadata to the database
      const fileData: Prisma.FileCreateInput = {
        name: filename,
        url: uploadResult.Location, // Store the R2 public URL
        size: fileSize, // Use fetched size
        type: mimetype,
        uploader: { connect: { id: uploaderId } },
        // Add messageId, chatId if needed based on your schema
      };

      const savedFile = await this.prisma.file.create({ data: fileData });
      return savedFile;

    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw new InternalServerErrorException('Failed to process file upload.');
    }
  }

  // Using 'any' temporarily for return type
  async getFilesByUser(userId: string, limit?: number, offset?: number): Promise<any[]> {
    return this.prisma['file'].findMany({
      where: { uploaderId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            isVerified: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });
  }

  async deleteFile(fileId: string, userId: string): Promise<boolean> {
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
      const urlParts = new URL(file.url);
      const bucketName = this.cloudflareR2Service.bucketName;
      if (urlParts.pathname.startsWith(`/${bucketName}/`)) {
          r2Key = urlParts.pathname.substring(`/${bucketName}/`.length);
      }
    } catch (e) {
       this.logger.error(`Error parsing file URL for R2 key: ${file.url}`, e);
       throw new InternalServerErrorException('Could not determine file key for deletion.');
    }

    if (!r2Key) {
        this.logger.error(`Could not extract R2 key from URL: ${file.url}`);
        throw new InternalServerErrorException('Could not process file deletion.');
    }

    try {
      // Delete from R2 first
      await this.cloudflareR2Service.deleteFile(r2Key);

      // Then delete from the database
      await this.prisma.file.delete({ where: { id: fileId } });
      return true;
    } catch (error) {
      this.logger.error(`Error deleting file ${fileId} (key: ${r2Key}):`, error);
      throw new InternalServerErrorException('Failed to delete file.');
    }
  }
}
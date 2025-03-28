import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AwsS3Service } from '../aws/aws-s3.service';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { createReadStream, ReadStream } from 'fs'; // Keep ReadStream for type hint if needed
// Removed FileUpload import, using any for now

// Removed streamToBuffer helper function

// Helper function to extract S3 key from URL
const getKeyFromUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    // Remove leading slash if present, assuming key is like 'uploads/filename.ext'
    const key = pathname.startsWith('/') ? pathname.substring(1) : pathname;
    // Decode URI components in case filename has special characters
    return decodeURIComponent(key);
  } catch (e) {
    console.error("Error parsing S3 URL:", e);
    return null;
  }
};


@Injectable()
export class FileService {
  constructor(
    private prisma: PrismaService,
    private awsS3Service: AwsS3Service,
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
      // Pass the stream directly to AwsS3Service
      const uploadResult = await this.awsS3Service.uploadFile(stream, uniqueFilename);

      if (!uploadResult || !uploadResult.Location) {
        throw new InternalServerErrorException('Failed to upload file to S3');
      }

      // TODO: Determine file size accurately.
      // This might require reading headers or buffering, depending on setup.
      let fileSize = 0; // Placeholder

      const fileData: any /* Prisma.FileCreateInput */ = {
        name: filename,
        url: uploadResult.Location,
        size: fileSize,
        type: mimetype,
        uploader: { connect: { id: uploaderId } },
      };

      // Accessing model via string index as workaround
      const savedFile = await this.prisma['file'].create({ data: fileData });
      return savedFile;

    } catch (error) {
      console.error('Error uploading file:', error);
      // Consider deleting from S3 if DB save fails
      // await this.awsS3Service.deleteFile(uniqueFilename); // Use uniqueFilename as key
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

    const s3Key = getKeyFromUrl(file.url);
    if (!s3Key) {
        console.error(`Could not extract S3 key from URL: ${file.url}`);
        throw new InternalServerErrorException('Could not process file deletion.');
    }

    try {
      // Pass the extracted key to deleteFile
      await this.awsS3Service.deleteFile(s3Key);

       // Accessing model via string index as workaround
      await this.prisma['file'].delete({ where: { id: fileId } });
      return true;
    } catch (error) {
      console.error(`Error deleting file ${fileId} (key: ${s3Key}):`, error);
      throw new InternalServerErrorException('Failed to delete file.');
    }
  }
}
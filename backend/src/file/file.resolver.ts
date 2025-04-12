import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { FileService } from './file.service';
import { FileDto } from './dto/file.dto';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts'; // Use types from graphql-upload-ts
import { UserDto } from '../user/dto/user.dto'; // Needed for mapping

// Helper function to map Prisma File (currently 'any') to FileDto
// TODO: Update this when FileService returns proper Prisma types
const mapFileToDto = (file: any): FileDto | null => {
  if (!file) return null;
  // Basic mapping, assuming 'file' has the necessary properties
  return {
    id: file.id,
    name: file.name,
    url: file.url,
    size: file.size,
    type: file.type,
    createdAt: file.createdAt,
    // Assuming uploader is included or fetched separately if needed by DTO
    uploader: file.uploader ? {
        id: file.uploader.id,
        name: file.uploader.name,
        email: file.uploader.email,
        isVerified: file.uploader.isVerified, // Добавлено поле isVerified
    } : null, // Map uploader or provide default/null
  };
};


@Resolver(() => FileDto)
export class FileResolver {
  constructor(private readonly fileService: FileService) {}

  // TODO: Add AuthGuard and get uploaderId from authenticated user context
  @Mutation(() => FileDto)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
    // @Args('uploaderId', { type: () => ID }) uploaderId: string // Get from context instead
  ): Promise<FileDto> {
     const uploaderId = 'user123'; // Placeholder for authenticated user ID
     const uploadedFile = await this.fileService.uploadFile(file, uploaderId);
     const mappedFile = mapFileToDto(uploadedFile);
     if (!mappedFile) {
         throw new Error("Failed to process uploaded file data."); // Should not happen if service throws
     }
     return mappedFile;
  }

  // TODO: Add AuthGuard and get userId from authenticated user context
  @Query(() => [FileDto], { name: 'getFiles' })
  async getFilesByUser(
     // @Args('userId', { type: () => ID }) userId: string // Get from context
  ): Promise<FileDto[]> {
    const userId = 'user123'; // Placeholder for authenticated user ID
    const files = await this.fileService.getFilesByUser(userId);
    return files.map(file => mapFileToDto(file)).filter(dto => dto !== null) as FileDto[];
  }

   // TODO: Add AuthGuard and get userId from authenticated user context
  @Mutation(() => Boolean)
  async deleteFile(
    @Args('fileId', { type: () => ID }) fileId: string,
     // @Args('userId', { type: () => ID }) userId: string // Get from context
  ): Promise<boolean> {
     const userId = 'user123'; // Placeholder for authenticated user ID
    return this.fileService.deleteFile(fileId, userId);
  }

  // TODO: Add mutations/queries for sharing, favorites etc.
}
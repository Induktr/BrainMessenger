import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { UserDto } from '../../user/dto/user.dto'; // Import UserDto

@ObjectType()
export class FileDto {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  url: string; // S3 URL

  @Field(() => Int)
  size: number; // Size in bytes

  @Field()
  type: string; // MIME type

  @Field(() => UserDto, { nullable: true }) // Make uploader nullable
  uploader: UserDto | null; // Allow null

  @Field()
  createdAt: Date;

  // Add other fields like lastModified, sharedWith, favorite if implemented
}
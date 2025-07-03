import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, Length, Matches, IsOptional } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  username?: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @Length(6, 50) // Increased max length to match frontend
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()]).*$/, { message: 'Password must contain at least one uppercase letter and one special character' }) // Added complexity validation
  password: string;
}

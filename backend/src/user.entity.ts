import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
@Entity('users')
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  password: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  twoFactorMethod: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  recoveryEmail: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  recoveryPhone: string;
}

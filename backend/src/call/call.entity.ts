import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
@Entity('calls')
export class Call {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  callerId: string;

  @Field()
  @Column()
  calleeId: string;

  @Field()
  @Column()
  chatId: string;

  @Field()
  @Column()
  status: string;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from './user.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('messages')
export class Message {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Chat)
  @ManyToOne(() => Chat)
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Field()
  @Column({ type: 'uuid' })
  chatId: string;

  @Field()
  @Column()
  content: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Field()
  @Column({ type: 'uuid' })
  senderId: string;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call } from './call.entity';
import { PubSub } from 'graphql-subscriptions';
import { v4 as uuidv4 } from 'uuid';

const pubSub = new PubSub();

@Injectable()
export class CallService {
  constructor(
    @InjectRepository(Call)
    private callRepository: Repository<Call>,
  ) {}

  async initiateCall(callerId: string, calleeId: string, chatId: string): Promise<Call> {
    const call = this.callRepository.create({
      callerId,
      calleeId,
      chatId,
      status: 'ringing',
    });
    call.id = uuidv4();

    await this.callRepository.save(call);
    pubSub.publish('callEvents', { callEvents: call });
    return call;
  }

  async acceptCall(callId: string): Promise<Call> {
    const call = await this.callRepository.findOne({ where: { id: callId } });
    if (!call) {
      throw new Error('Call not found');
    }

    call.status = 'in_progress';
    await this.callRepository.save(call);
    //pubSub.publish('callEvents', { callEvents: call }); //Re-enable this later
    return call;
  }

  async endCall(callId: string): Promise<boolean> {
    const call = await this.callRepository.findOne({ where: { id: callId } });
    if (!call) {
      return false;
    }
    call.status = 'ended';
    await this.callRepository.save(call);
    pubSub.publish('callEvents', { callEvents: call });
    return true;
  }
}

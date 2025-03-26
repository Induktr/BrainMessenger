import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { NhostModule } from '../nhost/nhost.module';

@Module({
  imports: [NhostModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}

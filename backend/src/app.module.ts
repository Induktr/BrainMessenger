import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { NhostModule } from './nhost/nhost.module';
import { CallModule } from './call/call.module';
import { WebrtcSignalingGateway } from './webrtc-signaling';
import { CallHistoryModule } from './call-history/call-history.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from './orm.config';
import { AwsModule } from './aws/aws.module';
import { PrivacySettingsModule } from './privacy-settings/privacy-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule.register({
      global: true,
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
    }),
    TypeOrmModule.forRoot({
      ...dataSource.options,
      autoLoadEntities: true,
    }),
    NhostModule,
    AwsModule,
    UserModule,
    AuthModule,
    ChatModule,
    MessageModule,
    MailModule,
    CallModule,
    CallHistoryModule,
    PrivacySettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, WebrtcSignalingGateway],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { PrivacySettingsService } from './privacy-settings.service';

@Module({
  providers: [PrivacySettingsService],
  exports: [PrivacySettingsService],
})
export class PrivacySettingsModule {}

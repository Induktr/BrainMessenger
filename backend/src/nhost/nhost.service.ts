import { Injectable } from '@nestjs/common';
import { NhostClient } from '@nhost/nhost-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NhostService {
  private nhost: NhostClient;

  constructor(private configService: ConfigService) {
    this.nhost = new NhostClient({
      subdomain: this.configService.get<string>('NHOST_SUBDOMAIN'),
      region: this.configService.get<string>('NHOST_REGION'),
    });
  }

  getNhostClient(): NhostClient {
    return this.nhost;
  }
}

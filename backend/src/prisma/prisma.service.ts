import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Note: this.$connect() is optional and is called automatically
    // upon the first query. We explicitly call it here to ensure
    // the database connection is established during startup.
    await this.$connect();
    console.log('Prisma Client connected');
  }

  async onModuleDestroy() {
    // Optional: Close the connection when the module is destroyed
    await this.$disconnect();
    console.log('Prisma Client disconnected');
  }
}
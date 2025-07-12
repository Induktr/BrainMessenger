import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, FeedbackComplaint } from '@prisma/client';
import { Logger } from '@nestjs/common';

 
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Add connection pool configuration
      // These values might need tuning based on your database server and load
      log: ['info', 'warn', 'error', 'query'], // Add 'query' to log all database queries
      errorFormat: 'pretty', // Optional: pretty print errors
    });
  }
  private readonly logger = new Logger(PrismaService.name);
  private logPoolStats() {
    const pool = (this as any)._engine?.client?.pool;
    if (pool) {
      // console.log('Database connection pool stats:', { // Removed excessive log
      //   total: pool.totalCount,
      //   idle: pool.idleCount,
      //   waiting: pool.waitingCount
      // });
      
      // Warning if approaching connection limit (80% of max)
      if (pool.totalCount / pool.options.max > 0.8) {
        this.logger.warn('WARNING: Approaching database connection limit!');
      }
    }
  }

  async onModuleInit() {
    await this.$connect();
    // console.log('Prisma Client connected'); // Removed excessive log
    
    // Log initial pool stats
    this.logPoolStats();
    
    // Setup periodic monitoring every 5 minutes
    setInterval(() => this.logPoolStats(), 5 * 60 * 1000);
  }

  async onModuleDestroy() {
    // Optional: Close the connection when the module is destroyed
    await this.$disconnect();
    // console.log('Prisma Client disconnected'); // Removed excessive log
  }
}
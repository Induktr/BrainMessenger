import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager'; // Correct import for CACHE_MANAGER

const THROTTLE_TIME_MS = 30 * 1000; // 30 seconds

@Injectable()
export class UpdateLastActiveGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    if (req.user && req.user.id) {
      const userId = req.user.id;
      const lastUpdateTime = await this.cacheManager.get<number>(`last_active_update:${userId}`);

      if (!lastUpdateTime || (Date.now() - lastUpdateTime) > THROTTLE_TIME_MS) {
        // Update lastActiveAt for the authenticated user
        await this.prisma.user.update({
          where: { id: userId },
          data: { lastActiveAt: new Date() },
        });
        // The ttl parameter for cacheManager.set is a number representing seconds
        await this.cacheManager.set(`last_active_update:${userId}`, Date.now(), THROTTLE_TIME_MS / 1000);
      }
    }
    return true; // Always allow the request to proceed
  }
}
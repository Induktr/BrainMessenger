import { ExecutionContext, Injectable, CallHandler, Logger } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { User } from '../../auth/interfaces/user.interface'; // Import User interface

@Injectable()
export class UserCacheInterceptor extends CacheInterceptor {
  private readonly logger = new Logger(UserCacheInterceptor.name);

  // Override the intercept method to ensure it calls super.intercept
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    this.logger.debug('UserCacheInterceptor: Intercepting request.');
    return super.intercept(context, next);
  }

  // Override trackBy to generate a cache key specific to GraphQL requests
  // and include user ID for personalized caching.
  trackBy(context: ExecutionContext): string | undefined {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo(); // Contains AST of the query
    const args = gqlContext.getArgs(); // Contains arguments passed to the resolver
    const user: User = gqlContext.getContext().req?.user; // Get the authenticated user from the request context

    // If no user is authenticated, or if it's a subscription, we might not want to cache.
    // Subscriptions are real-time and typically not cached in this manner.
    if (!user || info.operation.operation === 'subscription') {
      this.logger.debug(`UserCacheInterceptor: Bypassing cache for user: ${user?.id || 'N/A'}, operation type: ${info.operation.operation}`);
      return undefined; // Do not cache
    }

    // Generate a unique cache key based on operation name, arguments, and user ID.
    // This ensures that different users get different cached data, and different
    // arguments for the same query result in different cache entries.
    const cacheKey = `${info.fieldName}-${JSON.stringify(args)}-${user.id}`;
    this.logger.debug(`UserCacheInterceptor: Generated cache key: ${cacheKey}`);
    return cacheKey;
  }
}
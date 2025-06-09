import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager'; // Correct import for CacheInterceptor
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class UserCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const request = gqlContext.getContext().req;

    // Check if it's a GraphQL request and if user is authenticated
    if (info && request && request.user && request.user.id) {
      // Generate a unique cache key based on the GraphQL operation name and user ID
      // For example, for 'getChats' query, the key would be 'getChats-userId'
      return `${info.fieldName}-${request.user.id}`;
    }

    // Fallback to default behavior or skip caching if no user context
    return super.trackBy(context);
  }
}
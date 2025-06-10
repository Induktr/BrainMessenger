import { ExecutionContext, Injectable, CallHandler } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs'; // Import Observable

@Injectable()
export class UserCacheInterceptor extends CacheInterceptor {
  async intercept(context: ExecutionContext, call$: CallHandler): Promise<Observable<any>> {
    // Temporarily bypass caching logic to resolve "Cannot read properties of undefined (reading 'method')" error.
    // This interceptor needs to be re-evaluated for proper GraphQL caching.
    // Ensure the method is async to return a Promise<Observable<any>> as required by CacheInterceptor.
    return call$.handle();
  }

  // We no longer need to override trackBy explicitly if we override intercept
  // However, if the base intercept method still calls trackBy internally,
  // we might need to keep a simplified trackBy or ensure it doesn't cause issues.
  // For now, let's assume overriding intercept is sufficient.
}
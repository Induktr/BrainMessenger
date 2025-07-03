import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext): any {
    const ctx = GqlExecutionContext.create(context).getContext();
    // For HTTP, we return the request object for Passport's strategy to use.
    // For WS, the request object is not what we need, but Passport requires something to be returned.
    // The actual user object will be retrieved from the context in `handleRequest`.
    return ctx.req;
  }

  handleRequest(err, user, info, context) {
    const ctx = GqlExecutionContext.create(context).getContext();

    // For WebSocket connections, the user object is attached in `onConnect`.
    // We retrieve it from the context directly.
    if (ctx.user) {
      return ctx.user;
    }

    // For HTTP requests, Passport populates the `user` object.
    // If there's an error or the user is not found, we throw an exception.
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed for HTTP request.');
    }

    return user;
  }


}
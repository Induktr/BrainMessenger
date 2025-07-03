<<<<<<< HEAD
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
=======
import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
>>>>>>> f701f644797923ab65532d63750f4fcba8d1b5df
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
<<<<<<< HEAD
=======
  private readonly logger = new Logger(JwtAuthGuard.name);

>>>>>>> f701f644797923ab65532d63750f4fcba8d1b5df
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
<<<<<<< HEAD
      return true;
    }

=======
      this.logger.log('[JwtAuthGuard] Public route detected. Allowing access.');
      return true; // Allow access to public routes
    }

    // For protected routes, proceed with default authentication
>>>>>>> f701f644797923ab65532d63750f4fcba8d1b5df
    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext): any {
<<<<<<< HEAD
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


=======
    this.logger.log(`[JwtAuthGuard] getRequest called for context type: ${context.getType()}`);

    if (context.getType() === 'http') {
      // For standard REST requests
      this.logger.log('[JwtAuthGuard] Handling HTTP request.');
      return context.switchToHttp().getRequest();
    }

    // For GraphQL requests (queries, mutations, subscriptions)
    this.logger.log('[JwtAuthGuard] Handling GraphQL/WS request.');
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(err, user, info, context, status) {
    this.logger.log(`[JwtAuthGuard] handleRequest called. Info: ${info?.message || info || 'N/A'}`);

    if (err || !user) {
      this.logger.error(`[JwtAuthGuard] Authentication failed. Info: ${info?.message}`);
      throw err || new UnauthorizedException('Authentication failed: Invalid token or user not found.');
    }

    this.logger.log(`[JwtAuthGuard] User successfully authenticated: ${user.id}`);
    return user;
  }
>>>>>>> f701f644797923ab65532d63750f4fcba8d1b5df
}
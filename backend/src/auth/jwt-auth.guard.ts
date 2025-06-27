import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log('[JwtAuthGuard] Public route detected. Allowing access.');
      return true; // Allow access to public routes
    }

    // For protected routes, proceed with default authentication
    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext): any {
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
}
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const { request, connection } = ctx.getContext();

    console.log('[JwtAuthGuard] canActivate called. Request:', request ? 'exists' : 'null', 'Connection:', connection ? 'exists' : 'null');
    if (connection) {
      console.log('[JwtAuthGuard] Connection context:', connection.context);
    }

    // For HTTP requests (queries/mutations)
    if (request) {
      return super.canActivate(context);
    }

    // For WebSocket connections (subscriptions), the user payload is directly attached to connection.context by onConnect
    // For WebSocket connections (subscriptions), ensure Passport.js flow is triggered
    // The token is already validated in onConnect, and user is attached to connection.context.user
    // We need to ensure this user is available via the standard req.user for guards/decorators
    if (connection) {
      // Attach the user from connection.context to the request object for Passport to pick up
      // This mimics the behavior for HTTP requests where Passport populates req.user
      // We create a dummy request object for Passport to process
      const dummyRequest = {
        ...request, // Preserve any existing request properties if available
        user: connection.context.user, // Attach the authenticated user
        // Add other properties if needed by Passport or subsequent guards
      };
      // Override the context's request with our dummy request
      Object.defineProperty(ctx.getContext(), 'req', { value: dummyRequest, writable: true });
      return super.canActivate(context);
    }
    // If neither an HTTP request nor a WebSocket connection with context, deny activation
    return false;
  }

  // getRequest is no longer explicitly overridden for WebSocket as super.canActivate will handle it
  // by using the modified context.req.
  // We can remove this override if the base AuthGuard's getRequest correctly handles the modified context.
  // If issues persist, we might need to re-evaluate this.
  // For now, let's rely on the modification in canActivate.

  handleRequest(err, user, info, context, status) {
    if (err || !user) {
      throw err || new UnauthorizedException('Could not authenticate with token');
    }
    // For WebSocket connections, the user is already authenticated by onConnect
    // and attached to connection.context. We simply return the user.
    // For HTTP requests, Passport will attach the user to req.user.
    return user;
  }
}
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
    if (connection && connection.context) {
      // If the user is already authenticated via the WebSocket connection, allow activation
      return true;
    }
    // If neither an HTTP request nor an authenticated WebSocket connection, deny activation
    return false;
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    // For HTTP requests, return the standard request object
    // For WebSocket connections, return a request-like object with the user attached
    // For WebSocket connections, return the connection.context which now contains the user
    if (ctx.getContext().connection) {
      const connectionContext = ctx.getContext().connection.context;
      console.log('[JwtAuthGuard] getRequest returning for WebSocket (connection.context):', connectionContext ? 'exists' : 'null');
      // Return a request-like object with the user attached to the 'user' property
      return { user: connectionContext.user };
    }
    const requestObject = ctx.getContext().request;
    console.log('[JwtAuthGuard] getRequest returning for HTTP:', requestObject ? 'exists' : 'null');
    return requestObject;
  }

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
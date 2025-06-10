import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super('jwt', { session: false });
  }
    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        let { req, connection } = ctx.getContext();

        if (req && req.headers) {
            console.log('[JwtAuthGuard] Incoming Authorization header:', req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'No Authorization header');
        }

        // For WebSocket connections (subscriptions), the token is in connection.context.Authorization
        if (connection) {
            // Ensure req object exists and has a headers property for Passport-JWT
            if (!req) {
                req = { headers: {} };
            } else if (!req.headers) {
                req.headers = {};
            }

            // The token is attached to connection.context.token by the onConnect function in GraphQLModule
            const tokenFromContext = connection.context.token;
            if (tokenFromContext) {
                req.headers.authorization = `Bearer ${tokenFromContext}`;
                console.log('[JwtAuthGuard] WebSocket Authorization header set from context.token:', tokenFromContext.substring(0, 20) + '...');
            } else {
                console.warn('[JwtAuthGuard] WebSocket connection.context.token is missing.');
            }

            // Attach the user from WebSocket context if available (e.g., from onConnect)
            if (connection.context.user) {
                req.user = connection.context.user;
                console.log('[JwtAuthGuard] WebSocket user attached from context:', connection.context.user.id);
            }
        }
        
        // Return the request object. Passport.js will attach the user to this.
        return req;
    }

    handleRequest(err, user, info, context, status) {
        const gqlContext = GqlExecutionContext.create(context);
        const req = gqlContext.getContext().req;

        if (err || !user) {
            console.error('[JwtAuthGuard] Authentication failed:', err || 'No user returned');
            throw err || new UnauthorizedException('Could not authenticate with token');
        }
        
        // Explicitly attach the authenticated user to the request object
        req.user = user;
        console.log('[JwtAuthGuard] User successfully authenticated and attached to request:', user.id);
        return user;
    }
}
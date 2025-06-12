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
        const { req, connection } = ctx.getContext();

        // For HTTP requests, req will be present
        if (req) {
            if (req.headers) {
                console.log('[JwtAuthGuard] Incoming HTTP Authorization header:', req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'No Authorization header');
            }
            return req;
        }

        // For WebSocket connections (subscriptions), connection will be present
        if (connection) {
            // Create a dummy request object for Passport-JWT
            const dummyReq = {
                headers: {},
                user: connection.context.user, // User already authenticated and attached by onConnect
            };

            // Passport-JWT's ExtractJwt.fromAuthHeaderAsBearerToken() expects 'authorization' in headers.
            // The token is attached to connection.context.token by the onConnect function in GraphQLModule.
            const tokenFromContext = connection.context.token;
            if (tokenFromContext) {
                dummyReq.headers['authorization'] = `Bearer ${tokenFromContext}`;
                console.log('[JwtAuthGuard] WebSocket Authorization header set from context.token:', tokenFromContext.substring(0, 20) + '...');
            } else {
                console.warn('[JwtAuthGuard] WebSocket connection.context.token is missing. Throwing UnauthorizedException.');
                throw new UnauthorizedException('Authentication token missing for WebSocket connection.');
            }
            
            console.log('[JwtAuthGuard] WebSocket user attached from context:', connection.context.user ? connection.context.user.id : 'No user');
            return dummyReq;
        }

        // Fallback if neither req nor connection is present (should not happen in GraphQL context)
        console.error('[JwtAuthGuard] Neither HTTP request nor WebSocket connection context found.');
        return {}; // Return an empty object to prevent further errors, though this indicates a problem
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
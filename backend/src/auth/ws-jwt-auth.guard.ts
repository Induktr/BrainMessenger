import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class WsJwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(WsJwtAuthGuard.name);

  getRequest(context: ExecutionContext) {
    this.logger.debug(`[WsJwtAuthGuard] Raw ExecutionContext type: ${context.getType()}`);
    this.logger.debug(`[WsJwtAuthGuard] Raw ExecutionContext args: ${JSON.stringify(context.getArgs())}`);

    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    const { connectionParams, req } = gqlContext;

    this.logger.debug(`[WsJwtAuthGuard] GQL Context - connectionParams: ${!!connectionParams}, req: ${!!req}`);
    if (connectionParams) {
      this.logger.debug(`[WsJwtAuthGuard] GQL Context - connectionParams keys: ${Object.keys(connectionParams).join(', ')}`);
      this.logger.debug(`[WsJwtAuthGuard] GQL Context - connectionParams.Authorization: ${connectionParams.Authorization ? 'Present' : 'Missing'}`);
    }
    if (req) {
      this.logger.debug(`[WsJwtAuthGuard] GQL Context - req.headers: ${!!req.headers}`);
      if (req.headers) {
        this.logger.debug(`[WsJwtAuthGuard] GQL Context - req.headers.authorization: ${req.headers.authorization ? 'Present' : 'Missing'}`);
      }
    }

    // For WebSocket subscriptions
    if (connectionParams && (connectionParams.Authorization || connectionParams.authorization)) {
      const token = connectionParams.Authorization || connectionParams.authorization;
      this.logger.debug(`[WsJwtAuthGuard] WebSocket: Extracted token from connectionParams.`);
      // Return a synthetic request object that Passport.js can understand
      return { headers: { authorization: token } };
    }

    // For HTTP queries/mutations
    if (req && req.headers && (req.headers.authorization || req.headers.Authorization)) {
      this.logger.debug(`[WsJwtAuthGuard] HTTP: Extracted token from req.headers.`);
      return req;
    }

    this.logger.warn('[WsJwtAuthGuard] No authorization token found in WebSocket connectionParams or HTTP headers.');
    throw new UnauthorizedException('No authorization token provided for WebSocket or HTTP request.');
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If authentication fails, throw an UnauthorizedException
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token.');
    }
    return user;
  }
}
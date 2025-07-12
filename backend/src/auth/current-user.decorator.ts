import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();

    // For HTTP requests (queries/mutations)
    if (gqlContext.req) {
      return gqlContext.req.user;
    }

    // For WebSocket subscriptions, user is typically attached to connection.context
    if (gqlContext.connection && gqlContext.connection.context) {
      return gqlContext.connection.context.user;
    }

    // If no user found in either context, return undefined or throw an error
    return undefined;
  },
);
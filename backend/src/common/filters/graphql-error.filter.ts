import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';
import * as Sentry from '@sentry/node';

@Catch(GraphQLError)
export class GraphQLErrorFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphQLErrorFilter.name);

  catch(exception: GraphQLError, host: ArgumentsHost) {
    GqlArgumentsHost.create(host);

    this.logger.error(`GraphQL Error: ${exception.message}`, exception.stack);

    // Send to Sentry only if it's not a known client-side error or a validation error
    if (
      exception.extensions?.code !== ApolloServerErrorCode.BAD_USER_INPUT &&
      exception.extensions?.code !== 'GRAPHQL_VALIDATION_FAILED'
    ) {
      Sentry.captureException(exception);
    }

    return exception;
  }
}
import React, { ReactNode } from 'react';
import { ApolloClient, InMemoryCache, HttpLink, split, ApolloLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import AppProviders from './Providers';

interface ApolloProviderProps {
  children: ReactNode;
}

const httpUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql';

const httpLink = new HttpLink({
  uri: httpUrl,
});

const wsLink = typeof window !== 'undefined'
  ? new GraphQLWsLink(
    createClient({
      url: wsUrl,
    })
  )
  : undefined;

const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    )
  : httpLink;

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export function AppApolloProvider({ children }: ApolloProviderProps) {
  return (
    <ApolloProvider client={client}>
      <AppProviders>{children}</AppProviders>
    </ApolloProvider>
  );
}

export default AppApolloProvider;

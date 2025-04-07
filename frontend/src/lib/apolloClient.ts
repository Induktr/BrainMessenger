import { ApolloClient, InMemoryCache, HttpLink, split, ApolloLink, NormalizedCacheObject } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { useMemo } from 'react';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

const httpUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql';

function createIsomorphicLink() {
  // Create links only on the client side where 'window' is defined
  if (typeof window === 'undefined') {
    // Server-side: only use HTTP link
    return new HttpLink({ uri: httpUrl });
  } else {
    // Client-side: use split link for HTTP and WS
    const httpLink = new HttpLink({ uri: httpUrl });

    const wsLink = new GraphQLWsLink(
      createClient({
        url: wsUrl,
      })
    );

    // Use splitLink to route subscriptions via wsLink and other operations via httpLink
    return split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    );
  }
}

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined', // Enable SSR mode on the server
    link: createIsomorphicLink(),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState: NormalizedCacheObject | null = null): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();
    // Restore the cache using the data passed from SSR/SSG/ISR
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

// Hook to use the initialized Apollo Client
export function useApollo(initialState: NormalizedCacheObject | null = null): ApolloClient<NormalizedCacheObject> {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}
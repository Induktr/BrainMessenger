import { ApolloClient, InMemoryCache, HttpLink, split, ApolloLink, NormalizedCacheObject } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { useMemo } from 'react';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

// Use relative path for HTTP requests, which will be handled by Next.js rewrites
const httpUrl = '/api/graphql';
// WebSocket URL still needs the direct address (rewrites don't work for WS)
// Ensure NEXT_PUBLIC_WS_URL is set correctly in your .env.local or environment
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql'; // Fallback might need adjustment if NEXT_PUBLIC_WS_URL isn't set

// Temporarily simplified link creation for debugging
function createHttpLink() {
  // Always use the relative path for HTTP link
  return new HttpLink({ uri: httpUrl });
}

// NOTE: This simplification breaks WebSocket subscriptions.
// We will restore createIsomorphicLink later if this fixes the HTTP issue.

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined', // Enable SSR mode on the server
    link: createHttpLink(), // Use the simplified HTTP link
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
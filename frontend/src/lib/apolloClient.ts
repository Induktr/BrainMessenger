import { ApolloClient, InMemoryCache, HttpLink, split, ApolloLink, NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context'; // Import setContext
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { useMemo } from 'react';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

// Use the environment variable for the full backend URL
const httpUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/graphql/'; // Fallback needed if env var not set
// WebSocket URL still needs the direct address (rewrites don't work for WS)
// Ensure NEXT_PUBLIC_WS_URL is set correctly in your .env.local or environment
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql'; // Fallback might need adjustment if NEXT_PUBLIC_WS_URL isn't set

// Create the HTTP link
const httpLink = new HttpLink({ uri: httpUrl });

// Create the Auth link to add the token to headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  // Ensure this runs only on the client side
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "", // Add the Bearer token
    }
  }
});

// NOTE: WebSocket subscriptions might still be broken with this setup.
// We need to restore the split logic later if subscriptions are needed.
// For now, we focus on fixing HTTP auth.

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined', // Enable SSR mode on the server
    link: authLink.concat(httpLink), // Chain authLink and httpLink
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
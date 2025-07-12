import { ApolloClient, InMemoryCache, split, from } from '@apollo/client';
import { OperationDefinitionNode } from 'graphql';
import { setContext } from '@apollo/client/link/context';
import { HttpLink } from '@apollo/client/link/http';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { onError } from '@apollo/client/link/error';
import { ApolloLink, FetchResult } from '@apollo/client';
import Observable from 'zen-observable';
import { execute, Operation } from '@apollo/client/link/core';
import { REFRESH_TOKEN_MUTATION } from '@/entities/user/model/user.queries';
import * as Sentry from "@sentry/nextjs"; // Import Sentry

// Configure the HTTP link for queries and mutations
// Determine the backend URL dynamically based on the frontend's location
const isBrowser = typeof window !== 'undefined';

const getBackendUrl = (protocol: string) => {
  // Prioritize NEXT_PUBLIC_API_URL for Vercel/production
  if (process.env.NEXT_PUBLIC_API_URL) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (protocol === 'http') {
      return `${baseUrl}/graphql`; // Assuming GraphQL endpoint is /graphql
    } else if (protocol === 'ws') {
      // Assuming WebSocket endpoint is also /graphql, adjust if needed
      // Replace http:// or https:// with ws:// or wss://
      const wsBaseUrl = baseUrl.replace(/^http/, 'ws');
      return `${wsBaseUrl}/graphql`; // Assuming WebSocket endpoint is /graphql
    }
  }

  // Fallback for specific local development/testing scenarios
  const backendPort = 4000; // Your backend port
  if (process.env.NEXT_PUBLIC_RUNNING_IN_DOCKER === 'true') {
    // When running in Docker and accessed from host browser
    if (protocol === 'http') {
      return `http://localhost:${backendPort}/graphql`; // Still use localhost for host access to docker
    } else {
      return `ws://localhost:${backendPort}/graphql`; // Still use localhost for host access to docker
    }
  } else if (process.env.PLAYWRIGHT_TEST) {
    // Use direct backend URL in Playwright test environment
    const backendBaseUrl = `http://localhost:${backendPort}`;
    if (protocol === 'http') {
      return `${backendBaseUrl}/graphql`;
    } else {
      return `ws://localhost:${backendPort}/graphql`;
    }
  } else if (!isBrowser) {
    // Fallback for server-side rendering (SSR) within Docker network
    // This might still be needed if SSR happens within a Docker context
    return `http://backend:${backendPort}/graphql`;
  } else {
    // Default for local development outside Docker (e.g., direct npm run dev)
    if (protocol === 'http') {
      return `http://localhost:${backendPort}/graphql`;
    } else {
      return `ws://localhost:${backendPort}/graphql`;
    }
  }
  // Fallback for cases where no URL can be determined (should ideally not happen in production)
  return protocol === 'http' ? '/graphql' : '/graphql'; // Fallback to relative paths
};

// A mutable object to hold the current access token
const tokenRef = {
  currentAccessToken: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
};

// Function to create and return a new WebSocket client
const createNewWsClient = () => {
  const client = createClient({
    url: getBackendUrl('ws'),
    connectionParams: () => {
      const currentToken = tokenRef.currentAccessToken;
      console.log(
        '[ApolloClient] WebSocket connectionParams: Token',
        currentToken
          ? `Present (first 10 chars: ${currentToken.substring(0, 10)}...)`
          : 'Missing',
      );
      // Only include the Authorization header if the token exists.
      if (currentToken) {
        return {
          Authorization: `Bearer ${currentToken}`,
        };
      }
      // Otherwise, connect without authentication headers.
      return {};
    },
    // Defer the connection until the first subscription is made
    lazy: true,
    retryAttempts: 5, // Number of times to retry connection
  });
  client.on('connected', () =>
    console.log('[ApolloClient] WebSocket connected!'),
  );
  client.on('closed', (event: any) => {
    console.log(
      `[ApolloClient] WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`,
    );
  });
  client.on('error', (err: any) => {
    console.error('[ApolloClient] WebSocket error:', err);
  });
  return client;
};

// A mutable object to hold the WebSocket client instance
let wsClientRef: any | null = null; // Initialize as null, will be created on first token or subscription

// Initialize wsClientRef if token is already present on load
if (typeof window !== 'undefined' && tokenRef.currentAccessToken) {
  console.log('[ApolloClient] Initializing WebSocket client on load with existing token.');
  wsClientRef = createNewWsClient();
}


// Configure the HTTP link for standard queries and mutations
const httpLink = new HttpLink({
  uri: getBackendUrl('http'),
});

// Configure the Upload link for file upload mutations
const uploadLink = createUploadLink({
  uri: getBackendUrl('http'),
  headers: {
    'x-apollo-operation-name': 'FileUploadOperation',
  },
});

// Configure the authentication link
const authLink = setContext(async (operation, { headers }) => {
  // Читаем токен доступа непосредственно из localStorage для каждого запроса
  const currentAccessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  console.log('[ApolloClient] AuthLink - Current Access Token:', currentAccessToken ? 'Present' : 'Missing');
  if (currentAccessToken) {
    console.log('[ApolloClient] AuthLink - Access Token (first 10 chars):', currentAccessToken.substring(0, 10) + '...');
  }

  return {
    headers: {
      ...headers,
      authorization: currentAccessToken ? `Bearer ${currentAccessToken}` : "",
    }
  }
});

// Configure the error handling link
let isRefreshing = false;
let failedQueue: { operation: Operation; forward: any; observer: any }[] = [];

const processQueue = (error: any, access_token: string | null = null) => {
  failedQueue.forEach(({ operation, forward, observer }) => {
    if (error) {
      observer.error(error);
    } else if (access_token) {
      // Update the tokenRef with the new token
      setAccessTokenForApollo(access_token);
      // Retry the operation with the new access token
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          authorization: `Bearer ${access_token}`,
        },
      }));
      forward(operation).subscribe(observer);
    }
  });
  failedQueue = [];
};

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      // Safely log GraphQL errors, checking for 'locations' property
      const errorDetails = {
        message: err.message,
        path: err.path,
        extensions: err.extensions,
        locations: err.locations ? err.locations : 'N/A' // Safely access locations
      };
      console.error('ErrorLink - GraphQL Error:', JSON.stringify(errorDetails, null, 2)); // Log the full GraphQL error with more detail
      Sentry.captureException(err); // Capture GraphQL error in Sentry
      // Handle authentication errors
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        console.warn('ErrorLink - UNAUTHENTICATED error detected. Attempting token refresh.');
      } else {
        // Added logging for other GraphQL errors
        console.error('ErrorLink - Received GraphQL error without UNAUTHENTICATED code:', JSON.stringify(err, null, 2));
      }
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        console.warn('ErrorLink - UNAUTHENTICATED error detected. Attempting token refresh.');

        // Get the refresh token from local storage
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

          if (!refreshToken) {
            console.error('ErrorLink - No refresh token available. Clearing tokens and redirecting.');
            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
            }
            // Propagate the error so AuthContext can handle the state change and redirection
            return new Observable(observer => {
              observer.error(err);
            });
          }
          console.log('ErrorLink - Refresh token found. Attempting refresh...');

          if (!isRefreshing) {
            isRefreshing = true;

            const tempLink = new HttpLink({ uri: getBackendUrl('http') });

            try {
              execute(tempLink, {
                query: REFRESH_TOKEN_MUTATION,
                variables: { refreshToken: refreshToken },
                operationName: 'RefreshToken',
                context: {
                  headers: {},
                },
              }).subscribe({
                next: (result: FetchResult) => {
                  const data = result.data as any;

                  if (data && data.refreshToken && data.refreshToken.access_token && data.refreshToken.refresh_token) {
                    const newAccessToken = data.refreshToken.access_token;
                    const newRefreshToken = data.refreshToken.refresh_token;
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('access_token', newAccessToken);
                      localStorage.setItem('refresh_token', newRefreshToken);
                    }
                    isRefreshing = false;
                    // Update the tokenRef with the new token after successful refresh
                    setAccessTokenForApollo(newAccessToken);
                    console.log('ErrorLink - Token refresh successful. New access token set.');
                    processQueue(null, newAccessToken);
                  } else {
                    console.error('ErrorLink - Refresh token mutation failed or returned invalid data. Clearing tokens and processing queue with error.');
                    isRefreshing = false;
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('access_token');
                      localStorage.removeItem('refresh_token');
                    }
                    processQueue(err);
                  }
                },
                error: (refreshError: any) => {
                  console.error('ErrorLink - Error during token refresh:', JSON.stringify(refreshError, null, 2));
                  isRefreshing = false;
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                  }
                  processQueue(refreshError);
                },
              });
            } catch (syncError) {
              console.error('ErrorLink - Synchronous error during refresh token execution:', JSON.stringify(syncError, null, 2));
              isRefreshing = false;
              if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
              }
              processQueue(syncError);
            }
          }
          console.log('ErrorLink - Adding operation to failed queue.');

          return new Observable(observer => {
            failedQueue.push({ operation, forward, observer });
          });
        }
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${JSON.stringify(networkError, null, 2)}`);
    Sentry.captureException(networkError); // Capture network error in Sentry
    // Handle network errors if needed
  }
});

// Use split to route requests to the appropriate link
// Conditionally include wsLink only if it's defined (client-side)
let currentWsLink: GraphQLWsLink | null = wsClientRef ? new GraphQLWsLink(wsClientRef) : null;

const createSplitLink = (wsLink: GraphQLWsLink | null) => {
  return isBrowser && wsLink ? split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      const isSubscription = definition.kind === 'OperationDefinition' && (definition as OperationDefinitionNode).operation === 'subscription';
      console.log(`[ApolloClient] Split Link - Operation: ${definition.kind === 'OperationDefinition' ? (definition as OperationDefinitionNode).operation : 'N/A'}, Kind: ${definition.kind}, Is Subscription: ${isSubscription}`);
      return isSubscription;
    },
    wsLink, // WebSocket link for subscriptions
    from([authLink, uploadLink, httpLink]), // Chain authLink, uploadLink, and httpLink for queries and mutations
  ) : from([authLink.concat(uploadLink).concat(httpLink)]); // Use chained links on the server or if wsLink is not defined
};

let splitLink = createSplitLink(currentWsLink);

// ...
let link = from(
  [
    errorLink, // Handle errors first
    splitLink, // Route to HTTP/WS first
  ]
);

// Create the Apollo Client instance
const client = new ApolloClient({
  link: link, // Use the chained link
  cache: new InMemoryCache(),
});

// Function to update the access token and re-initialize WebSocket connection
export const setAccessTokenForApollo = (token: string | null) => {
  console.log('[ApolloClient] setAccessTokenForApollo called. New token:', token ? `Present (first 10 chars: ${token.substring(0, 10)}...)` : 'Missing');
  tokenRef.currentAccessToken = token;

  if (isBrowser) {
    console.log('[ApolloClient] setAccessTokenForApollo - isBrowser is true.');
    // Dispose of the old WebSocket client if it exists
    if (wsClientRef) {
      console.log('[ApolloClient] setAccessTokenForApollo - Disposing existing WebSocket client.');
      wsClientRef.dispose();
      wsClientRef = null; // Ensure it's nullified after dispose
    }

    // Create a new WebSocket client with the updated token, only if token is present
    if (token) {
      console.log('[ApolloClient] setAccessTokenForApollo - Re-initializing WebSocket client with new token.');
      wsClientRef = createNewWsClient();
      currentWsLink = new GraphQLWsLink(wsClientRef);
    } else {
      console.log('[ApolloClient] setAccessTokenForApollo - Clearing WebSocket client (no token).');
      wsClientRef = null;
      currentWsLink = null;
    }

    // Update the Apollo Client's link with the new WebSocket link
    splitLink = createSplitLink(currentWsLink);
    link = from([
      errorLink,
      new ApolloLink((operation, forward) => {
        if (operation.operationName === 'verifyEmail') {
          console.log('[ApolloClient] Bypassing AuthLink for verifyEmail operation during link update.');
          return forward(operation);
        }
        return authLink.request(operation, forward);
      }),
      splitLink,
    ]);
    client.setLink(link); // Update the client's link
    console.log('[ApolloClient] Apollo Client link updated with new WebSocket client.');
  }
};

export default client;

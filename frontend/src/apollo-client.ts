import { ApolloClient, InMemoryCache, split, from } from '@apollo/client';
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
import { REFRESH_TOKEN_MUTATION } from '@/graphql/queries';

// Configure the HTTP link for queries and mutations
// Determine the backend URL dynamically based on the frontend's location
const isBrowser = typeof window !== 'undefined';
const backendPort = 4000; // Your backend port

const getBackendUrl = (protocol: string) => {
  if (process.env.NEXT_PUBLIC_RUNNING_IN_DOCKER === 'true') {
    // When running in Docker and accessed from host browser
    if (protocol === 'http') {
      return process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URI || `http://localhost:${backendPort}/graphql`;
    } else {
      return process.env.NEXT_PUBLIC_BACKEND_WS_URL || `ws://localhost:${backendPort}/graphql`;
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
    return `http://backend:${backendPort}/graphql`;
  } else {
    // Default for local development outside Docker (e.g., direct npm run dev)
    // Explicitly use localhost and backendPort
    if (protocol === 'http') {
      return `http://localhost:${backendPort}/graphql`;
    } else {
      return `ws://localhost:${backendPort}/graphql`;
    }
  }
};

// A mutable object to hold the current access token
const tokenRef = {
  currentAccessToken: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
};

// A mutable object to hold the WebSocket client instance
let wsClientRef: any = null;

// Function to create and return a new WebSocket client
const createNewWsClient = () => {
  const client = createClient({
    url: getBackendUrl('ws'),
    connectionParams: () => {
      const currentToken = tokenRef.currentAccessToken;
      console.log('[ApolloClient] WebSocket connectionParams: Token', currentToken ? 'Present' : 'Missing');
      return {
        Authorization: currentToken ? `Bearer ${currentToken}` : '',
      };
    },
  });
  client.on('connected', () => console.log('[ApolloClient] WebSocket connected!'));
  client.on('closed', (event: any) => console.log('[ApolloClient] WebSocket closed:', event));
  client.on('error', (error: any) => console.error('[ApolloClient] WebSocket error:', error));
  return client;
};

// Initial creation of wsClientRef (only if in browser)
if (isBrowser) {
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
      console.error('ErrorLink - GraphQL Error:', JSON.stringify(err, null, 2)); // Log the full GraphQL error with more detail
      // Handle authentication errors
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
    // Handle network errors if needed
  }
});

// Use split to route requests to the appropriate link
// Conditionally include wsLink only if it's defined (client-side)
let currentWsLink: GraphQLWsLink | null = isBrowser && wsClientRef ? new GraphQLWsLink(wsClientRef) : null;

const createSplitLink = (wsLink: GraphQLWsLink | null) => {
  return isBrowser && wsLink ? split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    // Route file upload mutations (UploadAvatar and SendMessage) to uploadLink, others to httpLink
    split(({ operationName }) => operationName === 'UploadAvatar' || operationName === 'SendMessage', uploadLink, httpLink),
  ) : httpLink; // Use only httpLink on the server or if wsLink is not defined
};

let splitLink = createSplitLink(currentWsLink);

// Chain the links: errorLink -> authLink -> splitLink
let link = from(
  [
    errorLink, // Handle errors first
    authLink, // Add auth headers
    splitLink, // Route to HTTP/WS
  ]
);

// Create the Apollo Client instance
const client = new ApolloClient({
  link: link, // Use the chained link
  cache: new InMemoryCache(),
});

// Function to update the access token and re-initialize WebSocket connection
export const setAccessTokenForApollo = (token: string | null) => {
  console.log('[ApolloClient] setAccessTokenForApollo called. New token:', token ? 'Present' : 'Missing');
  tokenRef.currentAccessToken = token;

  if (isBrowser) {
    // Dispose of the old WebSocket client if it exists
    if (wsClientRef) {
      console.log('[ApolloClient] Disposing existing WebSocket client.');
      wsClientRef.dispose();
    }

    // Create a new WebSocket client with the updated token
    wsClientRef = createNewWsClient();
    currentWsLink = new GraphQLWsLink(wsClientRef);

    // Update the Apollo Client's link with the new WebSocket link
    splitLink = createSplitLink(currentWsLink);
    link = from([
      errorLink,
      authLink,
      splitLink,
    ]);
    client.setLink(link); // Update the client's link
    console.log('[ApolloClient] Apollo Client link updated with new WebSocket client.');
  }
};

export default client;

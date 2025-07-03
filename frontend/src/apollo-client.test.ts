import { ApolloClient, InMemoryCache, ApolloLink, HttpLink, split, from, execute, Operation, FetchResult } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import Observable from 'zen-observable';
import gql from 'graphql-tag'; // Use graphql-tag for gql

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the actual links to control their behavior
const mockHttpLink = jest.fn();
const mockWsLink = jest.fn();
const mockUploadLink = jest.fn();

jest.mock('@apollo/client/link/http', () => ({
  HttpLink: jest.fn().mockImplementation((config) => {
    // Return a mock link that can be controlled
    return new ApolloLink((operation, forward) => {
      mockHttpLink(operation, config); // Log the operation and config
      // Return an observable that can be controlled in tests
      return new Observable(observer => {
        // This observer will be controlled by the test
        (mockHttpLink as any).observers.push(observer);
      });
    });
  }),
}));

jest.mock('@apollo/client/link/subscriptions', () => ({
  GraphQLWsLink: jest.fn().mockImplementation((client) => {
    // Return a mock link that can be controlled
    return new ApolloLink((operation, forward) => {
      mockWsLink(operation, client); // Log the operation and client
      // Return an observable that can be controlled in tests
      return new Observable(observer => {
        // This observer will be controlled by the test
        (mockWsLink as any).observers.push(observer);
      });
    });
  }),
}));

jest.mock('apollo-upload-client/createUploadLink.mjs', () => ({
  __esModule: true, // This is needed for default exports
  default: jest.fn().mockImplementation((config) => {
    // Return a mock link that can be controlled
    return new ApolloLink((operation, forward) => {
      mockUploadLink(operation, config); // Log the operation and config
      // Return an observable that can be controlled in tests
      return new Observable(observer => {
        // This observer will be controlled by the test
        (mockUploadLink as any).observers.push(observer);
      });
    });
  }),
}));


// Define the Refresh Token mutation (needs to be the same as in apollo-client.ts)
const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      access_token
      refresh_token
      user {
        id
        email
        name
        isVerified
        avatarUrl
      }
    }
  }
`;

// Re-implement the links and client setup from apollo-client.ts
const isBrowser = typeof window !== 'undefined';
const backendPort = 4000;

const getBackendUrl = (protocol: string) => {
  if (!isBrowser) {
    return process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URI || `http://localhost:${backendPort}/graphql`;
  }
  const { protocol: frontendProtocol, hostname: frontendHostname } = window.location;
  if (protocol === 'http') {
    return '/api/graphql';
  } else {
    const backendProtocol = frontendProtocol.replace('http', 'ws');
    const backendHostname = frontendHostname.replace('3000', backendPort.toString());
    return `${backendProtocol}//${backendHostname}/graphql`;
  }
};

// Use the mocked links
const httpLink = new (HttpLink as any)({ uri: getBackendUrl('http') });
const uploadLink = (createUploadLink as any)({ uri: getBackendUrl('http') });
const wsLink = isBrowser ? new (GraphQLWsLink as any)(createClient({ url: getBackendUrl('ws') })) : (null as any);


const authLink = setContext(async (operation, { headers }) => {
  const access_token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const refresh_token = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

  return {
    headers: {
      ...headers,
      authorization: access_token ? `Bearer ${access_token}` : "",
    }
  }
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

        if (!refreshToken) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
          return;
        }

        const tempLink = from([
          new (HttpLink as any)({ uri: getBackendUrl('http') }),
        ]);

        return new Observable<FetchResult>((observer) => {
          execute(tempLink, {
            ...operation,
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
                forward(operation).subscribe(observer);
              } else {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
                }
                observer.error(err);
              }
            },
            error: (refreshError: any) => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
              }
              observer.error(err);
            },
            complete: () => {},
          });
        });
      }
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});


const splitLink = isBrowser && wsLink ? split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  split(({ operationName }) => operationName === 'UploadAvatar', uploadLink, httpLink),
) : httpLink;

const link = from([
  errorLink,
  authLink,
  splitLink,
]);

const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
});


describe('Apollo Client Authentication Flow', () => {
  let originalWindowLocation: Location;

  beforeAll(() => {
    // Store original window.location
    originalWindowLocation = window.location;
    // Mock window.location for getBackendUrl
    Object.defineProperty(window, 'location', {
      value: {
        protocol: 'http:',
        hostname: 'localhost',
        port: '3000',
      },
      writable: true,
    });
  });

  afterAll(() => {
    // Restore original window.location
    Object.defineProperty(window, 'location', {
      value: originalWindowLocation,
      writable: true,
    });
  });


  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    // Reset observers for mock links
    (mockHttpLink as any).observers = [];
    (mockWsLink as any).observers = [];
    (mockUploadLink as any).observers = [];
  });

  const testQuery = gql`
    query TestQuery {
      someField
    }
  `;

  const refreshTokenSuccessResponse = {
    data: {
      refreshToken: {
        access_token: 'new_fake_access_token',
        refresh_token: 'new_fake_refresh_token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          isVerified: true,
          avatarUrl: null,
        },
      },
    },
  };

  const refreshTokenFailureResponse = {
    errors: [{ message: 'Invalid refresh token', extensions: { code: 'UNAUTHENTICATED' } }],
  };


  test('should include access token in headers if available', async () => {
    localStorageMock.setItem('access_token', 'fake_access_token');

    // Simulate a successful response from the httpLink
    mockHttpLink.mockImplementationOnce((operation, config) => {
        // Check headers here
        expect(operation.getContext().headers.authorization).toBe('Bearer fake_access_token');
        // Resolve the observable immediately with a success result
        return new Observable(observer => {
            observer.next({ data: { someField: 'data' } });
            observer.complete();
        });
    });

    // Execute the query
    await client.query({ query: testQuery });

    // Verify httpLink was called
    expect(mockHttpLink).toHaveBeenCalled();
  });

  test('should attempt to refresh token on UNAUTHENTICATED error if refresh token is available', async () => {
    localStorageMock.setItem('access_token', 'expired_access_token');
    localStorageMock.setItem('refresh_token', 'valid_refresh_token');

    // Simulate the initial query failing with UNAUTHENTICATED
    mockHttpLink.mockImplementationOnce((operation, config) => {
        return new Observable(observer => {
            observer.error({ graphQLErrors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }] });
        });
    });

    // Simulate the refresh token mutation succeeding
    mockHttpLink.mockImplementationOnce((operation, config) => {
        // Verify the refresh token mutation was called with the correct refresh token
        expect(operation.query).toEqual(REFRESH_TOKEN_MUTATION);
        expect(operation.variables.refreshToken).toBe('valid_refresh_token');
        // Resolve the observable with the success response
        return new Observable(observer => {
            observer.next(refreshTokenSuccessResponse);
            observer.complete();
        });
    });

    // Simulate the original query being retried and succeeding
    mockHttpLink.mockImplementationOnce((operation, config) => {
        // Verify the retried query includes the new access token
        expect(operation.getContext().headers.authorization).toBe('Bearer new_fake_access_token');
        // Resolve the observable with a success result
        return new Observable(observer => {
            observer.next({ data: { someField: 'retried data' } });
            observer.complete();
        });
    });


    // Execute the query and expect it to eventually succeed after refresh
    const { data } = await client.query({ query: testQuery });

    // Verify the final data is from the retried query
    expect(data).toEqual({ someField: 'retried data' });

    // Verify localStorage was updated with new tokens
    expect(localStorageMock.getItem('access_token')).toBe('new_fake_access_token');
    expect(localStorageMock.getItem('refresh_token')).toBe('new_fake_refresh_token');

    // Verify httpLink was called three times: initial query, refresh mutation, retried query
    expect(mockHttpLink).toHaveBeenCalledTimes(3);
  });

  test('should clear tokens and not retry if refresh token is not available on UNAUTHENTICATED error', async () => {
    localStorageMock.setItem('access_token', 'expired_access_token');
    // No refresh token set

    // Simulate the initial query failing with UNAUTHENTICATED
    mockHttpLink.mockImplementationOnce((operation, config) => {
        return new Observable(observer => {
            observer.error({ graphQLErrors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }] });
        });
    });

    // Execute the query and expect it to throw an error
    await expect(client.query({ query: testQuery })).rejects.toThrow('GraphQL error: Unauthenticated');

    // Verify tokens were cleared from localStorage
    expect(localStorageMock.getItem('access_token')).toBeNull();
    expect(localStorageMock.getItem('refresh_token')).toBeNull();

    // Verify httpLink was called only once (initial query)
    expect(mockHttpLink).toHaveBeenCalledTimes(1);
  });

  test('should clear tokens and not retry if refresh token mutation fails', async () => {
    localStorageMock.setItem('access_token', 'expired_access_token');
    localStorageMock.setItem('refresh_token', 'invalid_refresh_token');

    // Simulate the initial query failing with UNAUTHENTICATED
    mockHttpLink.mockImplementationOnce((operation, config) => {
        return new Observable(observer => {
            observer.error({ graphQLErrors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }] });
        });
    });

    // Simulate the refresh token mutation failing
    mockHttpLink.mockImplementationOnce((operation, config) => {
        // Verify the refresh token mutation was called
        expect(operation.query).toEqual(REFRESH_TOKEN_MUTATION);
        // Resolve the observable with a failure response
        return new Observable(observer => {
            observer.next(refreshTokenFailureResponse); // Simulate a GraphQL error response
            observer.complete(); // Or observer.error(...) depending on how backend signals failure
        });
    });


    // Execute the query and expect it to throw an error
    await expect(client.query({ query: testQuery })).rejects.toThrow('GraphQL error: Unauthenticated'); // Expecting the original error to be propagated

    // Verify tokens were cleared from localStorage
    expect(localStorageMock.getItem('access_token')).toBeNull();
    expect(localStorageMock.getItem('refresh_token')).toBeNull();

    // Verify httpLink was called twice: initial query and refresh mutation
    expect(mockHttpLink).toHaveBeenCalledTimes(2);
  });

  test('should clear tokens and not retry if refresh token mutation throws a network error', async () => {
    localStorageMock.setItem('access_token', 'expired_access_token');
    localStorageMock.setItem('refresh_token', 'valid_refresh_token');

    // Simulate the initial query failing with UNAUTHENTICATED
    mockHttpLink.mockImplementationOnce((operation, config) => {
        return new Observable(observer => {
            observer.error({ graphQLErrors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }] });
        });
    });

    // Simulate the refresh token mutation throwing a network error
    mockHttpLink.mockImplementationOnce((operation, config) => {
        // Verify the refresh token mutation was called
        expect(operation.query).toEqual(REFRESH_TOKEN_MUTATION);
        // Throw a network error
        return new Observable(observer => {
            observer.error(new Error('Network error during refresh'));
        });
    });


    // Execute the query and expect it to throw an error
    await expect(client.query({ query: testQuery })).rejects.toThrow('GraphQL error: Unauthenticated'); // Expecting the original error to be propagated

    // Verify tokens were cleared from localStorage
    expect(localStorageMock.getItem('access_token')).toBeNull();
    expect(localStorageMock.getItem('refresh_token')).toBeNull();

    // Verify httpLink was called twice: initial query and refresh mutation
    expect(mockHttpLink).toHaveBeenCalledTimes(2);
  });

});
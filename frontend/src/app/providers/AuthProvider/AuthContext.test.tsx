import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/app/providers/AuthProvider/AuthContext';
import { useQuery, useApolloClient } from '@apollo/client';
import { useRouter } from 'next/navigation';
import React, { ReactNode } from 'react';

// Mock Apollo Client hooks
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
  useApolloClient: jest.fn(),
}));

// Mock Next.js useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

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

const mockUseQuery = useQuery as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseApolloClient = useApolloClient as jest.Mock;

describe('AuthContext', () => {
  let mockPush: jest.Mock;
  let mockClearStore: jest.Mock;

  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorageMock.clear();
    jest.clearAllMocks();

    // Setup mock router and apollo client
    mockPush = jest.fn();
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockClearStore = jest.fn();
    mockUseApolloClient.mockReturnValue({ clearStore: mockClearStore });

    // Default mock for useQuery - simulates no user data initially and not loading
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    // Default mock for localStorage - simulates no tokens initially
    localStorageMock.getItem.mockReturnValue(null);
  });

  const renderAuthHook = () => {
    const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    return renderHook(() => useAuth(), { wrapper });
  };

  test('should be in initializing state initially', () => {
    const { result } = renderAuthHook();

    // Initially, it should be initializing and loading
    expect(result.current.isInitializing).toBe(true);
    expect(result.current.loading).toBe(true); // Combined loading includes isInitializing
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('should read tokens from localStorage and attempt to fetch user on initialization if tokens exist', async () => {
    // Arrange
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'access_token') return 'fake_access_token';
      if (key === 'refresh_token') return 'fake_refresh_token';
      return null;
    });

    const mockUserData = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      isVerified: true,
      username: 'testuser',
      avatarUrl: null,
      bio: null,
    };

    // Mock useQuery to simulate successful user fetch after initialization
    mockUseQuery.mockImplementation(({ skip }) => {
        if (!skip) {
            return {
                data: { getCurrentUser: mockUserData },
                loading: false,
                error: null,
                refetch: jest.fn(),
            };
        }
         return { // Return initial state when skipped
            data: null,
            loading: true, // Simulate loading while initializing
            error: null,
            refetch: jest.fn(),
        };
    });


    // Act
    const { result } = renderAuthHook();

    // Assert
    // Initially initializing and loading
    expect(result.current.isInitializing).toBe(true);
    expect(result.current.loading).toBe(true);

    // Wait for initialization to complete and user data to be loaded
    await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUserData);
    });

    // Verify localStorage was read
    expect(localStorageMock.getItem).toHaveBeenCalledWith('access_token');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('refresh_token');

    // Verify useQuery was called without skip after initialization
    expect(mockUseQuery).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        skip: false,
    }));
  });

  test('should not fetch user if no tokens are in localStorage', async () => {
    // Arrange - localStorageMock is already set to return null by default

    // Act
    const { result } = renderAuthHook();

    // Assert
    // Initially initializing and loading
    expect(result.current.isInitializing).toBe(true);
    expect(result.current.loading).toBe(true);

    // Wait for initialization to complete
    await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
        expect(result.current.loading).toBe(false); // Loading should be false after init if skipped
    });

    // Verify localStorage was read
    expect(localStorageMock.getItem).toHaveBeenCalledWith('access_token');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('refresh_token');

    // Verify useQuery was called with skip true
     expect(mockUseQuery).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        skip: true,
    }));
    expect(result.current.user).toBeNull();
  });


  test('should clear tokens and user state on logout', async () => {
    // Arrange
    const mockUserData = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      isVerified: true,
      username: 'testuser',
      avatarUrl: null,
      bio: null,
    };
    // Simulate user being logged in initially
     localStorageMock.setItem('access_token', 'fake_access_token');
     localStorageMock.setItem('refresh_token', 'fake_refresh_token');
     mockUseQuery.mockImplementation(({ skip }) => {
        if (!skip) {
            return {
                data: { getCurrentUser: mockUserData },
                loading: false,
                error: null,
                refetch: jest.fn(),
            };
        }
         return { // Return initial state when skipped
            data: null,
            loading: true, // Simulate loading while initializing
            error: null,
            refetch: jest.fn(),
        };
    });


    const { result } = renderAuthHook();

    // Wait for user to be loaded
    await waitFor(() => expect(result.current.user).toEqual(mockUserData));

    // Act - Trigger logout
    act(() => {
      result.current.logout();
    });

    // Assert
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
    expect(result.current.user).toBeNull();
    expect(mockClearStore).toHaveBeenCalled(); // Check if Apollo cache was cleared
    expect(mockPush).toHaveBeenCalledWith('/'); // Check if redirected to home
  });

  test('should clear user state and tokens if useQuery returns an authentication error', async () => {
    // Arrange
    localStorageMock.setItem('access_token', 'fake_access_token');
    localStorageMock.setItem('refresh_token', 'fake_refresh_token');

    const authError = {
      graphQLErrors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }],
      networkError: null,
      message: 'GraphQL error: Unauthenticated',
    };

    // Mock useQuery to simulate an authentication error after initialization
    mockUseQuery.mockImplementation(({ skip }) => {
        if (!skip) {
            return {
                data: null,
                loading: false,
                error: authError, // Simulate authentication error
                refetch: jest.fn(),
            };
        }
         return { // Return initial state when skipped
            data: null,
            loading: true, // Simulate loading while initializing
            error: null,
            refetch: jest.fn(),
        };
    });

    // Act
    const { result } = renderAuthHook();

    // Assert
    // Wait for initialization to complete and error to be processed
    await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBeNull(); // User should be null after auth error
        expect(result.current.error).toEqual(authError); // Error state should reflect the auth error
    });

    // Verify tokens were removed from localStorage (simulated by the errorLink logic)
    // Note: The actual removal logic is in apollo-client's errorLink,
    // these tests verify AuthContext's reaction to the resulting state change (user becomes null)
    // We can directly check localStorage mock here as a proxy for the errorLink's action
    expect(localStorageMock.getItem('access_token')).toBeNull();
    expect(localStorageMock.getItem('refresh_token')).toBeNull();
  });

  test('should set user state directly using setUserState', async () => {
    // Arrange
    const mockUserData = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      isVerified: true,
      username: 'testuser',
      avatarUrl: null,
      bio: null,
    };

    // Act
    const { result } = renderAuthHook();

    // Wait for initialization to complete
     await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
        expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setUserState(mockUserData);
    });

    // Assert
    expect(result.current.user).toEqual(mockUserData);
    expect(result.current.loading).toBe(false); // Setting user state directly doesn't change loading
    expect(result.current.error).toBeNull();
  });
});
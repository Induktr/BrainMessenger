import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useQuery, useApolloClient, NetworkStatus } from '@apollo/client'; // Добавляем NetworkStatus
import { GET_CURRENT_USER } from '../../graphql/queries'; // Проверьте путь

// Определяем тип User (можно вынести в types/index.ts)
interface User {
  id: string;
  name: string;
  email: string;
  // Добавить другие поля по мере необходимости
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean; // Единое состояние загрузки
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Состояние для отслеживания завершения *первоначальной* проверки токена на клиенте
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const apolloClient = useApolloClient();

  // Проверяем наличие токена только на клиенте
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('authToken');

  const { loading: queryLoading, error: queryError, data: queryData, networkStatus } = useQuery<{ getCurrentUser: User }>(
    GET_CURRENT_USER,
    {
      fetchPolicy: 'network-only',
      // Пропускаем запрос, если мы на сервере ИЛИ если токена на клиенте точно нет
      skip: typeof window === 'undefined' || !hasToken,
      notifyOnNetworkStatusChange: true, // Важно для отслеживания refetch и т.д.
      onCompleted: (data) => {
        // console.log("AuthContext: getCurrentUser completed", data);
        setUser(data?.getCurrentUser ?? null);
        if (!data?.getCurrentUser && typeof window !== 'undefined') {
            localStorage.removeItem('authToken'); // Удаляем токен, если юзер не найден
        }
        setInitialAuthCheckComplete(true); // Первоначальная проверка завершена (успешно)
      },
      onError: (error) => {
        console.error("AuthContext: Auth check error (getCurrentUser):", error);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken'); // Удаляем невалидный токен
        }
        setUser(null);
        setInitialAuthCheckComplete(true); // Первоначальная проверка завершена (с ошибкой)
      },
    }
  );

  // Эффект для случая, когда токена изначально не было
  useEffect(() => {
    // Если мы на клиенте и токена нет, то проверка сразу завершена
    if (typeof window !== 'undefined' && !localStorage.getItem('authToken')) {
      setInitialAuthCheckComplete(true);
    }
  }, []);

  const logout = async () => {
    setUser(null);
    if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
    }
    try {
      // Сброс кеша важен, чтобы при следующем логине не подтянулись старые данные
      await apolloClient.resetStore();
    } catch (e) {
      console.error("Error resetting Apollo store on logout:", e);
    }
    // Редирект лучше делать через router в компоненте, который вызывает logout,
    // но для простоты оставим window.location
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
  };

  // Определяем общее состояние загрузки:
  // Загрузка идет, если первоначальная проверка еще не завершена
  const loading = !initialAuthCheckComplete;

  // Пользователь аутентифицирован, если проверка завершена, нет ошибки, и есть данные пользователя
  const isAuthenticated = initialAuthCheckComplete && !queryError && !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
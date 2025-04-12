import App, { AppProps } from 'next/app';
import { useRouter } from 'next/router'; // Импортируем useRouter
import { useEffect } from 'react'; // Импортируем useEffect
import AppApolloProvider from '../../providers/ApolloProvider'; // Путь может быть '../providers/...' в зависимости от структуры
import AppProviders from '../../providers/Providers'; // Путь может быть '../providers/...'
import { AuthProvider, useAuth } from '../context/AuthContext'; // Импортируем AuthProvider и useAuth
import '../styles/globals.css';
function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Use the AppApolloProvider which contains the ApolloProvider and client logic
    <AppApolloProvider> {/* Apollo должен быть снаружи Auth, т.к. Auth использует useQuery */}
      <AuthProvider> {/* Оборачиваем в AuthProvider */}
        {/* Keep AppProviders if it wraps other contexts */}
        <AppProviders>
           {/* Оборачиваем Component в AuthGuardComponent */}
           <AuthGuardComponent>
              <Component {...pageProps} />
           </AuthGuardComponent>
        </AppProviders>
      </AuthProvider>
    </AppApolloProvider>
  );
}

// --- Вспомогательный компонент для защиты роутов ---
const AuthGuardComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Не выполняем редиректы, пока идет проверка аутентификации
    if (loading) {
      return;
    }

    const publicPaths = ['/', '/login', '/register']; // Добавлен корневой путь '/'
    const pathIsProtected = !publicPaths.includes(router.pathname);

    // Если пользователь НЕ аутентифицирован и пытается зайти на защищенный роут
    if (!isAuthenticated && pathIsProtected) {
      router.push('/login'); // Перенаправляем на логин
    }

    // Если пользователь аутентифицирован и пытается зайти на страницу логина/регистрации
    if (isAuthenticated && publicPaths.includes(router.pathname)) {
       router.push('/chat'); // Перенаправляем в чат (или на главную страницу приложения)
    }

  }, [loading, isAuthenticated, router]); // Зависимости useEffect

  // Пока идет проверка, можно показать глобальный лоадер или ничего
  if (loading) {
     // Можно вернуть глобальный спиннер/загрузчик на весь экран
     return <div className="flex justify-center items-center min-h-screen">Loading Application...</div>;
  }

  // Если проверка завершена, показываем запрошенный компонент страницы
  return <>{children}</>;
};
// --- Конец вспомогательного компонента ---


export default MyApp;
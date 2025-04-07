import React, { ReactNode, useMemo } from 'react'; // Добавлен useMemo
import { ApolloClient, InMemoryCache, HttpLink, split, ApolloLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
// Убран импорт AppProviders, так как он не используется здесь
// import AppProviders from './Providers';

interface ApolloProviderProps {
  children: ReactNode;
}

const httpUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql';

// Функция для создания экземпляра Apollo Client
function createApolloClient() {
  const httpLink = new HttpLink({
    uri: httpUrl,
  });

  // Создаем wsLink только на клиенте
  const wsLink = typeof window !== 'undefined'
    ? new GraphQLWsLink(
      createClient({
        url: wsUrl,
        // Optional: connectionParams, keepAlive, etc.
      })
    ): undefined; // undefined на сервере

  // Используем splitLink для разделения запросов
  const link = typeof window !== 'undefined' && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink, // Использовать wsLink для подписок
        httpLink, // Использовать httpLink для остального
      )
    : httpLink; // Использовать только httpLink на сервере

  return new ApolloClient({
    link: link, // Используем созданный link
    cache: new InMemoryCache(),
    ssrMode: typeof window === 'undefined', // Важно для SSR
  });
}

export function AppApolloProvider({ children }: ApolloProviderProps) {
  // Используем useMemo для создания клиента один раз на клиенте
  // и для каждого запроса на сервере
  const client = useMemo(() => createApolloClient(), []);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

export default AppApolloProvider;

// Экспортируем функцию создания клиента, если она понадобится в getStaticProps/getServerSideProps
export { createApolloClient };

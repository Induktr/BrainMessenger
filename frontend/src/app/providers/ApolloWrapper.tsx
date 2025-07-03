'use client';

import { ApolloProvider } from '@apollo/client';
import client from '@/apollo-client'; // Import the Apollo Client instance

const ApolloWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
};

export default ApolloWrapper;
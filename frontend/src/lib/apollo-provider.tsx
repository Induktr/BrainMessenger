'use client';

import React, { ReactNode } from 'react';
import AppApolloProvider from '../../providers/ApolloProvider';

interface ApolloProviderProps {
  children: ReactNode;
}

export const ApolloWrapper: React.FC<ApolloProviderProps> = ({ children }) => {
  return (
    <AppApolloProvider children={children} />
  );
};

export default ApolloWrapper;

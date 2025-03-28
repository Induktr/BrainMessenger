'use client';

import React, { ReactNode } from 'react';
import AppApolloProvider from '../../providers/ApolloProvider'; // Corrected import path

interface ApolloProviderProps {
  children: ReactNode;
}

export const ApolloWrapper: React.FC<ApolloProviderProps> = ({ children }) => {
  return (
    <AppApolloProvider children={children} />
  );
};

export default ApolloWrapper;

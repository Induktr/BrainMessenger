import React, { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <React.Fragment>{children}</React.Fragment>
  );
}

export default AppProviders;
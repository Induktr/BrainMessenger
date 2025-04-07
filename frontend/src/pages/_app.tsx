import App, { AppProps } from 'next/app';
// Import the wrapper provider we created earlier
import AppApolloProvider from '../../providers/ApolloProvider';
import AppProviders from '../../providers/Providers'; // Keep AppProviders if needed
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Use the AppApolloProvider which contains the ApolloProvider and client logic
    <AppApolloProvider>
      {/* Keep AppProviders if it wraps other contexts */}
      <AppProviders>
        <Component {...pageProps} />
      </AppProviders>
    </AppApolloProvider>
  );
}

export default MyApp;
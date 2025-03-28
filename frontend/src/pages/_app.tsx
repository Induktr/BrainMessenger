import App, { AppProps } from 'next/app';
import { ApolloWrapper } from '../lib/apollo-provider'; // Use ApolloWrapper
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Wrap the entire application with ApolloWrapper
    <ApolloWrapper>
      <Component {...pageProps} />
    </ApolloWrapper>
  );
}

export default MyApp;
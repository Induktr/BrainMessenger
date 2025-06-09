import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '../ui/ui.css';

import ApolloWrapper from '@/components/ApolloWrapper'; // Import ApolloWrapper
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import { NetworkStatusProvider } from '@/context/NetworkStatusContext'; // Import NetworkStatusProvider
import { ChatIdProvider } from '@/context/ChatIdContext'; // Import ChatIdProvider
import GlobalNotificationHandler from '@/components/GlobalNotificationHandler'; // Import GlobalNotificationHandler

// Import Roboto font
import { Roboto } from 'next/font/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configure Roboto font
const roboto = Roboto({
  weight: ['400', '500', '700'], // Specify the weights you need
  style: ['normal', 'italic'], // Specify the styles you need
  subsets: ['latin'],
  variable: '--font-roboto', // Define a CSS variable for the font
  display: 'swap', // Optimize font loading
});

export const metadata: Metadata = {
  title: "BrainMessenger", // Updated title
  description: "BrainMessenger MVP", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased bg-background-dark text-textPrimary-dark font-roboto`}
      >
        <ApolloWrapper> {/* ApolloWrapper (containing ApolloProvider) must wrap AuthProvider */}
          <NetworkStatusProvider>
            <AuthProvider>
              <ChatIdProvider> {/* Wrap children and GlobalNotificationHandler with ChatIdProvider */}
                {children}
                <GlobalNotificationHandler />
              </ChatIdProvider>
            </AuthProvider>
          </NetworkStatusProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}

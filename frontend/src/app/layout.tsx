'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '../ui/ui.css';

import ApolloWrapper from '@/components/ApolloWrapper'; // Import ApolloWrapper
import BodyClassNameUpdater from '@/components/BodyClassNameUpdater'; // Import BodyClassNameUpdater
import { AuthProvider, useAuth } from '@/context/AuthContext'; // Import AuthProvider and useAuth
import { NetworkStatusProvider } from '@/context/NetworkStatusContext'; // Import NetworkStatusProvider
import { ChatIdProvider } from '@/context/ChatIdContext'; // Import ChatIdProvider
import { DeepWorkProvider } from '@/context/DeepWorkContext';
import { NotificationProvider, useNotification } from '@/context/NotificationContext';
import { useMutation } from '@apollo/client';
import { UPDATE_LAST_ACTIVE_MUTATION, GET_CURRENT_USER } from '@/graphql/queries';
import { useEffect } from 'react';
import { GlobalAudioProvider } from '@/context/GlobalAudioContext'; // Import GlobalAudioProvider
import { ImageGalleryProvider } from '@/context/ImageGalleryContext';
import ImageGallery from '@/components/ImageGallery';
import NotificationDropdown from '@/components/NotificationDropdown';

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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background-dark text-textPrimary-dark font-roboto"> {/* Use a static base class name */}
        <ApolloWrapper> {/* ApolloWrapper (containing ApolloProvider) must wrap AuthProvider */}
          <DeepWorkProvider>
            <BodyClassNameUpdater /> {/* Add the component to update body class on client */}
            <GlobalAudioProvider> {/* Wrap the entire application with GlobalAudioProvider */}
              <NetworkStatusProvider>
                <AuthProvider>
                  <ChatIdProvider> {/* Wrap children and GlobalNotificationHandler with ChatIdProvider */}
                    <NotificationProvider>
                      <ImageGalleryProvider>
                        <UserStatusUpdater />
                        <NotificationWrapper>
                          {children}
                        </NotificationWrapper>
                        <ImageGallery />
                      </ImageGalleryProvider>
                    </NotificationProvider>
                  </ChatIdProvider>
                </AuthProvider>
              </NetworkStatusProvider>
            </GlobalAudioProvider>
          </DeepWorkProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}

function NotificationWrapper({ children }: { children: React.ReactNode }) {
  // NotificationDropdown is now rendered directly within AuthProvider
  return <>{children}</>;
}

// This component handles periodically updating the user's last active status
function UserStatusUpdater() {
  const { user } = useAuth();
  const [updateLastActive] = useMutation(UPDATE_LAST_ACTIVE_MUTATION, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
  });

  useEffect(() => {
    if (user) {
      // Immediately update status on login/app load
      updateLastActive();

      // Set up an interval to update the status every 15 seconds
      const intervalId = setInterval(() => {
        updateLastActive();
      }, 15000); // 15 seconds

      // Clear the interval on component unmount or when the user logs out
      return () => clearInterval(intervalId);
    }
  }, [user, updateLastActive]);

  return null; // This component does not render anything
}

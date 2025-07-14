'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import './ui.css';
import './admin/admin.css';

import ApolloWrapper from '@/app/providers/ApolloWrapper';
import BodyClassNameUpdater from '@/shared/ui/BodyClassNameUpdater/BodyClassNameUpdater';
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { LanguageProvider } from '@/app/providers/LanguageProvider';
import { AuthProvider } from '@/features/user-auth/ui/AuthContext';
import { NetworkStatusProvider } from '@/features/network-status/ui/NetworkStatusContext';
import { ChatIdProvider } from '@/entities/chat/ui/ChatIdContext';
import { DeepWorkProvider } from '@/features/deepwork-chat/ui/DeepWorkContext';
import { NotificationProvider } from '@/features/manage-notifications/ui/NotificationContext';
import { GlobalAudioProvider } from '@/features/manage-audio-player/ui/GlobalAudioContext';
import { ImageGalleryProvider } from '@/features/gallery-images/ui/ImageGalleryContext';
import ImageGallery from '@/features/gallery-images/ui/ImageGallery';
import UserStatusUpdater from '@/features/update-user-status/ui/UserStatusUpdater';

// Import Roboto font
import { Roboto } from 'next/font/google';

// Import i18n configuration
import '../i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';


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
    <html lang={i18n.language}>
      <body className="antialiased bg-background-dark text-textPrimary-dark font-roboto"> {/* Use a static base class name */}
        <ThemeProvider>
          <LanguageProvider>
            <I18nextProvider i18n={i18n}>
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
                            {children}
                            <ImageGallery />
                          </ImageGalleryProvider>
                        </NotificationProvider>
                      </ChatIdProvider>
                    </AuthProvider>
                  </NetworkStatusProvider>
                </GlobalAudioProvider>
              </DeepWorkProvider>
            </ApolloWrapper>
          </I18nextProvider>
        </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


'use client';

import "./globals.css";
import ApolloWrapper from '@/app/providers/ApolloWrapper';
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { LanguageProvider } from '@/app/providers/LanguageProvider';
import { AuthProvider } from '@/app/providers/AuthProvider/AuthContext';
import { NetworkStatusProvider } from '@/app/providers/NetworkStatusProvider/NetworkStatusContext';
import { ChatIdProvider } from '@/app/providers/ChatIdProvider/ChatIdContext';
import { DeepWorkProvider } from '@/app/providers/DeepWorkProvider/DeepWorkContext';
import { NotificationProvider } from '@/app/providers/NotificationProvider/NotificationContext';
import { GlobalAudioProvider } from '@/app/providers/GlobalAudioProvider/GlobalAudioContext';
import { ImageGalleryProvider } from '@/features/gallery-images/ui/ImageGalleryContext';
import ImageGallery from '@/features/gallery-images/ui/ImageGallery';
import UserStatusUpdater from '@/features/update-user-status/ui/UserStatusUpdater';
import { Roboto } from 'next/font/google';
import { ReactScan } from "@/shared/ui/ReactScanComponent/ReactScanComponent";
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';


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
    <html lang={i18n.language} className="h-full">
      <body className={`h-full bg-[var(--color-background)] text-[var(--color-text-primary)] antialiased ${roboto.variable}`}>
        <ThemeProvider>
          <LanguageProvider>
            <I18nextProvider i18n={i18n}>
            <ApolloWrapper> {/* ApolloWrapper (containing ApolloProvider) must wrap AuthProvider */}
              <DeepWorkProvider>
                {/* Removed BodyClassNameUpdater as theme is now set on html */}
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
        {process.env.NODE_ENV === 'development' && <ReactScan />}
      </body>
    </html>
  );
}


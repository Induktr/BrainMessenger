'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useDeepWork } from '@/app/providers/DeepWorkProvider/DeepWorkContext';
import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Roboto } from 'next/font/google';

// Re-configure fonts to get the variable names
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});


const BodyClassNameUpdater = () => {
  const pathname = usePathname();
  const { isDeepWorkActive } = useDeepWork();

  useEffect(() => {
    const body = document.body;
    if (body) {
      // Base class names
      let classNames = `${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased bg-background-dark text-textPrimary-dark font-roboto`;

      // Conditionally add the deep work mode class
      if (isDeepWorkActive) {
        classNames += ' deep-work-active';
      }

      // Apply the dynamic class name to the body
      body.className = classNames;
    }
  }, [pathname, isDeepWorkActive]); // Re-run effect if pathname or deep work state changes

  // This component doesn't render anything itself
  return null;
};

export default BodyClassNameUpdater;
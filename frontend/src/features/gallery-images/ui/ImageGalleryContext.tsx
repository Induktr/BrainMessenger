'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Slide, ImageGalleryContextType } from '@/features/gallery-images/model/gallery-images.types';

const ImageGalleryContext = createContext<ImageGalleryContextType | undefined>(undefined);

export const ImageGalleryProvider = ({ children }: { children: ReactNode }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openGallery = (slides: Slide[], index: number) => {
    setSlides(slides);
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  return (
    <ImageGalleryContext.Provider value={{ isGalleryOpen, slides, currentImageIndex, openGallery, closeGallery, setCurrentImageIndex }}>
      {children}
    </ImageGalleryContext.Provider>
  );
};

export const useImageGallery = () => {
  const context = useContext(ImageGalleryContext);
  if (context === undefined) {
    throw new Error('useImageGallery must be used within a ImageGalleryProvider');
  }
  return context;
};

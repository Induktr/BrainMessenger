import { Component } from "react";

export interface Slide {
  type: string;
  icon?: any;
  image?: string;
  title: string;
  description?: string;
  src?: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ImageGalleryContextType {
  isGalleryOpen: boolean;
  slides: Slide[];
  currentImageIndex: number;
  openGallery: (slides: Slide[], index: number) => void;
  closeGallery: () => void;
  setCurrentImageIndex: (index: number) => void;
}
export interface Slide {
    src: string;
    alt: string;
    description?: string;
}

export interface ImageGalleryContextType {
  isGalleryOpen: boolean;
  slides: Slide[];
  currentImageIndex: number;
  openGallery: (slides: Slide[], index: number) => void;
  closeGallery: () => void;
  setCurrentImageIndex: (index: number) => void;
}
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { icons } from '@/app/lib/constants';
import { useImageGallery } from '@/context/ImageGalleryContext';

const ImageGallery: React.FC = () => {
  const { isGalleryOpen, closeGallery, slides, currentImageIndex, setCurrentImageIndex } = useImageGallery();
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPinchDistance = useRef<number | null>(null);

  useEffect(() => {
    if (isGalleryOpen) {
      setRotation(0);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isGalleryOpen, currentImageIndex]);

  const clampPosition = (x: number, y: number, currentScale: number) => {
    if (!imageRef.current || !containerRef.current) return { x, y };

    const image = imageRef.current;
    const container = containerRef.current;

    const maxOffsetX = Math.max(0, (image.offsetWidth * currentScale - container.clientWidth) / 2);
    const maxOffsetY = Math.max(0, (image.offsetHeight * currentScale - container.clientHeight) / 2);

    return {
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, x)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, y)),
    };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = scale - e.deltaY * 0.001;
    const clampedScale = Math.max(1, Math.min(newScale, 5)); // Min scale 1, Max scale 5
    setScale(clampedScale);
    setPosition(clampPosition(position.x, position.y, clampedScale));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      isDragging.current = true;
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      if (imageRef.current) imageRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      setPosition(clampPosition(newX, newY, scale));
    }
  };

  const handleMouseUpOrLeave = (e: React.MouseEvent) => {
    isDragging.current = false;
    if (imageRef.current) imageRef.current.style.cursor = scale > 1 ? 'grab' : 'default';
  };

  const getDistance = (touches: React.TouchList) => {
    return Math.sqrt(
      Math.pow(touches[0].clientX - touches[1].clientX, 2) +
      Math.pow(touches[0].clientY - touches[1].clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      initialPinchDistance.current = getDistance(e.touches);
    } else if (e.touches.length === 1 && scale > 1) {
      e.preventDefault();
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance.current) {
        e.preventDefault();
        const newPinchDistance = getDistance(e.touches);
        const scaleFactor = newPinchDistance / initialPinchDistance.current;
        const newScale = Math.max(1, Math.min(scale * scaleFactor, 5));
        setScale(newScale);
        setPosition(clampPosition(position.x, position.y, newScale));
        initialPinchDistance.current = newPinchDistance; // Update for continuous zoom
    } else if (e.touches.length === 1 && isDragging.current) {
        e.preventDefault();
        const newX = e.touches[0].clientX - dragStart.current.x;
        const newY = e.touches[0].clientY - dragStart.current.y;
        setPosition(clampPosition(newX, newY, scale));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    isDragging.current = false;
    initialPinchDistance.current = null;
  };

  const handleNext = useCallback(() => {
    setCurrentImageIndex((currentImageIndex + 1) % slides.length);
    setRotation(0);
  }, [currentImageIndex, slides.length, setCurrentImageIndex]);

  const handlePrev = useCallback(() => {
    setCurrentImageIndex((currentImageIndex - 1 + slides.length) % slides.length);
    setRotation(0);
  }, [currentImageIndex, slides.length, setCurrentImageIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'Escape') {
      closeGallery();
    }
  }, [handleNext, handlePrev, closeGallery]); // Добавляем зависимости

  useEffect(() => {
    if (isGalleryOpen) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGalleryOpen, slides, currentImageIndex, handleKeyDown]); // Добавляем handleKeyDown в зависимости

  if (!isGalleryOpen || !slides.length) {
    return null;
  }

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentSlide = slides[currentImageIndex];
    const link = document.createElement('a');
    link.href = currentSlide.src;
    link.download = currentSlide.alt || 'downloaded-image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeGallery();
    }
  };

  const currentSlide = slides[currentImageIndex];

  return (
    <div className="gallery-overlay" onClick={handleOverlayClick}>
      <div className="gallery-toolbar">
        <button onClick={handleRotate} className="gallery-button">
          <Image src={icons.rotate} alt="Rotate" width={24} height={24} />
        </button>
        <button onClick={handleDownload} className="gallery-button">
          <Image src={icons.download} alt="Download" width={24} height={24} />
        </button>
      </div>

      <button onClick={closeGallery} className="gallery-close-button">
        <Image src={icons.closeModal} alt="Close" width={32} height={32} />
      </button>

      <button onClick={handlePrev} className="gallery-nav-button gallery-nav-prev">
        <Image src={icons.arrowBack} alt="Previous" width={48} height={48} />
      </button>

      <div className="gallery-main-view" ref={containerRef}>
        <div className="gallery-image-container">
          <img
            ref={imageRef}
            src={currentSlide.src}
            alt={currentSlide.alt}
            className="gallery-image"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              cursor: scale > 1 ? 'grab' : 'default',
              transition: isDragging.current ? 'none' : 'transform 0.1s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>
        {currentSlide.description && (
          <div className="gallery-description">
            {currentSlide.description}
          </div>
        )}
      </div>

      <button onClick={handleNext} className="gallery-nav-button gallery-nav-next">
        <Image src={icons.arrowRight} alt="Next" width={48} height={48} />
      </button>
    </div>
  );
};

export default ImageGallery;

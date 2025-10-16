'use client';

import React, { useState, useLayoutEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

import { useAuth } from '@/app/providers/AuthProvider/AuthContext';
import { BurgerMenu } from '@/shared/assets/Icons/icons';
import { AppRoutes } from '@/shared/config/paths'; // Предполагаемый путь к константам роутов
import { variantsStylesBackground, variantsStylesIcons } from '@/shared/assets/VariantStyles/variantStyles';
import WelcomeCarousel from '@/widgets/WelcomeCarousel/WelcomeCarousel';
import SmallSettings from '@/features/manage-settings/ui/SmallSettings';
import { SLIDE_DEFINITIONS } from '@/shared/utils/slides';

const WelcomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // УПРОЩЕНИЕ СОСТОЯНИЯ (Ясность)
  const router = useRouter();
  const { t } = useTranslation();
  const { user, queryLoading } = useAuth();

  useLayoutEffect(() => {
    if (!queryLoading && user) {
      router.push(AppRoutes.CHAT);
    }
  }, [user, queryLoading, router]);

  const slides = useMemo(() => {
    return SLIDE_DEFINITIONS.map(slide => ({
      ...slide,
      title: t(slide.titleKey),
      description: t(slide.descriptionKey),
      alt: t(slide.altKey),
    }));
  }, [t]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  if (queryLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Image
          src="/images/logo.png"
          alt={t('welcome_page.loading_text')}
          width={175}
          height={175}
          className="rounded-full"
          priority
        />
      </div>
    );
  }

  return !user ? (
    <div className={`${variantsStylesBackground.backgroundAccent} flex flex-col items-center justify-center min-h-screen p-4`}>
      {isSettingsOpen && <SmallSettings onClose={closeSettings} isOpen={isSettingsOpen} />}
      
      <header className="absolute top-6 right-6">
        <button onClick={openSettings} aria-label={t('welcome_page.burger_menu_alt')}>
            <BurgerMenu className={`${variantsStylesIcons.iconSecondary} w-6 h-6 text-text-primary cursor-pointer`} />
        </button>
      </header>

      <WelcomeCarousel
        slides={slides}
        currentSlide={currentSlide}
        onNextSlide={nextSlide}
        onPrevSlide={prevSlide}
        onGetStarted={() => router.push(AppRoutes.REGISTER)} // ИСПОЛЬЗУЕМ КОНСТАНТУ
      />
    </div>
  ) : null;
};

export default WelcomePage;
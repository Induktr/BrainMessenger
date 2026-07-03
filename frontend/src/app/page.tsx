'use client';

import { useState, useLayoutEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext';
import { useSlide } from '@/hooks/useSlide';

import { BurgerMenu } from '@/shared/assets/Icons/icons';
import { Button } from '@/shared/ui/Button/Button';
import Image from 'next/image';
import WelcomeCarousel from '@/widgets/WelcomeCarousel/WelcomeCarousel';
import SmallSettings from '@/features/manage-settings/ui/SmallSettings';

import { APP_ROUTES } from '@/shared/config/paths';
import { SLIDE_DEFINITIONS } from '@/shared/utils/slides';
import { VARIANTS_BACKGROUND, VARIANTS_ICONS } from '@/shared/assets/VariantStyles/variantStyles';

const WelcomePage = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const router = useRouter();
  const { slides, current, next, setNext, prev, setPrev, isLast } = useSlide(SLIDE_DEFINITIONS);
  const { t } = useTranslation();
  const { user, queryLoading } = useAuth();

  useLayoutEffect(() => {
    if (!queryLoading && user) router.push(APP_ROUTES.CHAT);
  }, [user, queryLoading, router]);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return user ? null : (
    <div className={`${VARIANTS_BACKGROUND.backgroundAccent} flex flex-col items-center justify-center min-h-screen p-4`}>
      {isSettingsOpen && <SmallSettings onClose={closeSettings} isOpen={isSettingsOpen} />}

      {queryLoading && (
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
      )}
      
      <header className="absolute top-6 right-6">
        <Button
          onClick={openSettings}
          aria-label={t('welcome_page.burger_menu_alt')}
          size="icon"
        >
          <BurgerMenu className={`${VARIANTS_ICONS.iconSecondary} w-6 h-6 text-text-primary cursor-pointer`} />
        </Button>
      </header>

      <WelcomeCarousel
        slides={slides}
        currentSlide={current}
        onNextSlide={() => setNext}
        onPrevSlide={() => setPrev}
        onGetStarted={() => router.push(APP_ROUTES.REGISTER)}
      />
    </div>
  );
};

export default WelcomePage;
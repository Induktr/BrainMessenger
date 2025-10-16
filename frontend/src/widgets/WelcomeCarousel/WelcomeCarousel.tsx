import React from 'react';
import Button from '@/shared/ui/Button/Button';
import { ArrowLeft, ArrowRight } from '@/shared/assets/Icons/icons';
import { variantsStylesIcons } from '@/shared/assets/VariantStyles/variantStyles';
import { useTranslation } from 'react-i18next';

interface Slide {
  image?: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
  description: string;
}

interface WelcomeCarouselProps {
  slides: Slide[];
  currentSlide: number;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  onGetStarted: () => void;
}

const WelcomeCarousel: React.FC<WelcomeCarouselProps> = ({
  slides,
  currentSlide,
  onNextSlide,
  onPrevSlide,
  onGetStarted,
}) => {
  const { t } = useTranslation();
  const slide = slides[currentSlide];

  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
      <h1 className="text-2xl font-bold mb-4">{slide.title}</h1>
      <div className="mb-8 min-h-[120px] flex items-center justify-center">
        {slide.image || slide.icon}
      </div>

      <div className="relative flex items-center justify-center w-full max-w-md mb-10">
        <Button
          onClick={onPrevSlide}
          disabled={currentSlide === 0}
          variant="ghost"
          className="absolute left-0 p-2 rounded-full"
        >
          <ArrowLeft alt={t('welcome_page.back_button_alt')} className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} />
        </Button>
        <Button
          onClick={onNextSlide}
          disabled={currentSlide === slides.length - 1}
          variant="ghost"
          className="absolute right-0 p-2"
        >
          <ArrowRight alt={t('welcome_page.next_button_alt')} className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} />
        </Button>
      </div>
      <p className="text-[16px] mb-10 max-w-md min-h-[72px]">{slide.description}</p>

      <Button
        variant="primary"
        className="w-full from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-[var(--color-background)] max-w-[456px] text-2xl min-h-[70px] py-3 rounded-lg font-semibold"
        onClick={onGetStarted}
      >
        {t('welcome_page.get_started_button')}
      </Button>
    </div>
  );
};

export default WelcomeCarousel;
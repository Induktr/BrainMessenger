'use client'; // This is a Client Component

import React, { 
  useState, 
  useEffect, 
  useLayoutEffect } from 'react'; // Import useLayoutEffect
import { useRouter } from 'next/navigation'; // Import useRouter
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext'; // Import useAuth
import { 
  Shield, 
  Channel, 
  Castle, 
  Increase, 
  ArrowLeft, 
  ArrowRight, 
  BurgerMenu } from '@/shared/assets/Icons/icons';
import { IMAGES } from '@/shared/assets/Images/images';
import Button from '@/shared/ui/Button/Button';
import Image from 'next/image';
import SmallSettings from '@/features/manage-settings/ui/SmallSettings';
import { 
  variantsStylesBackground, 
  variantsStylesIcons, 
  variantsStylesText 
} from '@/shared/assets/variantStyles/variantStyles';

const WelcomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter(); // Get router instance
  const { t } = useTranslation(); // Initialize useTranslation
  const { user, queryLoading } = useAuth(); // Use useAuth hook
  const [currentView, setCurrentView] = useState('');

  // Redirect authenticated users to the chat page
  useLayoutEffect(() => { // Use useLayoutEffect
    console.log('WelcomePage useLayoutEffect - user:', user, 'loading:', queryLoading); // Debug log inside effect
    if (!queryLoading && user) {
      console.log('WelcomePage useLayoutEffect - Redirecting to /chat'); // Debug log before redirect
      router.push('/chat');
    }
  }, [user, queryLoading, router]); // Depend on user, loading, and router

  console.log('WelcomePage - user:', user, 'loading:', queryLoading); // Debug log

  const slides = [
    {
      image: <Image src={IMAGES.logoBrainMessenger} alt={t('welcome_page.logo_alt')} width={175} height={175}></Image>, // Temporarily commented out for debugging
      title: t('welcome_page.slide1_title'),
      description: t('welcome_page.slide1_description'),
      // Add more slides as needed based on the mockup/requirements
    },
    {
      icon: <Shield alt={t('welcome_page.shield_alt')} className={variantsStylesIcons.iconAccent} width={120} height={120}></Shield>,
      title: t('welcome_page.slide2_title'),
      description: t('welcome_page.slide2_description'),
    },
    {
      icon: <Channel alt={t('welcome_page.group_alt')} className={variantsStylesIcons.iconAccent} width={120} height={120}></Channel>,
      title: t('welcome_page.slide3_title'),
      description: t('welcome_page.slide3_description'),
    },
    {
      icon: <Castle alt={t('welcome_page.castle_alt')} className={`${variantsStylesIcons.iconAccent}`} width={120} height={120}></Castle>,
      title: t('welcome_page.slide4_title'),
      description: t('welcome_page.slide4_description'),
    },
    {
      icon: <Increase alt={t('welcome_page.increase_alt')} className={variantsStylesIcons.iconAccent} width={120} height={120}></Increase>,
      title: t('welcome_page.slide5_title'),
      description: t('welcome_page.slide5_description'),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };
  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  const handleSmallSettingsClick = () => {
    setCurrentView('smallSettings')
  }

  const handleClose = () => {
    setCurrentView('')
  }

  // Keep the original useEffect for potential other side effects if needed,
  // but the primary redirect logic is now in useLayoutEffect
  // useEffect(() => {
  //   console.log('WelcomePage useEffect - user:', user, 'loading:', loading); // Debug log inside effect
  //   if (!loading && user) {
  //     console.log('WelcomePage useEffect - Redirecting to /chat'); // Debug log before redirect
  //     router.push('/chat');
  //   }
  // }, [user, loading, router]); // Depend on user, loading, and router


  // Optionally show a loading state while checking authentication
  if (queryLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Image
          src="/images/logo.png" // Path to your logo
          alt={t('welcome_page.loading_text')}
          width={175}
          height={175}
          style={{ borderRadius: '100%' }} // Make the image round
        />
      </div>
    );
  }

  // If user is authenticated, the useEffect hook will handle the redirect.
  // If not authenticated, render the welcome page.
  return (
    <div className={`${variantsStylesBackground.backgroundAccent} flex flex-col items-center justify-center min-h-screen p-4`}>
      {currentView === 'smallSettings' && (
        <SmallSettings onClose={handleClose} isOpen={true}/>
      )}
      {/* Header */}
      <header className="absolute top-6 right-6">
        <BurgerMenu alt={t('welcome_page.burger_menu_alt')} onClick={handleSmallSettingsClick} className={`${variantsStylesIcons.iconSecondary} w-6 h-6 text-text-primary cursor-pointer`} />
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
        {/* Render slide image or icon */}
        <h1 className="text-2xl font-bold mb-4">{slides[currentSlide].title}</h1>
        <div className="mb-8">
          {slides[currentSlide].image || slides[currentSlide].icon}
        </div>


        {/* Slider Navigation */}
        <div className="relative flex items-center justify-center w-full max-w-md mb-10">
          <Button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            variant="ghost"
            className="absolute left-0 p-2 rounded-full"
          >
            <ArrowLeft alt={t('welcome_page.back_button_alt')} className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} />
          </Button>
          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            variant="ghost"
            className="absolute right-0 p-2"
          >
            <ArrowRight alt={t('welcome_page.next_button_alt')} className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} />
          </Button>
        </div>
        <p className="text-[16px] mb-10 max-w-md">{slides[currentSlide].description}</p>

        {/* Get Started Button */}
        <Button variant="primary" className="w-full from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] text-[var(--color-background)] max-w-[456px] text-2xl min-h-[70px] py-3 rounded-lg font-semibold" onClick={() => router.push('/register')}>
          {t('welcome_page.get_started_button')}
        </Button>
      </div>
    </div>
  );
};

export default WelcomePage;

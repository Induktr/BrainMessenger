'use client'; // This is a Client Component

import React, { useState, useEffect, useLayoutEffect } from 'react'; // Import useLayoutEffect
import { useRouter } from 'next/navigation'; // Import useRouter
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthProvider/AuthContext'; // Import useAuth
import { ICONS } from '@/shared/assets/Icons/icons';
import { IMAGES } from '@/shared/assets/Images/images';
import Button from '@/shared/ui/Button/Button';
import Image from 'next/image';
import SmallSettings from '@/features/manage-settings/ui/SmallSettings';

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
      image: <Image src={IMAGES.logoBrainMessenger} alt={t('welcome_page.logo_alt')} className="logo-container-size" width={175} height={175}></Image>, // Temporarily commented out for debugging
      title: t('welcome_page.slide1_title'),
      description: t('welcome_page.slide1_description'),
      // Add more slides as needed based on the mockup/requirements
    },
    {
      icon: <Image src={ICONS.shield} alt={t('welcome_page.shield_alt')} className="icon-container-size" width={120} height={120}></Image>,
      title: t('welcome_page.slide2_title'),
      description: t('welcome_page.slide2_description'),
    },
    {
      icon: <Image src={ICONS.channel} alt={t('welcome_page.group_alt')} className="icon-container-size" width={120} height={120}></Image>,
      title: t('welcome_page.slide3_title'),
      description: t('welcome_page.slide3_description'),
    },
    {
      icon: <Image src={ICONS.castle} alt={t('welcome_page.castle_alt')} className="icon-container-size" width={120} height={120}></Image>,
      title: t('welcome_page.slide4_title'),
      description: t('welcome_page.slide4_description'),
    },
    {
      icon: <Image src={ICONS.increase} alt={t('welcome_page.increase_alt')} className="icon-container-size" width={120} height={120}></Image>,
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
    <div className="welcome-container">
      {currentView === 'smallSettings' && (
        <div>
          <SmallSettings onClose={handleClose} isOpen={true}/>
        </div>
      )}
      {/* Header */}
      <header className="welcome-header">
        {/* Right side: Burger Menu Icon */}
        <div className="burger-menu-container">
            <Image src={ICONS.burgerMenu} alt={t('welcome_page.burger_menu_alt')} onClick={handleSmallSettingsClick} className="icon" width={24} height={24}></Image>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Render slide image or icon */}
        <div className="slide-image-container"> {/* Add a container for styling */}
          {slides[currentSlide].image || slides[currentSlide].icon}
        </div>

        <h1 className="slide-title h1">{slides[currentSlide].title}</h1>
        <p className="slide-description p">{slides[currentSlide].description}</p>

        {/* Slider Navigation */}
        <div className="slider-navigation">
          <Button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="slider-button prev-button"
          >
            {/* Left Arrow SVG */}
              {/* Left Arrow SVG */}
              <Image src={ICONS.arrowLeft} alt={t('welcome_page.back_button_alt')} className="icon" width={24} height={24}></Image>
          </Button>
          {/* Placeholder for slider indicators if needed */}
          <div className="slider-indicators">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`slider-indicator ${index === currentSlide ? 'active' : ''}`}
              ></span>
            ))}
          </div>
          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="slider-button next-button"
          >
            {/* Right Arrow SVG */}
            <Image src={ICONS.arrowRight} alt={t('welcome_page.next_button_alt')} className="icon" width={24} height={24}></Image>
          </Button>
        </div>


        {/* Get Started Button */}
        <Button className="get-started-button" onClick={() => router.push('/register')}>
          {t('welcome_page.get_started_button')}
        </Button>
      </div>
    </div>
  );
};

export default WelcomePage;

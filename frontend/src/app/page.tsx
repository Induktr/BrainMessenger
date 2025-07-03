'use client'; // This is a Client Component

import React, { useState, useEffect, useLayoutEffect } from 'react'; // Import useLayoutEffect
import { useRouter } from 'next/navigation'; // Import useRouter
import { useAuth } from '@/features/user-auth/ui/AuthContext'; // Import useAuth
import { ICONS } from '@/shared/assets/Icons/icons';
import { IMAGES } from '@/shared/assets/Images/images';
import Button from '@/shared/ui/Button/Button';
import Image from 'next/image';
import SmallSettings from '@/features/manage-settings/ui/SmallSettings';

const slides = [
  {
    image: <Image src={IMAGES.logoBrainMessenger} alt="logoBrainMessenger" className="logo-container-size" width={175} height={175}></Image>, // Temporarily commented out for debugging
    title: 'Welcome to BrainMessenger - let\'s get started!',
    description: 'Brain Messenger helps you stay connected.',
    // Add more slides as needed based on the mockup/requirements
  },
  {
    icon: <Image src={ICONS.shield} alt="Shield" className="icon-container-size" width={120} height={120}></Image>,
    title: 'Secure Communication', // Example from mockup
    description: 'End-to-end encryption ensures your messages stay private and secure.', // Example from mockup
  },
  {
    icon: <Image src={ICONS.channel} alt="Group" className="icon-container-size" width={120} height={120}></Image>,
    title: 'Main features', // Example from mockup
    description: 'Create private and group chats, send messages and receive real-time notifications.', // Example from mockup
  },
  {
    icon: <Image src={ICONS.castle} alt="Castle" className="icon-container-size" width={120} height={120}></Image>,
    title: 'Safety first', // Example from mockup
    description: 'Your data is protected by end-to-end encryption and state-of-the-art security protocols.', // Example from mockup
  },
  {
    icon: <Image src={ICONS.increase} alt="Increase" className="icon-container-size" width={120} height={120}></Image>,
    title: 'The future of BrainMessenger', // Example from mockup
    description: 'Coming soon: AI assistant, CRM integrations and blockchain transaction support!', // Example from mockup
  },
];


const WelcomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter(); // Get router instance
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
          alt="Loading..."
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
            <Image src={ICONS.burgerMenu} alt="Burger menu" onClick={handleSmallSettingsClick} className="icon" width={24} height={24}></Image>
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
              <Image src={ICONS.arrowLeft} alt="Arrow Left" className="icon" width={24} height={24}></Image>
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
            <Image src={ICONS.arrowRight} alt="Arrow Right" className="icon" width={24} height={24}></Image>
          </Button>
        </div>


        {/* Get Started Button */}
        <Button className="get-started-button" onClick={() => router.push('/register')}>
          Get started
        </Button>
      </div>
    </div>
  );
};

export default WelcomePage;
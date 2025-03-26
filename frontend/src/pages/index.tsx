import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const WelcomeSlider = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const icons = [
    'https://res.cloudinary.com/dsjalneil/image/upload/v1739618043/BrainMessengerLogo_yuxq6c.png',
    'https://res.cloudinary.com/dsjalneil/image/upload/v1734708432/boldly-change-the-proportions--for-example--enlarg_ndehsg.svg',
    'https://res.cloudinary.com/dsjalneil/image/upload/v1742508636/CreateChannelIcon_kw1k68.svg',
    'https://res.cloudinary.com/dsjalneil/image/upload/v1734645760/use-a-more-geometric-lock-with-slanted-lines-or-ov_aynv46.svg',
    'https://res.cloudinary.com/dsjalneil/image/upload/v1734708159/boldly-change-the-proportions--for-example--increa_r2v11j.svg',
  ];

  const slides = [
    {
      title: 'Welcome to Brain Messenger - let\'s get started!',
      description: 'A modern messaging application with advanced features for secure and convenient communication.',
    },
    {
      title: 'Secure Communication',
      description: 'End-to-end encryption ensures your messages stay private and secure.',
    },
    {
      title: 'Main features',
      description: 'Create private and group chats, send messages and receive real-time notifications.',
    },
    {
      title: 'Safety first',
      description: 'Your data is protected by end-to-end encryption and state-of-the-art security protocols.',
    },
    {
      title: 'The future of BrainMessenger',
      description: 'Coming soon: AI assistant, CRM integrations and blockchain transaction support!',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 10000000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === slides.length - 1 ? 0 : prevSlide + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === 0 ? slides.length - 1 : prevSlide - 1));
  };

  const handleGetStarted = () => {
    router.push('/register');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background-dark">
      {/* Slide Content */}
      <div className="relative flex items-center justify-center w-full max-w-md">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="absolute left-5 text-disabled-light hover:text-textPrimary-light focus:outline-none"
          style={{ transform: 'rotate(180deg)', bottom: '50%' }}
        >
          <img
            src="https://res.cloudinary.com/dsjalneil/image/upload/v1734771378/--shape--arrow-with-the-effect-of-forward-movement_doyeth.svg"
            alt="Previous Slide"
            className="w-6 h-6"
            style={{ filter: 'grayscale(1) brightness(0.8)' }}
          />
        </button>

        <div className="flex flex-col items-center justify-center">
          {/* Welcome Text */}
          <h1 className="text-h2 font-bold text-textPrimary-dark mb-4 text-center">
            {slides[currentSlide].title}
          </h1>

          {/* Logo */}
          <div className="mb-8">
            {currentSlide === 0 ? (
              <img
                src={icons[0]}
                alt="BrainMessenger Logo"
                className="w-36 h-36"
              />
            ) : (
              <img
                src={icons[currentSlide]}
                alt={slides[currentSlide].title}
                className="w-36 h-36"
              />
            )}
          </div>

          {/* Description */}
          <p className="text-textSecondary-dark text-center">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="absolute right-5 text-disabled-light hover:text-textPrimary-light focus:outline-none"
          style={{ bottom: '50%' }}
        >
          <img
            src="https://res.cloudinary.com/dsjalneil/image/upload/v1734771378/--shape--arrow-with-the-effect-of-forward-movement_doyeth.svg"
            alt="Next Slide"
            className="w-6 h-6"
            style={{ filter: 'grayscale(1) brightness(0.8)' }}
          />
        </button>
      </div>
      
      {/* Get Started Button */}
      <button
        onClick={handleGetStarted}
        className="mt-8 bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to text-background-dark py-3 px-8 rounded-[10px] shadow-md hover:scale-105 transition-transform duration-300"
        style={{ width: '400px' }}>
        Get Started
      </button>
      <div className="mt-4 text-textSecondary-dark">
        Already have an account? <a href="/login" className="text-secondary hover:underline">Log in</a>
      </div>
      <div className="absolute top-4 right-4">
        <img
          src="https://res.cloudinary.com/dsjalneil/image/upload/v1736710074/a-menu-icon-composed-of-asymmetrical-geometric-sha_s68cey.svg"
          alt="Menu"
          className="w-6 h-6"
          style={{ filter: 'grayscale(1) brightness(0.8)' }}
        />
      </div>
    </div>
  );
};

export default WelcomeSlider;
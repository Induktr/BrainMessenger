import { useState, useCallback } from 'react';

export const useFeedbackAnimation = (animationClass: string, duration: number = 500) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, [duration]);

  const animationClassName = isAnimating ? animationClass : '';

  return { triggerAnimation, animationClassName };
};
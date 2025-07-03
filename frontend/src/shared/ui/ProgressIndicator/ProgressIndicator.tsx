import React from 'react';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  currentStep: number; // Current step (1-based)
  totalSteps: number; // Total number of steps
  size?: number; // Diameter of the circle
  progressColor?: string; // Color for the animating top half
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  size = 175, // Default size
  progressColor = '#96C93D', // Default progress color
}) => {
  // Calculate the progress percentage (excluding the first step which is just logo)
  // The progress starts after the first step.
  // So, if totalSteps is 5, the progress is calculated over steps 2, 3, 4, 5 (4 steps of progress)
  // The range of steps that show progress is from 2 to totalSteps.
  const progressSteps = totalSteps - 1; // Number of steps that show progress
  const currentProgressStep = Math.max(0, currentStep - 1); // Current step in terms of progress (0-based)

  // Calculate the percentage of progress completed
  // Ensure we don't divide by zero if totalSteps is 1
  const progressPercentage = totalSteps > 1 ? currentProgressStep / progressSteps : 0;

  // Map the progress percentage to a rotation angle
  // 0% progress corresponds to 180deg rotation (hidden)
  // 100% progress corresponds to 0deg rotation (fully visible)
  const targetAngle = 180 * (1 - progressPercentage);

  // Ensure currentStep is within the valid range for animation (steps 2 to totalSteps)
  const shouldAnimate = currentStep >= 2 && currentStep <= totalSteps;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        borderRadius: '50%', // Make the container round
        boxSizing: 'border-box', // Include border in size
        overflow: 'hidden', // Hide the parts outside the circle
        opacity: 0.1, // Keep opacity as per previous state
        zIndex: -111, // Keep zIndex as per previous state
      }}
    >
      {/* Static div for the visually bottom half (unrotated top half) */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          position: 'absolute',
          top: 0,
          left: 0,
          // Clip to show the unrotated top half (visually bottom after container rotation)
          clipPath: 'inset(50% 0 0 0)',
          WebkitClipPath: 'inset(50% 0 0 0)',
        }}
      ></div>

      {/* Animating div for the visually top half (unrotated bottom half) */}
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: progressColor,
          position: 'absolute',
          top: 0,
          left: 0,
          // Clip to show the unrotated bottom half (visually top after container rotation)
          clipPath: 'inset(0 0 50% 0)',
          WebkitClipPath: 'inset(0 0 50% 0)',
          transformOrigin: '50% 100%', // Rotate around the bottom center of the clipped area
        }}
        initial={{
           transform: `rotate(180deg)`, // Set initial rotation to hidden state
        }}
        animate={{
          // Animate the rotation only if shouldAnimate is true
          transform: shouldAnimate ? `rotate(${targetAngle}deg)` : `rotate(180deg)`,
        }}
        transition={{
          duration: 0.5, // Animation duration
          ease: 'easeInOut', // Easing function
        }}
      ></motion.div>
    </div>
  );
};

export default ProgressIndicator;
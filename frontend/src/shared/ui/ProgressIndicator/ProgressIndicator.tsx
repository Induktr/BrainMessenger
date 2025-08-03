import React from 'react';

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
  progressColor = 'var(--color-gradient-start)', // Default progress color from CSS variables
}) => {
  // Calculate the progress percentage
  const progressSteps = totalSteps - 1;
  const currentProgressStep = Math.max(0, currentStep - 1);
  const progressPercentage = totalSteps > 1 ? currentProgressStep / progressSteps : 0;

  // Map the progress percentage to a rotation angle
  const targetAngle = 180 * (1 - progressPercentage);

  // Ensure currentStep is within the valid range for animation
  const shouldAnimate = currentStep >= 2 && currentStep <= totalSteps;
  const rotationAngle = shouldAnimate ? targetAngle : 180;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        borderRadius: '50%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        opacity: 0.1,
        zIndex: -111,
      }}
    >
      {/* Static div for the visually bottom half */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          position: 'absolute',
          top: 0,
          left: 0,
          clipPath: 'inset(50% 0 0 0)',
        }}
      />

      {/* Animating div for the visually top half */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: progressColor,
          position: 'absolute',
          top: 0,
          left: 0,
          clipPath: 'inset(0 0 50% 0)',
          transformOrigin: '50% 100%',
          transform: `rotate(${rotationAngle}deg)`,
          transition: 'transform 0.5s ease-in-out', // CSS transition for smooth animation
        }}
      />
    </div>
  );
};

export default ProgressIndicator;
import React from 'react';

interface HalfEllipseProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Компонент полукруглого эллипса с непрозрачностью 10% и цветом #96C93D
 */
const HalfEllipse: React.FC<HalfEllipseProps> = ({
  className = '',
  width = '100%',
  height = '200px',
  position = 'bottom',
}) => {
  // Определяем стили для разных позиций
  const getTransform = () => {
    switch (position) {
      case 'top':
        return 'rotate(180deg)';
      case 'left':
        return 'rotate(90deg)';
      case 'right':
        return 'rotate(270deg)';
      case 'bottom':
      default:
        return 'rotate(0deg)';
    }
  };

  return (
    <div
      className={`absolute overflow-hidden ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        style={{ transform: getTransform() }}
      >
        <ellipse
          cx="50"
          cy="50"
          rx="50"
          ry="50"
          fill="#96C93D"
          fillOpacity="0.1"
        />
      </svg>
    </div>
  );
};

export default HalfEllipse;
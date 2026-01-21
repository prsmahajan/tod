"use client";

import React, { useRef, RefObject } from 'react';
import { useOnScreen } from '@/hooks/useOnScreen';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right';
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  direction = 'up'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref as RefObject<HTMLElement>, { threshold: 0.1, triggerOnce: true });

  const getDirectionClass = () => {
    if (!isVisible) {
      switch (direction) {
        case 'left':
          return 'opacity-0 -translate-x-12';
        case 'right':
          return 'opacity-0 translate-x-12';
        case 'up':
        default:
          return 'opacity-0 translate-y-12';
      }
    }
    return 'opacity-100 translate-y-0 translate-x-0';
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${getDirectionClass()} ${className}`}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;

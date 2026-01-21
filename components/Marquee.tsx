"use client";

import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number; // Duration in seconds for one complete loop
  direction?: 'left' | 'right';
}

const Marquee: React.FC<MarqueeProps> = ({ children, speed = 4, direction = 'left' }) => {
  return (
    <div className="relative overflow-hidden w-full">
      <div
        className="flex gap-2"
        style={{
          animation: `marquee-scroll ${speed}s linear infinite`,
          animationDirection: direction === 'right' ? 'reverse' : 'normal',
        }}
      >
        {/* First set */}
        <div className="flex gap-2 flex-shrink-0">
          {children}
        </div>
        {/* Duplicate for seamless loop */}
        <div className="flex gap-2 flex-shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
};

Marquee.displayName = 'Marquee';

export default Marquee;

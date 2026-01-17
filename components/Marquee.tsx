"use client";

import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number; // Duration in seconds
  direction?: 'left' | 'right';
}

const Marquee: React.FC<MarqueeProps> = React.memo(({ children, speed = 40, direction = 'left' }) => {
  return (
    <div className="overflow-hidden relative">
      <div
        className="flex gap-4 marquee-animated"
        style={{
          '--marquee-duration': `${speed}s`,
          animationDirection: direction === 'right' ? 'reverse' : 'normal',
          willChange: 'transform',
        } as React.CSSProperties}
      >
        {/* First set of items */}
        <div className="flex gap-4 flex-shrink-0">
          {children}
        </div>
        {/* Duplicate for seamless loop */}
        <div className="flex gap-4 flex-shrink-0">
          {children}
        </div>
        {/* Third duplicate to ensure no gaps */}
        <div className="flex gap-4 flex-shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
});

Marquee.displayName = 'Marquee';

export default Marquee;

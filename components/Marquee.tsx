"use client";

import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
}

const Marquee: React.FC<MarqueeProps> = ({ children }) => {
  return (
    <div className="overflow-hidden">
      <div className="flex marquee-content">
        {children}
        {children}
      </div>
    </div>
  );
};

export default Marquee;

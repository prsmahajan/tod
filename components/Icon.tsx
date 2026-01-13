import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: 'logo' | 'menu' | 'close' | 'paw' | 'chat' | 'send' | 'heart' | 'shield' | 'users';
}

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'logo':
      return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
          <circle cx="50" cy="50" r="50" fill="none" />
          <path d="M50,50 L93.3,25 A50,50 0 0,0 75,6.7 z" fill="currentColor" />
          <path d="M50,50 L75,93.3 A50,50 0 0,0 93.3,75 z" fill="currentColor" />
          <path d="M50,50 L25,93.3 A50,50 0 0,0 6.7,75 z" fill="currentColor" />
          <path d="M50,50 L6.7,25 A50,50 0 0,0 25,6.7 z" fill="currentColor" />
          <path d="M50,50 L50,0 A50,50 0 0,0 50,0 L50,50 z" transform="rotate(45 50 50)" fill="currentColor" />
          <path d="M50,50 L100,50 A50,50 0 0,0 100,50 L50,50 z" transform="rotate(135 50 50)" fill="currentColor" />
          <path d="M50,50 L50,100 A50,50 0 0,0 50,100 L50,50 z" transform="rotate(225 50 50)" fill="currentColor" />
          <path d="M50,50 L0,50 A50,50 0 0,0 0,50 L50,50 z" transform="rotate(315 50 50)" fill="currentColor" />
        </svg>
      );
    case 'paw':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
                <path d="M12 2c-3.3 0-6 2.7-6 6 0 2.2 1.2 4.1 3 5.2V17c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-3.8c1.8-1.1 3-3 3-5.2 0-3.3-2.7-6-6-6zm-4 6c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zM5 22c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2zm14 0c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2z"/>
            </svg>
        );
    case 'menu':
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
        </svg>
      );
    case 'close':
      return (
        <svg stroke="currentColor" fill="none" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'chat':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      );
    case 'send':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      );
    case 'heart':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        );
    case 'shield':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
        );
    case 'users':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
        );
    default:
      return null;
  }
};

export default Icon;

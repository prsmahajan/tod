"use client";

import React from "react";
import { useTheme, Theme } from "./ThemeProvider";

interface ThemeSwitcherProps {
  isFixed: boolean;
}

const THEMES: { name: Theme; color: string }[] = [
  { name: 'lavender', color: 'bg-indigo-200' },
  { name: 'black', color: 'bg-gray-800' },
  { name: 'off-white', color: 'bg-stone-200' },
];

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ isFixed }) => {
  const { theme, setTheme } = useTheme();

  const containerClasses = isFixed
    ? 'fixed bottom-4 left-4 z-50 hidden md:flex flex-col space-y-2'
    : 'flex space-x-2';

  return (
    <div className={containerClasses}>
      {THEMES.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          aria-label={`Switch to ${t.name} theme`}
          className={`w-6 h-6 rounded-full ${t.color} border-2 transition-transform duration-200 hover:scale-110 ${
            theme === t.name ? 'border-[var(--color-text-primary)]' : 'border-transparent'
          }`}
        />
      ))}
    </div>
  );
};

export default ThemeSwitcher;

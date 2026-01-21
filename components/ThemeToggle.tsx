"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('warm');
    } else {
      setTheme('light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-[#FAFAFA] dark:hover:bg-[#212121] transition-colors border border-transparent hover:border-[#E5E5E5] dark:hover:border-[#404040]"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon size={20} className="text-[#212121] dark:text-gray-300" />
      ) : (
        <Sun size={20} className="text-[#212121] dark:text-gray-300" />
      )}
    </button>
  );
}

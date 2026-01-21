"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "off-white" | "lavender" | "black";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("off-white");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    // Only use saved theme if it's valid, default to off-white
    if (savedTheme && ["off-white", "lavender", "black"].includes(savedTheme)) {
      setThemeState(savedTheme);
    } else {
      // Explicitly default to off-white theme
      setThemeState("off-white");
    }

    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;

      // Remove all theme classes
      root.classList.remove("off-white", "lavender", "black");

      // Add current theme class
      root.classList.add(theme);

      // Save to localStorage
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    if (newTheme === theme) return;

    const root = document.documentElement;

    // Add theme-transition class for smooth background transition
    root.classList.add("theme-transition");

    // Remove it after transition completes
    setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 2000);

    // Change theme
    setThemeState(newTheme);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default values if not in a provider (e.g., during SSR)
    return {
      theme: "off-white" as Theme,
      setTheme: () => {},
    };
  }
  return context;
}

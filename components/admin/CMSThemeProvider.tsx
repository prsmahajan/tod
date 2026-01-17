"use client";

import { createContext, useContext, useState } from "react";

type Theme = "dark"; // CMS is always dark

interface CMSThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const CMSThemeContext = createContext<CMSThemeContextType | null>(null);

export function CMSThemeProvider({ children }: { children: React.ReactNode }) {
  // CMS is always dark theme - no toggle needed
  const [theme] = useState<Theme>("dark");

  const setTheme = () => {
    // No-op - CMS is always dark
  };

  const toggleTheme = () => {
    // No-op - CMS is always dark
  };

  return (
    <CMSThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div className="cms-theme-dark" data-cms-theme="dark">
        {children}
      </div>
    </CMSThemeContext.Provider>
  );
}

export function useCMSTheme() {
  const context = useContext(CMSThemeContext);
  if (!context) {
    throw new Error("useCMSTheme must be used within a CMSThemeProvider");
  }
  return context;
}

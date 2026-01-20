"use client";

import { createContext, useContext, useState } from "react";

type Theme = "light"; // CMS is always light

interface CMSThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const CMSThemeContext = createContext<CMSThemeContextType | null>(null);

export function CMSThemeProvider({ children }: { children: React.ReactNode }) {
  // CMS is always light theme - no toggle needed
  const [theme] = useState<Theme>("light");

  const setTheme = () => {
    // No-op - CMS is always light
  };

  const toggleTheme = () => {
    // No-op - CMS is always light
  };

  return (
    <CMSThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div className="cms-theme-light" data-cms-theme="light">
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

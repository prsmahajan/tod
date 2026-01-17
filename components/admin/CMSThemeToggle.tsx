"use client";

import { useCMSTheme } from "./CMSThemeProvider";
import { Sun, Moon } from "lucide-react";

export function CMSThemeToggle() {
  const { theme, toggleTheme } = useCMSTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-all hover:bg-[#2a2a2a] text-[#999] hover:text-white flex items-center gap-2"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <>
          <Moon size={18} />
          <span className="text-sm hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <Sun size={18} />
          <span className="text-sm hidden sm:inline">Light</span>
        </>
      )}
    </button>
  );
}

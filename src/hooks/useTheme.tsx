"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Theme = "win98" | "winxp";

const STORAGE_KEY = "kk-theme";

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "win98",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("win98");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "winxp" || saved === "win98") setThemeState(saved);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

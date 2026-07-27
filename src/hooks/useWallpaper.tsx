"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useTheme, type Theme } from "./useTheme";
import { WALLPAPERS, defaultWallpaper } from "@/data/wallpapers";

const STORAGE_KEY = (t: Theme) => `kk-wallpaper-${t}`;

function savedOrDefault(t: Theme): string {
  if (typeof window === "undefined") return defaultWallpaper(t).id;
  const saved = window.localStorage.getItem(STORAGE_KEY(t));
  return WALLPAPERS[t].some((w) => w.id === saved) ? saved! : defaultWallpaper(t).id;
}

const WallpaperContext = createContext<{
  wallpaperId: string;
  wallpaperBackground: string;
  setWallpaper: (id: string) => void;
}>({
  wallpaperId: "teal",
  wallpaperBackground: "#008080",
  setWallpaper: () => {},
});

export function WallpaperProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [ids, setIds] = useState<Record<Theme, string>>(() => ({
    win98: savedOrDefault("win98"),
    winxp: savedOrDefault("winxp"),
  }));

  const wallpaperId = ids[theme];
  const wallpaperBackground =
    WALLPAPERS[theme].find((w) => w.id === wallpaperId)?.background ??
    defaultWallpaper(theme).background;

  const setWallpaper = (id: string) => {
    setIds((prev) => ({ ...prev, [theme]: id }));
    localStorage.setItem(STORAGE_KEY(theme), id);
  };

  return (
    <WallpaperContext.Provider value={{ wallpaperId, wallpaperBackground, setWallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaper() {
  return useContext(WallpaperContext);
}

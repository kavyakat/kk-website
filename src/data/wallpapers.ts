import type { Theme } from "@/hooks/useTheme";

export interface WallpaperOption {
  id: string;
  label: string;
  background: string;
}

export const WALLPAPERS: Record<Theme, WallpaperOption[]> = {
  win98: [
    {
      id: "teal",
      label: "None (Teal)",
      background: "#008080",
    },
    {
      id: "clouds",
      label: "Clouds",
      background: "linear-gradient(180deg,#5e9ed6 0%,#87bce8 30%,#c8dff5 65%,#e8f4fd 100%)",
    },
    {
      id: "forest",
      label: "Forest",
      background: "linear-gradient(180deg,#0a2a0a 0%,#1a4a1a 40%,#2d6a2d 80%,#1a3a1a 100%)",
    },
    {
      id: "gone-fishing",
      label: "Gone Fishing",
      background: "linear-gradient(180deg,#1a2a5a 0%,#8a4010 40%,#d46010 70%,#e8a020 100%)",
    },
    {
      id: "black",
      label: "Black",
      background: "#000000",
    },
  ],
  winxp: [
    {
      id: "bliss",
      label: "Bliss",
      background: "#5a8bd6 url(/wallpapers/bliss.jpg) center/cover no-repeat",
    },
    {
      id: "azul",
      label: "Azul",
      background: "linear-gradient(135deg,#0a1a6e 0%,#1a3a9e 35%,#2a5abe 65%,#1a2a8e 100%)",
    },
    {
      id: "autumn",
      label: "Autumn",
      background: "linear-gradient(180deg,#5a7080 0%,#9a6018 40%,#d49030 70%,#8a5010 100%)",
    },
    {
      id: "ascent",
      label: "Ascent",
      background: "linear-gradient(180deg,#3060b8 0%,#5888d4 30%,#88aee0 55%,#4a6a8a 80%,#2a4a6a 100%)",
    },
    {
      id: "black",
      label: "Black",
      background: "#000000",
    },
  ],
};

export function defaultWallpaper(theme: Theme) {
  return WALLPAPERS[theme][0];
}

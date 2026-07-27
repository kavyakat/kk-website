import Desktop from "@/components/desktop/Desktop";
import { ThemeProvider } from "@/hooks/useTheme";
import { CharacterProvider } from "@/hooks/useCharacter";
import { WallpaperProvider } from "@/hooks/useWallpaper";

export default function Home() {
  return (
    <ThemeProvider>
      <CharacterProvider>
        <WallpaperProvider>
          <Desktop />
        </WallpaperProvider>
      </CharacterProvider>
    </ThemeProvider>
  );
}

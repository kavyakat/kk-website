import Desktop from "@/components/desktop/Desktop";
import { ThemeProvider } from "@/hooks/useTheme";
import { CharacterProvider } from "@/hooks/useCharacter";

export default function Home() {
  return (
    <ThemeProvider>
      <CharacterProvider>
        <Desktop />
      </CharacterProvider>
    </ThemeProvider>
  );
}

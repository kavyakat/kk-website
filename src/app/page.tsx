import Desktop from "@/components/desktop/Desktop";
import { ThemeProvider } from "@/hooks/useTheme";

export default function Home() {
  return (
    <ThemeProvider>
      <Desktop />
    </ThemeProvider>
  );
}

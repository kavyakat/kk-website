import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { CharacterProvider, useCharacter } from "@/hooks/useCharacter";
import { WallpaperProvider, useWallpaper } from "@/hooks/useWallpaper";
import SkillsApp from "./SkillsApp";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CharacterProvider>
        <WallpaperProvider>{children}</WallpaperProvider>
      </CharacterProvider>
    </ThemeProvider>
  );
}

function ThemeReadout() {
  const { theme } = useTheme();
  return <span data-testid="active-theme">{theme}</span>;
}

function CharacterReadout() {
  const { character } = useCharacter();
  return <span data-testid="active-character">{character.id}</span>;
}

function WallpaperReadout() {
  const { wallpaperId } = useWallpaper();
  return <span data-testid="active-wallpaper">{wallpaperId}</span>;
}

describe("SkillsApp", () => {
  beforeEach(() => localStorage.clear());

  it("renders Appearance, Assistant and Background controls", () => {
    render(<Providers><SkillsApp /></Providers>);
    expect(screen.getByLabelText("Appearance")).toBeInTheDocument();
    expect(screen.getByLabelText("Assistant")).toBeInTheDocument();
    expect(screen.getByLabelText("None (Teal)")).toBeInTheDocument();
  });

  it("switches theme live via the Appearance dropdown", () => {
    render(<Providers><SkillsApp /><ThemeReadout /></Providers>);
    fireEvent.change(screen.getByLabelText("Appearance"), { target: { value: "winxp" } });
    expect(screen.getByTestId("active-theme").textContent).toBe("winxp");
    expect(localStorage.getItem("kk-theme")).toBe("winxp");
  });

  it("shows XP wallpaper options when theme is XP", () => {
    render(<Providers><SkillsApp /></Providers>);
    fireEvent.change(screen.getByLabelText("Appearance"), { target: { value: "winxp" } });
    expect(screen.getByLabelText("Bliss")).toBeInTheDocument();
    expect(screen.queryByLabelText("None (Teal)")).toBeNull();
  });

  it("switches assistant live via the Assistant dropdown", () => {
    render(<Providers><SkillsApp /><CharacterReadout /></Providers>);
    fireEvent.change(screen.getByLabelText("Assistant"), { target: { value: "merlin" } });
    expect(screen.getByTestId("active-character").textContent).toBe("merlin");
  });

  it("switches wallpaper live when a swatch is clicked", () => {
    render(<Providers><SkillsApp /><WallpaperReadout /></Providers>);
    fireEvent.click(screen.getByLabelText("Clouds"));
    expect(screen.getByTestId("active-wallpaper").textContent).toBe("clouds");
    expect(localStorage.getItem("kk-wallpaper-win98")).toBe("clouds");
  });
});

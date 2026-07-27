import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { CharacterProvider, useCharacter } from "@/hooks/useCharacter";
import SkillsApp from "./SkillsApp";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CharacterProvider>{children}</CharacterProvider>
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

describe("SkillsApp", () => {
  beforeEach(() => localStorage.clear());

  it("renders an Appearance dropdown and an Assistant dropdown", () => {
    render(<Providers><SkillsApp /></Providers>);
    expect(screen.getByLabelText("Appearance")).toBeInTheDocument();
    expect(screen.getByLabelText("Assistant")).toBeInTheDocument();
  });

  it("shows the OS name matching the current theme", () => {
    render(<Providers><SkillsApp /></Providers>);
    expect(screen.getByText(/Kavya OS 98/)).toBeInTheDocument();
  });

  it("switches theme live via the Appearance dropdown", () => {
    render(<Providers><SkillsApp /><ThemeReadout /></Providers>);
    fireEvent.change(screen.getByLabelText("Appearance"), { target: { value: "winxp" } });
    expect(screen.getByTestId("active-theme").textContent).toBe("winxp");
    expect(localStorage.getItem("kk-theme")).toBe("winxp");
  });

  it("updates OS name when theme switches to XP", () => {
    render(<Providers><SkillsApp /></Providers>);
    fireEvent.change(screen.getByLabelText("Appearance"), { target: { value: "winxp" } });
    expect(screen.getByText(/Kavya OS XP/)).toBeInTheDocument();
  });

  it("switches the assistant live via the Assistant dropdown", () => {
    render(<Providers><SkillsApp /><CharacterReadout /></Providers>);
    fireEvent.change(screen.getByLabelText("Assistant"), { target: { value: "merlin" } });
    expect(screen.getByTestId("active-character").textContent).toBe("merlin");
  });
});

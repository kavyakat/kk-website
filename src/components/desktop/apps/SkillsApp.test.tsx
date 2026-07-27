import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import SkillsApp from "./SkillsApp";
import { skills } from "@/data/skills";

function ThemeReadout() {
  const { theme } = useTheme();
  return <span data-testid="active-theme">{theme}</span>;
}

describe("SkillsApp", () => {
  beforeEach(() => localStorage.clear());

  it("shows the first group's tags by default", () => {
    render(<SkillsApp />);
    expect(screen.getByText(skills[0].tags[0])).toBeInTheDocument();
  });

  it("switches tags when a different tab is selected", () => {
    render(<SkillsApp />);
    fireEvent.click(screen.getByText(skills[1].group));
    expect(screen.getByText(skills[1].tags[0])).toBeInTheDocument();
  });

  it("shows theme radios on the Appearance tab", () => {
    render(<SkillsApp />);
    fireEvent.click(screen.getByText("Appearance"));
    expect(screen.getByLabelText(/Windows 98/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Windows XP/i)).toBeInTheDocument();
  });

  it("switches the theme live when XP is chosen from Appearance", () => {
    render(<ThemeProvider><SkillsApp /><ThemeReadout /></ThemeProvider>);
    fireEvent.click(screen.getByText("Appearance"));
    fireEvent.click(screen.getByLabelText(/Windows XP/i));
    expect(screen.getByTestId("active-theme").textContent).toBe("winxp");
    expect(localStorage.getItem("kk-theme")).toBe("winxp");
  });
});

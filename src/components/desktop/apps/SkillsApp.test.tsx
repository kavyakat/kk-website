import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import SkillsApp from "./SkillsApp";

function ThemeReadout() {
  const { theme } = useTheme();
  return <span data-testid="active-theme">{theme}</span>;
}

describe("SkillsApp", () => {
  beforeEach(() => localStorage.clear());

  it("shows system info instead of skill tags", () => {
    render(<SkillsApp />);
    expect(screen.getByText("Kavya Kathuria")).toBeInTheDocument();
    expect(screen.getByText(/Kavya OS 98/)).toBeInTheDocument();
  });

  it("reflects the current theme in the OS name", () => {
    render(
      <ThemeProvider>
        <SkillsApp />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByLabelText("Appearance"), { target: { value: "winxp" } });
    expect(screen.getByText(/Kavya OS XP/)).toBeInTheDocument();
  });

  it("offers an appearance dropdown with both themes", () => {
    render(<SkillsApp />);
    const select = screen.getByLabelText("Appearance");
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Windows 98" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Windows XP" })).toBeInTheDocument();
  });

  it("switches the theme live when XP is chosen from the dropdown", () => {
    render(
      <ThemeProvider>
        <SkillsApp />
        <ThemeReadout />
      </ThemeProvider>
    );
    fireEvent.change(screen.getByLabelText("Appearance"), { target: { value: "winxp" } });
    expect(screen.getByTestId("active-theme").textContent).toBe("winxp");
    expect(localStorage.getItem("kk-theme")).toBe("winxp");
  });
});

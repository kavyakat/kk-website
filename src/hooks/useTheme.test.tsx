import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./useTheme";

function Probe() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("winxp")}>xp</button>
    </div>
  );
}

describe("useTheme", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to win98", () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("theme").textContent).toBe("win98");
  });

  it("setTheme updates value and persists to localStorage", () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    fireEvent.click(screen.getByText("xp"));
    expect(screen.getByTestId("theme").textContent).toBe("winxp");
    expect(localStorage.getItem("kk-theme")).toBe("winxp");
  });

  it("rehydrates the saved theme on mount", () => {
    localStorage.setItem("kk-theme", "winxp");
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("theme").textContent).toBe("winxp");
  });
});

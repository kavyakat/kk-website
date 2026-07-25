import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import SettingsApp from "./SettingsApp";

function ThemeReadout() {
  const { theme } = useTheme();
  return <span data-testid="active-theme">{theme}</span>;
}

describe("SettingsApp", () => {
  beforeEach(() => localStorage.clear());

  it("enables both theme radios (no coming soon)", () => {
    render(<ThemeProvider><SettingsApp /></ThemeProvider>);
    const xp = screen.getByLabelText(/Windows XP/i) as HTMLInputElement;
    expect(xp.disabled).toBe(false);
    expect(screen.queryByText(/coming soon/i)).toBeNull();
  });

  it("switches the theme live when XP is chosen", () => {
    render(<ThemeProvider><SettingsApp /><ThemeReadout /></ThemeProvider>);
    fireEvent.click(screen.getByLabelText(/Windows XP/i));
    expect(screen.getByTestId("active-theme").textContent).toBe("winxp");
    expect(localStorage.getItem("kk-theme")).toBe("winxp");
  });

  it("calls onClose from OK", () => {
    const onClose = vi.fn();
    render(<ThemeProvider><SettingsApp onClose={onClose} /></ThemeProvider>);
    fireEvent.click(screen.getByText("OK"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

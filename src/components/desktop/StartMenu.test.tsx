import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@/hooks/useTheme";
import StartMenu from "./StartMenu";

function renderMenu() {
  return render(
    <ThemeProvider>
      <StartMenu isMobile={false} onSelect={vi.fn()} onShutDown={vi.fn()} onClose={vi.fn()} />
    </ThemeProvider>
  );
}

describe("StartMenu", () => {
  beforeEach(() => localStorage.clear());

  it("keeps Minesweeper out of the top-level Programs list (98)", () => {
    renderMenu();
    fireEvent.mouseEnter(screen.getByText("Programs"));
    expect(screen.getByText("Games")).toBeTruthy();
    expect(screen.queryByText("Minesweeper")).toBeNull();
  });

  it("reveals the games under the Games flyout (98)", () => {
    renderMenu();
    fireEvent.mouseEnter(screen.getByText("Programs"));
    fireEvent.mouseEnter(screen.getByText("Games"));
    expect(screen.getByText("Minesweeper")).toBeTruthy();
    expect(screen.getByText("Solitaire")).toBeTruthy();
  });

  it("renders the XP two-column layout with Log Off / Turn Off", () => {
    localStorage.setItem("kk-theme", "winxp");
    renderMenu();
    expect(screen.getByText(/Kavya Kathuria/i)).toBeTruthy();
    expect(screen.getByText(/Log Off/i)).toBeTruthy();
    expect(screen.getByText(/Turn Off/i)).toBeTruthy();
    expect(screen.getByText(/All Programs/i)).toBeTruthy();
  });
});

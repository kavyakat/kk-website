import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DesktopIcon from "./DesktopIcon";
import { ThemeProvider } from "@/hooks/useTheme";

describe("DesktopIcon", () => {
  it("calls onOpen on double-click when not mobile", () => {
    const onOpen = vi.fn();
    render(
      <ThemeProvider>
        <DesktopIcon label="About.txt" iconSrc="/icons/about.png" isMobile={false} onOpen={onOpen} />
      </ThemeProvider>
    );
    fireEvent.doubleClick(screen.getByText("About.txt"));
    expect(onOpen).toHaveBeenCalled();
  });

  it("calls onOpen on single click when mobile", () => {
    const onOpen = vi.fn();
    render(
      <ThemeProvider>
        <DesktopIcon label="About.txt" iconSrc="/icons/about.png" isMobile onOpen={onOpen} />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText("About.txt"));
    expect(onOpen).toHaveBeenCalled();
  });

  it("uses the XP icon when the theme is winxp", () => {
    localStorage.setItem("kk-theme", "winxp");
    render(
      <ThemeProvider>
        <DesktopIcon label="About" iconSrc="/icons/about.png" xpIconSrc="/icons/xp/about.png" isMobile={false} onOpen={() => {}} />
      </ThemeProvider>
    );
    const img = document.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/icons/xp/about.png");
    localStorage.clear();
  });
});

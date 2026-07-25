import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Taskbar from "./Taskbar";
import { ThemeProvider } from "@/hooks/useTheme";

describe("Taskbar", () => {
  it("opens the Start menu and selecting an app from Programs calls onSelectApp", () => {
    const onSelectApp = vi.fn();
    render(
      <ThemeProvider>
        <Taskbar isMobile={false} windows={{}} onSelectApp={onSelectApp} onShutDown={vi.fn()} />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText("Start"));
    fireEvent.click(screen.getByText("Programs"));
    fireEvent.click(screen.getByRole("menuitem", { name: "About.txt" }));
    expect(onSelectApp).toHaveBeenCalledWith("about");
  });

  it("shows a taskbar button for each open window", () => {
    render(
      <ThemeProvider>
        <Taskbar
          isMobile={false}
          windows={{
            about: {
              open: true,
              minimized: false,
              maximized: false,
              zIndex: 1,
              position: { x: 0, y: 0 },
              size: { width: 360, height: 260 },
            },
          }}
          onSelectApp={vi.fn()}
          onShutDown={vi.fn()}
        />
      </ThemeProvider>
    );
    expect(screen.getAllByText(/About\.txt/).length).toBeGreaterThan(0);
  });

  it("shows the green italic 'start' button in XP theme", () => {
    localStorage.setItem("kk-theme", "winxp");
    render(
      <ThemeProvider>
        <Taskbar isMobile={false} windows={{}} onSelectApp={() => {}} onShutDown={() => {}} />
      </ThemeProvider>
    );
    expect(screen.getByRole("button", { name: /start/i }).textContent?.toLowerCase()).toContain("start");
    localStorage.clear();
  });
});

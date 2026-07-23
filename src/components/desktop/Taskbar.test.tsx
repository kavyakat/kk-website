import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Taskbar from "./Taskbar";

describe("Taskbar", () => {
  it("opens the Start menu and selecting an app calls onSelectApp", () => {
    const onSelectApp = vi.fn();
    render(<Taskbar isMobile={false} windows={{}} onSelectApp={onSelectApp} />);
    fireEvent.click(screen.getByText("Start"));
    fireEvent.click(screen.getByText("About.txt"));
    expect(onSelectApp).toHaveBeenCalledWith("about");
  });

  it("shows a taskbar button for each open window", () => {
    render(
      <Taskbar
        isMobile={false}
        windows={{ about: { open: true, minimized: false, zIndex: 1, position: { x: 0, y: 0 } } }}
        onSelectApp={vi.fn()}
      />
    );
    expect(screen.getAllByText(/About\.txt/).length).toBeGreaterThan(0);
  });
});

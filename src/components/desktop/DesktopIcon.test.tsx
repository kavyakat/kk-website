import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DesktopIcon from "./DesktopIcon";

describe("DesktopIcon", () => {
  it("calls onOpen on double-click when not mobile", () => {
    const onOpen = vi.fn();
    render(<DesktopIcon label="About.txt" icon="📄" isMobile={false} onOpen={onOpen} />);
    fireEvent.doubleClick(screen.getByText("About.txt"));
    expect(onOpen).toHaveBeenCalled();
  });

  it("calls onOpen on single click when mobile", () => {
    const onOpen = vi.fn();
    render(<DesktopIcon label="About.txt" icon="📄" isMobile onOpen={onOpen} />);
    fireEvent.click(screen.getByText("About.txt"));
    expect(onOpen).toHaveBeenCalled();
  });
});

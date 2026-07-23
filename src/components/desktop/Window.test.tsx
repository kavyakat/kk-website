import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Window from "./Window";

const baseProps = {
  title: "About.txt",
  isFocused: true,
  isMobile: false,
  position: { x: 10, y: 20 },
  size: { width: 300, height: 200 },
  onMove: vi.fn(),
};

describe("Window", () => {
  it("renders the title and calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Window {...baseProps} onFocus={vi.fn()} onClose={onClose} onMinimize={vi.fn()}>
        <p>content</p>
      </Window>
    );
    expect(screen.getByText("About.txt")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onMinimize when the minimize button is clicked", () => {
    const onMinimize = vi.fn();
    render(
      <Window {...baseProps} onFocus={vi.fn()} onClose={vi.fn()} onMinimize={onMinimize}>
        <p>content</p>
      </Window>
    );
    fireEvent.click(screen.getByRole("button", { name: /minimize/i }));
    expect(onMinimize).toHaveBeenCalled();
  });

  it("calls onFocus when the window body is clicked", () => {
    const onFocus = vi.fn();
    render(
      <Window {...baseProps} onFocus={onFocus} onClose={vi.fn()} onMinimize={vi.fn()}>
        <p>content</p>
      </Window>
    );
    fireEvent.mouseDown(screen.getByText("content"));
    expect(onFocus).toHaveBeenCalled();
  });
});

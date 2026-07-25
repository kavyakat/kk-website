import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Window from "./Window";

const baseProps = {
  title: "About.txt",
  isFocused: true,
  isMobile: false,
  maximized: false,
  position: { x: 10, y: 20 },
  size: { width: 300, height: 200 },
  onMove: vi.fn(),
  onResize: vi.fn(),
  onToggleMaximize: vi.fn(),
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

  it("calls onToggleMaximize when the maximize button is clicked", () => {
    const onToggleMaximize = vi.fn();
    render(
      <Window {...baseProps} onToggleMaximize={onToggleMaximize} onFocus={vi.fn()} onClose={vi.fn()} onMinimize={vi.fn()}>
        <p>content</p>
      </Window>
    );
    fireEvent.click(screen.getByRole("button", { name: /maximize/i }));
    expect(onToggleMaximize).toHaveBeenCalled();
  });

  it("shows a Restore button instead of Maximize when maximized", () => {
    render(
      <Window {...baseProps} maximized onFocus={vi.fn()} onClose={vi.fn()} onMinimize={vi.fn()}>
        <p>content</p>
      </Window>
    );
    expect(screen.getByRole("button", { name: /restore/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /maximize/i })).not.toBeInTheDocument();
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

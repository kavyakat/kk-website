import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DesktopBuddy from "./DesktopBuddy";
import { characters } from "@/lib/agents/characters";
import type { WindowState } from "@/hooks/useWindowManager";

const clippy = characters.find((c) => c.id === "clippy")!;

const openAgents: WindowState = {
  open: true,
  minimized: false,
  maximized: false,
  zIndex: 1,
  position: { x: 240, y: 60 },
  size: { width: 400, height: 480 },
};

describe("DesktopBuddy", () => {
  it("shows the 'Click me to chat!' bubble in the corner and opens the chat on click", () => {
    const onOpen = vi.fn();
    render(<DesktopBuddy character={clippy} agents={undefined} onOpen={onOpen} />);
    expect(screen.getByText(/Click me to chat!/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Open chat with Clippy/i }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("hides the bubble once the chat window is open", () => {
    render(<DesktopBuddy character={clippy} agents={openAgents} onOpen={vi.fn()} />);
    expect(screen.queryByText(/Click me to chat!/i)).not.toBeInTheDocument();
  });

  it("renders the selected character's avatar", () => {
    render(<DesktopBuddy character={clippy} agents={undefined} onOpen={vi.fn()} />);
    expect(screen.getByAltText("Clippy")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AgentChatApp from "./AgentChatApp";

afterEach(() => vi.unstubAllGlobals());

describe("AgentChatApp", () => {
  it("shows the picker first, then the greeting after choosing a character", () => {
    render(<AgentChatApp onLaunchApp={vi.fn()} />);
    expect(screen.getByText(/Choose your assistant/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Clippy"));
    expect(screen.getByText(/exploring Kavya's portfolio/i)).toBeInTheDocument();
  });

  it("Open Resume launches the resume app", () => {
    const onLaunchApp = vi.fn();
    render(<AgentChatApp onLaunchApp={onLaunchApp} />);
    fireEvent.click(screen.getByText("Genius"));
    fireEvent.click(screen.getByRole("button", { name: /Open Resume/i }));
    expect(onLaunchApp).toHaveBeenCalledWith("resume");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CharacterPicker from "./CharacterPicker";

describe("CharacterPicker", () => {
  it("renders all four characters and reports the chosen one", () => {
    const onPick = vi.fn();
    render(<CharacterPicker onPick={onPick} />);
    expect(screen.getByText("Clippy")).toBeInTheDocument();
    expect(screen.getByText("Merlin")).toBeInTheDocument();
    expect(screen.getByText("Rover")).toBeInTheDocument();
    expect(screen.getByText("Genius")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Merlin"));
    expect(onPick).toHaveBeenCalledWith("merlin");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import BootSequence from "./BootSequence";

describe("BootSequence", () => {
  it("calls onComplete immediately when clicked (skip)", () => {
    const onComplete = vi.fn();
    render(<BootSequence onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: /skip boot sequence/i }));
    expect(onComplete).toHaveBeenCalled();
  });
});
